import { getSql } from "../../postgres/client";

export interface MarketSignal {
  title: string;
  source: string;
  bias: "Bullish" | "Bearish" | "Neutral";
  symbol: string;
  description: string;
  metrics?: {
    prevValue?: string;
    lastValue?: string;
    change?: string;
  };
}

export async function getLatestMarketSignals(): Promise<MarketSignal[]> {
  try {
    const sql = getSql();

    // 1. Attempt to fetch latest reports from market_reports table
    const reports = await sql<Array<{ title: string; symbol: string; bias: string; description: string }>>`
      SELECT title, symbol, bias, summary as description 
      FROM market_reports 
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    if (reports.length > 0) {
      return reports.map((r) => ({
        title: r.title,
        source: "Beew Market Intelligence",
        bias: r.bias.includes("Bullish") ? "Bullish" : r.bias.includes("Bearish") ? "Bearish" : "Neutral",
        symbol: r.symbol,
        description: r.description,
      }));
    }
  } catch (error) {
    console.error("[Quant] Market signal query failed:", error);
    throw error;
  }

  return [];
}
export type { MarketSignal as SignalType };
