import { NextResponse } from "next/server";
import path from "path";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";
import { enforceRateLimit, rejectOversizedRequest } from "@/lib/security/rate-limit";
import { recordSecurityEvent } from "@/lib/security/audit";

const MAX_EA_BYTES = 25 * 1024 * 1024;
const ALLOWED_TIMEFRAMES = new Set(["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN1"]);

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();
    const sizeError = rejectOversizedRequest(req, MAX_EA_BYTES + 1024 * 1024);
    if (sizeError) return sizeError;
    const rateLimitError = enforceRateLimit(req, { namespace: "backtest", key: user.id, limit: 5, windowMs: 60 * 60_000 });
    if (rateLimitError) return rateLimitError;

    const formData = await req.formData();
    const file = formData.get("eaFile") as File | null;
    const fileExtension = file ? path.extname(file.name).toLowerCase() : "";
    const detectedPlatform = fileExtension === ".ex5" || fileExtension === ".mq5"
      ? "mt5"
      : fileExtension === ".ex4" || fileExtension === ".mq4"
        ? "mt4"
        : null;
    const platform = detectedPlatform || String(formData.get("platform") || "mt4").toLowerCase();
    if (platform !== "mt4" && platform !== "mt5") {
      return NextResponse.json({ error: "Platform must be MT4 or MT5." }, { status: 400 });
    }
    const isMt5 = platform === "mt5";
    const symbol = String(formData.get("symbol") || "EURUSD").toUpperCase();
    const timeframe = String(formData.get("timeframe") || "H1").toUpperCase();
    const dateFrom = String(formData.get("dateFrom") || "2023-01-01");
    const dateTo = String(formData.get("dateTo") || "2023-12-31");
    const deposit = String(formData.get("deposit") || "10000");
    const leverage = String(formData.get("leverage") || "1:100");

    if (!/^[A-Z0-9._-]{1,24}$/.test(symbol) || !ALLOWED_TIMEFRAMES.has(timeframe)) {
      return NextResponse.json({ error: "Invalid symbol or timeframe." }, { status: 400 });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFrom) || !/^\d{4}-\d{2}-\d{2}$/.test(dateTo) || dateFrom > dateTo) {
      return NextResponse.json({ error: "Invalid backtest date range." }, { status: 400 });
    }
    const depositValue = Number(deposit);
    if (!Number.isFinite(depositValue) || depositValue < 100 || depositValue > 100_000_000 || !/^1:\d{1,4}$/.test(leverage)) {
      return NextResponse.json({ error: "Invalid deposit or leverage." }, { status: 400 });
    }

    let eaName = "MACD Sample";

    if (file) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "EA uploads require private object storage. Select an EA already installed on the trading worker." }, { status: 503 });
      }
      if (file.size > MAX_EA_BYTES) {
        return NextResponse.json({ error: "EA file exceeds the 25 MB limit." }, { status: 413 });
      }
      const allowedExtensions = isMt5 ? [".ex5", ".mq5"] : [".ex4", ".mq4"];
      if (!allowedExtensions.includes(fileExtension)) {
        return NextResponse.json({
          error: `Uploaded EA is ${fileExtension || "missing an extension"}, but ${platform.toUpperCase()} needs ${allowedExtensions.join(" or ")}.`,
        }, { status: 400 });
      }

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "");
      if (!safeName) return NextResponse.json({ error: "EA filename is invalid." }, { status: 400 });
      eaName = safeName.replace(/\.(ex4|ex5|mq4|mq5)$/i, "");
    } else {
      const passedName = formData.get("eaName");
      if (passedName) {
        const normalizedName = String(passedName).trim();
        if (!/^[a-zA-Z0-9._() -]{1,100}$/.test(normalizedName)) {
          return NextResponse.json({ error: "EA name is invalid." }, { status: 400 });
        }
        eaName = normalizedName;
      }
    }

    const config = {
      dateFrom,
      dateTo,
      deposit,
      leverage,
      eaName,
      platform,
      detectedPlatform,
    };

    const sql = getSql();
    const [backtest] = await sql`
      insert into backtests (user_id, platform, symbol, timeframe, config, status)
      values (${user.id}, ${platform}, ${symbol}, ${timeframe}, ${sql.json(config)}, ${"queued"})
      returning id
    `;
    await recordSecurityEvent({ event: "backtest_queued", userId: user.id, request: req, metadata: { backtestId: backtest.id, platform, symbol, timeframe } });

    return NextResponse.json({
      success: true,
      backtestId: backtest.id,
      message: "Queued " + eaName + " for " + platform.toUpperCase() + ".",
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
