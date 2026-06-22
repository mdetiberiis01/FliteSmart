import { NextRequest, NextResponse } from 'next/server';
import { searchFlights } from '@/lib/serpapi/flight-search';
import { isMockMode } from '@/lib/search/orchestrator';

export interface TrendingFlight {
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

const POPULAR_DESTINATIONS = [
  { iata: 'NRT', city: 'Tokyo',        country: 'Japan',        photo: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', tag: 'Popular' },
  { iata: 'DPS', city: 'Bali',         country: 'Indonesia',    photo: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', tag: 'Trending' },
  { iata: 'CDG', city: 'Paris',        country: 'France',       photo: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80' },
  { iata: 'BCN', city: 'Barcelona',    country: 'Spain',        photo: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80', tag: 'Hot deal' },
  { iata: 'LHR', city: 'London',       country: 'UK',           photo: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80' },
  { iata: 'DXB', city: 'Dubai',        country: 'UAE',          photo: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80' },
  { iata: 'ICN', city: 'Seoul',        country: 'South Korea',  photo: 'https://images.unsplash.com/photo-1617369120004-4848bbc79a68?w=600&q=80' },
  { iata: 'SIN', city: 'Singapore',    country: 'Singapore',    photo: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&q=80' },
  { iata: 'HKT', city: 'Phuket',       country: 'Thailand',     photo: 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=600&q=80' },
  { iata: 'SYD', city: 'Sydney',       country: 'Australia',    photo: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80' },
];

// Varied week offsets per destination so each card searches a different window,
// surfacing genuinely different cheap dates rather than all using the same flight day.
const DEST_WEEK_OFFSETS: Record<string, number[]> = {
  NRT: [5, 9],   DPS: [6, 10],  CDG: [4, 8],   BCN: [4, 7],
  LHR: [5, 8],   DXB: [6, 11],  ICN: [5, 10],  SIN: [7, 11],
  HKT: [6, 9],   SYD: [8, 12],
};

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// Mock data with varied realistic dates per destination (staggered across next 12 weeks)
function buildMockTrending(): TrendingFlight[] {
  const base = new Date();
  const MOCK_BASE = [
    { city: 'Tokyo',      country: 'Japan',      destination: 'Tokyo',      price: 689, photo: POPULAR_DESTINATIONS[0].photo, tag: 'Popular',   weeksOut: 5,  tripDays: 10 },
    { city: 'Bali',       country: 'Indonesia',  destination: 'Bali',       price: 520, photo: POPULAR_DESTINATIONS[1].photo, tag: 'Trending',  weeksOut: 8,  tripDays: 7  },
    { city: 'Paris',      country: 'France',     destination: 'Paris',      price: 430, photo: POPULAR_DESTINATIONS[2].photo, tag: undefined,   weeksOut: 4,  tripDays: 6  },
    { city: 'Barcelona',  country: 'Spain',      destination: 'Barcelona',  price: 415, photo: POPULAR_DESTINATIONS[3].photo, tag: 'Hot deal',  weeksOut: 6,  tripDays: 5  },
    { city: 'London',     country: 'UK',         destination: 'London',     price: 380, photo: POPULAR_DESTINATIONS[4].photo, tag: undefined,   weeksOut: 3,  tripDays: 7  },
    { city: 'Dubai',      country: 'UAE',        destination: 'Dubai',      price: 560, photo: POPULAR_DESTINATIONS[5].photo, tag: undefined,   weeksOut: 10, tripDays: 8  },
  ];
  return MOCK_BASE.map(({ weeksOut, tripDays, ...rest }) => {
    const dep = addDays(base, weeksOut * 7);
    const ret = addDays(new Date(dep), tripDays);
    return { ...rest, departureDate: dep, returnDate: ret };
  });
}

// In-process cache: keyed by origin IATA, expires after 1 hour
const cache = new Map<string, { ts: number; destinations: TrendingFlight[] }>();
const CACHE_TTL = 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.searchParams.get('origin')?.toUpperCase();
  if (!origin) return NextResponse.json({ destinations: [] });

  if (isMockMode()) {
    return NextResponse.json({ destinations: buildMockTrending() });
  }

  const hit = cache.get(origin);
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    return NextResponse.json({ destinations: hit.destinations });
  }

  const now = new Date();

  // For each destination, search across 2 different date windows and take the cheapest.
  // This surfaces genuinely different deals per destination rather than all using the same day.
  const settled = await Promise.allSettled(
    POPULAR_DESTINATIONS.map(async (dest) => {
      const weekOffsets = DEST_WEEK_OFFSETS[dest.iata] ?? [5, 9];
      const searches = await Promise.all(
        weekOffsets.map(async (weeks) => {
          const dep = addDays(now, weeks * 7);
          const ret = addDays(new Date(dep), 7);
          const { flights } = await searchFlights(origin, dest.iata, dep, ret, 'economy');
          return flights[0] ?? null;
        })
      );
      // Pick the cheapest result across the date windows
      const best = searches
        .filter((f): f is NonNullable<typeof f> => f !== null && f.price > 0)
        .sort((a, b) => a.price - b.price)[0];

      if (!best) return null;
      return {
        city: dest.city,
        country: dest.country,
        destination: dest.city,
        price: best.price,
        photo: dest.photo,
        tag: dest.tag,
        bookingUrl: best.bookingUrl,
        departureDate: best.departureDate,
        returnDate: best.returnDate,
      } as TrendingFlight;
    })
  );

  const destinations = settled
    .filter((r): r is PromiseFulfilledResult<TrendingFlight> => r.status === 'fulfilled' && r.value !== null)
    .map((r) => r.value)
    .sort((a, b) => a.price - b.price)
    .slice(0, 6);

  if (destinations.length === 0) {
    return NextResponse.json({ destinations: buildMockTrending() });
  }

  cache.set(origin, { ts: Date.now(), destinations });
  return NextResponse.json({ destinations });
}
