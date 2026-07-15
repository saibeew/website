import { type FeedItem } from "./rss-fetcher";

export async function fetchGdeltNews(): Promise<FeedItem[]> {
  try {
    const query = encodeURIComponent("(quant OR trading OR bitcoin OR forex OR fed OR inflation)");
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${query}&mode=artlist&format=json&maxrecords=25&timespan=12h`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP status ${response.status}`);
    }

    const data = await response.json();
    if (!data.articles) return [];

    return data.articles.map((art: { title?: string; url?: string; seendate?: string; socialimage?: string; source?: string }) => ({
      title: art.title || "",
      link: art.url || "",
      pubDate: art.seendate || new Date().toISOString(),
      content: art.socialimage || "", // GDELT doesn't return full text snippet, but returns metadata
      sourceId: "gdelt",
      sourceName: art.source || "GDELT News",
      category: "general" as const,
      weight: 0.7,
    }));
  } catch (error) {
    console.warn("[Trends] Failed to fetch GDELT news:", error instanceof Error ? error.message : error);
    return [];
  }
}
