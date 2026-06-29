import Database from "better-sqlite3";

const DB_PATH = process.env.NEWS_DB_PATH || "d:/news/news-engine/news.db";

let _db: any = null;

export function getDb() {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: true });
  }
  return _db;
}

export interface NewsItem {
  id: number;
  title: string;
  summary: string | null;
  link: string | null;
  source: string;
  category: string | null;
  published_at: string | null;
  collected_at: string | null;
  processed: number;
  ai_summarized: number;
}

function getKeywordsForSymbol(symbol: string): string[] {
  const s = symbol.toUpperCase();
  if (s === "XAUUSD" || s === "GOLD" || s === "XAGUSD" || s === "SILVER") {
    return ["gold", "xau", "silver", "xag", "precious metal", "commodity", "metals"];
  }
  if (s.includes("BTC") || s.includes("ETH") || s.includes("SOL") || s.includes("XRP") || s.includes("DOGE") || s.includes("CRYPTO")) {
    const kws = ["bitcoin", "btc", "ethereum", "eth", "solana", "sol", "xrp", "ripple", "doge", "crypto", "blockchain", "defi", "stablecoin"];
    if (s.includes("BTC")) kws.unshift("bitcoin", "btc");
    if (s.includes("ETH")) kws.unshift("ethereum", "eth");
    if (s.includes("SOL")) kws.unshift("solana", "sol");
    if (s.includes("XRP")) kws.unshift("ripple", "xrp");
    if (s.includes("DOGE")) kws.unshift("doge", "dogecoin");
    return Array.from(new Set(kws));
  }
  if (s.includes("SPX") || s.includes("NAS") || s.includes("NDX") || s.includes("US30") || s.includes("DJI") || s.includes("GER") || s.includes("UK100")) {
    return ["s&p", "spx", "nasdaq", "ndx", "dow", "djia", "dax", "ftse", "stocks", "equity", "market", "wall street", "nvidia", "apple", "tesla", "microsoft", "google", "meta"];
  }
  if (s === "WTIUSD" || s === "BRENTUSD" || s.includes("OIL")) {
    return ["oil", "crude", "brent", "wti", "energy", "petroleum", "opec"];
  }
  
  // Forex base and quote currency
  const base = s.slice(0, 3);
  const quote = s.slice(3, 6);
  const forexKws = ["forex", "fx", "currency", "dxy", "dollar", "fed", "inflation", "interest rate", "rate cut", "cpi"];
  if (base && base.length === 3) forexKws.unshift(base.toLowerCase());
  if (quote && quote.length === 3) forexKws.unshift(quote.toLowerCase());
  return Array.from(new Set(forexKws));
}

export function fetchNews({ limit = 50, offset = 0, category = "all", symbol = "all" } = {}) {
  const db = getDb();
  let query = "SELECT * FROM news_items";
  const conditions: string[] = [];
  const params: any[] = [];

  if (category && category !== "all") {
    conditions.push("category = ?");
    params.push(category);
  }

  if (symbol && symbol !== "all") {
    const keywords = getKeywordsForSymbol(symbol);
    const keywordConditions = keywords.map(() => "(title LIKE ? OR summary LIKE ?)");
    conditions.push(`(${keywordConditions.join(" OR ")})`);
    keywords.forEach((kw) => {
      params.push(`%${kw}%`, `%${kw}%`);
    });
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  query += " ORDER BY collected_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  return db.prepare(query).all(...params) as NewsItem[];
}

export function fetchNewsById(id: number) {
  const db = getDb();
  return db.prepare("SELECT * FROM news_items WHERE id = ?").get(id) as NewsItem | undefined;
}

export function fetchCategories() {
  const db = getDb();
  const rows = db
    .prepare("SELECT DISTINCT category FROM news_items WHERE category IS NOT NULL ORDER BY category")
    .all() as { category: string }[];
  return rows.map((r) => r.category);
}

export function countNews(category = "all", symbol = "all") {
  const db = getDb();
  let query = "SELECT COUNT(*) as count FROM news_items";
  const conditions: string[] = [];
  const params: any[] = [];

  if (category && category !== "all") {
    conditions.push("category = ?");
    params.push(category);
  }

  if (symbol && symbol !== "all") {
    const keywords = getKeywordsForSymbol(symbol);
    const keywordConditions = keywords.map(() => "(title LIKE ? OR summary LIKE ?)");
    conditions.push(`(${keywordConditions.join(" OR ")})`);
    keywords.forEach((kw) => {
      params.push(`%${kw}%`, `%${kw}%`);
    });
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  const stmt = db.prepare(query);
  const res = params.length > 0 ? stmt.get(...params) : stmt.get();
  return (res as { count: number }).count;
}
