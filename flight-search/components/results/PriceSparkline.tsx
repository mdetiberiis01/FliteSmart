'use client';

import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { PricePoint } from '@/types/search';
import { formatPrice } from '@/lib/utils/format-price';

interface Props {
  data: PricePoint[];
  currentPrice?: number;
}

export function PriceSparkline({ data }: Props) {
  if (!data || data.length < 2) {
    return (
      <div className="h-12 flex items-center justify-center text-black/30 dark:text-white/30 text-xs">
        No history
      </div>
    );
  }

  const chartData = data.map((p) => ({ month: p.month, price: p.price }));

  return (
    <div className="h-12">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--sparkline-color)" stopOpacity={0.15} />
              <stop offset="95%" stopColor="var(--sparkline-color)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="price"
            stroke="var(--sparkline-color)"
            strokeWidth={1}
            fill="url(#sparkGrad)"
            dot={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="glass-card text-xs text-black dark:text-white px-2 py-1 rounded border border-black/15 dark:border-white/20">
                  {formatPrice(payload[0].value as number)}
                </div>
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
