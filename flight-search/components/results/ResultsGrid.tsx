'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SearchResult } from '@/types/search';
import { FlightCard } from './FlightCard';
import { FlightRow } from './FlightRow';
import { SortFilterBar, SortKey, SortDir, ViewMode } from './SortFilterBar';
import { FlightCardSkeleton, FlightRowSkeleton } from './FlightCardSkeleton';

function parseDurationMinutes(iso: string): number {
  const h = parseInt(iso.match(/(\d+)H/)?.[1] ?? '0');
  const m = parseInt(iso.match(/(\d+)M/)?.[1] ?? '0');
  return h * 60 + m;
}

interface Props {
  results: SearchResult[];
  isLoading: boolean;
  cabinClass?: string;
  travelers?: number;
  tripType?: 'roundtrip' | 'oneway';
}

export function ResultsGrid({ results, isLoading, cabinClass = 'economy', travelers = 1, tripType = 'roundtrip' }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>('price');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [filterStops, setFilterStops] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const displayResults = useMemo(() => {
    let filtered = results;
    if (filterStops !== null) {
      filtered = filtered.filter((r) => r.stops === filterStops);
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sortBy === 'price') return (a.price - b.price) * dir;
      if (sortBy === 'date') return a.departureDate.localeCompare(b.departureDate) * dir;
      if (sortBy === 'duration') return (parseDurationMinutes(a.duration) - parseDurationMinutes(b.duration)) * dir;
      if (sortBy === 'stops') return (a.stops - b.stops) * dir;
      if (sortBy === 'deal') {
        const ratingOrder: Record<string, number> = { great: 0, good: 1, fair: 2, 'above-average': 3, unknown: 4 };
        return (ratingOrder[a.dealRating] ?? 4) - (ratingOrder[b.dealRating] ?? 4);
      }
      return 0;
    });
  }, [results, sortBy, sortDir, filterStops]);

  if (isLoading) {
    return (
      <div>
        <div className="h-10 mb-6" />
        {viewMode === 'tiles' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <FlightCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <FlightRowSkeleton key={i} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!results.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center py-20"
      >
        <div className="flex justify-center mb-6">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-slate-200" aria-hidden="true">
            <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
            <path d="M38 19.2 36 11l3.5-3.5C41 6 41 4 39 2c-2-2-4-2-5.5-.5L30 5l-8.2 1.2c-.5.1-.9.5-.7 1l2.3 4c.3.5.9.7 1.5.5L29 10.5 31 13l-2 3.5c-.3.5-.1 1.1.4 1.4l4 2.3c.5.2 1 0 1-.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="44" cy="44" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="m51 51 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="text-slate-900 text-xl font-semibold mb-2">No flights found</h3>
        <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6">
          We couldn&apos;t find flights for this search. Try a different destination, time period, or remove filters.
        </p>
        <div className="flex items-center justify-center gap-3">
          <a
            href="/"
            className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition"
          >
            New search
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      <SortFilterBar
        results={results}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={(key, dir) => { setSortBy(key); setSortDir(dir); }}
        filterStops={filterStops}
        onFilterStopsChange={setFilterStops}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <p className="text-xs text-slate-400 mt-2 mb-4">
        Deal % shows how far the price is above the 12-month historical low for that route.
      </p>

      {viewMode === 'tiles' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayResults.map((result, i) => (
            <FlightCard key={result.id} result={result} index={i} cabinClass={cabinClass} travelers={travelers} tripType={tripType} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayResults.map((result, i) => (
            <FlightRow key={result.id} result={result} index={i} cabinClass={cabinClass} travelers={travelers} tripType={tripType} />
          ))}
        </div>
      )}

      {filterStops !== null && displayResults.length === 0 && (
        <div className="text-center py-8 text-slate-500 text-sm">
          No flights match this filter.{' '}
          <button onClick={() => setFilterStops(null)} className="text-slate-900 underline underline-offset-2">
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
}
