import { NextResponse } from "next/server";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";
import { recordSecurityEvent } from "@/lib/security/audit";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    const sql = getSql();
    const [profile, strategies, watchlists, trades, connections, reports, backtests, deployments, studioJobs, scheduledPosts, securityEvents] = await Promise.all([
      sql`select id, email, name, created_at, updated_at, email_verified_at from app_users where id = ${user.id}`,
      sql`select * from strategies where user_id = ${user.id} order by created_at desc`,
      sql`select symbol, created_at from watchlists where user_id = ${user.id} order by created_at`,
      sql`select * from trades where user_id = ${user.id} order by created_at desc`,
      sql`select id, created_at, exchange, status, latency from exchange_connections where user_id = ${user.id} order by created_at desc`,
      sql`select id, created_at, title, summary, bias, symbol, tags, content from market_reports where author_id = ${user.id} order by created_at desc`,
      sql`select * from backtests where user_id = ${user.id} order by created_at desc`,
      sql`select id, created_at, updated_at, name, platform, symbol, timeframe, account_type, lot_size, max_drawdown, status, config from deployments where user_id = ${user.id} order by created_at desc`,
      sql`select * from studio_jobs where user_id = ${user.id} order by created_at desc`,
      sql`select * from scheduled_posts where user_id = ${user.id} order by created_at desc`,
      sql`select event, ip_address, user_agent, metadata, created_at from security_audit_events where user_id = ${user.id} order by created_at desc`,
    ]);
    await recordSecurityEvent({ event: "account_data_exported", userId: user.id, request });
    return NextResponse.json(
      { exportedAt: new Date().toISOString(), profile: profile[0], strategies, watchlists, trades, connections, reports, backtests, deployments, studioJobs, scheduledPosts, securityEvents },
      { headers: { "Content-Disposition": `attachment; filename="beew-data-${user.id}.json"`, "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return serverErrorResponse(error);
  }
}
