'use client';

import { useEffect, useState } from 'react';

export interface TrendingDest {
  city: string;
  country: string;
  destination: string;
  price: number;
  photo: string;
  tag?: string;
  bookingUrl?: string;
  departureDate?: string;
  returnDate?: string;
}

const STATIC_TRENDING: TrendingDest[] = [
  { city: 'Tokyo',     country: 'Japan',     destination: 'Tokyo',     price: 689, photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', tag: 'Popular' },
  { city: 'Bali',      country: 'Indonesia', destination: 'Bali',      price: 520, photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', tag: 'Trending' },
  { city: 'Paris',     country: 'France',    destination: 'Paris',     price: 430, photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
  { city: 'Barcelona', country: 'Spain',     destination: 'Barcelona', price: 415, photo: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80', tag: 'Hot deal' },
  { city: 'London',    country: 'UK',        destination: 'London',    price: 380, photo: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80' },
  { city: 'Dubai',     country: 'UAE',       destination: 'Dubai',     price: 560, photo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80' },
];

interface Props {
  onSelect: (dest: TrendingDest) => void;
  origin?: string;
  originName?: string;
}

export function TrendingDestinations({ onSelect, origin, originName }: Props) {
  const [destinations, setDestinations] = useState<TrendingDest[]>(STATIC_TRENDING);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!origin) {
      setDestinations(STATIC_TRENDING);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/trending-flights?origin=${encodeURIComponent(origin)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.destinations?.length >= 3) {
          setDestinations(data.destinations);
        } else {
          setDestinations(STATIC_TRENDING);
        }
      })
      .catch(() => {
        if (!cancelled) setDestinations(STATIC_TRENDING);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [origin]);

  const displayLabel = originName || origin;
  const headerLabel = displayLabel && !loading
    ? `Great Deals from ${displayLabel}`
    : 'Trending destinations';

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-900">{headerLabel}</h2>
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">
          Tap to book
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-slate-200 animate-pulse" />
            ))
          : destinations.map((dest) => (
              <button
                key={dest.city}
                onClick={() => onSelect(dest)}
                className="group relative h-36 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand text-left"
              >
                <img
                  src={dest.photo}
                  alt={dest.city}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {dest.tag && (
                  <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wide bg-brand text-white px-2 py-0.5 rounded-full">
                    {dest.tag}
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white font-bold text-sm leading-tight">{dest.city}</p>
                  <p className="text-white/70 text-xs">{dest.country}</p>
                  <p className="text-[#48cae4] font-semibold text-sm mt-0.5">from ${dest.price}</p>
                </div>
              </button>
            ))}
      </div>
    </div>
  );
}
