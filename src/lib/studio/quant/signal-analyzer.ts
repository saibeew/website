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

const FALLBACK_SIGNALS: MarketSignal[] = [
  {
    title: "Gold rotates lower on hawkish Fed commentary",
    source: "Beew Algos",
    bias: "Bearish",
    symbol: "XAUUSD",
    description:
      "Intraday signals show strong institutional distribution near 2450. Fed governors hint at a longer-than-expected rate pause, strengthening the dollar index.",
    metrics: { prevValue: "2455", lastValue: "2428", change: "-1.1%" },
  },
  {
    title: "Bitcoin breaks out of range as stablecoin inflows accelerate",
    source: "Beew Algos",
    bias: "Bullish",
    symbol: "BTCUSD",
    description:
      "Order book depth indicates strong buy walls near 67,000. Stablecoin supply expansion is supporting exchange-flow momentum and broader risk appetite.",
    metrics: { prevValue: "66800", lastValue: "69200", change: "+3.59%" },
  },
  {
    title: "Euro consolidates near support ahead of CPI release",
    source: "Beew Algos",
    bias: "Neutral",
    symbol: "EURUSD",
    description:
      "Price action is coiled inside a narrow 30-pip daily bracket. Market participant positioning indicates low risk appetite before the next inflation print.",
    metrics: { prevValue: "1.0890", lastValue: "1.0875", change: "-0.13%" },
  },
];

export async function getLatestMarketSignals(): Promise<MarketSignal[]> {
  try {
    const sql = getSql();

    // 1. Attempt to fetch latest reports from market_reports table
    const reports = await sql`
      SELECT title, symbol, bias, summary as description 
      FROM market_reports 
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    if (reports.length > 0) {
      return reports.map((r: any) => ({
        title: r.title,
        source: "Beew Market Intelligence",
        bias: r.bias.includes("Bullish") ? "Bullish" : r.bias.includes("Bearish") ? "Bearish" : "Neutral",
        symbol: r.symbol,
        description: r.description,
      }));
    }
  } catch (error) {
    console.warn("[Quant] Falling back to bundled market signals:", error);
  }

  return FALLBACK_SIGNALS;
}
export type { MarketSignal as SignalType };
