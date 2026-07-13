const { isFfmpegInstalled } = require("../src/lib/studio/effects/index");

async function main() {
  console.log("=========================================");
  console.log("TESTING TIER 2: CAPTION & EFFECTS STUDIO");
  console.log("=========================================");

  const hasFFmpeg = await isFfmpegInstalled();
  console.log(`\nFFmpeg installed: ${hasFFmpeg}`);

  if (!hasFFmpeg) {
    console.log("\n[SKIP] FFmpeg not found. Install with:");
    console.log("  winget install --id Gyan.FFmpeg -e");
    console.log("\nEffects will be available once FFmpeg is installed.");
    console.log("API route (/api/studio/effects) is ready and will validate FFmpeg at runtime.");
    return;
  }

  // Only run these tests when FFmpeg is available
  const path = require("path");
  const fs = require("fs");
  const { trimVideo, speedRampVideo, reframeVideo } = require("../src/lib/studio/effects/index");

  const sampleInput = path.resolve("public/studio/test/sample.mp4");
  const outDir = path.resolve("public/studio/test/output");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  if (!fs.existsSync(sampleInput)) {
    console.log(`[SKIP] No test video found at ${sampleInput}.`);
    console.log("Place a sample.mp4 there to run FFmpeg effect tests.");
    return;
  }

  // Test trim
  console.log("\n[Test 1] Trimming video (0-10s)...");
  const trimRes = await trimVideo({ inputPath: sampleInput, outputPath: `${outDir}/trim.mp4`, startSec: 0, endSec: 10 });
  console.log(`  Trim result: ${trimRes.success ? "✓ PASSED" : "✗ FAILED - " + trimRes.error}`);

  // Test speed ramp
  console.log("\n[Test 2] Speed ramp (1.25x)...");
  const speedRes = await speedRampVideo({ inputPath: sampleInput, outputPath: `${outDir}/speed.mp4`, multiplier: 1.25 });
  console.log(`  Speed result: ${speedRes.success ? "✓ PASSED" : "✗ FAILED - " + speedRes.error}`);

  // Test reframe
  console.log("\n[Test 3] Reframe to 9:16 (blur-fill)...");
  const reframeRes = await reframeVideo({ inputPath: sampleInput, outputPath: `${outDir}/reframe.mp4`, mode: "blur-fill" });
  console.log(`  Reframe result: ${reframeRes.success ? "✓ PASSED" : "✗ FAILED - " + reframeRes.error}`);
}

main().catch(console.error);
export {};
