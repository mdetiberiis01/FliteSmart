'use client';

import { SearchResult } from '@/types/search';
import { formatPrice, formatDuration } from '@/lib/utils/format-price';
import { DealBadge } from './DealBadge';
import { AirlineLogo } from './AirlineLogo';
import { BaggageInfo } from './BaggageInfo';
import { RouteBar } from './RouteBar';
import { motion } from 'framer-motion';

interface Props {
  result: SearchResult;
  index: number;
  cabinClass?: string;
  travelers?: number;
  tripType?: 'roundtrip' | 'oneway';
}

function formatLegDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}


const GOOGLE_CABIN: Record<string, string> = { economy: 'e', premium_economy: 'p', business: 'b', first: 'f' };

export function FlightRow({ result, index, cabinClass = 'economy', travelers = 1, tripType = 'roundtrip' }: Props) {
  const isOneWay = tripType === 'oneway';
  function handleClick() {
    const origin = result.origin || '';
    const dest = result.destination || '';
    const dep = result.departureDate || '';
    const cabin = GOOGLE_CABIN[cabinClass] ?? 'e';
    const url = result.bookingUrl?.startsWith('https://www.google.com')
      ? result.bookingUrl
      : `https://www.google.com/travel/flights#search;f=${origin};t=${dest};d=${dep}${!isOneWay && result.returnDate ? `;r=${result.returnDate}` : ''};tt=${cabin};tc=${travelers}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={handleClick}
      className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all hover:shadow-md hover:shadow-slate-100 group cursor-pointer"
    >
      <div className="flex items-stretch gap-0">

        {/* ── Left: destination name ── */}
        <div className="px-2 sm:px-3 py-3 flex flex-col justify-center w-24 sm:w-36 shrink-0 border-r border-slate-100">
          <div className="font-semibold text-slate-900 text-xs sm:text-sm leading-tight break-words">
            {result.destinationCity || result.destination}
          </div>
          <div className="text-xs text-slate-400 break-words mt-0.5">
            {result.destinationCountry}
          </div>
        </div>

        {/* ── Middle: flight legs ── */}
        <div className={`flex-1 min-w-0 divide-y divide-slate-100${isOneWay ? ' flex flex-col justify-center' : ''}`}>

          {/* Outbound leg */}
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2.5">
            <AirlineLogo code={result.airlineCode} size={24} />
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <RouteBar
                from={result.origin}
                to={result.destination}
                stops={result.stops}
                layovers={result.layovers}
                layoverDurations={result.layoverDurations}
                fromDate={formatLegDate(result.departureDate)}
              />
              {result.duration && (
                <span className="text-[10px] text-slate-400 tabular-nums sm:hidden">
                  {formatDuration(result.duration)}
                </span>
              )}
            </div>
            {result.duration && (
              <span className="text-xs text-slate-400 shrink-0 hidden sm:block tabular-nums">
                {formatDuration(result.duration)}
              </span>
            )}
          </div>

          {/* Return leg (round-trip only) */}
          {!isOneWay && result.returnDate && (
            <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2.5">
              <AirlineLogo code={result.airlineCode} size={24} />
              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                <RouteBar
                  from={result.destination}
                  to={result.origin}
                  stops={result.stops}
                  layovers={result.layovers}
                  layoverDurations={result.layoverDurations}
                  fromDate={formatLegDate(result.returnDate)}
                />
                {result.duration && (
                  <span className="text-[10px] text-slate-400 tabular-nums sm:hidden">
                    {formatDuration(result.duration)}
                  </span>
                )}
              </div>
              {result.duration && (
                <span className="text-xs text-slate-400 shrink-0 hidden sm:block tabular-nums">
                  {formatDuration(result.duration)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Right: baggage + price + CTA ── */}
        <div className="flex flex-col items-end justify-center gap-1.5 px-3 py-3 border-l border-slate-100 shrink-0">
          <BaggageInfo carryOn={1} checked={0} />
          <div className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
            {formatPrice(result.price, result.currency)}
          </div>
          <div className="flex items-center gap-1.5">
            <DealBadge rating={result.dealRating} percent={result.dealPercent} />
            <span className="text-xs font-medium text-slate-500 group-hover:text-brand transition-colors">
              Book →
            </span>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
