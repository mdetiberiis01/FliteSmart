'use client';

import { useMemo, useRef } from 'react';
import { SearchResult } from '@/types/search';
import { formatPrice } from '@/lib/utils/format-price';

export interface Filters {
  stops: number[];
  maxPrice: number;
  maxDurationMin: number;
  depTimeFrom: number;   // 0–23
  depTimeTo: number;     // 0–23
  arrTimeFrom: number;   // 0–23
  arrTimeTo: number;     // 0–23
  airlines: string[];
}

export const defaultFilters: Filters = {
  stops: [],
  maxPrice: Infinity,
  maxDurationMin: Infinity,
  depTimeFrom: 0,
  depTimeTo: 23,
  arrTimeFrom: 0,
  arrTimeTo: 23,
  airlines: [],
};

export function isFilterActive(f: Filters): boolean {
  return (
    f.stops.length > 0 ||
    f.maxPrice !== Infinity ||
    f.maxDurationMin !== Infinity ||
    f.depTimeFrom !== 0 ||
    f.depTimeTo !== 23 ||
    f.arrTimeFrom !== 0 ||
    f.arrTimeTo !== 23 ||
    f.airlines.length > 0
  );
}

function parseDurationMinutes(iso: string): number {
  const h = parseInt(iso.match(/(\d+)H/)?.[1] ?? '0');
  const m = parseInt(iso.match(/(\d+)M/)?.[1] ?? '0');
  return h * 60 + m;
}

function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function fmtHour(h: number): string {
  if (h === 0) return '12am';
  if (h < 12) return `${h}am`;
  if (h === 12) return '12pm';
  return `${h - 12}pm`;
}

const AIRLINE_NAMES: Record<string, string> = {
  AA: 'American', DL: 'Delta', UA: 'United', WN: 'Southwest',
  B6: 'JetBlue', AS: 'Alaska', NK: 'Spirit', F9: 'Frontier',
  G4: 'Allegiant', SY: 'Sun Country', BA: 'British Airways',
  AF: 'Air France', LH: 'Lufthansa', EK: 'Emirates', QR: 'Qatar',
  SQ: 'Singapore', CX: 'Cathay', JL: 'Japan Air', NH: 'ANA',
  KE: 'Korean Air', TK: 'Turkish', IB: 'Iberia', AZ: 'ITA',
};

interface SectionProps { title: string; children: React.ReactNode }
function Section({ title, children }: SectionProps) {
  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

interface CheckRowProps {
  label: string;
  count?: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}
function CheckRow({ label, count, checked, onChange }: CheckRowProps) {
  return (
    <label className="flex items-center gap-2.5 py-1 cursor-pointer group">
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked ? 'bg-brand border-brand' : 'border-slate-300 group-hover:border-brand'
      }`}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="flex-1 text-sm text-slate-700">{label}</span>
      {count !== undefined && <span className="text-xs text-slate-400 tabular-nums">{count}</span>}
    </label>
  );
}

interface RangeProps {
  min: number; max: number; value: number;
  clampMin?: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  isMax?: boolean;
}
function RangeSlider({ min, max, value, clampMin, onChange, format, isMax }: RangeProps) {
  // pct uses min=0 so the visual position of clampMin is proportional to the full range
  const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
  return (
    <div>
      <div className="relative h-5 mb-1">
        <div className="absolute top-1.5 left-0 right-0 h-2 bg-slate-100 rounded-full" />
        <div className="absolute top-1.5 h-2 bg-brand rounded-full"
          style={isMax ? { left: 0, right: `${100 - pct}%` } : { left: `${pct}%`, right: 0 }} />
        <input
          type="range" min={clampMin ?? min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ accentColor: '#0077b6' }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute top-0 w-5 h-5 bg-white border-2 border-brand rounded-full shadow-sm pointer-events-none"
          style={{ left: `calc(${pct}% - 10px)` }}
        />
      </div>
      <div className="text-xs text-slate-500 text-right">{format(value)}</div>
    </div>
  );
}

interface TimeRangeProps {
  from: number; to: number;
  onChange: (from: number, to: number) => void;
  minFrom?: number;
}
function TimeRangeSlider({ from, to, onChange, minFrom = 0 }: TimeRangeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  // Keep live refs so drag handlers always see current values
  const fromRef = useRef(from);
  const toRef = useRef(to);
  const minFromRef = useRef(minFrom);
  fromRef.current = from;
  toRef.current = to;
  minFromRef.current = minFrom;

  const clampedFrom = Math.max(minFrom, from);
  const pctFrom = (clampedFrom / 23) * 100;
  const pctTo = (to / 23) * 100;

  function posToValue(clientX: number): number {
    if (!trackRef.current) return 0;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * 23);
  }

  function startDrag(handle: 'from' | 'to') {
    function onMove(e: MouseEvent | TouchEvent) {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const val = posToValue(clientX);
      if (handle === 'from') {
        const newFrom = Math.max(minFromRef.current, Math.min(val, toRef.current - 1));
        onChange(newFrom, toRef.current);
      } else {
        const newTo = Math.max(fromRef.current + 1, Math.min(val, 23));
        onChange(fromRef.current, newTo);
      }
    }
    function onEnd() {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onEnd);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
  }

  function handleTrackClick(e: React.MouseEvent<HTMLDivElement>) {
    // Don't re-fire if the click came from a thumb
    if ((e.target as HTMLElement).dataset.thumb) return;
    const val = posToValue(e.clientX);
    const distFrom = Math.abs(val - clampedFrom);
    const distTo = Math.abs(val - to);
    if (distFrom <= distTo) {
      onChange(Math.max(minFrom, Math.min(val, to - 1)), to);
    } else {
      onChange(clampedFrom, Math.max(clampedFrom + 1, Math.min(val, 23)));
    }
  }

  return (
    <div>
      <div
        ref={trackRef}
        className="relative h-6 mb-2 cursor-pointer select-none"
        onClick={handleTrackClick}
      >
        <div className="absolute left-0 right-0 top-2.5 h-1.5 bg-slate-100 rounded-full pointer-events-none" />
        <div
          className="absolute top-2.5 h-1.5 bg-brand rounded-full pointer-events-none"
          style={{ left: `${pctFrom}%`, right: `${100 - pctTo}%` }}
        />
        {/* From thumb */}
        <div
          data-thumb="from"
          className="absolute top-1 w-4 h-4 bg-white border-2 border-brand rounded-full shadow-sm cursor-grab active:cursor-grabbing"
          style={{ left: `calc(${pctFrom}% - 8px)` }}
          onMouseDown={(e) => { e.stopPropagation(); startDrag('from'); }}
          onTouchStart={(e) => { e.stopPropagation(); startDrag('from'); }}
        />
        {/* To thumb */}
        <div
          data-thumb="to"
          className="absolute top-1 w-4 h-4 bg-white border-2 border-brand rounded-full shadow-sm cursor-grab active:cursor-grabbing"
          style={{ left: `calc(${pctTo}% - 8px)` }}
          onMouseDown={(e) => { e.stopPropagation(); startDrag('to'); }}
          onTouchStart={(e) => { e.stopPropagation(); startDrag('to'); }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{fmtHour(clampedFrom)}</span>
        <span className="text-slate-300">–</span>
        <span>{fmtHour(to)}</span>
      </div>
    </div>
  );
}

interface Props {
  results: SearchResult[];
  filters: Filters;
  onChange: (f: Filters) => void;
}

export function FilterPanel({ results, filters, onChange }: Props) {
  const stats = useMemo(() => {
    const prices = results.map(r => r.price);
    const durations = results.map(r => parseDurationMinutes(r.duration));
    const stopCounts = { 0: 0, 1: 0, 2: 0 } as Record<number, number>;
    const airlineCounts: Record<string, number> = {};
    const hasHours = results.some(r => r.departureHour !== undefined);
    const hasArrival = results.some(r => r.arrivalHour !== undefined);
    const minDurationHours = durations.length ? Math.ceil(Math.min(...durations) / 60) : 1;
    const minDuration = durations.length ? Math.floor(Math.min(...durations)) : 0;

    for (const r of results) {
      stopCounts[Math.min(r.stops, 2)] = (stopCounts[Math.min(r.stops, 2)] ?? 0) + 1;
      airlineCounts[r.airlineCode] = (airlineCounts[r.airlineCode] ?? 0) + 1;
    }

    return {
      minPrice: Math.floor(Math.min(...prices)),
      maxPrice: Math.ceil(Math.max(...prices)),
      minDuration,
      maxDuration: Math.ceil(Math.max(...durations)),
      stopCounts,
      airlines: Object.entries(airlineCounts).sort((a, b) => b[1] - a[1]).slice(0, 8),
      hasHours,
      hasArrival,
      minDurationHours,
    };
  }, [results]);

  function toggleStop(s: number) {
    const next = filters.stops.includes(s)
      ? filters.stops.filter(x => x !== s)
      : [...filters.stops, s];
    onChange({ ...filters, stops: next });
  }

  function toggleAirline(code: string) {
    const next = filters.airlines.includes(code)
      ? filters.airlines.filter(x => x !== code)
      : [...filters.airlines, code];
    onChange({ ...filters, airlines: next });
  }

  function handleDepTimeChange(from: number, to: number) {
    // Enforce: arrival window start must be at least minDuration hours after dep start
    const minArrFrom = Math.min(from + stats.minDurationHours, 23);
    const newArrFrom = Math.max(filters.arrTimeFrom, minArrFrom);
    const newArrTo = Math.max(newArrFrom + 1, filters.arrTimeTo);
    onChange({
      ...filters,
      depTimeFrom: from,
      depTimeTo: to,
      arrTimeFrom: newArrFrom,
      arrTimeTo: Math.min(newArrTo, 23),
    });
  }

  function handleArrTimeChange(from: number, to: number) {
    onChange({ ...filters, arrTimeFrom: from, arrTimeTo: to });
  }

  const activeCount = [
    filters.stops.length > 0,
    filters.maxPrice !== Infinity,
    filters.maxDurationMin !== Infinity,
    filters.depTimeFrom !== 0 || filters.depTimeTo !== 23,
    filters.arrTimeFrom !== 0 || filters.arrTimeTo !== 23,
    filters.airlines.length > 0,
  ].filter(Boolean).length;

  // Min arrival from = dep start + min flight duration (clamped to 23)
  const minArrFrom = Math.min(filters.depTimeFrom + stats.minDurationHours, 23);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-slate-900">
          Filters {activeCount > 0 && <span className="text-brand">({activeCount})</span>}
        </span>
        {activeCount > 0 && (
          <button
            onClick={() => onChange(defaultFilters)}
            className="text-xs text-slate-400 hover:text-brand transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Stops */}
      <Section title="Stops">
        {([0, 1, 2] as const).map(s => (
          <CheckRow
            key={s}
            label={s === 0 ? 'Nonstop' : s === 1 ? '1 stop' : '2+ stops'}
            count={stats.stopCounts[s] ?? 0}
            checked={filters.stops.includes(s)}
            onChange={() => toggleStop(s)}
          />
        ))}
      </Section>

      {/* Departure time */}
      {stats.hasHours && (
        <Section title="Departure time">
          <TimeRangeSlider
            from={filters.depTimeFrom}
            to={filters.depTimeTo}
            onChange={handleDepTimeChange}
          />
        </Section>
      )}

      {/* Arrival time */}
      {stats.hasArrival && (
        <Section title="Arrival time">
          <TimeRangeSlider
            from={filters.arrTimeFrom}
            to={filters.arrTimeTo}
            onChange={handleArrTimeChange}
            minFrom={minArrFrom}
          />
          {minArrFrom > 0 && (
            <p className="text-[10px] text-slate-400 mt-1.5">
              Earliest arrival based on min flight time
            </p>
          )}
        </Section>
      )}

      {/* Max price */}
      {stats.maxPrice > stats.minPrice && (
        <Section title="Max price">
          <RangeSlider
            min={stats.minPrice}
            max={stats.maxPrice}
            value={filters.maxPrice === Infinity ? stats.maxPrice : filters.maxPrice}
            onChange={v => onChange({ ...filters, maxPrice: v >= stats.maxPrice ? Infinity : v })}
            format={v => v >= stats.maxPrice ? 'Any' : formatPrice(v, 'USD')}
            isMax
          />
        </Section>
      )}

      {/* Max duration */}
      {stats.maxDuration > 0 && (
        <Section title="Max duration">
          <RangeSlider
            min={0}
            max={stats.maxDuration}
            clampMin={stats.minDuration}
            value={filters.maxDurationMin === Infinity ? stats.maxDuration : Math.max(filters.maxDurationMin, stats.minDuration)}
            onChange={v => onChange({ ...filters, maxDurationMin: v >= stats.maxDuration ? Infinity : v })}
            format={v => v >= stats.maxDuration ? 'Any' : fmtDuration(v)}
            isMax
          />
        </Section>
      )}

      {/* Airlines */}
      {stats.airlines.length > 1 && (
        <Section title="Airlines">
          {stats.airlines.map(([code, count]) => (
            <CheckRow
              key={code}
              label={AIRLINE_NAMES[code] ?? code}
              count={count}
              checked={filters.airlines.includes(code)}
              onChange={() => toggleAirline(code)}
            />
          ))}
        </Section>
      )}
    </div>
  );
}
