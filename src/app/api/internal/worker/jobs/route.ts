import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSql } from "@/lib/postgres/client";
import { serverErrorResponse } from "@/lib/auth/user";
import { recordSecurityEvent } from "@/lib/security/audit";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request) {
  const configured = process.env.TRADING_WORKER_API_KEY || "";
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const expectedBuffer = Buffer.from(configured);
  const suppliedBuffer = Buffer.from(supplied);
  return configured.length >= 32 && expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

const resultSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("deployment"),
    jobId: z.string().uuid(),
    workerId: z.string().trim().min(1).max(100),
    status: z.enum(["running", "failed", "halted"]),
    result: z.record(z.string(), z.unknown()).optional(),
  }),
  z.object({
    kind: z.literal("backtest"),
    jobId: z.string().uuid(),
    workerId: z.string().trim().min(1).max(100),
    status: z.enum(["completed", "failed"]),
    reportUrl: z.string().url().max(2_000).optional(),
    result: z.record(z.string(), z.unknown()).optional(),
  }),
]);

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const workerId = url.searchParams.get("workerId")?.trim();
  const kind = url.searchParams.get("kind");
  if (!workerId || workerId.length > 100 || (kind !== "deployment" && kind !== "backtest")) {
    return NextResponse.json({ error: "workerId and valid kind are required." }, { status: 400 });
  }

  try {
    const sql = getSql();
    if (kind === "deployment") {
      const [job] = await sql`
        with next_job as (
          select id from deployments where status = 'pending'
          order by created_at for update skip locked limit 1
        )
        update deployments d set status = 'processing', worker_id = ${workerId}, worker_claimed_at = now(), updated_at = now()
        from next_job where d.id = next_job.id
        returning d.id, d.user_id, d.platform, d.name, d.symbol, d.timeframe, d.account_type, d.lot_size, d.max_drawdown, d.config
      `;
      return NextResponse.json({ job: job || null });
    }

    const [job] = await sql`
      with next_job as (
        select id from backtests where status = 'queued'
        order by created_at for update skip locked limit 1
      )
      update backtests b set status = 'processing', worker_id = ${workerId}, worker_claimed_at = now(), updated_at = now()
      from next_job where b.id = next_job.id
      returning b.id, b.user_id, b.platform, b.symbol, b.timeframe, b.config
    `;
    return NextResponse.json({ job: job || null });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const input = resultSchema.parse(await request.json());
    const sql = getSql();
    const result = (input.result || {}) as Parameters<typeof sql.json>[0];
    const [updated] = input.kind === "deployment"
      ? await sql<{ id: string; user_id: string }[]>`
          update deployments set status = ${input.status}, result = ${sql.json(result)}, updated_at = now()
          where id = ${input.jobId} and worker_id = ${input.workerId}
          returning id, user_id
        `
      : await sql<{ id: string; user_id: string }[]>`
          update backtests set status = ${input.status}, report_url = ${input.reportUrl || null}, result = ${sql.json(result)}, updated_at = now()
          where id = ${input.jobId} and worker_id = ${input.workerId}
          returning id, user_id
        `;
    if (!updated) return NextResponse.json({ error: "Claimed job not found." }, { status: 404 });
    await recordSecurityEvent({ event: `worker_${input.kind}_${input.status}`, userId: updated.user_id, request, metadata: { jobId: input.jobId, workerId: input.workerId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid worker result." }, { status: 400 });
    return serverErrorResponse(error);
  }
}
