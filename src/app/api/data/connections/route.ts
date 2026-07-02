import { NextResponse } from "next/server";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const connections = await getSql()`
      select id, exchange, status, keys, latency
      from exchange_connections
      where user_id = ${user.id}
      order by created_at desc
    `;

    return NextResponse.json({ connections });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
