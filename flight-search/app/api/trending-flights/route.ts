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

const MOCK_TRENDING: TrendingFlight[] = [
  { city: 'Tokyo',      country: 'Japan',      destination: 'Tokyo',      price: 689, photo: POPULAR_DESTINATIONS[0].photo, tag: 'Popular' },
  { city: 'Bali',       country: 'Indonesia',  destination: 'Bali',       price: 520, photo: POPULAR_DESTINATIONS[1].photo, tag: 'Trending' },
  { city: 'Paris',      country: 'France',     destination: 'Paris',      price: 430, photo: POPULAR_DESTINATIONS[2].photo },
  { city: 'Barcelona',  country: 'Spain',      destination: 'Barcelona',  price: 415, photo: POPULAR_DESTINATIONS[3].photo, tag: 'Hot deal' },
  { city: 'London',     country: 'UK',         destination: 'London',     price: 380, photo: POPULAR_DESTINATIONS[4].photo },
  { city: 'Dubai',      country: 'UAE',        destination: 'Dubai',      price: 560, photo: POPULAR_DESTINATIONS[5].photo },
];

// In-process cache: keyed by origin IATA, expires after 1 hour
const cache = new Map<string, { ts: number; destinations: TrendingFlight[] }>();
const CACHE_TTL = 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.searchParams.get('origin')?.toUpperCase();
  if (!origin) return NextResponse.json({ destinations: [] });

  if (isMockMode()) {
    // Add realistic dates (~6 weeks out) so the hover tooltip works in dev mode
    const dep = new Date();
    dep.setDate(dep.getDate() + 42);
    const departureDate = dep.toISOString().split('T')[0];
    const ret = new Date(dep);
    ret.setDate(ret.getDate() + 7);
    const returnDate = ret.toISOString().split('T')[0];
    const withDates = MOCK_TRENDING.map((d, i) => {
      const d2 = new Date(dep);
      d2.setDate(d2.getDate() + i * 2); // stagger departure dates slightly
      const r2 = new Date(d2);
      r2.setDate(r2.getDate() + 7);
      return { ...d, departureDate: d2.toISOString().split('T')[0], returnDate: r2.toISOString().split('T')[0] };
    });
    return NextResponse.json({ destinations: withDates });
  }

  const hit = cache.get(origin);
  if (hit && Date.now() - hit.ts < CACHE_TTL) {
    return NextResponse.json({ destinations: hit.destinations });
  }

  // Departure ~6 weeks out, return 7 days later
  const dep = new Date();
  dep.setDate(dep.getDate() + 42);
  const departureDate = dep.toISOString().split('T')[0];
  const ret = new Date(dep);
  ret.setDate(ret.getDate() + 7);
  const returnDate = ret.toISOString().split('T')[0];

  const settled = await Promise.allSettled(
    POPULAR_DESTINATIONS.map(async (dest) => {
      const { flights } = await searchFlights(origin, dest.iata, departureDate, returnDate, 'economy');
      const best = flights[0];
      if (!best?.price) return null;
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
    .slice(0, 6);

  if (destinations.length === 0) {
    return NextResponse.json({ destinations: MOCK_TRENDING });
  }

  cache.set(origin, { ts: Date.now(), destinations });
  return NextResponse.json({ destinations });
}
