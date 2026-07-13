import { runFfmpegCommand } from "./ffmpeg";

export async function trimVideo(params: {
  inputPath: string;
  outputPath: string;
  startSec: number;
  endSec: number;
}): Promise<{ success: boolean; error?: string }> {
  // ffmpeg -y -ss START -to END -i INPUT -c copy OUTPUT
  const args = [
    "-y",
    "-ss",
    String(params.startSec),
    "-to",
    String(params.endSec),
    "-i",
    params.inputPath,
    "-c",
    "copy",
    params.outputPath,
  ];

  return runFfmpegCommand(args);
}
