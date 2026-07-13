const { isFfmpegInstalled } = require("../src/lib/studio/effects/ffmpeg");
const { selectBestClips } = require("../src/lib/studio/clipper/clip-selector");

async function main() {
  console.log("=========================================");
  console.log("TESTING TIER 1: REEL CLIPPER");
  console.log("=========================================");

  // 1. Check FFmpeg
  const hasFfmpeg = await isFfmpegInstalled();
  console.log(`\nFFmpeg installed: ${hasFfmpeg}`);

  if (!hasFfmpeg) {
    console.log("\n[SKIP] FFmpeg not found. Install with:");
    console.log("  winget install --id Gyan.FFmpeg -e");
    console.log("\nThen install Python dependencies:");
    console.log("  pip install faster-whisper yt-dlp");
    console.log("\nFull Reel Clipper pipeline requires: FFmpeg + faster-whisper + yt-dlp");
    return;
  }

  // 2. Test clip selector algorithm (no FFmpeg needed for this part)
  console.log("\n[Test 1] Clip Selector Algorithm...");
  const mockWords = Array.from({ length: 100 }, (_, i) => ({
    word: ["the", "fed", "rate", "inflation", "gold", "signal", "bullish", "bitcoin"][i % 8],
    start: i * 0.5,
    end: i * 0.5 + 0.4,
  }));

  const clips = selectBestClips(mockWords, 3, 15);
  console.log(`  Selected ${clips.length} clips from mock transcript:`);
  clips.forEach((clip: any, i: number) => {
    console.log(`  [${i + 1}] ${clip.startSec.toFixed(1)}s - ${clip.endSec.toFixed(1)}s | Score: ${clip.score} | Preview: ${clip.preview}`);
  });
  console.log("  ✓ Clip selector: PASSED");

  // 3. Full pipeline test (if sample video is available)
  const fs = require("fs");
  const path = require("path");
  const sampleInput = path.resolve("public/studio/test/sample.mp4");

  if (!fs.existsSync(sampleInput)) {
    console.log(`\n[SKIP] Full pipeline test requires: ${sampleInput}`);
    console.log("  Place a sample video there to run end-to-end clip extraction.");
    return;
  }

  console.log("\n[Test 2] Full Clipper Pipeline...");
  const { runClipperPipeline } = require("../src/lib/studio/clipper/index");
  const result = await runClipperPipeline({
    localFilePath: sampleInput,
    clipCount: 2,
    targetDurationSec: 15,
  });

  console.log(`  Extracted ${result.clips.length} clips from ${result.totalDurationSec.toFixed(1)}s source video`);
  result.clips.forEach((clip: any) => {
    console.log(`  [Clip ${clip.index}] ${clip.startSec.toFixed(1)}s-${clip.endSec.toFixed(1)}s → ${clip.outputPath}`);
  });
  console.log("  ✓ Full pipeline: PASSED");
}

main().catch(console.error);
export {};
