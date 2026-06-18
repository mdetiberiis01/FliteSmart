'use client';

import { SearchResult } from '@/types/search';

interface Props {
  rating: SearchResult['dealRating'];
  percent: number | null;
}

const RATING_CONFIG = {
  great: {
    label: 'Great deal',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: '✓',
  },
  good: {
    label: 'Good deal',
    color: 'bg-brand-50 text-brand border-blue-200',
    icon: null,
  },
  fair: {
    label: 'Fair price',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: null,
  },
  'above-average': {
    label: 'Above avg',
    color: 'bg-slate-100 text-slate-500 border-slate-200',
    icon: null,
  },
  unknown: {
    label: 'New route',
    color: 'bg-slate-50 text-slate-400 border-slate-100',
    icon: null,
  },
};

export function DealBadge({ rating, percent }: Props) {
  const config = RATING_CONFIG[rating] || RATING_CONFIG.unknown;

  const atHistoricalLow = percent !== null && percent <= 0;
  const percentLabel = !atHistoricalLow && percent !== null && percent > 0
    ? ` +${Math.round(percent)}%`
    : null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      {config.icon && <span>{config.icon}</span>}
      {atHistoricalLow ? '12-month low' : config.label}
      {percentLabel}
    </span>
  );
}
