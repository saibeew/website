import { NextResponse } from "next/server";
import { fetchNews, countNews } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const category = searchParams.get("category") || "all";
  const symbol = searchParams.get("symbol") || "all";

  try {
    const rows = fetchNews({ limit, offset, category, symbol });
    const total = countNews(category, symbol);

    const items = rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.summary || "",
      category: row.category || "finance",
      source_url: row.link || "",
      source: row.source,
      score: null,
      published_at: row.published_at,
      collected_at: row.collected_at,
      processed: row.processed === 1,
      ai_summarized: row.ai_summarized === 1,
    }));

    return NextResponse.json({ items, total, limit, offset });
  } catch (err: any) {
    console.error("API /api/news error:", err);
    return NextResponse.json(
      { error: `Failed to fetch news items: ${err.message}` },
      { status: 500 }
    );
  }
}
