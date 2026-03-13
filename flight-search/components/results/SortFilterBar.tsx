'use client';

import { SearchResult } from '@/types/search';

type SortKey = 'price' | 'date' | 'deal';

interface Props {
  results: SearchResult[];
  sortBy: SortKey;
  onSortChange: (key: SortKey) => void;
  filterStops: number | null;
  onFilterStopsChange: (stops: number | null) => void;
}

export function SortFilterBar({
  sortBy,
  onSortChange,
  filterStops,
  onFilterStopsChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-white/40">Sort:</span>
        {(['price', 'date', 'deal'] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => onSortChange(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              sortBy === key
                ? 'bg-teal-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {key === 'price' ? 'Cheapest' : key === 'date' ? 'Soonest' : 'Best deal'}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm ml-auto">
        <span className="text-white/40">Stops:</span>
        {[null, 0, 1].map((stops) => (
          <button
            key={String(stops)}
            onClick={() => onFilterStopsChange(stops)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterStops === stops
                ? 'bg-teal-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {stops === null ? 'Any' : stops === 0 ? 'Nonstop' : '1 stop'}
          </button>
        ))}
      </div>
    </div>
  );
}
