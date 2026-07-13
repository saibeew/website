import { runFfmpegCommand } from "./ffmpeg";

export async function speedRampVideo(params: {
  inputPath: string;
  outputPath: string;
  multiplier: number; // e.g. 1.25 for 25% speedup, 0.8 for slowdown
}): Promise<{ success: boolean; error?: string }> {
  // multiplier must be between 0.5 and 2.0
  const speed = Math.max(0.5, Math.min(2.0, params.multiplier));
  const ptsRatio = 1 / speed;

  // ffmpeg -y -i input -filter_complex "[0:v]setpts=PTS_RATIO*PTS[v];[0:a]atempo=SPEED[a]" -map "[v]" -map "[a]" output
  const args = [
    "-y",
    "-i",
    params.inputPath,
    "-filter_complex",
    `[0:v]setpts=${ptsRatio.toFixed(4)}*PTS[v];[0:a]atempo=${speed.toFixed(4)}[a]`,
    "-map",
    "[v]",
    "-map",
    "[a]",
    params.outputPath,
  ];

  return runFfmpegCommand(args);
}
