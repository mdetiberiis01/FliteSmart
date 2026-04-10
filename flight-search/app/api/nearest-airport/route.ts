import { NextRequest, NextResponse } from 'next/server';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface TpAirport {
  code: string;
  name: string;
  city_code: string;
  country_code: string;
  coordinates: { lat: number; lon: number };
  flightable: boolean;
}

// Cache airports data in memory for the lifetime of the server process
let cachedAirports: TpAirport[] | null = null;

async function getAirports(): Promise<TpAirport[]> {
  if (cachedAirports) return cachedAirports;

  const res = await fetch('https://api.travelpayouts.com/data/en/airports.json', {
    next: { revalidate: 86400 }, // cache for 24h on Vercel
  });

  if (!res.ok) throw new Error('Failed to fetch airports list');

  const data: TpAirport[] = await res.json();

  // Filter to major commercial airports only:
  // - valid 3-letter IATA code
  // - has a city_code (only assigned to airports with scheduled commercial service)
  // - valid coordinates
  cachedAirports = data.filter(
    (a) =>
      a.code &&
      a.code.length === 3 &&
      a.city_code &&
      a.city_code.length === 3 &&
      a.coordinates?.lat != null &&
      a.coordinates?.lon != null &&
      a.flightable === true
  );

  return cachedAirports;
}

export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get('lat') ?? '');
  const lon = parseFloat(req.nextUrl.searchParams.get('lon') ?? '');

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: 'lat and lon required' }, { status: 400 });
  }

  try {
    const airports = await getAirports();

    let nearest: TpAirport | null = null;
    let minDist = Infinity;

    for (const airport of airports) {
      const dist = haversineKm(lat, lon, airport.coordinates.lat, airport.coordinates.lon);
      if (dist < minDist) {
        minDist = dist;
        nearest = airport;
      }
    }

    if (!nearest) {
      return NextResponse.json({ error: 'No airport found' }, { status: 404 });
    }

    return NextResponse.json({
      iataCode: nearest.code,
      name: nearest.name,
      cityCode: nearest.city_code,
      countryCode: nearest.country_code,
      distanceKm: Math.round(minDist),
      // Label suitable for display in the origin field
      label: `${nearest.name} (${nearest.code})`,
    });
  } catch (err) {
    console.error('[nearest-airport]', err);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}
