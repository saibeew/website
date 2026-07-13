import { NextResponse } from "next/server";
import { getCurrentUser, unauthorizedResponse, serverErrorResponse } from "@/lib/auth/user";
import { createStudioJob } from "@/lib/studio/jobs";

export const dynamic = "force-dynamic";

function isLocalStudioProcessingEnabled() {
  return process.env.NODE_ENV === "development" && process.env.ENABLE_LOCAL_STUDIO_PROCESSING === "true";
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

    const { isFfmpegInstalled } = await import("@/lib/studio/effects");
    const hasFFmpeg = await isFfmpegInstalled();
    return NextResponse.json({ success: true, ffmpegAvailable: hasFFmpeg, localProcessingEnabled: true });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const body = await req.json().catch(() => ({}));
    const { effect, inputPath, outputPath, ...params } = body;

    if (!effect || !inputPath || !outputPath) {
      return NextResponse.json(
        { success: false, error: "effect, inputPath, and outputPath are required" },
        { status: 400 }
      );
    }

    if (!["trim", "speed", "reframe"].includes(effect)) {
      return NextResponse.json({ success: false, error: `Unknown effect: ${effect}` }, { status: 400 });
    }

    const jobInput = {
      effect,
      inputPath,
      outputPath,
      params,
    };

    const job = await createStudioJob({
      userId: user.id,
      service: "effects",
      input: jobInput,
    });

    return NextResponse.json(
      {
        success: true,
        queued: true,
        job,
        message: "Effects job queued. Run npm.cmd run studio:worker to render it with FFmpeg.",
      },
      { status: 202 }
    );
  } catch (error) {
    return serverErrorResponse(error);
  }
}
