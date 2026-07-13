import { fetchAllFeeds } from "./rss-fetcher";
import { fetchGdeltNews } from "./gdelt-fetcher";
import { deduplicateItems } from "./dedup";
import { rankTrends, type ScoredTrend } from "./scorer";

function getFallbackTrends(): ScoredTrend[] {
  const now = new Date().toISOString();
  return [
    {
      title: "Gold volatility stays elevated as rate-cut expectations reset",
      link: "https://news.google.com/search?q=gold%20rates%20fed%20inflation",
      source: "Beew Studio Demo Feed",
      category: "economy",
      pubDate: now,
      score: 8.8,
      tags: ["gold", "fed", "inflation", "volatility"],
    },
    {
      title: "Bitcoin liquidity expands as traders rotate back into risk assets",
      link: "https://news.google.com/search?q=bitcoin%20liquidity%20markets",
      source: "Beew Studio Demo Feed",
      category: "crypto",
      pubDate: now,
      score: 8.1,
      tags: ["bitcoin", "liquidity", "volatility"],
    },
    {
      title: "Dollar pairs consolidate before the next macro data release",
      link: "https://news.google.com/search?q=forex%20dollar%20macro%20data",
      source: "Beew Studio Demo Feed",
      category: "forex",
      pubDate: now,
      score: 7.5,
      tags: ["forex", "dollar", "cpi"],
    },
  ];
}

export async function getTrendingTopics(): Promise<ScoredTrend[]> {
  try {
    console.log("[Trends] Fetching RSS feeds and GDELT...");
    const [rssItems, gdeltItems] = await Promise.all([
      fetchAllFeeds(),
      fetchGdeltNews(),
    ]);

    const allItems = [...rssItems, ...gdeltItems];
    const uniqueItems = deduplicateItems(allItems);
    const ranked = rankTrends(uniqueItems);

    // Limit to top 25 high-quality trends
    return ranked.length > 0 ? ranked.slice(0, 25) : getFallbackTrends();
  } catch (error) {
    console.error("[Trends] Orchestration failed:", error);
    return getFallbackTrends();
  }
}
export { type ScoredTrend };
