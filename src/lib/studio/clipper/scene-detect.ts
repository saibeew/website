import { spawn } from "child_process";

export interface SceneBoundary {
  timeSec: number;
  score: number;
}

export async function detectScenes(videoPath: string, threshold = 0.3): Promise<SceneBoundary[]> {
  // ffmpeg -i video -vf "scdet=s=1:t=THRESHOLD" -f null -
  // Parse [scdet] lines from stderr which contain timecodes
  return new Promise((resolve, reject) => {
    const args = [
      "-i", videoPath,
      "-vf", `scdet=s=1:t=${threshold}`,
      "-f", "null", "-",
    ];

    const proc = spawn("ffmpeg", args);
    let stderr = "";

    proc.stderr.on("data", (d) => (stderr += d.toString()));
    proc.on("error", (err) => reject(new Error(`FFmpeg not found: ${err.message}`)));

    proc.on("close", () => {
      const boundaries: SceneBoundary[] = [];
      // Parse lines like: [scdet @ ...] lavfi.scd.score: 12.00, lavfi.scd.time: 3.50
      const regex = /lavfi\.scd\.score:\s*([\d.]+).*?lavfi\.scd\.time:\s*([\d.]+)/g;
      let match;
      while ((match = regex.exec(stderr)) !== null) {
        boundaries.push({
          score: parseFloat(match[1]),
          timeSec: parseFloat(match[2]),
        });
      }
      resolve(boundaries);
    });
  });
}
