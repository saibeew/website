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

const DEMO_NEWS = [
  {
    id: 900001,
    title: "Gold holds near session highs as traders weigh Fed outlook",
    body: "XAUUSD gains traction as market participants position around macro data and rate expectations.",
    category: "macro",
    source_url: "",
    source: "beew.ai Example Feed",
    published_at: new Date().toISOString(),
    collected_at: new Date().toISOString(),
    processed: true,
    ai_summarized: true,
  },
  {
    id: 900002,
    title: "Bitcoin volatility spikes ahead of major liquidity session",
    body: "BTC remains highly reactive to broader risk sentiment and exchange flow conditions.",
    category: "crypto",
    source_url: "",
    source: "beew.ai Example Feed",
    published_at: new Date().toISOString(),
    collected_at: new Date().toISOString(),
    processed: true,
    ai_summarized: true,
  },
  {
    id: 900003,
    title: "FX markets stabilize as dollar demand pauses",
    body: "EURUSD and GBPUSD are consolidating while traders wait for the next catalyst.",
    category: "forex",
    source_url: "",
    source: "beew.ai Example Feed",
    published_at: new Date().toISOString(),
    collected_at: new Date().toISOString(),
    processed: true,
    ai_summarized: false,
  },
  {
    id: 900004,
    title: "Energy prices cool after a strong intraday squeeze",
    body: "Oil and commodity pairs are rotating as supply expectations settle.",
    category: "commodity",
    source_url: "",
    source: "beew.ai Example Feed",
    published_at: new Date().toISOString(),
    collected_at: new Date().toISOString(),
    processed: true,
    ai_summarized: false,
  },
];

const LIVE_SOURCE_TIMEOUT_MS = 6000;

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
  const results: RawNewsItem[] = [];

  for (const query of queries) {
    const xml = await fetchXmlWithTimeout(buildGoogleNewsUrl(query));
    if (!xml) continue;
    results.push(...parseRssItems(xml, "Google News Live"));
  }

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

    return NextResponse.json({ items: filteredItems, total, limit, offset, source: "database" });
  } catch (err: any) {
    console.error("API /api/news error:", err);

    const fallbackItems = DEMO_NEWS.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (symbol === "all") return true;

      const symbolText = symbol.toUpperCase();
      if (symbolText.includes("BTC") || symbolText.includes("ETH")) return item.category === "crypto";
      if (symbolText.includes("XAU") || symbolText.includes("GOLD") || symbolText.includes("OIL")) return item.category === "commodity" || item.category === "macro";
      if (symbolText.includes("USD") || symbolText.includes("EUR") || symbolText.includes("GBP") || symbolText.includes("JPY")) return item.category === "forex" || item.category === "macro";
      return true;
    });

    return NextResponse.json({
      items: fallbackItems,
      total: fallbackItems.length,
      limit,
      offset,
      fallback: true,
      source: "demo",
      error: `Using demo feed because the local news database is unavailable: ${err instanceof Error ? err.message : "unknown error"}`,
    });
  }
}
