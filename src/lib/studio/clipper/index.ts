import path from "path";
import fs from "fs";
import os from "os";
import { spawn } from "child_process";
import { transcribeAudio } from "./transcribe";
import { selectBestClips } from "./clip-selector";
import { reframeClip } from "./reframe";
import { burnCaptions } from "./caption-burner";
import { runFfmpegCommand, isFfmpegInstalled } from "../effects/ffmpeg";
import { type ClipWindow } from "./clip-selector";

export interface ClipperOptions {
  sourceUrl?: string;
  localFilePath?: string;
  clipCount?: number;
  targetDurationSec?: number;
  outputDir?: string;
}

export interface ClipperResult {
  clips: {
    index: number;
    outputPath: string;
    startSec: number;
    endSec: number;
    score: number;
    preview: string;
  }[];
  transcript: string;
  totalDurationSec: number;
}

const studioTempRoot = path.join(os.tmpdir(), "beew-studio");

async function downloadWithYtDlp(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("python", [
      "-m", "yt_dlp",
      "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4",
      "--merge-output-format", "mp4",
      "-o", outputPath,
      url,
    ]);

    proc.on("error", (err) => reject(new Error(`yt-dlp not found: ${err.message}`)));
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`yt-dlp exited with code ${code}`));
    });
  });
}

async function extractAudio(videoPath: string, audioPath: string): Promise<void> {
  const result = await runFfmpegCommand([
    "-y", "-i", videoPath,
    "-vn", "-acodec", "pcm_s16le",
    "-ar", "16000", "-ac", "1",
    audioPath,
  ]);
  if (!result.success) throw new Error(`Audio extraction failed: ${result.error}`);
}

async function cutClip(videoPath: string, outputPath: string, startSec: number, endSec: number): Promise<void> {
  const result = await runFfmpegCommand([
    "-y",
    "-ss", String(startSec),
    "-to", String(endSec),
    "-i", videoPath,
    "-c", "copy",
    outputPath,
  ]);
  if (!result.success) throw new Error(`Clip cut failed: ${result.error}`);
}

export async function runClipperPipeline(options: ClipperOptions): Promise<ClipperResult> {
  const ffmpegOk = await isFfmpegInstalled();
  if (!ffmpegOk) throw new Error("FFmpeg is not installed. Install with: winget install --id Gyan.FFmpeg -e");

  const clipCount = options.clipCount ?? 5;
  const targetDurationSec = options.targetDurationSec ?? 30;
  const outputDir = options.outputDir ?? path.join(studioTempRoot, "clips");

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const tmpDir = path.join(outputDir, `tmp_${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  let videoPath: string;

  // 1. Acquire video
  if (options.sourceUrl) {
    videoPath = path.join(tmpDir, "source.mp4");
    console.log("[Clipper] Downloading video from URL...");
    await downloadWithYtDlp(options.sourceUrl, videoPath);
  } else if (options.localFilePath) {
    const resolvedLocalPath = path.resolve(options.localFilePath);
    const allowedRoot = path.resolve(studioTempRoot);
    if (!resolvedLocalPath.startsWith(allowedRoot + path.sep)) {
      throw new Error("Local file paths must point to a file generated inside the Studio temp workspace.");
    }
    videoPath = resolvedLocalPath;
  } else {
    throw new Error("Either sourceUrl or localFilePath must be provided");
  }

  // 2. Extract audio for transcription
  console.log("[Clipper] Extracting audio...");
  const audioPath = path.join(tmpDir, "audio.wav");
  await extractAudio(videoPath, audioPath);

  // 3. Transcribe
  console.log("[Clipper] Transcribing audio (this may take a moment)...");
  const transcription = await transcribeAudio(audioPath);

  // 4. Select best clips
  console.log("[Clipper] Selecting best clip windows...");
  const totalDuration = transcription.words.length > 0
    ? transcription.words[transcription.words.length - 1].end
    : 0;

  let clipWindows = selectBestClips(transcription.words, clipCount, targetDurationSec);
  if (clipWindows.length === 0 && totalDuration > 0) {
    console.log("[Clipper] No strong speech windows found; creating fallback clip windows.");
    const fallbackCount = Math.max(1, Math.min(clipCount, Math.ceil(totalDuration / targetDurationSec)));
    const usableDuration = Math.max(5, Math.min(targetDurationSec, totalDuration));
    clipWindows = Array.from({ length: fallbackCount }, (_, index): ClipWindow => {
      const maxStart = Math.max(0, totalDuration - usableDuration);
      const startSec = Math.min(maxStart, index * targetDurationSec);
      const endSec = Math.min(totalDuration, startSec + usableDuration);
      return {
        startSec,
        endSec,
        score: 0,
        words: transcription.words.filter((w) => w.start >= startSec && w.end <= endSec),
        preview: transcription.text.trim() || `Fallback clip ${index + 1}`,
      };
    });
  }

  // 5. For each clip: cut → reframe → burn captions
  const clipResults: ClipperResult["clips"] = [];

  for (let i = 0; i < clipWindows.length; i++) {
    const clip = clipWindows[i];
    console.log(`[Clipper] Processing clip ${i + 1}/${clipWindows.length}: ${clip.preview}`);

    const rawClipPath = path.join(tmpDir, `raw_clip_${i}.mp4`);
    const reframedPath = path.join(tmpDir, `reframed_${i}.mp4`);
    const finalPath = path.join(outputDir, `reel_${i + 1}.mp4`);

    await cutClip(videoPath, rawClipPath, clip.startSec, clip.endSec);

    const reframeResult = await reframeClip({ inputPath: rawClipPath, outputPath: reframedPath });
    if (!reframeResult.success) {
      console.warn(`[Clipper] Reframe failed for clip ${i + 1}, using raw clip`);
      fs.copyFileSync(rawClipPath, reframedPath);
    }

    if (clip.words.length > 0) {
      const captionResult = await burnCaptions({
        inputPath: reframedPath,
        outputPath: finalPath,
        words: clip.words,
        clipStartSec: clip.startSec,
      });

      if (!captionResult.success) {
        console.warn(`[Clipper] Caption burn failed for clip ${i + 1}, using reframed clip`);
        fs.copyFileSync(reframedPath, finalPath);
      }
    } else {
      fs.copyFileSync(reframedPath, finalPath);
    }

    clipResults.push({
      index: i + 1,
      outputPath: finalPath,
      startSec: clip.startSec,
      endSec: clip.endSec,
      score: clip.score,
      preview: clip.preview,
    });
  }

  // Cleanup tmp
  fs.rmSync(tmpDir, { recursive: true, force: true });

  return {
    clips: clipResults,
    transcript: transcription.text,
    totalDurationSec: totalDuration,
  };
}

export { isFfmpegInstalled };
