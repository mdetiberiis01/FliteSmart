'use client';

interface Props {
  tripType: 'roundtrip' | 'oneway';
  travelers: number;
  cabinClass: 'economy' | 'premium_economy' | 'business' | 'first';
  onChange: (field: 'tripType' | 'travelers' | 'cabinClass', value: string | number) => void;
}

const pillar = 'relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/15 transition cursor-pointer text-sm font-medium text-slate-700 dark:text-white/70 border border-slate-200 dark:border-white/10 select-none';

const chevron = (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="opacity-50 shrink-0">
    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

export function TripOptionsBar({ tripType, travelers, cabinClass, onChange }: Props) {
  const cabinLabels: Record<string, string> = {
    economy: 'Economy',
    premium_economy: 'Premium Economy',
    business: 'Business',
    first: 'First Class',
  };

  const travelerLabel = travelers === 1 ? '1 Traveler' : `${travelers} Travelers`;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {/* Trip type */}
      <div className={pillar}>
        <span>{tripType === 'roundtrip' ? 'Round trip' : 'One way'}</span>
        {chevron}
        <select
          value={tripType}
          onChange={(e) => onChange('tripType', e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
        >
          <option value="roundtrip">Round trip</option>
          <option value="oneway">One way</option>
        </select>
      </div>

      {/* Travelers */}
      <div className={pillar}>
        <span>{travelerLabel}</span>
        {chevron}
        <select
          value={travelers}
          onChange={(e) => onChange('travelers', parseInt(e.target.value))}
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? 'Traveler' : 'Travelers'}</option>
          ))}
        </select>
      </div>

      {/* Cabin class */}
      <div className={pillar}>
        <span>{cabinLabels[cabinClass]}</span>
        {chevron}
        <select
          value={cabinClass}
          onChange={(e) => onChange('cabinClass', e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
        >
          <option value="economy">Economy</option>
          <option value="premium_economy">Premium Economy</option>
          <option value="business">Business</option>
          <option value="first">First Class</option>
        </select>
      </div>
    </div>
  );
}
