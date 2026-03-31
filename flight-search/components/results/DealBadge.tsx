'use client';

import { SearchResult } from '@/types/search';

interface Props {
  rating: SearchResult['dealRating'];
  percent: number | null;
}

const RATING_CONFIG = {
  great: { label: 'Great deal', color: 'bg-black/15 text-black border-black/30 dark:bg-white/20 dark:text-white dark:border-white/40' },
  good: { label: 'Good deal', color: 'bg-black/10 text-black/90 border-black/20 dark:bg-white/12 dark:text-white/90 dark:border-white/30' },
  fair: { label: 'Fair price', color: 'bg-black/5 text-black/70 border-black/15 dark:bg-white/8 dark:text-white/70 dark:border-white/20' },
  'above-average': {
    label: 'Above avg',
    color: 'bg-black/5 text-black/50 border-black/10 dark:bg-white/5 dark:text-white/50 dark:border-white/15',
  },
  unknown: { label: 'New route', color: 'bg-black/5 text-black/40 border-black/8 dark:bg-white/5 dark:text-white/40 dark:border-white/10' },
};

export function DealBadge({ rating, percent }: Props) {
  const config = RATING_CONFIG[rating] || RATING_CONFIG.unknown;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      {rating === 'great' && '✓ '}
      {config.label}
      {percent !== null && percent > 0 && ` +${Math.round(percent)}%`}
      {percent !== null && percent <= 0 && ` ${Math.round(percent)}%`}
    </span>
  );
}
