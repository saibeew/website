import { NextResponse } from "next/server";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { getCurrentUser, serverErrorResponse, unauthorizedResponse } from "@/lib/auth/user";
import { getSql } from "@/lib/postgres/client";

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

function getTerminalSettings(platform: "mt4" | "mt5") {
  const isMt5 = platform === "mt5";
  return {
    terminalExe: isMt5 ? process.env.MT5_TERMINAL_EXE : process.env.MT4_TERMINAL_EXE,
    dataPath: isMt5 ? process.env.MT5_DATA_PATH : process.env.MT4_DATA_PATH,
    expertsFolder: isMt5 ? "MQL5" : "MQL4",
  };
}

async function ensureDeploymentsTable() {
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
    create index if not exists deployments_user_created_idx on public.deployments (user_id, created_at desc);
  `);
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const config = (await req.json()) as DeployConfig;
    const platform = normalizePlatform(config.platform);
    const { terminalExe, dataPath, expertsFolder } = getTerminalSettings(platform);
    const name = String(config.strategy || config.expertName || "Unnamed Strategy").trim();
    const expertName = String(config.expertName || name).replace(/\.(ex4|ex5|mq4|mq5)$/i, "").trim();
    const symbol = String(config.symbol || "XAUUSD").toUpperCase();
    const timeframe = String(config.timeframe || "M15").toUpperCase();
    const accountType = String(config.accountType || "demo").toLowerCase();
    const lotSize = Number(config.lotSize || 0.01);
    const maxDrawdown = Number(config.maxDrawdown || 5);

    if (!terminalExe) {
      return NextResponse.json({ error: `${platform.toUpperCase()} terminal executable is not configured.` }, { status: 500 });
    }
    if (!dataPath) {
      return NextResponse.json({ error: `${platform.toUpperCase()} data path is not configured.` }, { status: 500 });
    }
    if (!fs.existsSync(terminalExe)) {
      return NextResponse.json({ error: `${platform.toUpperCase()} terminal was not found at ${terminalExe}.` }, { status: 500 });
    }
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ error: `${platform.toUpperCase()} data folder was not found at ${dataPath}.` }, { status: 500 });
    }
    if (!expertName) {
      return NextResponse.json({ error: "EA name is required for live deployment." }, { status: 400 });
    }

    await ensureDeploymentsTable();

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
        ${"running"},
        ${sql.json({ ...config, expertName })}
      )
      returning id, created_at
    `;

    const bridgeDir = path.join(dataPath, expertsFolder, "Files", "Aialgo", "deployments");
    fs.mkdirSync(bridgeDir, { recursive: true });

    const command = {
      id: deployment.id,
      action: "deploy",
      createdAt: new Date().toISOString(),
      userId: user.id,
      platform,
      strategy: name,
      expertName,
      symbol,
      timeframe,
      accountType,
      lotSize,
      maxDrawdown,
      status: "running",
      note: "A terminal-side bridge EA/script should read this command and attach or manage the requested Expert Advisor on the selected chart.",
    };

    const commandPath = path.join(bridgeDir, `deploy_${deployment.id}.json`);
    fs.writeFileSync(commandPath, JSON.stringify(command, null, 2));

    await sql`
      update deployments
      set command_path = ${commandPath}, updated_at = now()
      where id = ${deployment.id}
    `;

    exec(`"${terminalExe}"`, (error) => {
      if (error) console.error(platform.toUpperCase() + " launch failed:", error);
    });

    return NextResponse.json({
      success: true,
      deploymentId: deployment.id,
      message: `${name} prepared for ${platform.toUpperCase()} on ${symbol} ${timeframe}.`,
      deployment: {
        id: deployment.id,
        name,
        platform,
        symbol,
        timeframe,
        accountType,
        lotSize,
        maxDrawdown,
        status: "Running",
        startTime: deployment.created_at,
        commandPath,
      },
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
