import { runFfmpegCommand } from "../effects/ffmpeg";
import fs from "fs";
import path from "path";

export async function reframeClip(params: {
  inputPath: string;
  outputPath: string;
}): Promise<{ success: boolean; error?: string }> {
  const logoPath = path.join(process.cwd(), "public", "brand-assets", "logos", "Icon_.png");
  const hasLogo = fs.existsSync(logoPath);

  // Scale to fill 1080x1920 (9:16) with blurred background
  const filterComplex = [
    `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5[bg]`,
    `[0:v]scale=1080:1920:force_original_aspect_ratio=decrease[fg]`,
    `[bg][fg]overlay=(W-w)/2:(H-h)/2[base]`,
    hasLogo
      ? `[1:v]scale=104:-1[logo];[base][logo]overlay=64:64[v]`
      : `[base]null[v]`,
  ].join(";");

  const args = [
    "-y",
    "-i", params.inputPath,
    ...(hasLogo ? ["-i", logoPath] : []),
    "-filter_complex", filterComplex,
    "-map", "[v]",
    "-map", "0:a?",
    "-c:v", "libx264",
    "-c:a", "aac",
    "-preset", "fast",
    "-crf", "23",
    params.outputPath,
  ];

  return runFfmpegCommand(args);
}
