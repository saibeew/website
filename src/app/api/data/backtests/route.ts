import { NextResponse } from "next/server";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const backtests = await getSql()`
      select id, created_at, platform, symbol, timeframe, config, status, report_url, result, worker_id
      from backtests
      where user_id = ${user.id}
      order by created_at desc
      limit 5
    `;

    return NextResponse.json({ backtests });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
