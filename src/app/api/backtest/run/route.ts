
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/server';
import { writeFile } from 'fs/promises';

// Confirmed Data Folder for Aurum Markets
const MT4_DATA_PATH = "C:\\Users\\saibi\\AppData\\Roaming\\MetaQuotes\\Terminal\\CCA40A8CECCD5E4889B87457B950AE64";
const EXPERTS_PATH = path.join(MT4_DATA_PATH, "MQL4", "Experts");
const TERMINAL_EXE = "C:\\Program Files (x86)\\Aurum Markets MT4 Terminal\\terminal.exe";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { 
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('eaFile') as File | null;
    const symbol = formData.get('symbol') as string;
    const timeframe = formData.get('timeframe') as string;
    const dateFrom = formData.get('dateFrom') as string;
    const dateTo = formData.get('dateTo') as string;
    const deposit = formData.get('deposit') as string;
    const leverage = formData.get('leverage') as string;
    const platform = formData.get('platform') as string;

    let eaName = "MACD Sample"; // Default

    if (file) {
        // Save uploaded EA to Experts folder
        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
        await writeFile(path.join(EXPERTS_PATH, safeName), buffer);
        eaName = safeName.replace(/\.(ex4|ex5)$/, "");
        console.log(`Saved EA to: ${path.join(EXPERTS_PATH, safeName)}`);
    } else {
        // Fallback or use existing name if passed (simpler to enforce restart for now)
        const passedName = formData.get('eaName') as string;
        if (passedName) eaName = passedName;
    }

    // 1. Create a DB record
    const { data: backtest, error: dbError } = await supabase
        .from('backtests')
        .insert([{
            user_id: user.id,
            platform,
            symbol,
            timeframe,
            config: { dateFrom, dateTo, deposit, leverage, eaName, terminal_path: TERMINAL_EXE },
            status: 'running'
        }])
        .select()
        .single();

    if (dbError) throw dbError;

    // 2. Generate Configuration File (.ini)
    const configContent = `
[Tester]
Expert=${eaName}
Symbol=${symbol}
Period=${timeframe}
Deposit=${deposit}
Leverage=${leverage}
Model=0
ExecutionMode=0
Optimization=0
Visual=1
FromDate=${dateFrom.replace(/-/g, '.')}
ToDate=${dateTo.replace(/-/g, '.')}
UseDate=1
Report=backtest_report_${backtest.id}.htm
ReplaceReport=1
ShutdownTerminal=0
    `;

    const configPath = path.join(process.cwd(), `mt4_config_${backtest.id}.ini`);
    fs.writeFileSync(configPath, configContent);

    // 3. Spawn Terminal Process
    const command = `"${TERMINAL_EXE}" /config:"${configPath}"`;
    
    console.log("Launching MT4:", command);

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    });

    return NextResponse.json({ success: true, backtestId: backtest.id, message: `Running ${eaName} on MT4...` });

  } catch (error: any) {
    console.error("Backtest API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
