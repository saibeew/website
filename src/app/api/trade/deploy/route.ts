import { NextResponse } from "next/server";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";
import { enforceRateLimit, rejectOversizedRequest } from "@/lib/security/rate-limit";
import { recordSecurityEvent } from "@/lib/security/audit";

const ALLOWED_TIMEFRAMES = new Set(["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN1"]);

export const dynamic = "force-dynamic";

type DeployConfig = {
  strategy?: string;
  expertName?: string;
  platform?: string;
  symbol?: string;
  timeframe?: string;
  lotSize?: number;
  maxDrawdown?: number;
  accountType?: string;
};

function normalizePlatform(platform: string | undefined) {
  const normalized = String(platform || "mt5").toLowerCase();
  return normalized === "mt4" ? "mt4" : "mt5";
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    const sizeError = rejectOversizedRequest(req, 16_384);
    if (sizeError) return sizeError;
    const rateLimitError = enforceRateLimit(req, { namespace: "trade-deploy", key: user.id, limit: 10, windowMs: 60 * 60_000 });
    if (rateLimitError) return rateLimitError;

    const config = (await req.json()) as DeployConfig;
    const platform = normalizePlatform(config.platform);
    const name = String(config.strategy || config.expertName || "Unnamed Strategy").trim();
    const expertName = String(config.expertName || name).replace(/\.(ex4|ex5|mq4|mq5)$/i, "").trim();
    const symbol = String(config.symbol || "XAUUSD").toUpperCase();
    const timeframe = String(config.timeframe || "M15").toUpperCase();
    const accountType = String(config.accountType || "demo").toLowerCase();
    const lotSize = Number(config.lotSize || 0.01);
    const maxDrawdown = Number(config.maxDrawdown || 5);

    if (!/^[A-Z0-9._-]{1,24}$/.test(symbol) || !ALLOWED_TIMEFRAMES.has(timeframe)) {
      return NextResponse.json({ error: "Invalid symbol or timeframe." }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9._ -]{1,100}$/.test(expertName)) {
      return NextResponse.json({ error: "EA name is invalid." }, { status: 400 });
    }
    if (!new Set(["demo", "live"]).has(accountType)) {
      return NextResponse.json({ error: "Account type must be demo or live." }, { status: 400 });
    }
    if (!Number.isFinite(lotSize) || lotSize <= 0 || lotSize > 100 || !Number.isFinite(maxDrawdown) || maxDrawdown <= 0 || maxDrawdown > 100) {
      return NextResponse.json({ error: "Invalid lot size or maximum drawdown." }, { status: 400 });
    }

    if (!expertName) {
      return NextResponse.json({ error: "EA name is required for live deployment." }, { status: 400 });
    }

    const sql = getSql();
    const [deployment] = await sql`
      insert into deployments (user_id, name, platform, symbol, timeframe, account_type, lot_size, max_drawdown, status, config)
      values (
        ${user.id},
        ${name},
        ${platform},
        ${symbol},
        ${timeframe},
        ${accountType},
        ${lotSize},
        ${maxDrawdown},
        ${"pending"},
        ${sql.json({ ...config, expertName })}
      )
      returning id, created_at
    `;
    await recordSecurityEvent({ event: "deployment_queued", userId: user.id, request: req, metadata: { deploymentId: deployment.id, platform, symbol, accountType } });

    return NextResponse.json({
      success: true,
      deploymentId: deployment.id,
      message: `${name} queued for the isolated ${platform.toUpperCase()} worker on ${symbol} ${timeframe}.`,
      deployment: {
        id: deployment.id,
        name,
        platform,
        symbol,
        timeframe,
        accountType,
        lotSize,
        maxDrawdown,
        status: "Pending",
        startTime: deployment.created_at,
        commandPath: null,
      },
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
