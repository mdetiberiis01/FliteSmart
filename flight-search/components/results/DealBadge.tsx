'use client';

import { SearchResult } from '@/types/search';

interface Props {
  rating: SearchResult['dealRating'];
  percent: number | null;
}

const RATING_CONFIG = {
  great: {
    label: 'Great deal',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
    icon: '✓',
  },
  good: {
    label: 'Good deal',
    color: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-400 dark:border-sky-500/30',
    icon: null,
  },
  fair: {
    label: 'Fair price',
    color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25',
    icon: null,
  },
  'above-average': {
    label: 'Above avg',
    color: 'bg-black/5 text-black/50 border-black/10 dark:bg-white/5 dark:text-white/50 dark:border-white/15',
    icon: null,
  },
  unknown: {
    label: 'New route',
    color: 'bg-black/5 text-black/35 border-black/8 dark:bg-white/5 dark:text-white/35 dark:border-white/10',
    icon: null,
  },
};

export function DealBadge({ rating, percent }: Props) {
  const config = RATING_CONFIG[rating] || RATING_CONFIG.unknown;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      {config.icon && <span>{config.icon}</span>}
      {config.label}
      {percent !== null && percent > 0 && ` +${Math.round(percent)}%`}
      {percent !== null && percent <= 0 && ` ${Math.round(percent)}%`}
    </span>
  );
}
