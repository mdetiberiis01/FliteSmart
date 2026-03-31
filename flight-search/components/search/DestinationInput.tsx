'use client';

import { useState, useRef, useEffect } from 'react';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_OPTIONS = [
  { label: 'Anywhere', value: 'anywhere' },
  { label: 'Southeast Asia', value: 'Southeast Asia' },
  { label: 'Europe', value: 'Europe' },
  { label: 'East Asia', value: 'East Asia' },
  { label: 'Caribbean', value: 'Caribbean' },
  { label: 'South America', value: 'South America' },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function DestinationInput({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const { query, setQuery, results, isLoading } = useAutocomplete('destination');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayValue = open ? query : value;
  const showQuickPicks = open && query.length < 2;
  const showResults = open && query.length >= 2;

  const regions = results.filter((r) => r.category === 'region');
  const airports = results.filter((r) => r.category !== 'region');

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm text-black/60 dark:text-white/60 mb-1">To</label>
      <input
        type="text"
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery('');
          setOpen(true);
        }}
        placeholder="City, country, region, or anywhere..."
        className="w-full bg-black/5 dark:bg-white/10 border border-black/20 dark:border-white/20 rounded-xl px-4 py-3 text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/40 focus:border-transparent transition"
      />

      <AnimatePresence>
        {open && (showQuickPicks || showResults) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="dropdown-surface absolute z-50 w-full mt-2 rounded-xl overflow-hidden border border-black/15 dark:border-white/20 shadow-2xl max-h-80 overflow-y-auto" style={{ backdropFilter: 'blur(20px)' }}
          >
            {/* Quick picks when empty */}
            {showQuickPicks && (
              <>
                <div className="px-4 py-2 text-xs text-black/40 dark:text-white/40 uppercase tracking-wider font-medium">
                  Popular destinations
                </div>
                {QUICK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition flex items-center gap-3 border-b border-black/5 dark:border-white/5 last:border-0"
                  >
                    <span className="text-black dark:text-white text-sm">{opt.label}</span>
                    <span className="ml-auto text-xs text-black/30 dark:text-white/30 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">Region</span>
                  </button>
                ))}
              </>
            )}

            {/* Live search results */}
            {showResults && (
              <>
                {isLoading && (
                  <div className="px-4 py-3 text-black/50 dark:text-white/50 text-sm flex items-center gap-2">
                    <span className="inline-block w-3 h-3 border-2 border-black/60 dark:border-white/60 border-t-transparent rounded-full animate-spin" />
                    Searching...
                  </div>
                )}

                {!isLoading && regions.length === 0 && airports.length === 0 && (
                  <div className="px-4 py-3 text-black/40 dark:text-white/40 text-sm">No results for "{query}"</div>
                )}

                {/* Regions */}
                {!isLoading && regions.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs text-black/40 dark:text-white/40 uppercase tracking-wider font-medium">
                      Regions
                    </div>
                    {regions.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          onChange(item.name);
                          setOpen(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition flex items-center gap-3 border-b border-black/5 dark:border-white/5 last:border-0"
                      >
                        <span className="text-black dark:text-white text-sm flex-1">{item.name}</span>
                        <span className="text-xs text-black/30 dark:text-white/30 bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">Region</span>
                      </button>
                    ))}
                  </>
                )}

                {/* Airports & Cities */}
                {!isLoading && airports.length > 0 && (
                  <>
                    <div className="px-4 py-2 text-xs text-black/40 dark:text-white/40 uppercase tracking-wider font-medium border-t border-black/10 dark:border-white/10">
                      Airports & Cities
                    </div>
                    {airports.map((item) => (
                      <button
                        key={`${item.iataCode}-${item.name}`}
                        type="button"
                        onClick={() => {
                          const label = item.cityName
                            ? `${item.cityName} (${item.iataCode})`
                            : `${item.name} (${item.iataCode})`;
                          onChange(item.iataCode);
                          setQuery(label);
                          setOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/15 transition flex items-center gap-3 border-b border-black/8 dark:border-white/8 last:border-0"
                      >
                        <span className="text-xs font-mono text-black/80 dark:text-white/80 w-10 shrink-0 text-center bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded">
                          {item.iataCode}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-black dark:text-white text-sm font-medium truncate">
                            {item.name}
                          </span>
                          <span className="block text-black/45 dark:text-white/45 text-xs truncate">
                            {[item.cityName, item.countryName].filter(Boolean).join(', ')}
                          </span>
                        </span>
                        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                          item.category === 'airport'
                            ? 'bg-black/8 dark:bg-white/10 text-black/50 dark:text-white/50'
                            : 'bg-black/8 dark:bg-white/10 text-black/50 dark:text-white/50'
                        }`}>
                          {item.category === 'airport' ? 'Airport' : 'City'}
                        </span>
                      </button>
                    ))}
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
