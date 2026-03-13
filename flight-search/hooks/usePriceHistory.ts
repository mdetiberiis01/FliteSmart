'use client';

import { useState, useEffect } from 'react';
import { PricePoint } from '@/types/search';

export function usePriceHistory(origin: string, destination: string) {
  const [pricePoints, setPricePoints] = useState<PricePoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [source, setSource] = useState<string>('');

  useEffect(() => {
    if (!origin || !destination) return;

    setIsLoading(true);
    fetch(`/api/price-history?origin=${origin}&destination=${destination}`)
      .then((res) => res.json())
      .then((data) => {
        setPricePoints(data.pricePoints || []);
        setSource(data.source || '');
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [origin, destination]);

  return { pricePoints, isLoading, source };
}
