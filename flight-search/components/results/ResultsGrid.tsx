'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchResult } from '@/types/search';
import { FlightCard } from './FlightCard';
import { FlightRow } from './FlightRow';
import { SortFilterBar, SortKey, SortDir, ViewMode } from './SortFilterBar';
import { FlightCardSkeleton, FlightRowSkeleton } from './FlightCardSkeleton';
import { FilterPanel, Filters, defaultFilters, isFilterActive } from './FilterPanel';

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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayResults = useMemo(() => {
    let filtered = results;

    if (filters.stops.length > 0) {
      filtered = filtered.filter(r => filters.stops.includes(Math.min(r.stops, 2)));
    }
    if (filters.maxPrice !== Infinity) {
      filtered = filtered.filter(r => r.price <= filters.maxPrice);
    }
    if (filters.maxDurationMin !== Infinity) {
      filtered = filtered.filter(r => parseDurationMinutes(r.duration) <= filters.maxDurationMin);
    }
    if (filters.depTimeFrom !== 0 || filters.depTimeTo !== 23) {
      filtered = filtered.filter(r =>
        r.departureHour !== undefined
          ? r.departureHour >= filters.depTimeFrom && r.departureHour <= filters.depTimeTo
          : true
      );
    }
    if (filters.arrTimeFrom !== 0 || filters.arrTimeTo !== 23) {
      filtered = filtered.filter(r =>
        r.arrivalHour !== undefined
          ? r.arrivalHour >= filters.arrTimeFrom && r.arrivalHour <= filters.arrTimeTo
          : true
      );
    }
    if (filters.airlines.length > 0) {
      filtered = filtered.filter(r => filters.airlines.includes(r.airlineCode));
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
  }, [results, sortBy, sortDir, filters]);

  const filterActive = isFilterActive(filters);
  const hiddenCount = results.length - displayResults.length;

  if (isLoading && results.length === 0) {
    return (
      <div className="flex gap-6">
        <div className="hidden lg:block w-60 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-10 mb-6" />
          {viewMode === 'tiles' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <FlightCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => <FlightRowSkeleton key={i} />)}
            </div>
          )}
        </div>
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
        <a href="/" className="px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand-dark transition">
          New search
        </a>
      </motion.div>
    );
  }

  return (
    <div className="flex gap-6 items-start">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-60 shrink-0 sticky top-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <FilterPanel results={results} filters={filters} onChange={setFilters} />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile filter toggle */}
        <div className="flex items-center gap-2 mb-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
              filterActive
                ? 'bg-brand/10 border-brand text-brand'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 3h12M3 7h8M5 11h4" strokeLinecap="round" />
            </svg>
            Filters{filterActive ? ` · ${[filters.stops.length > 0, filters.maxPrice !== Infinity, filters.maxDurationMin !== Infinity, filters.depTimeFrom !== 0 || filters.depTimeTo !== 23, filters.arrTimeFrom !== 0 || filters.arrTimeTo !== 23, filters.airlines.length > 0].filter(Boolean).length}` : ''}
          </button>
          {filterActive && (
            <button onClick={() => setFilters(defaultFilters)} className="text-xs text-slate-400 hover:text-brand">
              Clear
            </button>
          )}
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-xs bg-white z-50 lg:hidden overflow-y-auto p-5 shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-slate-900">Filters</span>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <FilterPanel results={results} filters={filters} onChange={f => { setFilters(f); }} />
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="mt-4 w-full py-2.5 rounded-xl bg-brand text-white text-sm font-medium"
                >
                  Show {displayResults.length} result{displayResults.length !== 1 ? 's' : ''}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <SortFilterBar
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={(key, dir) => { setSortBy(key); setSortDir(dir); }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {hiddenCount > 0 && (
          <p className="text-xs text-slate-400 mb-3">
            {hiddenCount} flight{hiddenCount !== 1 ? 's' : ''} hidden by filters.{' '}
            <button onClick={() => setFilters(defaultFilters)} className="text-brand hover:underline">Clear</button>
          </p>
        )}

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

        {displayResults.length === 0 && filterActive && (
          <div className="text-center py-8 text-slate-500 text-sm">
            No flights match these filters.{' '}
            <button onClick={() => setFilters(defaultFilters)} className="text-slate-900 underline underline-offset-2">
              Clear filters
            </button>
          </div>
        )}

        {isLoading && results.length > 0 && (
          <div className="mt-3 flex items-center gap-2.5 text-sm text-slate-400 py-3 px-4 bg-white rounded-xl border border-slate-100">
            <div className="w-3.5 h-3.5 border-2 border-brand border-t-transparent rounded-full animate-spin shrink-0" />
            Finding more flights…
          </div>
        )}
      </div>
    </div>
  );
}
