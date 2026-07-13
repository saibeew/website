import dotenv from "dotenv";
import fs from "fs";
import os from "os";
import path from "path";
import postgres from "postgres";

dotenv.config({ path: ".env.local", override: true });

type StudioJob = {
  id: string;
  service: "clipper" | "effects" | "trends" | "quant" | "publisher";
  input: Record<string, unknown>;
};

type ReframeMode = "center-crop" | "blur-fill" | "letterbox";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is missing. Add it to .env.local before running the Studio worker.");
  process.exit(1);
}

const pollMs = Number(process.env.STUDIO_WORKER_POLL_MS || 5000);
const runOnce = process.argv.includes("--once");
const studioTempRoot = path.join(os.tmpdir(), "beew-studio");
const sql = postgres(databaseUrl, {
  max: 1,
  connect_timeout: 10,
  ssl: process.env.POSTGRES_SSL === "true" ? "require" : undefined,
});

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asReframeMode(value: unknown): ReframeMode {
  return value === "center-crop" || value === "letterbox" || value === "blur-fill" ? value : "blur-fill";
}

async function updateJob(
  id: string,
  patch: {
    status?: "queued" | "processing" | "done" | "failed";
    progress?: number;
    output?: Record<string, unknown> | null;
    error?: string | null;
  }
) {
  await sql`
    UPDATE studio_jobs
    SET
      status = COALESCE(${patch.status ?? null}, status),
      progress = COALESCE(${patch.progress ?? null}, progress),
      output = COALESCE(${patch.output ? sql.json(patch.output as Parameters<typeof sql.json>[0]) : null}, output),
      error = ${patch.error ?? null},
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

async function claimNextJob(): Promise<StudioJob | null> {
  return sql.begin(async (tx) => {
    const [job] = await tx<StudioJob[]>`
      SELECT id, service, input
      FROM studio_jobs
      WHERE status = 'queued'
        AND service IN ('clipper', 'effects')
      ORDER BY created_at DESC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    `;

    if (!job) return null;

    await tx`
      UPDATE studio_jobs
      SET status = 'processing', progress = 5, error = null, updated_at = NOW()
      WHERE id = ${job.id}
    `;

    return job;
  });
}

function ensureDirForFile(filePath: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function prepareLocalClipperInput(jobId: string, localFilePath?: string) {
  if (!localFilePath) return undefined;

  let resolved = path.resolve(localFilePath.replace(/^["']|["']$/g, ""));
  if (!fs.existsSync(resolved) && fs.existsSync(`${resolved}.mp4`)) {
    resolved = `${resolved}.mp4`;
  }

  if (!fs.existsSync(resolved)) {
    throw new Error(`Local clipper input does not exist: ${resolved}`);
  }

  const stat = fs.statSync(resolved);
  if (!stat.isFile()) {
    throw new Error(`Local clipper input must be a video file, not a folder: ${resolved}`);
  }

  const ext = path.extname(resolved).toLowerCase();
  if (![".mp4", ".mov", ".m4v", ".webm", ".avi", ".mkv"].includes(ext)) {
    throw new Error(`Local clipper input must be a video file: ${resolved}`);
  }

  const allowedRoot = path.resolve(studioTempRoot);
  if (resolved.startsWith(allowedRoot + path.sep)) {
    return resolved;
  }

  const workerInput = path.join(studioTempRoot, "worker-inputs", `${jobId}${ext}`);
  ensureDirForFile(workerInput);
  fs.copyFileSync(resolved, workerInput);
  return workerInput;
}

async function processClipperJob(job: StudioJob) {
  const { runClipperPipeline } = await import("../src/lib/studio/clipper");
  const sourceUrl = asString(job.input.sourceUrl);
  const localFilePath = prepareLocalClipperInput(job.id, asString(job.input.localFilePath));

  if (!sourceUrl && !localFilePath) {
    throw new Error("Clipper job requires sourceUrl or localFilePath.");
  }

  await updateJob(job.id, { progress: 20 });
  const result = await runClipperPipeline({
    sourceUrl,
    localFilePath,
    clipCount: asNumber(job.input.clipCount, 5),
    targetDurationSec: asNumber(job.input.targetDurationSec, 30),
    outputDir: path.join(studioTempRoot, "clips", job.id),
  });

  await updateJob(job.id, {
    status: "done",
    progress: 100,
    output: {
      clips: result.clips,
      transcript: result.transcript,
      totalDurationSec: result.totalDurationSec,
    },
    error: null,
  });
}

async function processEffectsJob(job: StudioJob) {
  const { trimVideo, speedRampVideo, reframeVideo, isFfmpegInstalled } = await import("../src/lib/studio/effects");
  const hasFfmpeg = await isFfmpegInstalled();
  if (!hasFfmpeg) {
    throw new Error("FFmpeg is not installed or not available in PATH.");
  }

  const effect = asString(job.input.effect);
  const inputPath = asString(job.input.inputPath);
  const outputPath =
    asString(job.input.outputPath) || path.join(studioTempRoot, "effects", job.id, `output_${effect || "effect"}.mp4`);
  const params = (job.input.params || {}) as Record<string, unknown>;

  if (!effect || !inputPath) {
    throw new Error("Effects job requires effect and inputPath.");
  }

  if (!fs.existsSync(path.resolve(inputPath))) {
    throw new Error(`Effects input does not exist: ${path.resolve(inputPath)}`);
  }

  ensureDirForFile(outputPath);
  await updateJob(job.id, { progress: 30 });

  let result: { success: boolean; error?: string };
  if (effect === "trim") {
    result = await trimVideo({
      inputPath,
      outputPath,
      startSec: asNumber(params.startSec, 0),
      endSec: asNumber(params.endSec, 10),
    });
  } else if (effect === "speed") {
    result = await speedRampVideo({
      inputPath,
      outputPath,
      multiplier: asNumber(params.multiplier, 1.25),
    });
  } else if (effect === "reframe") {
    result = await reframeVideo({
      inputPath,
      outputPath,
      mode: asReframeMode(params.mode),
    });
  } else {
    throw new Error(`Unsupported effects job: ${effect}`);
  }

  if (!result.success) {
    throw new Error(result.error || "FFmpeg effect failed.");
  }

  await updateJob(job.id, {
    status: "done",
    progress: 100,
    output: { outputPath, effect },
    error: null,
  });
}

async function processJob(job: StudioJob) {
  console.log(`[Studio Worker] Processing ${job.service} job ${job.id}`);
  try {
    if (job.service === "clipper") {
      await processClipperJob(job);
    } else if (job.service === "effects") {
      await processEffectsJob(job);
    } else {
      throw new Error(`Worker does not process service: ${job.service}`);
    }
    console.log(`[Studio Worker] Completed job ${job.id}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await updateJob(job.id, { status: "failed", progress: 100, error: message });
    console.error(`[Studio Worker] Failed job ${job.id}: ${message}`);
  }
}

async function tick() {
  const job = await claimNextJob();
  if (!job) {
    if (runOnce) console.log("[Studio Worker] No queued clipper/effects jobs found.");
    return false;
  }

  await processJob(job);
  return true;
}

async function main() {
  console.log(`[Studio Worker] Started. Polling every ${pollMs}ms. Temp: ${studioTempRoot}`);
  try {
    if (runOnce) {
      await tick();
      return;
    }

    for (;;) {
      const processed = await tick();
      if (!processed) {
        await new Promise((resolve) => setTimeout(resolve, pollMs));
      }
    }
  } finally {
    await sql.end();
  }
}

main().catch(async (error) => {
  console.error("[Studio Worker] Fatal:", error);
  await sql.end();
  process.exit(1);
});
