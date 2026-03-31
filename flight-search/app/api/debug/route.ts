/**
 * GET /api/debug?from=JFK&to=LHR
 *
 * Calls SerpAPI (and any other configured provider) with real parameters
 * and returns the raw response so you can see exactly what's coming back.
 *
 * Open this URL in your browser while the dev server is running.
 */

import { NextRequest, NextResponse } from 'next/server';

function futureDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') ?? 'JFK';
  const to   = searchParams.get('to')   ?? 'LHR';
  const dep  = searchParams.get('dep')  ?? futureDate(45);
  const ret  = searchParams.get('ret')  ?? futureDate(52);

  const results: Record<string, unknown> = {
    params: { from, to, dep, ret },
  };

  // ── SerpAPI ────────────────────────────────────────────────────────────────
  const serpKey = process.env.SERPAPI_KEY ?? '';
  if (serpKey) {
    try {
      const url = new URL('https://serpapi.com/search');
      url.searchParams.set('engine', 'google_flights');
      url.searchParams.set('departure_id', from);
      url.searchParams.set('arrival_id', to);
      url.searchParams.set('outbound_date', dep);
      url.searchParams.set('return_date', ret);
      url.searchParams.set('type', '1');
      url.searchParams.set('currency', 'USD');
      url.searchParams.set('hl', 'en');
      url.searchParams.set('gl', 'us');
      url.searchParams.set('api_key', serpKey);

      const r = await fetch(url.toString());
      const body = await r.json();
      results.serpapi = {
        status: r.status,
        error: body.error ?? null,
        bestFlightsCount: body.best_flights?.length ?? 0,
        otherFlightsCount: body.other_flights?.length ?? 0,
        firstPrice: body.best_flights?.[0]?.price ?? null,
        searchMetadata: body.search_metadata ?? null,
        // Full raw body for debugging (truncated to first 3 itineraries)
        raw_best_flights: (body.best_flights ?? []).slice(0, 3),
        raw_error_details: body.error ? body : undefined,
      };
    } catch (e) {
      results.serpapi = { error: String(e) };
    }
  } else {
    results.serpapi = { skipped: 'SERPAPI_KEY not set' };
  }

  // ── Amadeus ────────────────────────────────────────────────────────────────
  const amId = process.env.AMADEUS_CLIENT_ID ?? '';
  const amSecret = process.env.AMADEUS_CLIENT_SECRET ?? '';
  if (amId && amSecret) {
    try {
      const { getFlightOffers } = await import('@/lib/amadeus/flight-offers');
      const offers = await getFlightOffers(from, to, dep, ret, 1);
      results.amadeus = {
        count: offers.length,
        firstPrice: offers[0] ? parseFloat(offers[0].price.total) : null,
        baseUrl: process.env.AMADEUS_BASE_URL,
      };
    } catch (e) {
      results.amadeus = { error: String(e) };
    }
  } else {
    results.amadeus = { skipped: 'AMADEUS_CLIENT_ID / SECRET not set' };
  }

  // ── Aviasales ──────────────────────────────────────────────────────────────
  const avToken = process.env.AVIASALES_TOKEN ?? '';
  if (avToken) {
    try {
      const { searchFlightsAviasales } = await import('@/lib/aviasales/flight-search');
      const r = await searchFlightsAviasales(from, to, dep, ret);
      results.aviasales = {
        count: r.flights.length,
        firstPrice: r.flights[0]?.price ?? null,
      };
    } catch (e) {
      results.aviasales = { error: String(e) };
    }
  } else {
    results.aviasales = { skipped: 'AVIASALES_TOKEN not set' };
  }

  // ── Tequila ────────────────────────────────────────────────────────────────
  const tqKey = process.env.TEQUILA_API_KEY ?? '';
  if (tqKey) {
    try {
      const { searchFlightsTequila } = await import('@/lib/tequila/flight-search');
      const r = await searchFlightsTequila(from, to, dep, ret);
      results.tequila = {
        count: r.flights.length,
        firstPrice: r.flights[0]?.price ?? null,
      };
    } catch (e) {
      results.tequila = { error: String(e) };
    }
  } else {
    results.tequila = { skipped: 'TEQUILA_API_KEY not set' };
  }

  return NextResponse.json(results, { status: 200 });
}
