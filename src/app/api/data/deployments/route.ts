import { NextResponse } from "next/server";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const rows = await getSql()`
      select id, created_at, name, platform, symbol, timeframe, account_type, lot_size, max_drawdown, status, command_path
      from deployments
      where user_id = ${user.id}
      order by created_at desc
      limit 20
    `;

    return NextResponse.json({
      deployments: rows.map((row) => ({
        id: row.id,
        name: row.name,
        platform: row.platform,
        symbol: row.symbol,
        timeframe: row.timeframe,
        lotSize: Number(row.lot_size),
        maxDrawdown: Number(row.max_drawdown),
        status: row.status === "running" ? "Running" : row.status === "halted" ? "Halted" : row.status === "paused" ? "Paused" : row.status === "processing" ? "Processing" : row.status === "failed" ? "Failed" : "Pending",
        accountType: row.account_type,
        startTime: row.created_at,
        commandPath: row.command_path,
      })),
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
