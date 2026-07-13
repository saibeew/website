import { getSql } from "@/lib/postgres/client";

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

export async function createStudioJob(params: {
  userId: string;
  service: StudioService;
  input: Record<string, unknown>;
  status?: StudioJobStatus;
  progress?: number;
}) {
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
}

export async function listStudioJobs(userId: string, limit = 25) {
  const sql = getSql();
  return sql<StudioJob[]>`
    SELECT *
    FROM studio_jobs
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
}
