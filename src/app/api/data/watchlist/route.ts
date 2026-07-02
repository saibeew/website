import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";

export const dynamic = "force-dynamic";

const watchlistSchema = z.object({ symbol: z.string().min(1).max(24) });

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const rows = await getSql()< { symbol: string }[] >`
      select symbol from watchlists where user_id = ${user.id} order by created_at asc
    `;
    return NextResponse.json({ watchlist: rows.map((row) => row.symbol) });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const { symbol } = watchlistSchema.parse(await request.json());
    const sql = getSql();
    const removed = await sql`delete from watchlists where user_id = ${user.id} and symbol = ${symbol} returning symbol`;

    if (removed.length === 0) {
      await sql`insert into watchlists (user_id, symbol) values (${user.id}, ${symbol}) on conflict (user_id, symbol) do nothing`;
    }

    const rows = await sql<{ symbol: string }[]>`
      select symbol from watchlists where user_id = ${user.id} order by created_at asc
    `;
    return NextResponse.json({ watchlist: rows.map((row) => row.symbol) });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
