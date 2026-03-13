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

  const displayValue = open ? query : displayName || value || '';
  const showDropdown = open && query.length >= 2;

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm text-white/60 mb-1">From</label>
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
          className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
        />
        {value && !open && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-teal-400 font-mono bg-teal-500/10 px-2 py-0.5 rounded">
            {value}
          </span>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 glass-card rounded-xl overflow-hidden border border-white/20 shadow-2xl max-h-72 overflow-y-auto"
          >
            {isLoading ? (
              <div className="px-4 py-3 text-white/50 text-sm flex items-center gap-2">
                <span className="inline-block w-3 h-3 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                Searching...
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-3 text-white/40 text-sm">No results for "{query}"</div>
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
                  className="w-full text-left px-4 py-3 hover:bg-white/10 active:bg-white/15 transition flex items-center gap-3 border-b border-white/8 last:border-0"
                >
                  {/* IATA code */}
                  <span className="text-xs font-mono text-teal-400 w-10 shrink-0 text-center bg-teal-500/10 px-1.5 py-0.5 rounded">
                    {item.iataCode}
                  </span>

                  {/* Name + location */}
                  <span className="flex-1 min-w-0">
                    <span className="block text-white text-sm font-medium truncate">
                      {item.name}
                    </span>
                    <span className="block text-white/45 text-xs truncate">
                      {[item.cityName, item.countryName].filter(Boolean).join(', ')}
                    </span>
                  </span>

                  {/* Type badge */}
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                    item.category === 'airport'
                      ? 'bg-white/10 text-white/50'
                      : 'bg-blue-500/15 text-blue-400'
                  }`}>
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
