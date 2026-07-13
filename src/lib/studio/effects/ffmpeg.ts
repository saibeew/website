import { spawn } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

// Inject local FFmpeg path into process.env.PATH so subprocesses (like yt-dlp) can find it.
const localFfmpegBin = path.join(os.homedir(), "ffmpeg/ffmpeg-master-latest-win64-gpl/bin");
if (fs.existsSync(localFfmpegBin)) {
  const pathSeparator = os.platform() === "win32" ? ";" : ":";
  const currentPath = process.env.PATH || "";
  if (!currentPath.includes(localFfmpegBin)) {
    process.env.PATH = `${localFfmpegBin}${pathSeparator}${currentPath}`;
  }
}

function getFfmpegPath(): string {
  const localFfmpeg = path.join(localFfmpegBin, "ffmpeg.exe");
  return fs.existsSync(localFfmpeg) ? localFfmpeg : "ffmpeg";
}

export function isFfmpegInstalled(): Promise<boolean> {
  return new Promise((resolve) => {
    const proc = spawn(getFfmpegPath(), ["-version"]);
    proc.on("error", () => resolve(false));
    proc.on("close", (code) => resolve(code === 0));
  });
}

export function runFfmpegCommand(args: string[]): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const ffmpegPath = getFfmpegPath();
    console.log(`[FFmpeg] Running command: ${ffmpegPath} ${args.join(" ")}`);
    const proc = spawn(ffmpegPath, args);

    let stderr = "";
    proc.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("error", (err) => {
      resolve({ success: false, error: err.message });
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        console.warn("[FFmpeg] Command failed with stderr:", stderr);
        resolve({ success: false, error: stderr || `Exit code ${code}` });
      }
    });
  });
}
