import { SearchResult } from '@/types/search';

export function mergeAndDeduplicateResults(results: SearchResult[]): SearchResult[] {
  // Deduplicate by destination + departure month
  const seen = new Map<string, SearchResult>();

  for (const result of results) {
    const month = result.departureDate.substring(0, 7);
    const key = `${result.destination}-${month}`;

    const existing = seen.get(key);
    if (!existing || result.price < existing.price) {
      seen.set(key, result);
    }
  }

  return Array.from(seen.values()).sort((a, b) => a.price - b.price);
}
