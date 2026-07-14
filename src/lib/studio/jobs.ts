import { getSql } from "@/lib/postgres/client";
import { randomUUID } from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { isDatabaseConnectionError } from "@/lib/auth/user";

export type StudioService = "clipper" | "effects" | "trends" | "quant" | "publisher";
export type StudioJobStatus = "queued" | "processing" | "done" | "failed";

export interface StudioJob {
  id: string;
  user_id: string;
  service: StudioService;
  status: StudioJobStatus;
  progress: number;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  cost: string | number;
  created_at: string;
  updated_at: string;
}

const LOCAL_JOBS_PATH = path.join(os.tmpdir(), "beew-studio", "local-studio-jobs.json");

function readLocalJobs(): StudioJob[] {
  if (!fs.existsSync(LOCAL_JOBS_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(LOCAL_JOBS_PATH, "utf-8")) as StudioJob[];
  } catch {
    return [];
  }
}

function writeLocalJobs(jobs: StudioJob[]) {
  fs.mkdirSync(path.dirname(LOCAL_JOBS_PATH), { recursive: true });
  fs.writeFileSync(LOCAL_JOBS_PATH, JSON.stringify(jobs, null, 2), "utf-8");
}

function createLocalJob(params: {
  userId: string;
  service: StudioService;
  input: Record<string, unknown>;
  status?: StudioJobStatus;
  progress?: number;
}) {
  const now = new Date().toISOString();
  const job: StudioJob = {
    id: randomUUID(),
    user_id: params.userId,
    service: params.service,
    status: params.status ?? "queued",
    progress: params.progress ?? 0,
    input: params.input,
    output: null,
    error: null,
    cost: 0,
    created_at: now,
    updated_at: now,
  };

  writeLocalJobs([job, ...readLocalJobs()]);
  return job;
}

export async function createStudioJob(params: {
  userId: string;
  service: StudioService;
  input: Record<string, unknown>;
  status?: StudioJobStatus;
  progress?: number;
}) {
  try {
    const sql = getSql();
    const jsonInput = params.input as Parameters<typeof sql.json>[0];
    const [job] = await sql<StudioJob[]>`
      INSERT INTO studio_jobs (user_id, service, status, progress, input)
      VALUES (
        ${params.userId},
        ${params.service},
        ${params.status ?? "queued"},
        ${params.progress ?? 0},
        ${sql.json(jsonInput)}
      )
      RETURNING *
    `;

    return job;
  } catch (error) {
    if (!isDatabaseConnectionError(error)) throw error;
    return createLocalJob(params);
  }
}

export async function listStudioJobs(userId: string, limit = 25) {
  try {
    const sql = getSql();
    return sql<StudioJob[]>`
      SELECT *
      FROM studio_jobs
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  } catch (error) {
    if (!isDatabaseConnectionError(error)) throw error;
    return readLocalJobs()
      .filter((job) => job.user_id === userId || userId === "local-db-unavailable")
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, limit);
  }
}
