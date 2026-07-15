import { NextResponse } from "next/server";
import { fetchNews, countNews } from "@/lib/db";

export const dynamic = "force-dynamic";

type RawNewsItem = {
  id: number;
  title: string;
  body: string;
  category: string;
  source_url: string;
  source: string;
  score: null;
  published_at: string;
  collected_at: string;
  processed: boolean;
  ai_summarized: boolean;
};

const LIVE_SOURCE_TIMEOUT_MS = 6000;

function getPreviewNews(): RawNewsItem[] {
  const now = Date.now();
  return [
    {
      id: -101,
      title: "Preview: Central-bank policy expectations remain the main FX volatility driver",
      body: "Demonstration item for the local preview. Connect a licensed news provider before production launch.",
      category: "macro",
      source_url: "",
      source: "Beew preview dataset",
      score: null,
      published_at: new Date(now - 12 * 60_000).toISOString(),
      collected_at: new Date(now).toISOString(),
      processed: true,
      ai_summarized: false,
    },
    {
      id: -102,
      title: "Preview: Gold traders monitor real yields and dollar momentum",
      body: "Demonstration item showing how commodity intelligence is categorized. This is not a live market report.",
      category: "commodity",
      source_url: "",
      source: "Beew preview dataset",
      score: null,
      published_at: new Date(now - 28 * 60_000).toISOString(),
      collected_at: new Date(now).toISOString(),
      processed: true,
      ai_summarized: false,
    },
    {
      id: -103,
      title: "Preview: Crypto liquidity conditions can amplify short-term price moves",
      body: "Demonstration item for Studio and News acceptance testing. Do not treat it as current investment information.",
      category: "crypto",
      source_url: "",
      source: "Beew preview dataset",
      score: null,
      published_at: new Date(now - 44 * 60_000).toISOString(),
      collected_at: new Date(now).toISOString(),
      processed: true,
      ai_summarized: false,
    },
  ];
}

function normalizeCategory(rawCategory: string | null, title: string, body: string) {
  const text = `${rawCategory || ""} ${title} ${body}`.toLowerCase();

  if (/(war|conflict|strike|sanction|election|geopolit|military|ceasefire|attack|tension)/.test(text)) {
    return "geopolitical";
  }
  if (/(fed|cpi|inflation|rates|interest rate|jobs report|nfp|gdp|macro|recession|central bank)/.test(text)) {
    return "macro";
  }
  if (/(bitcoin|btc|ethereum|eth|solana|sol|crypto|blockchain|defi|stablecoin|altcoin)/.test(text)) {
    return "crypto";
  }
  if (/(gold|silver|oil|crude|brent|wti|commodity|copper|natural gas)/.test(text)) {
    return "commodity";
  }
  if (/(forex|fx|eurusd|gbpusd|usdjpy|usd|currency|dollar|euro|yen|pound)/.test(text)) {
    return "forex";
  }
  if (/(breaking|urgent|flash)/.test(text)) {
    return "breaking";
  }
  return "finance";
}

function stripHtml(text: string) {
  return text.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function pickCategoryFromText(title: string, body: string) {
  return normalizeCategory(null, title, body);
}

function buildGoogleNewsUrl(query: string) {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
}

function buildLiveQueries(category: string, symbol: string) {
  const queries = new Set<string>();
  const normalizedSymbol = symbol.toUpperCase();

  if (category !== "all") {
    queries.add(category);
  }

  if (normalizedSymbol !== "ALL") {
    queries.add(normalizedSymbol);
  }

  if (normalizedSymbol.includes("XAU") || normalizedSymbol.includes("GOLD")) {
    queries.add("gold OR XAUUSD");
  }
  if (normalizedSymbol.includes("BTC") || normalizedSymbol.includes("ETH") || normalizedSymbol.includes("CRYPTO")) {
    queries.add("bitcoin OR ethereum OR crypto");
  }
  if (normalizedSymbol.includes("EUR") || normalizedSymbol.includes("GBP") || normalizedSymbol.includes("JPY") || normalizedSymbol.includes("USD")) {
    queries.add("forex OR dollar OR rate cut OR inflation");
  }

  if (queries.size === 0) {
    queries.add("markets OR economy OR finance");
  }

  return [...queries];
}

async function fetchXmlWithTimeout(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), LIVE_SOURCE_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: { "user-agent": "Mozilla/5.0 (Aialgo News Feed)" },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}

function parseRssItems(xml: string, source: string): RawNewsItem[] {
  const items: RawNewsItem[] = [];
  const itemMatches = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches) {
    const title = stripHtml((itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i)?.[1] || itemXml.match(/<title>(.*?)<\/title>/i)?.[1] || "").trim());
    const body = stripHtml((itemXml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/i)?.[1] || itemXml.match(/<description>(.*?)<\/description>/i)?.[1] || "").trim());
    const link = stripHtml((itemXml.match(/<link>(.*?)<\/link>/i)?.[1] || "").trim());
    const published = stripHtml((itemXml.match(/<pubDate>(.*?)<\/pubDate>/i)?.[1] || "").trim());

    if (!title) continue;

    const category = pickCategoryFromText(title, body);
    items.push({
      id: simpleHash(`${title}::${link}::${source}`),
      title,
      body: body || "Live feed item",
      category,
      source_url: link,
      source,
      score: null,
      published_at: published ? new Date(published).toISOString() : new Date().toISOString(),
      collected_at: new Date().toISOString(),
      processed: true,
      ai_summarized: false,
    });
  }

  return items;
}

async function fetchLiveNews(category: string, symbol: string, limit: number) {
  const queries = buildLiveQueries(category, symbol);
  const feeds = await Promise.all(
    queries.map(async (query) => {
      const xml = await fetchXmlWithTimeout(buildGoogleNewsUrl(query));
      return xml ? parseRssItems(xml, "Google News Live") : [];
    })
  );
  const results = feeds.flat();

  const deduped = Array.from(
    new Map(results.map((item) => [`${item.title.toLowerCase()}::${item.source_url}`, item])).values()
  );

  return deduped.slice(0, limit);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const category = searchParams.get("category") || "all";
  const symbol = searchParams.get("symbol") || "all";

  try {
    const liveItems = await fetchLiveNews(category, symbol, limit);
    if (liveItems.length > 0) {
      return NextResponse.json({
        items: liveItems,
        total: liveItems.length,
        limit,
        offset,
        source: "live",
      });
    }

    const rows = fetchNews({ limit, offset, category, symbol });
    const total = countNews(category, symbol);

    const items = rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.summary || "",
      category: normalizeCategory(row.category, row.title, row.summary || ""),
      source_url: row.link || "",
      source: row.source,
      score: null,
      published_at: row.published_at,
      collected_at: row.collected_at,
      processed: row.processed === 1,
      ai_summarized: row.ai_summarized === 1,
    }));

    const filteredItems = category === "all"
      ? items
      : items.filter((item) => item.category === category);

    if (filteredItems.length === 0 && process.env.NODE_ENV === "development") {
      const previewItems = getPreviewNews().filter((item) => category === "all" || item.category === category);
      return NextResponse.json({ items: previewItems, total: previewItems.length, limit, offset, source: "preview" });
    }

    return NextResponse.json({ items: filteredItems, total, limit, offset, source: "database" });
  } catch (err) {
    console.error("API /api/news error:", err);
    return NextResponse.json({
      items: [],
      total: 0,
      limit,
      offset,
      source: "unavailable",
      error: "Live news is temporarily unavailable.",
    }, { status: 503 });
  }
}
