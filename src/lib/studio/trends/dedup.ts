import { createHash } from "crypto";
import { type FeedItem } from "./rss-fetcher";

function computeHash(title: string): string {
  // Normalize title (strip non-alphanumeric, lowercase)
  const normalized = title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
  return createHash("sha256").update(normalized).digest("hex");
}

export function deduplicateItems(items: FeedItem[]): FeedItem[] {
  const seenHashes = new Set<string>();
  const uniqueItems: FeedItem[] = [];

  for (const item of items) {
    if (!item.title) continue;
    const hash = computeHash(item.title);
    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      uniqueItems.push(item);
    }
  }

  return uniqueItems;
}
