import { NextRequest, NextResponse } from 'next/server';
import { REGIONS } from '@/lib/geo/region-map';

export interface AutocompleteResult {
  iataCode: string;
  name: string;
  cityName: string;
  countryName: string;
  detailedName: string;
  subType: string;
  category: 'airport' | 'city' | 'region';
  score: number;
}

interface TpAirport {
  code: string;
  name: string;
  city_code: string;
  country_code: string;
  flightable: boolean;
}

interface TpCity {
  code: string;
  name: string;
  country_code: string;
}

interface TpCountry {
  code: string;
  name: string;
}

// In-memory cache — populated once per server process
let airportIndex: AutocompleteResult[] | null = null;
const INDEX_VERSION = 2; // bump to invalidate cache when filter logic changes
let indexVersion = 0;

async function buildIndex(): Promise<AutocompleteResult[]> {
  if (airportIndex && indexVersion === INDEX_VERSION) return airportIndex;
  airportIndex = null;

  const [airportsRes, citiesRes, countriesRes] = await Promise.all([
    fetch('https://api.travelpayouts.com/data/en/airports.json', { next: { revalidate: 86400 } }),
    fetch('https://api.travelpayouts.com/data/en/cities.json', { next: { revalidate: 86400 } }),
    fetch('https://api.travelpayouts.com/data/en/countries.json', { next: { revalidate: 86400 } }),
  ]);

  if (!airportsRes.ok) throw new Error('Failed to fetch airport data');

  const airports: TpAirport[] = await airportsRes.json();
  const cities: TpCity[] = citiesRes.ok ? await citiesRes.json() : [];
  const countries: TpCountry[] = countriesRes.ok ? await countriesRes.json() : [];

  const cityMap = new Map<string, string>();
  for (const c of cities) {
    if (c.code && c.name) cityMap.set(c.code, c.name);
  }

  const countryMap = new Map<string, string>();
  for (const c of countries) {
    if (c.code && c.name) countryMap.set(c.code, c.name);
  }

  const NON_AIRPORT_TERMS = /railway|railroad|train|bus station|bus terminal|ferry|seaport|heliport|harbour|harbor|port of/i;

  airportIndex = airports
    .filter((a) =>
      a.code?.length === 3 &&
      a.city_code?.length === 3 &&
      a.flightable &&
      !NON_AIRPORT_TERMS.test(a.name || '')
    )
    .map((a) => {
      const cityName = cityMap.get(a.city_code) || '';
      const countryName = countryMap.get(a.country_code) || '';
      return {
        iataCode: a.code,
        name: a.name || a.code,
        cityName,
        countryName,
        detailedName: a.name || a.code,
        subType: 'AIRPORT',
        category: 'airport' as const,
        score: 50,
      };
    });

  indexVersion = INDEX_VERSION;
  return airportIndex;
}

function scoreMatch(result: AutocompleteResult, q: string): number {
  const ql = q.toLowerCase();
  const code = result.iataCode.toLowerCase();
  const name = result.name.toLowerCase();
  const city = result.cityName.toLowerCase();
  const country = result.countryName.toLowerCase();

  if (code === ql) return 100;
  if (city === ql) return 95;
  if (name === ql) return 90;
  if (code.startsWith(ql)) return 85;
  if (city.startsWith(ql)) return 80;
  if (name.startsWith(ql)) return 75;
  if (city.includes(ql)) return 60;
  if (name.includes(ql)) return 55;
  if (country.startsWith(ql)) return 40;
  if (country.includes(ql)) return 30;
  return 0;
}

function searchAirports(q: string, limit = 8): AutocompleteResult[] {
  if (!airportIndex) return [];
  const results: AutocompleteResult[] = [];
  for (const airport of airportIndex) {
    const s = scoreMatch(airport, q);
    if (s > 0) results.push({ ...airport, score: s });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

function matchingRegions(q: string): AutocompleteResult[] {
  const ql = q.toLowerCase().trim();
  const matches: AutocompleteResult[] = [];
  for (const [key, region] of Object.entries(REGIONS)) {
    if (key.includes(ql) || region.label.toLowerCase().includes(ql)) {
      matches.push({
        iataCode: '',
        name: region.label,
        cityName: '',
        countryName: '',
        detailedName: region.label,
        subType: 'REGION',
        category: 'region',
        score: 100,
      });
    }
  }
  return matches;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  const type = request.nextUrl.searchParams.get('type') || 'origin';

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    await buildIndex();
  } catch {
    // If the data fetch fails, return empty rather than error
    return NextResponse.json([]);
  }

  const results: AutocompleteResult[] = [];

  if (type === 'destination') {
    results.push(...matchingRegions(q));
  }

  results.push(...searchAirports(q, 8));

  return NextResponse.json(results);
}
