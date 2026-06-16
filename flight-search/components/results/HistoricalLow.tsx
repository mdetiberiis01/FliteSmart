'use client';

import { formatPrice } from '@/lib/utils/format-price';

interface Props {
  historicalLow: number | null;
  currency?: string;
}

export function HistoricalLow({ historicalLow, currency = 'USD' }: Props) {
  if (!historicalLow) return null;

  return (
    <span className="text-xs text-slate-400">
      Historical low:{' '}
      <span className="text-slate-600">{formatPrice(historicalLow, currency)}</span>
    </span>
  );
}
