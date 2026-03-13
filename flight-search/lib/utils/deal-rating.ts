import { SearchResult } from '@/types/search';

export function dealRating(
  currentPrice: number,
  historicalLow: number | null
): { rating: SearchResult['dealRating']; percent: number | null } {
  if (!historicalLow || historicalLow <= 0) {
    return { rating: 'unknown', percent: null };
  }

  const percent = ((currentPrice - historicalLow) / historicalLow) * 100;

  if (percent <= 5) return { rating: 'great', percent };
  if (percent <= 20) return { rating: 'good', percent };
  if (percent <= 40) return { rating: 'fair', percent };
  return { rating: 'above-average', percent };
}
