import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { writeFile } from "fs/promises";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

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
    const terminalExe = isMt5 ? process.env.MT5_TERMINAL_EXE || process.env.MT4_TERMINAL_EXE : process.env.MT4_TERMINAL_EXE;
    const dataPath = isMt5 ? process.env.MT5_DATA_PATH || process.env.MT4_DATA_PATH : process.env.MT4_DATA_PATH;

    if (!terminalExe) {
      return NextResponse.json({ error: `${isMt5 ? "MT5_TERMINAL_EXE" : "MT4_TERMINAL_EXE"} is not configured.` }, { status: 500 });
    }
    const symbol = String(formData.get("symbol") || "EURUSD");
    const timeframe = String(formData.get("timeframe") || "H1");
    const dateFrom = String(formData.get("dateFrom") || "2023-01-01");
    const dateTo = String(formData.get("dateTo") || "2023-12-31");
    const deposit = String(formData.get("deposit") || "10000");
    const leverage = String(formData.get("leverage") || "1:100");

    let eaName = "MACD Sample";

    if (file) {
      const allowedExtensions = isMt5 ? [".ex5", ".mq5"] : [".ex4", ".mq4"];
      if (!allowedExtensions.includes(fileExtension)) {
        return NextResponse.json({
          error: `Uploaded EA is ${fileExtension || "missing an extension"}, but ${platform.toUpperCase()} needs ${allowedExtensions.join(" or ")}.`,
        }, { status: 400 });
      }

      if (!dataPath) {
        return NextResponse.json({ error: `${isMt5 ? "MT5_DATA_PATH" : "MT4_DATA_PATH"} is required to upload Expert Advisors.` }, { status: 500 });
      }

      const expertsPath = path.join(dataPath, isMt5 ? "MQL5" : "MQL4", "Experts");
      fs.mkdirSync(expertsPath, { recursive: true });
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "");
      await writeFile(path.join(expertsPath, safeName), buffer);
      eaName = safeName.replace(/\.(ex4|ex5|mq4|mq5)$/i, "");
    } else {
      const passedName = formData.get("eaName");
      if (passedName) eaName = String(passedName);
    }

    const config = {
      dateFrom,
      dateTo,
      deposit,
      leverage,
      eaName,
      terminal_path: terminalExe,
      platform,
      detectedPlatform,
    };

    const sql = getSql();
    const [backtest] = await sql`
      insert into backtests (user_id, platform, symbol, timeframe, config, status)
      values (${user.id}, ${platform}, ${symbol}, ${timeframe}, ${sql.json(config)}, ${"running"})
      returning id
    `;

    const configContent = [
      "[Tester]",
      "Expert=" + eaName,
      "Symbol=" + symbol,
      "Period=" + timeframe,
      "Deposit=" + deposit,
      "Leverage=" + leverage,
      "Model=0",
      "ExecutionMode=0",
      "Optimization=0",
      "Visual=1",
      "FromDate=" + dateFrom.replace(/-/g, "."),
      "ToDate=" + dateTo.replace(/-/g, "."),
      "UseDate=1",
      "Report=backtest_report_" + backtest.id + ".htm",
      "ReplaceReport=1",
      "ShutdownTerminal=0",
    ].join("\n");

    const configPath = path.join(process.cwd(), `${platform}_config_${backtest.id}.ini`);
    fs.writeFileSync(configPath, configContent);

    const command = "\"" + terminalExe + "\" /config:\"" + configPath + "\"";
    exec(command, (error) => {
      if (error) {
        console.error(platform.toUpperCase() + " launch failed:", error);
      }
    });

    return NextResponse.json({
      success: true,
      backtestId: backtest.id,
      message: "Running " + eaName + " on " + platform.toUpperCase() + "...",
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
