'use client';

import { formatPrice } from '@/lib/utils/format-price';

interface Props {
  historicalLow: number | null;
  currency?: string;
}

export function HistoricalLow({ historicalLow, currency = 'USD' }: Props) {
  if (!historicalLow) return null;

  return (
    <span className="text-xs text-black/50 dark:text-white/50">
      Historical low:{' '}
      <span className="text-black/70 dark:text-white/70">{formatPrice(historicalLow, currency)}</span>
    </span>
  );
}
