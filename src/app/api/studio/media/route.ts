import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser, unauthorizedResponse } from "@/lib/auth/user";
import fs from "fs";
import path from "path";
import os from "os";

export const dynamic = "force-dynamic";

const STUDIO_TEMP_ROOT = path.join(os.tmpdir(), "beew-studio");
const UPLOAD_ROOT = path.join(STUDIO_TEMP_ROOT, "uploads");

function toMediaUrl(relativePath: string) {
  return `/api/studio/media?file=${encodeURIComponent(relativePath.replace(/\\/g, "/"))}`;
}

function contentTypeFor(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".mkv": "video/x-matroska",
    ".wav": "audio/wav",
    ".mp3": "audio/mpeg",
    ".m4a": "audio/mp4",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ass": "text/plain",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

function listUploadedMedia() {
  if (!fs.existsSync(UPLOAD_ROOT)) return [];

  const files: {
    name: string;
    path: string;
    url: string;
    type: "image" | "video" | "audio" | "other";
    size: number;
    updatedAt: string;
  }[] = [];

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
        continue;
      }
      if (!entry.isFile()) continue;

      const rel = path.relative(STUDIO_TEMP_ROOT, fullPath);
      const stat = fs.statSync(fullPath);
      const contentType = contentTypeFor(fullPath);
      files.push({
        name: entry.name,
        path: fullPath,
        url: toMediaUrl(rel),
        type: contentType.startsWith("image/")
          ? "image"
          : contentType.startsWith("video/")
            ? "video"
            : contentType.startsWith("audio/")
              ? "audio"
              : "other",
        size: stat.size,
        updatedAt: stat.mtime.toISOString(),
      });
    }
  };

  walk(UPLOAD_ROOT);
  return files.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

/**
 * Serves media files from the beew-studio temp directory.
 * GET /api/studio/media?file=clips/abc-123/reel_1.mp4
 *
 * Security: only authenticated users can access, and the resolved path
 * must stay within the beew-studio temp root (no directory traversal).
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const fileParam = request.nextUrl.searchParams.get("file");
    if (!fileParam) {
      return NextResponse.json({ success: true, files: listUploadedMedia() });
    }

    // Resolve and validate path stays within the allowed root
    const resolvedPath = path.resolve(STUDIO_TEMP_ROOT, fileParam);
    if (!resolvedPath.startsWith(STUDIO_TEMP_ROOT + path.sep) && resolvedPath !== STUDIO_TEMP_ROOT) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const stat = fs.statSync(resolvedPath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: "Not a file" }, { status: 400 });
    }

    const contentType = contentTypeFor(resolvedPath);
    const fileBuffer = fs.readFileSync(resolvedPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(stat.size),
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": `inline; filename="${path.basename(resolvedPath)}"`,
      },
    });
  } catch (error: any) {
    console.error("[Studio Media] Error serving file:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const form = await request.formData();
    const files = form.getAll("files").filter((file): file is File => file instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: "No files uploaded" }, { status: 400 });
    }

    fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
    const uploaded = [];

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `${Date.now()}_${Math.random().toString(16).slice(2)}_${safeName}`;
      const targetPath = path.join(UPLOAD_ROOT, filename);
      const bytes = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(targetPath, bytes);

      const relativePath = path.relative(STUDIO_TEMP_ROOT, targetPath);
      uploaded.push({
        name: file.name,
        path: targetPath,
        url: toMediaUrl(relativePath),
        type: file.type,
        size: bytes.length,
      });
    }

    return NextResponse.json({ success: true, files: uploaded });
  } catch (error: any) {
    console.error("[Studio Media] Upload failed:", error);
    return NextResponse.json({ success: false, error: error.message || "Upload failed" }, { status: 500 });
  }
}
