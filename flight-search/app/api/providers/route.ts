/**
 * GET /api/providers
 *
 * Returns configuration status for every flight data provider and runs a
 * live test search (JFK → LHR, ~30 days out) against each one that has
 * credentials configured.
 *
 * Usage:  curl http://localhost:3000/api/providers | jq
 */

import { NextResponse } from 'next/server';

interface ProviderStatus {
  configured: boolean;
  result: 'ok' | 'no_results' | 'error' | 'skipped';
  count?: number;
  error?: string;
  samplePrice?: number;
}

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

async function testTequila(dep: string, ret: string): Promise<ProviderStatus> {
  const key = process.env.TEQUILA_API_KEY || '';
  if (!key) return { configured: false, result: 'skipped' };

  try {
    const { searchFlightsTequila } = await import('@/lib/tequila/flight-search');
    const r = await searchFlightsTequila('JFK', 'LHR', dep, ret);
    return {
      configured: true,
      result: r.flights.length > 0 ? 'ok' : 'no_results',
      count: r.flights.length,
      samplePrice: r.flights[0]?.price,
    };
  } catch (err) {
    return { configured: true, result: 'error', error: String(err) };
  }
}

async function testSerpapi(dep: string, ret: string): Promise<ProviderStatus> {
  const key = process.env.SERPAPI_KEY || '';
  if (!key) return { configured: false, result: 'skipped' };

  try {
    const { searchFlights } = await import('@/lib/serpapi/flight-search');
    const r = await searchFlights('JFK', 'LHR', dep, ret);
    return {
      configured: true,
      result: r.flights.length > 0 ? 'ok' : 'no_results',
      count: r.flights.length,
      samplePrice: r.flights[0]?.price,
    };
  } catch (err) {
    return { configured: true, result: 'error', error: String(err) };
  }
}

async function testAmadeus(dep: string, ret: string): Promise<ProviderStatus> {
  const id = process.env.AMADEUS_CLIENT_ID || '';
  const secret = process.env.AMADEUS_CLIENT_SECRET || '';
  if (!id || !secret) return { configured: false, result: 'skipped' };

  try {
    const { getFlightOffers } = await import('@/lib/amadeus/flight-offers');
    const offers = await getFlightOffers('JFK', 'LHR', dep, ret);
    return {
      configured: true,
      result: offers.length > 0 ? 'ok' : 'no_results',
      count: offers.length,
      samplePrice: offers[0] ? parseFloat(offers[0].price.total) : undefined,
    };
  } catch (err) {
    return { configured: true, result: 'error', error: String(err) };
  }
}

async function testAviasales(dep: string, ret: string): Promise<ProviderStatus> {
  const token = process.env.AVIASALES_TOKEN || '';
  if (!token) return { configured: false, result: 'skipped' };

  try {
    const { searchFlightsAviasales } = await import('@/lib/aviasales/flight-search');
    const r = await searchFlightsAviasales('JFK', 'LHR', dep, ret);
    return {
      configured: true,
      result: r.flights.length > 0 ? 'ok' : 'no_results',
      count: r.flights.length,
      samplePrice: r.flights[0]?.price,
    };
  } catch (err) {
    return { configured: true, result: 'error', error: String(err) };
  }
}

export async function GET() {
  const dep = futureDate(30);
  const ret = futureDate(37);

  const [tequila, serpapi, amadeus, aviasales] = await Promise.all([
    testTequila(dep, ret),
    testSerpapi(dep, ret),
    testAmadeus(dep, ret),
    testAviasales(dep, ret),
  ]);

  const anyLive = [tequila, serpapi, amadeus, aviasales].some((p) => p.result === 'ok');

  return NextResponse.json({
    testRoute: `JFK → LHR  dep:${dep}  ret:${ret}`,
    anyLiveData: anyLive,
    providers: { tequila, serpapi, amadeus, aviasales },
    instructions: {
      tequila: 'Free key at https://tequila.kiwi.com',
      amadeus: 'Free test credentials at https://developers.amadeus.com (Self-Service)',
      serpapi: 'Manage credits at https://serpapi.com/manage-api-key',
      aviasales: 'Free token at https://www.travelpayouts.com/developers/api',
    },
  });
}
