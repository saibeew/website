export interface TrendSource {
  id: string;
  name: string;
  url: string;
  category: "crypto" | "forex" | "economy" | "general";
  weight: number; // 0.1 to 1.0 influence weight
}

export const TREND_SOURCES: TrendSource[] = [
  {
    id: "coindesk",
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    category: "crypto",
    weight: 0.9,
  },
  {
    id: "cointelegraph",
    name: "CoinTelegraph",
    url: "https://cointelegraph.com/rss",
    category: "crypto",
    weight: 0.8,
  },
  {
    id: "reuters-wealth",
    name: "Reuters Wealth",
    url: "https://news.google.com/rss/search?q=site:reuters.com+finance+OR+markets+OR+investing",
    category: "general",
    weight: 1.0,
  },
  {
    id: "bloomberg-markets",
    name: "Bloomberg Markets",
    url: "https://news.google.com/rss/search?q=site:bloomberg.com+markets+OR+economy",
    category: "economy",
    weight: 1.0,
  },
  {
    id: "forexlive",
    name: "ForexLive",
    url: "https://news.google.com/rss/search?q=site:forexlive.com+forex+OR+currencies",
    category: "forex",
    weight: 0.9,
  },
  {
    id: "seeking-alpha",
    name: "Seeking Alpha",
    url: "https://news.google.com/rss/search?q=site:seekingalpha.com+market+outlook+OR+macro",
    category: "general",
    weight: 0.8,
  },
];
