import { NextResponse } from "next/server";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const trades = await getSql()`
      select
        id,
        symbol,
        side,
        amount::text as amount,
        price::text as price,
        time,
        status,
        pnl::float as pnl,
        duration,
        exit_price::text as "exitPrice",
        max_adverse::float as "maxAdverse",
        max_favorable::float as "maxFavorable"
      from trades
      where user_id = ${user.id}
      order by created_at desc
      limit 50
    `;

    return NextResponse.json({ trades });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
