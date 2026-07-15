import { NextResponse } from "next/server";
import { getEnvironmentStatus } from "@/lib/environment";
import { getSql, isPostgresConfigured } from "@/lib/postgres/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const environment = getEnvironmentStatus();
  let database = false;

  if (isPostgresConfigured()) {
    try {
      await getSql()`select 1 as healthy`;
      database = true;
    } catch (error) {
      console.error("Health check database failure", error);
    }
  }

  const ready = environment.valid && database;
  return NextResponse.json(
    {
      status: ready ? "ready" : "not_ready",
      checks: {
        environment: environment.valid,
        database,
      },
      missing: environment.missing,
      warnings: environment.warnings,
      timestamp: new Date().toISOString(),
    },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
