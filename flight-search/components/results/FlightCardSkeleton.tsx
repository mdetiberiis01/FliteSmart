'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function FlightCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-5 space-y-4 animate-pulse">
      {/* Header: destination + price */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-5 w-2/3 bg-black/8 dark:bg-white/10 rounded-md" />
          <Skeleton className="h-3.5 w-1/3 bg-black/5 dark:bg-white/8 rounded-md" />
        </div>
        <Skeleton className="h-7 w-20 bg-black/8 dark:bg-white/10 rounded-lg shrink-0" />
      </div>

      {/* Route bar */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-10 bg-black/8 dark:bg-white/10 rounded" />
        <Skeleton className="h-px flex-1 bg-black/8 dark:bg-white/10" />
        <Skeleton className="h-4 w-10 bg-black/8 dark:bg-white/10 rounded" />
      </div>

      {/* Airline + stops row */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 bg-black/8 dark:bg-white/10 rounded-lg shrink-0" />
        <Skeleton className="h-3.5 w-24 bg-black/5 dark:bg-white/8 rounded" />
        <Skeleton className="h-5 w-16 bg-black/5 dark:bg-white/8 rounded-full ml-auto" />
      </div>

      {/* Sparkline */}
      <Skeleton className="h-10 w-full bg-black/5 dark:bg-white/8 rounded-lg" />

      {/* Footer CTA */}
      <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/8">
        <Skeleton className="h-3.5 w-28 bg-black/5 dark:bg-white/8 rounded" />
        <Skeleton className="h-8 w-24 bg-black/8 dark:bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}

export function FlightRowSkeleton() {
  return (
    <div className="glass-card rounded-xl px-4 py-3.5 flex items-center gap-4 animate-pulse">
      {/* Destination */}
      <div className="w-32 shrink-0 space-y-1">
        <Skeleton className="h-4 w-full bg-black/8 dark:bg-white/10 rounded" />
        <Skeleton className="h-3 w-2/3 bg-black/5 dark:bg-white/8 rounded" />
      </div>
      {/* Route */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <Skeleton className="h-3.5 w-10 bg-black/8 dark:bg-white/10 rounded" />
        <Skeleton className="h-px flex-1 bg-black/8 dark:bg-white/10" />
        <Skeleton className="h-3.5 w-10 bg-black/8 dark:bg-white/10 rounded" />
      </div>
      {/* Price + CTA */}
      <div className="flex items-center gap-3 shrink-0">
        <Skeleton className="h-5 w-16 bg-black/8 dark:bg-white/10 rounded" />
        <Skeleton className="h-8 w-20 bg-black/8 dark:bg-white/10 rounded-xl" />
      </div>
    </div>
  );
}
