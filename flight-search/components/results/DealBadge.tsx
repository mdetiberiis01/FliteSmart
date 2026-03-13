'use client';

import { SearchResult } from '@/types/search';

interface Props {
  rating: SearchResult['dealRating'];
  percent: number | null;
}

const RATING_CONFIG = {
  great: { label: 'Great deal', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  good: { label: 'Good deal', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  fair: { label: 'Fair price', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  'above-average': {
    label: 'Above avg',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  unknown: { label: 'New route', color: 'bg-white/10 text-white/50 border-white/20' },
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
