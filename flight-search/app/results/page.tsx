'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchResult } from '@/types/search';

function clientDedup(results: SearchResult[]): SearchResult[] {
  const map = new Map<string, SearchResult>();
  for (const r of results) {
    const key = `${r.destination}-${(r.departureDate ?? '').slice(0, 7)}`;
    const existing = map.get(key);
    if (!existing || r.price < existing.price) map.set(key, r);
  }
  return Array.from(map.values()).sort((a, b) => a.price - b.price);
}
import { ResultsGrid } from '@/components/results/ResultsGrid';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const DestinationMap = dynamic(
  () => import('@/components/map/DestinationMap').then((m) => m.DestinationMap),
  { ssr: false }
);

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [dismissedDemoBanner, setDismissedDemoBanner] = useState(false);

  const origin = searchParams.get('origin') || '';
  const originName = searchParams.get('originName') || origin;
  const destination = searchParams.get('destination') || '';
  const flexibility = searchParams.get('flexibility') || 'anytime';
  const tripDays = parseInt(searchParams.get('tripDays') || '7', 10);
  const cabinClass = searchParams.get('cabinClass') || 'economy';
  const travelers = parseInt(searchParams.get('travelers') || '1', 10);
  const maxBudget = parseInt(searchParams.get('maxBudget') || '0', 10);
  const tripType = (searchParams.get('tripType') || 'roundtrip') as 'roundtrip' | 'oneway';

  useEffect(() => {
    if (!origin || !destination) {
      router.push('/');
      return;
    }

    setIsLoading(true);
    setResults([]);
    setError(null);

    const abortController = new AbortController();

    async function runSearch() {
      try {
        const res = await fetch('/api/search/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            origin,
            originName,
            destination,
            flexibility,
            tripType,
            tripDays,
            cabinClass,
            travelers,
            maxBudget: maxBudget || undefined,
            customDateStart: searchParams.get('customDateStart') || undefined,
            customDateEnd: searchParams.get('customDateEnd') || undefined,
          }),
          signal: abortController.signal,
        });

        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          setError((data as { error?: string }).error || 'Search failed. Please check your connection.');
          setIsLoading(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';
          for (const event of events) {
            if (!event.startsWith('data: ')) continue;
            try {
              const payload = JSON.parse(event.slice(6)) as { done?: boolean; error?: string; results?: SearchResult[] };
              if (payload.done) { setIsLoading(false); return; }
              if (payload.error) { setError(payload.error); setIsLoading(false); return; }
              if (payload.results?.length) {
                setResults((prev) => clientDedup([...prev, ...payload.results!]));
              }
            } catch { /* ignore malformed chunks */ }
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError('Search failed. Please check your connection.');
      } finally {
        setIsLoading(false);
      }
    }

    runSearch();

    return () => abortController.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination, flexibility]);

  const flexLabel =
    {
      anytime: 'Anytime',
      spring: 'Spring',
      summer: 'Summer',
      fall: 'Fall',
      winter: 'Winter',
      custom: 'Custom dates',
    }[flexibility] || flexibility;

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Branded sticky header */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">

          {/* Logo — links home */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 font-bold text-slate-900 tracking-tight shrink-0 hover:opacity-80 transition cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand" aria-hidden="true">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.5-.7 1l2.3 4c.3.5.9.7 1.5.5L9 10.5 11 13l-2 3.5c-.3.5-.1 1.1.4 1.4l4 2.3c.5.2 1 0 1-.5z" />
            </svg>
            <span className="hidden sm:inline">FliteSmart</span>
          </button>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 bg-slate-200 shrink-0" />

          {/* Route + context chips */}
          <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-slate-900 font-semibold text-sm whitespace-nowrap">
              {originName}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand shrink-0" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span className="text-slate-900 font-semibold text-sm whitespace-nowrap capitalize">
              {destination}
            </span>
            <span className="hidden sm:flex items-center gap-1.5 ml-1">
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 whitespace-nowrap">{flexLabel}</span>
              {tripType !== 'oneway' && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 whitespace-nowrap">{tripDays}d {tripType}</span>
                </>
              )}
              {tripType === 'oneway' && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 whitespace-nowrap">one-way</span>
                </>
              )}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowMap(!showMap)}
              className="hidden sm:flex items-center gap-1 text-xs text-slate-400 hover:text-brand transition px-2 py-1 rounded-lg hover:bg-slate-50"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
              </svg>
              {showMap ? 'Hide map' : 'Map'}
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-3 py-1.5 rounded-full bg-brand text-white text-xs font-semibold hover:bg-brand-dark transition whitespace-nowrap"
            >
              New search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Map (optional) */}
        {showMap && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <DestinationMap results={results} origin={origin} />
          </motion.div>
        )}

        {/* Demo data banner */}
        {!isLoading && !error && !dismissedDemoBanner && results.length > 0 && results.every((r) => r.dataSource === 'demo') && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
            <span>Showing sample prices — configure API keys to see live fares.</span>
            <button
              onClick={() => setDismissedDemoBanner(true)}
              className="shrink-0 text-yellow-600 hover:text-yellow-900 transition"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* Results header */}
        {(!isLoading || results.length > 0) && !error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-slate-900 text-2xl font-bold">
                {results.length > 0
                  ? `${results.length} flight${results.length !== 1 ? 's' : ''} found${isLoading ? '…' : ''}`
                  : 'Searching...'}
              </h2>
              {results.length > 0 && (
                <span className="text-slate-400 text-sm">
                  {tripType === 'oneway' ? 'per person · one-way' : 'per person · roundtrip'}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="bg-white border border-slate-200 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                {originName} → {destination}
              </span>
              <span className="bg-white border border-slate-200 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                {flexLabel}
              </span>
              {tripType !== 'oneway' && (
                <span className="bg-white border border-slate-200 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
                  {tripDays} day{tripDays !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {error && (
          <div className="border border-red-200 bg-red-50 rounded-xl p-6 mb-6 text-center">
            <p className="text-red-600">{error}</p>
            <p className="text-slate-500 text-sm mt-2">
              Make sure your API keys are configured in .env.local
            </p>
          </div>
        )}

        <ResultsGrid results={results} isLoading={isLoading} cabinClass={cabinClass} travelers={travelers} tripType={tripType} />

        {/* Inline price alert prompt */}
        {!isLoading && !error && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="mt-8 rounded-2xl border border-brand-50 bg-[#e0f4ff] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand" aria-hidden="true">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Track prices for this route</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Get emailed when {origin} → {destination} drops below your target price.
                </p>
              </div>
            </div>
            <a
              href={`/account/add-alert?origin=${encodeURIComponent(origin)}&originName=${encodeURIComponent(originName)}&destination=${encodeURIComponent(destination)}`}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition whitespace-nowrap"
            >
              Set a price alert
            </a>
          </motion.div>
        )}
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-slate-500 text-lg">Loading...</div>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
