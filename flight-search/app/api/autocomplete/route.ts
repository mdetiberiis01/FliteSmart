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

// Primary airport for each city — shown first when the city name is searched.
// Score bonus applied on top of the text-match score.
const AIRPORT_PRIORITY: Record<string, number> = {
  // North America
  JFK: 30, LGA: 20, EWR: 15, // New York
  LAX: 30, BUR: 15, LGB: 15, ONT: 10, // Los Angeles
  ORD: 30, MDW: 20,           // Chicago
  SFO: 30, OAK: 20, SJC: 15, // San Francisco
  MIA: 30, FLL: 20,           // Miami
  BOS: 30,                    // Boston
  ATL: 30,                    // Atlanta
  DFW: 30, DAL: 20,           // Dallas
  SEA: 30,                    // Seattle
  DEN: 30,                    // Denver
  LAS: 30,                    // Las Vegas
  MSP: 30,                    // Minneapolis
  DTW: 30,                    // Detroit
  PHL: 30,                    // Philadelphia
  PHX: 30,                    // Phoenix
  IAH: 30, HOU: 20,           // Houston
  DCA: 25, IAD: 30, BWI: 20,  // Washington DC
  YYZ: 30, YUL: 30, YVR: 30, // Canada
  MEX: 30, CUN: 25,           // Mexico
  // Europe
  LHR: 30, LGW: 20, STN: 15, LTN: 10, // London
  CDG: 30, ORY: 20,           // Paris
  FCO: 30, CIA: 15,           // Rome
  MXP: 30, LIN: 15,           // Milan
  MAD: 30,                    // Madrid
  BCN: 30,                    // Barcelona
  AMS: 30,                    // Amsterdam
  FRA: 30, MUC: 30,           // Germany
  VIE: 30,                    // Vienna
  ZRH: 30,                    // Zurich
  BRU: 30,                    // Brussels
  LIS: 30,                    // Lisbon
  ATH: 30,                    // Athens
  IST: 30, SAW: 15,           // Istanbul
  CPH: 30,                    // Copenhagen
  ARN: 30,                    // Stockholm
  OSL: 30,                    // Oslo
  HEL: 30,                    // Helsinki
  DUB: 30,                    // Dublin
  WAW: 30,                    // Warsaw
  PRG: 30,                    // Prague
  BUD: 30,                    // Budapest
  // Middle East & Africa
  DXB: 30, AUH: 25,           // UAE
  DOH: 30,                    // Doha
  TLV: 30,                    // Tel Aviv
  CAI: 30,                    // Cairo
  JNB: 30, CPT: 25,           // South Africa
  NBO: 30,                    // Nairobi
  ADD: 30,                    // Addis Ababa
  CMN: 30,                    // Casablanca
  // Asia Pacific
  NRT: 30, HND: 25,           // Tokyo
  ICN: 30, GMP: 15,           // Seoul
  PEK: 30, PKX: 15,           // Beijing
  PVG: 30, SHA: 15,           // Shanghai
  HKG: 30,                    // Hong Kong
  TPE: 30,                    // Taipei
  SIN: 30,                    // Singapore
  BKK: 30, DMK: 15,           // Bangkok
  KUL: 30,                    // Kuala Lumpur
  CGK: 30,                    // Jakarta
  MNL: 30,                    // Manila
  DPS: 30,                    // Bali
  DEL: 30, BOM: 30, BLR: 25, // India
  SYD: 30, MEL: 30, BNE: 25, // Australia
  AKL: 30,                    // Auckland
};

// In-memory cache — populated once per server process
let airportIndex: AutocompleteResult[] | null = null;
const INDEX_VERSION = 3; // bump to invalidate cache when filter logic changes
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

  let base = 0;
  if (code === ql) base = 100;
  else if (city === ql) base = 95;
  else if (name === ql) base = 90;
  else if (code.startsWith(ql)) base = 85;
  else if (city.startsWith(ql)) base = 80;
  else if (name.startsWith(ql)) base = 75;
  else if (city.includes(ql)) base = 60;
  else if (name.includes(ql)) base = 55;
  else if (country.startsWith(ql)) base = 40;
  else if (country.includes(ql)) base = 30;

  if (base === 0) return 0;
  return base + (AIRPORT_PRIORITY[result.iataCode] ?? 0);
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
