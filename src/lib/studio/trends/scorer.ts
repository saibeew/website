import { type FeedItem } from "./rss-fetcher";

export interface ScoredTrend {
  title: string;
  link: string;
  source: string;
  category: FeedItem["category"];
  pubDate: string;
  score: number;
  tags: string[];
}

const KEYWORD_SCORES: Record<string, number> = {
  // High impact (quant/macro indicators)
  fed: 2.5,
  fomc: 2.5,
  inflation: 2.0,
  cpi: 2.0,
  interest: 1.5,
  yield: 1.5,
  treasury: 1.5,
  rate: 1.2,
  recession: 1.5,
  "jobs report": 1.8,
  unemployment: 1.5,
  payrolls: 1.8,
  gdp: 1.5,

  // Alpha / Quant signals
  quant: 2.5,
  algorithmic: 2.2,
  algo: 1.8,
  arbitrage: 2.0,
  backtest: 1.8,
  hft: 2.2,
  signal: 1.5,
  liquidity: 1.5,
  volatility: 1.8,
  vix: 1.8,

  // Assets
  bitcoin: 2.0,
  btc: 1.8,
  ethereum: 1.5,
  eth: 1.2,
  gold: 1.5,
  oil: 1.2,
  nasdaq: 1.5,
  forex: 1.5,
  xauusd: 2.0,
  eurusd: 1.5,
};

export function scoreItem(item: FeedItem): ScoredTrend {
  const titleLower = item.title.toLowerCase();
  const contentLower = item.content.toLowerCase();
  
  let baseScore = 0;
  const tags: string[] = [];

  // Match keywords and accumulate score
  for (const [kw, pts] of Object.entries(KEYWORD_SCORES)) {
    if (titleLower.includes(kw)) {
      baseScore += pts * 1.5; // title matches weigh more
      if (!tags.includes(kw)) tags.push(kw);
    } else if (contentLower.includes(kw)) {
      baseScore += pts * 0.5;
      if (!tags.includes(kw)) tags.push(kw);
    }
  }

  // Weight by source reliability
  let finalScore = baseScore * item.weight;

  // Recency boost (decay over 24 hours)
  const ageMs = Date.now() - new Date(item.pubDate).getTime();
  const ageHrs = Math.max(0, ageMs / (1000 * 60 * 60));
  
  if (ageHrs < 24) {
    const boost = (24 - ageHrs) / 24; // up to +1.5 boost for very fresh news
    finalScore += boost * 1.5;
  }

  return {
    title: item.title,
    link: item.link,
    source: item.sourceName,
    category: item.category,
    pubDate: item.pubDate,
    score: Math.round(finalScore * 10) / 10,
    tags,
  };
}

export function rankTrends(items: FeedItem[]): ScoredTrend[] {
  return items
    .map(scoreItem)
    .filter((trend) => trend.score > 0.5) // filter out low-relevance topics
    .sort((a, b) => b.score - a.score);
}
