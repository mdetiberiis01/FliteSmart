'use client';

import { useState, useRef, useEffect } from 'react';
import { useAutocomplete } from '@/hooks/useAutocomplete';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  value: string;
  displayName: string;
  onChange: (code: string, name: string) => void;
}

export function OriginInput({ value, displayName, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const { query, setQuery, results, isLoading } = useAutocomplete('origin');
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

  async function handleGeolocate() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by your browser');
      return;
    }
    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/nearest-airport?lat=${latitude}&lon=${longitude}`);
          if (!res.ok) throw new Error('Lookup failed');
          const airport = await res.json();
          const label = `${airport.name} (${airport.iataCode})`;
          onChange(airport.iataCode, label);
          setQuery(label);
        } catch {
          setGeoError('Could not find nearest airport');
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoError('Location access denied');
        setGeoLoading(false);
      },
      { timeout: 10000 }
    );
  }

  const displayValue = open ? query : displayName || value || '';
  const showDropdown = open && query.length >= 2;

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm text-slate-600 mb-1">From</label>
      <div className="relative">
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
          placeholder="City, airport, or IATA code..."
          className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 pr-20 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
        />

        {/* Geolocation button */}
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={geoLoading}
          title="Use my location"
          className="absolute right-10 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition disabled:opacity-40"
        >
          {geoLoading ? (
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
              <path d="M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          )}
        </button>

        {/* IATA badge */}
        {value && !open && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-mono bg-slate-200 px-2 py-0.5 rounded">
            {value}
          </span>
        )}
      </div>

      {geoError && (
        <p className="text-xs text-red-500 mt-1">{geoError}</p>
      )}

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="dropdown-surface absolute z-50 w-full mt-2 rounded-xl overflow-hidden border border-slate-200 shadow-2xl max-h-72 overflow-y-auto"
          >
            {isLoading ? (
              <div className="px-4 py-3 text-slate-500 text-sm flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-3 text-slate-400 text-sm">No results for &ldquo;{query}&rdquo;</div>
            ) : (
              results.map((item) => (
                <button
                  key={`${item.iataCode}-${item.name}`}
                  type="button"
                  onClick={() => {
                    const label = item.cityName
                      ? `${item.cityName} (${item.iataCode})`
                      : `${item.name} (${item.iataCode})`;
                    onChange(item.iataCode, label);
                    setQuery(label);
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-3 border-b border-slate-100 last:border-0"
                >
                  <span className="text-xs font-mono text-slate-600 w-10 shrink-0 text-center bg-slate-100 px-1.5 py-0.5 rounded">
                    {item.iataCode}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-slate-900 text-sm font-medium truncate">
                      {item.name}
                    </span>
                    <span className="block text-slate-400 text-xs truncate">
                      {[item.cityName, item.countryName].filter(Boolean).join(', ')}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                    {item.category === 'airport' ? 'Airport' : 'City'}
                  </span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
