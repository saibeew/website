import { NextResponse } from "next/server";
import { getCurrentUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth/user";
import { createStudioJob } from "@/lib/studio/jobs";

export const dynamic = "force-dynamic";

function supportedSourceUrl(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    const allowedHosts = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"]);
    return url.protocol === "https:" && allowedHosts.has(url.hostname.toLowerCase()) ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    return NextResponse.json({
      success: true,
      ffmpegAvailable: false,
      localProcessingEnabled: false,
      workerProcessing: true,
    });
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

    const submittedLocalFilePath = typeof localFilePath === "string" && localFilePath.trim() ? localFilePath.trim() : undefined;
    if (submittedLocalFilePath) {
      return NextResponse.json(
        { success: false, error: "Server-local file paths are not accepted. Upload media or provide a supported HTTPS source URL." },
        { status: 400 }
      );
    }

    const cleanSourceUrl = supportedSourceUrl(sourceUrl);
    if (sourceUrl && !cleanSourceUrl) {
      return NextResponse.json({ success: false, error: "Only HTTPS YouTube URLs are supported." }, { status: 400 });
    }

    const clipperOptions = {
      sourceUrl: cleanSourceUrl,
      localFilePath: undefined,
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
        message: "Clipper job queued for the isolated Studio worker.",
      },
      { status: 202 }
    );
  } catch (error) {
    return serverErrorResponse(error);
  }
}
