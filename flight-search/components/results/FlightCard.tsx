'use client';

import { SearchResult } from '@/types/search';
import { formatPrice, formatDuration } from '@/lib/utils/format-price';
import { DealBadge } from './DealBadge';
import { HistoricalLow } from './HistoricalLow';
import { PriceSparkline } from './PriceSparkline';
import { AirlineLogo } from './AirlineLogo';
import { BaggageInfo } from './BaggageInfo';
import { RouteBar } from './RouteBar';
import { motion } from 'framer-motion';

interface Props {
  result: SearchResult;
  index: number;
  cabinClass?: string;
  travelers?: number;
}

function formatLegDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

interface LegRowProps {
  airlineCode: string;
  date: string;
  from: string;
  to: string;
  stops: number;
  layovers?: string[];
  layoverDurations?: number[];
  duration: string;
}

function LegRow({ airlineCode, date, from, to, stops, layovers, layoverDurations, duration }: LegRowProps) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <AirlineLogo code={airlineCode} size={32} />
      <RouteBar from={from} to={to} stops={stops} layovers={layovers} layoverDurations={layoverDurations} fromDate={date} />
      {duration && (
        <div className="shrink-0 text-right">
          <div className="text-xs text-slate-400">{formatDuration(duration)}</div>
        </div>
      )}
    </div>
  );
}

const GOOGLE_CABIN: Record<string, string> = { economy: 'e', premium_economy: 'p', business: 'b', first: 'f' };

export function FlightCard({ result, index, cabinClass = 'economy', travelers = 1 }: Props) {
  function handleClick() {
    const origin = result.origin || '';
    const dest = result.destination || '';
    const dep = result.departureDate || '';
    const cabin = GOOGLE_CABIN[cabinClass] ?? 'e';
    // Use SerpAPI's google_flights_url when available (most reliable); fall back to
    // the #search hash format which Google Flights recognises as a search query.
    const url = result.bookingUrl?.startsWith('https://www.google.com')
      ? result.bookingUrl
      : `https://www.google.com/travel/flights#search;f=${origin};t=${dest};d=${dep}${result.returnDate ? `;r=${result.returnDate}` : ''};tt=${cabin};tc=${travelers}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      onClick={handleClick}
      className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all hover:shadow-lg hover:shadow-slate-100 group cursor-pointer overflow-hidden"
    >
      {/* Header: destination + price */}
      <div className="flex items-start justify-between px-5 pt-4 pb-3">
        <div>
          <h3 className="text-slate-900 font-semibold text-lg leading-tight">
            {result.destinationCity || result.destination}
          </h3>
          <p className="text-slate-500 text-sm">{result.destinationCountry}</p>
        </div>
        <div className="text-right">
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
            {formatPrice(result.price, result.currency)}
          </div>
          <div className="text-xs text-slate-400">per person</div>
        </div>
      </div>

      {/* Flight legs */}
      <div className="px-5 border-t border-slate-100 divide-y divide-slate-100">
        <LegRow
          airlineCode={result.airlineCode}
          date={formatLegDate(result.departureDate)}
          from={result.origin}
          to={result.destination}
          stops={result.stops}
          layovers={result.layovers}
          layoverDurations={result.layoverDurations}
          duration={result.duration}
        />
        {result.returnDate && (
          <LegRow
            airlineCode={result.airlineCode}
            date={formatLegDate(result.returnDate)}
            from={result.destination}
            to={result.origin}
            stops={result.stops}
            layovers={result.layovers}
            layoverDurations={result.layoverDurations}
            duration={result.duration}
          />
        )}
      </div>

      {/* Baggage + deal badge + historical low */}
      <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
        <BaggageInfo carryOn={1} checked={0} />
        <div className="flex items-center gap-2">
          <DealBadge rating={result.dealRating} percent={result.dealPercent} />
          <HistoricalLow historicalLow={result.historicalLow} currency={result.currency} />
        </div>
      </div>

      {/* Sparkline */}
      <div className="px-5 pb-1">
        <PriceSparkline data={result.priceHistory} currentPrice={result.price} />
      </div>

      {/* CTA footer */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs text-slate-400">google.com/flights</span>
        <span className="text-xs text-slate-500 font-medium group-hover:text-brand transition-colors">
          Book now →
        </span>
      </div>
    </motion.div>
  );
}
