import { getSql } from "@/lib/postgres/client";

export async function recordSecurityEvent(params: {
  event: string;
  userId?: string | null;
  request?: Request;
  metadata?: Record<string, unknown>;
}) {
  try {
    const sql = getSql();
    const metadata = (params.metadata || {}) as Parameters<typeof sql.json>[0];
    await sql`
      insert into security_audit_events (user_id, event, ip_address, user_agent, metadata)
      values (
        ${params.userId || null},
        ${params.event},
        ${params.request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null},
        ${params.request?.headers.get("user-agent") || null},
        ${sql.json(metadata)}
      )
    `;
  } catch (error) {
    console.error("Security audit event could not be recorded", error);
  }
}
