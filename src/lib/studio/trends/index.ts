import { fetchAllFeeds } from "./rss-fetcher";
import { fetchGdeltNews } from "./gdelt-fetcher";
import { deduplicateItems } from "./dedup";
import { rankTrends, type ScoredTrend } from "./scorer";

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
    return ranked.slice(0, 25);
  } catch (error) {
    console.error("[Trends] Orchestration failed:", error);
    return [];
  }
}
export { type ScoredTrend };
