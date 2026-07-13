import Parser from "rss-parser";
import { TREND_SOURCES, type TrendSource } from "./sources";

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  sourceId: string;
  sourceName: string;
  category: TrendSource["category"];
  weight: number;
}

const parser = new Parser({
  requestOptions: {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  },
});

export async function fetchRssFeed(source: TrendSource): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).map((item) => ({
      title: item.title || "",
      link: item.link || "",
      pubDate: item.pubDate || new Date().toISOString(),
      content: item.contentSnippet || item.content || "",
      sourceId: source.id,
      sourceName: source.name,
      category: source.category,
      weight: source.weight,
    }));
  } catch (error: any) {
    console.warn(`[Trends] Failed to fetch feed ${source.name}:`, error.message || error);
    return [];
  }
}

export async function fetchAllFeeds(): Promise<FeedItem[]> {
  const promises = TREND_SOURCES.map((source) => fetchRssFeed(source));
  const results = await Promise.all(promises);
  return results.flat();
}
