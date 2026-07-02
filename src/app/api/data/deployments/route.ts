import { NextResponse } from "next/server";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    await getSql().unsafe(`
      create table if not exists public.deployments (
        id uuid primary key default gen_random_uuid(),
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        user_id uuid not null references public.app_users(id) on delete cascade,
        name text not null,
        platform text not null,
        symbol text not null,
        timeframe text not null,
        account_type text not null,
        lot_size numeric not null,
        max_drawdown numeric not null,
        status text not null default 'running',
        command_path text,
        config jsonb not null default '{}'::jsonb
      );
    `);

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
        status: row.status === "halted" ? "Halted" : row.status === "paused" ? "Paused" : "Running",
        accountType: row.account_type,
        startTime: row.created_at,
        commandPath: row.command_path,
      })),
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
