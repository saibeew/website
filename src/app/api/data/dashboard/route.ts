import { NextResponse } from "next/server";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const sql = getSql();
    const [strategyStats] = await sql`
      select count(*)::int as count
      from strategies
      where user_id = ${user.id} and active = true
    `;
    const watchlistRows = await sql<{ symbol: string }[]>`
      select symbol
      from watchlists
      where user_id = ${user.id}
      order by created_at asc
    `;
    const [tradeStats] = await sql<{ pnl: number }[]>`
      select coalesce(sum(pnl), 0)::float as pnl
      from trades
      where user_id = ${user.id}
    `;

    const initialBalance = Number(process.env.NEXT_PUBLIC_DEFAULT_INITIAL_BALANCE || process.env.DEFAULT_INITIAL_BALANCE || 10000);
    const realizedPnl = Number(tradeStats?.pnl || 0);

    return NextResponse.json({
      activeStrategies: Number(strategyStats?.count || 0),
      watchlist: watchlistRows.map((row) => row.symbol),
      balance: initialBalance + realizedPnl,
      pnl: initialBalance > 0 ? Number(((realizedPnl / initialBalance) * 100).toFixed(2)) : 0,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
