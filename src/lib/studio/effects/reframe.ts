import { runFfmpegCommand } from "./ffmpeg";

export type ReframeMode = "center-crop" | "blur-fill" | "letterbox";

export async function reframeVideo(params: {
  inputPath: string;
  outputPath: string;
  mode: ReframeMode;
  targetWidth?: number;
  targetHeight?: number;
}): Promise<{ success: boolean; error?: string }> {
  const w = params.targetWidth || 1080;
  const h = params.targetHeight || 1920;

  let filterComplex: string;

  switch (params.mode) {
    case "center-crop":
      // Scale to fill 9:16 then center-crop
      filterComplex = `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`;
      break;

    case "blur-fill":
      // Blurred background fill + sharp centered foreground
      filterComplex = [
        `[0:v]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},boxblur=20:5[bg]`,
        `[0:v]scale=${w}:${h}:force_original_aspect_ratio=decrease[fg]`,
        `[bg][fg]overlay=(W-w)/2:(H-h)/2`,
      ].join(";");
      break;

    case "letterbox":
      // Fit inside frame with black bars
      filterComplex = `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:black`;
      break;

    default:
      filterComplex = `scale=${w}:${h}`;
  }

  const args = [
    "-y",
    "-i",
    params.inputPath,
    "-vf",
    filterComplex,
    "-c:a",
    "copy",
    params.outputPath,
  ];

  // blur-fill needs -filter_complex instead of -vf
  if (params.mode === "blur-fill") {
    const idx = args.indexOf("-vf");
    args[idx] = "-filter_complex";
    // Remove -c:a copy since filter_complex rebuilds streams
    const caIdx = args.indexOf("-c:a");
    if (caIdx !== -1) args.splice(caIdx, 2);
  }

  return runFfmpegCommand(args);
}
