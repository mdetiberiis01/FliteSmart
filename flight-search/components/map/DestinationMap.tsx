'use client';

import dynamic from 'next/dynamic';
import { SearchResult } from '@/types/search';

// Lazy load the actual map to avoid SSR issues
const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="h-64 glass-card rounded-2xl flex items-center justify-center text-black/40 dark:text-white/40">
      Loading map...
    </div>
  ),
});

interface Props {
  results: SearchResult[];
  origin: string;
}

export function DestinationMap({ results, origin }: Props) {
  return <MapInner results={results} origin={origin} />;
}
