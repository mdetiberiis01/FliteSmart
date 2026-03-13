'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface AutocompleteItem {
  iataCode: string;
  name: string;
  cityName: string;
  countryName: string;
  detailedName: string;
  subType: string;
  category: 'airport' | 'city' | 'region';
  score: number;
}

export function useAutocomplete(type: 'origin' | 'destination' = 'origin') {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AutocompleteItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/autocomplete?q=${encodeURIComponent(q)}&type=${type}`,
        { signal: abortRef.current.signal }
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data);
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => search(query), 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, search]);

  return { query, setQuery, results, isLoading };
}
