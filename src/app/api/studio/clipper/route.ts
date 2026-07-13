import { NextResponse } from "next/server";
import { getCurrentUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth/user";
import { createStudioJob } from "@/lib/studio/jobs";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function isLocalStudioProcessingEnabled() {
  return process.env.NODE_ENV === "development" && process.env.ENABLE_LOCAL_STUDIO_PROCESSING === "true";
}

function validateLocalVideoPath(localFilePath?: string) {
  if (!localFilePath) return undefined;

  let resolved = path.resolve(localFilePath.replace(/^["']|["']$/g, ""));
  if (!fs.existsSync(resolved) && fs.existsSync(`${resolved}.mp4`)) {
    resolved = `${resolved}.mp4`;
  }

  if (!fs.existsSync(resolved)) {
    throw new Error(`Local video file does not exist: ${resolved}`);
  }

  const stat = fs.statSync(resolved);
  if (!stat.isFile()) {
    throw new Error(`Local path must be a video file, not a folder: ${resolved}`);
  }

  const ext = path.extname(resolved).toLowerCase();
  if (![".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"].includes(ext)) {
    throw new Error(`Local path must point to a video file: ${resolved}`);
  }

  return resolved;
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    if (!isLocalStudioProcessingEnabled()) {
      return NextResponse.json({
        success: true,
        ffmpegAvailable: false,
        localProcessingEnabled: false,
      });
    }

    const { isFfmpegInstalled } = await import("@/lib/studio/clipper");
    const ffmpegOk = await isFfmpegInstalled();
    return NextResponse.json({ success: true, ffmpegAvailable: ffmpegOk, localProcessingEnabled: true });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const body = await req.json().catch(() => ({}));
    const { sourceUrl, localFilePath, clipCount, targetDurationSec } = body;

    if (!sourceUrl && !localFilePath) {
      return NextResponse.json(
        { success: false, error: "Either sourceUrl or localFilePath is required" },
        { status: 400 }
      );
    }

    let cleanLocalFilePath: string | undefined;
    try {
      cleanLocalFilePath = validateLocalVideoPath(
        typeof localFilePath === "string" && localFilePath.trim() ? localFilePath.trim() : undefined
      );
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : "Invalid local video path" },
        { status: 400 }
      );
    }

    const clipperOptions = {
      sourceUrl: typeof sourceUrl === "string" && sourceUrl.trim() ? sourceUrl.trim() : undefined,
      localFilePath: cleanLocalFilePath,
      clipCount: typeof clipCount === "number" ? clipCount : 5,
      targetDurationSec: typeof targetDurationSec === "number" ? targetDurationSec : 30,
    };

    const jobInput = {
      sourceUrl: clipperOptions.sourceUrl ?? null,
      localFilePath: clipperOptions.localFilePath ?? null,
      clipCount: clipperOptions.clipCount,
      targetDurationSec: clipperOptions.targetDurationSec,
    };

    const job = await createStudioJob({
      userId: user.id,
      service: "clipper",
      input: jobInput,
    });

    return NextResponse.json(
      {
        success: true,
        queued: true,
        job,
        message:
          "Clipper job queued. Run npm.cmd run studio:worker to process it with FFmpeg, yt-dlp, Python, and Whisper.",
      },
      { status: 202 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Clipper pipeline failed" },
      { status: 500 }
    );
  }
}
