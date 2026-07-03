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

type FetchNewsOptions = {
  limit?: number;
  offset?: number;
  category?: string;
  symbol?: string;
};

export function fetchNews(_options: FetchNewsOptions = {}): NewsItem[] {
  return [];
}

export function fetchNewsById(_id: number): NewsItem | undefined {
  return undefined;
}

export function fetchCategories(): string[] {
  return [];
}

export function countNews(_category = "all", _symbol = "all") {
  return 0;
}
