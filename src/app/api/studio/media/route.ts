import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import fs from "fs";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

const STUDIO_TEMP_ROOT = path.join(os.tmpdir(), "beew-studio");
const MAX_FILES = 5;
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_FILES * MAX_FILE_BYTES;
const ALLOWED_EXTENSIONS = new Set([
  ".mp4", ".webm", ".mov", ".wav", ".mp3", ".m4a", ".jpg", ".jpeg", ".png", ".webp",
]);

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

function listUploadedMedia(userRoot: string, uploadRoot: string) {
  if (!fs.existsSync(uploadRoot)) return [];

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

      const rel = path.relative(userRoot, fullPath);
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

  walk(uploadRoot);
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
    const userRoot = path.join(STUDIO_TEMP_ROOT, "users", user.id);
    const uploadRoot = path.join(userRoot, "uploads");

    const fileParam = request.nextUrl.searchParams.get("file");
    if (!fileParam) {
      return NextResponse.json({ success: true, files: listUploadedMedia(userRoot, uploadRoot) });
    }

    // Resolve and validate path stays within the allowed root
    const resolvedPath = path.resolve(userRoot, fileParam);
    if (!resolvedPath.startsWith(userRoot + path.sep)) {
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
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    const contentLength = Number(request.headers.get("content-length") || 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json({ success: false, error: "Upload is too large" }, { status: 413 });
    }

    const form = await request.formData();
    const files = form.getAll("files").filter((file): file is File => file instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: "No files uploaded" }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ success: false, error: `Upload at most ${MAX_FILES} files` }, { status: 400 });
    }

    for (const file of files) {
      const extension = path.extname(file.name).toLowerCase();
      if (!ALLOWED_EXTENSIONS.has(extension)) {
        return NextResponse.json({ success: false, error: `Unsupported media type: ${extension || "unknown"}` }, { status: 400 });
      }
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json({ success: false, error: `${file.name} exceeds the 100 MB limit` }, { status: 413 });
      }
    }

    const userRoot = path.join(STUDIO_TEMP_ROOT, "users", user.id);
    const uploadRoot = path.join(userRoot, "uploads");
    fs.mkdirSync(uploadRoot, { recursive: true });
    const uploaded = [];

    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filename = `${Date.now()}_${randomUUID()}_${safeName}`;
      const targetPath = path.join(uploadRoot, filename);
      const bytes = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(targetPath, bytes);

      const relativePath = path.relative(userRoot, targetPath);
      uploaded.push({
        name: file.name,
        path: targetPath,
        url: toMediaUrl(relativePath),
        type: file.type,
        size: bytes.length,
      });
    }

    return NextResponse.json({ success: true, files: uploaded });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
