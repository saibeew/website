import { runFfmpegCommand } from "../effects/ffmpeg";

export async function reframeClip(params: {
  inputPath: string;
  outputPath: string;
}): Promise<{ success: boolean; error?: string }> {
  // Scale to fill 1080x1920 (9:16) with blurred background
  const filterComplex = [
    `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=20:5[bg]`,
    `[0:v]scale=1080:1920:force_original_aspect_ratio=decrease[fg]`,
    `[bg][fg]overlay=(W-w)/2:(H-h)/2`,
  ].join(";");

  const args = [
    "-y",
    "-i", params.inputPath,
    "-filter_complex", filterComplex,
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "23",
    params.outputPath,
  ];

  return runFfmpegCommand(args);
}
