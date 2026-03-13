import { SearchParams, SearchResult, PricePoint } from '@/types/search';
import { getFlightDestinations } from '../amadeus/flight-destinations';
import { getCheapestDates } from '../amadeus/flight-dates';
import { getFlightOffers } from '../amadeus/flight-offers';
import { searchLocations } from '../amadeus/locations';
import { resolveDestination } from '../geo/resolve-destination';
import { resolveRegionAirports, getRegionLabel } from '../geo/region-map';
import { getDateRanges } from './date-ranges';
import { mergeAndDeduplicateResults } from './result-merger';
import {
  getCachedPriceHistory,
  savePriceSnapshots,
  updatePriceSummary,
  checkSerpApiBudget,
  logSerpApiCall,
} from '../supabase/price-cache';
import { getPriceHistory } from '../serpapi/price-history';
import { dealRating } from '../utils/deal-rating';

// ---------------------------------------------------------------------------
// Demo data — shown when Amadeus keys are not configured
// ---------------------------------------------------------------------------

const DEMO_DESTINATIONS = [
  { iataCode: 'LHR', city: 'London', country: 'United Kingdom', basePrice: 420, airline: 'British Airways', airlineCode: 'BA', stops: 0, duration: 'PT7H' },
  { iataCode: 'CDG', city: 'Paris', country: 'France', basePrice: 390, airline: 'Air France', airlineCode: 'AF', stops: 0, duration: 'PT7H30M' },
  { iataCode: 'NRT', city: 'Tokyo', country: 'Japan', basePrice: 780, airline: 'Japan Airlines', airlineCode: 'JL', stops: 0, duration: 'PT14H' },
  { iataCode: 'BKK', city: 'Bangkok', country: 'Thailand', basePrice: 650, airline: 'Thai Airways', airlineCode: 'TG', stops: 1, duration: 'PT18H' },
  { iataCode: 'SIN', city: 'Singapore', country: 'Singapore', basePrice: 720, airline: 'Singapore Airlines', airlineCode: 'SQ', stops: 0, duration: 'PT18H30M' },
  { iataCode: 'DXB', city: 'Dubai', country: 'United Arab Emirates', basePrice: 560, airline: 'Emirates', airlineCode: 'EK', stops: 0, duration: 'PT12H' },
  { iataCode: 'MEX', city: 'Mexico City', country: 'Mexico', basePrice: 280, airline: 'American Airlines', airlineCode: 'AA', stops: 0, duration: 'PT5H30M' },
  { iataCode: 'GRU', city: 'São Paulo', country: 'Brazil', basePrice: 510, airline: 'LATAM Airlines', airlineCode: 'LA', stops: 1, duration: 'PT10H' },
  { iataCode: 'SYD', city: 'Sydney', country: 'Australia', basePrice: 1100, airline: 'Qantas', airlineCode: 'QF', stops: 1, duration: 'PT21H' },
  { iataCode: 'FCO', city: 'Rome', country: 'Italy', basePrice: 450, airline: 'Lufthansa', airlineCode: 'LH', stops: 1, duration: 'PT10H' },
  { iataCode: 'ICN', city: 'Seoul', country: 'South Korea', basePrice: 820, airline: 'Korean Air', airlineCode: 'KE', stops: 0, duration: 'PT14H30M' },
  { iataCode: 'AMS', city: 'Amsterdam', country: 'Netherlands', basePrice: 410, airline: 'KLM', airlineCode: 'KL', stops: 0, duration: 'PT7H45M' },
];

function makeDemoHistory(basePrice: number, seed: number): PricePoint[] {
  const points: PricePoint[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    // Fully deterministic: seasonal curve + per-destination offset, no Math.random()
    const seasonal = Math.sin((d.getMonth() / 12) * Math.PI * 2 - 1.2) * 0.15;
    const destVariance = Math.sin(seed * 0.37 + i * 0.9) * 0.07;
    points.push({ month, price: Math.round(basePrice * (1 + seasonal + destVariance)) });
  }
  return points;
}

// Cheapest-day offsets per destination (simulates real cheapest-date search)
// Spread across days 8-22 of a month — mid-month tends to be cheapest
const DEST_DAY_OFFSETS: Record<string, number> = {
  LHR: 12, CDG: 8, NRT: 15, BKK: 9, SIN: 19, DXB: 11,
  MEX: 14, GRU: 22, SYD: 17, FCO: 10, ICN: 13, AMS: 8,
};

function makeDemoResults(origin: string, destinationCodes: string[], dateRanges: ReturnType<typeof getDateRanges>, tripDays: number): SearchResult[] {
  const pool = DEMO_DESTINATIONS.filter(
    (d) => destinationCodes.includes(d.iataCode) || destinationCodes.length > 10
  );
  const selected = pool.length > 0 ? pool : DEMO_DESTINATIONS;

  return selected.slice(0, 9).map((dest, i) => {
    // Each destination gets its "cheapest date" in a different month from the date ranges
    const range = dateRanges[i % Math.max(dateRanges.length, 1)];
    const rangeStart = new Date((range?.start || new Date().toISOString().split('T')[0]) + 'T00:00:00');
    const day = DEST_DAY_OFFSETS[dest.iataCode] ?? (8 + (i * 3) % 15);
    rangeStart.setDate(day);
    const depDate = rangeStart.toISOString().split('T')[0];
    const retDate = new Date(rangeStart.getTime() + tripDays * 86400000).toISOString().split('T')[0];

    // Deterministic price: seasonal factor by month + per-destination curve
    const monthIndex = rangeStart.getMonth();
    const seasonalFactor = [1.05, 1.0, 1.02, 0.98, 1.0, 1.15, 1.2, 1.18, 1.05, 0.97, 0.95, 1.1][monthIndex];
    const destFactor = 1 + Math.sin(i * 1.7) * 0.06;
    const price = Math.round(dest.basePrice * seasonalFactor * destFactor);

    const history = makeDemoHistory(dest.basePrice, i);
    const historicalLow = Math.min(...history.map((p) => p.price));
    const avg12m = history.reduce((s, p) => s + p.price, 0) / history.length;
    const { rating, percent } = dealRating(price, historicalLow);

    return {
      id: `demo-${origin}-${dest.iataCode}-${i}`,
      origin,
      destination: dest.iataCode,
      destinationName: `${dest.city}, ${dest.country}`,
      destinationCity: dest.city,
      destinationCountry: dest.country,
      departureDate: depDate,
      returnDate: retDate,
      price,
      currency: 'USD',
      airline: dest.airline,
      airlineCode: dest.airlineCode,
      stops: dest.stops,
      duration: dest.duration,
      historicalLow,
      avg12m,
      dealRating: rating,
      dealPercent: percent,
      priceHistory: history,
      dataSource: 'demo',
    } as SearchResult;
  });
}

const AIRLINE_NAMES: Record<string, string> = {
  AA: 'American Airlines', UA: 'United Airlines', DL: 'Delta Air Lines',
  B6: 'JetBlue', WN: 'Southwest', AS: 'Alaska Airlines', NK: 'Spirit',
  F9: 'Frontier', G4: 'Allegiant', SY: 'Sun Country',
  BA: 'British Airways', LH: 'Lufthansa', AF: 'Air France', KL: 'KLM',
  IB: 'Iberia', AY: 'Finnair', SK: 'SAS', LX: 'Swiss', OS: 'Austrian',
  TK: 'Turkish Airlines', EK: 'Emirates', QR: 'Qatar Airways', EY: 'Etihad',
  SQ: 'Singapore Airlines', CX: 'Cathay Pacific', NH: 'ANA', JL: 'Japan Airlines',
  KE: 'Korean Air', OZ: 'Asiana', CA: 'Air China', MU: 'China Eastern',
  TG: 'Thai Airways', VN: 'Vietnam Airlines', MH: 'Malaysia Airlines', GA: 'Garuda',
  QF: 'Qantas', NZ: 'Air New Zealand', AI: 'Air India',
};

export async function orchestrateSearch(params: SearchParams): Promise<SearchResult[]> {
  const { origin, destination, flexibility, customDateStart, customDateEnd } = params;

  const isRegion = !!resolveRegionAirports(destination);

  // Resolve destination to IATA codes
  const destinationCodes = await resolveDestination(destination);
  if (!destinationCodes.length) {
    return [];
  }

  const dateRanges = getDateRanges(flexibility, customDateStart, customDateEnd);
  if (!dateRanges.length) return [];

  let allResults: SearchResult[] = [];

  if (isRegion || destinationCodes.length > 1) {
    // Use flight destinations for multi-destination search
    const flightDests = await getFlightDestinations(origin);
    const relevantDests = flightDests.filter((d) =>
      destinationCodes.includes(d.destination)
    );

    // Take top 8 cheapest relevant destinations
    const topDests = relevantDests
      .sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total))
      .slice(0, 8);

    // Get city info for top destinations
    const destInfoMap = new Map<string, { city: string; country: string }>();
    await Promise.all(
      topDests.slice(0, 5).map(async (d) => {
        try {
          const locs = await searchLocations(d.destination);
          if (locs.length) {
            destInfoMap.set(d.destination, {
              city: locs[0].address.cityName,
              country: locs[0].address.countryName,
            });
          }
        } catch {
          destInfoMap.set(d.destination, { city: d.destination, country: '' });
        }
      })
    );

    // Get cheapest dates for top 3
    const top3Dests = topDests.slice(0, 3);
    const dateResults = await Promise.all(
      top3Dests.map(async (dest) => {
        const cheapestDate =
          dateRanges.length > 0
            ? await getCheapestDates(origin, dest.destination, dateRanges[0].month + '-01')
            : [];

        const bestDate = cheapestDate.sort(
          (a, b) => parseFloat(a.price.total) - parseFloat(b.price.total)
        )[0];

        if (!bestDate) return null;

        const offers = await getFlightOffers(
          origin,
          dest.destination,
          bestDate.departureDate,
          bestDate.returnDate
        );

        const bestOffer = offers.sort(
          (a, b) => parseFloat(a.price.total) - parseFloat(b.price.total)
        )[0];

        if (!bestOffer) return null;

        const price = parseFloat(bestOffer.price.total);
        const airlineCode = bestOffer.validatingAirlineCodes[0] || '';
        const itinerary = bestOffer.itineraries[0];
        const segment = itinerary?.segments[0];

        const info = destInfoMap.get(dest.destination) || { city: dest.destination, country: '' };

        // Get price history
        const { pricePoints, historicalLow, avg12m } = await getPriceData(
          origin,
          dest.destination,
          price
        );

        const { rating, percent } = dealRating(price, historicalLow);

        return {
          id: bestOffer.id,
          origin,
          destination: dest.destination,
          destinationName: `${info.city}, ${info.country}`,
          destinationCity: info.city,
          destinationCountry: info.country,
          departureDate: bestDate.departureDate,
          returnDate: bestDate.returnDate,
          price,
          currency: bestOffer.price.currency,
          airline: AIRLINE_NAMES[airlineCode] || airlineCode,
          airlineCode,
          stops: segment?.numberOfStops || 0,
          duration: itinerary?.duration || '',
          historicalLow,
          avg12m,
          dealRating: rating,
          dealPercent: percent,
          priceHistory: pricePoints,
          dataSource: 'amadeus',
        } as SearchResult;
      })
    );

    allResults = dateResults.filter((r): r is SearchResult => r !== null);

    // Also add flight destinations with basic data for display
    for (const dest of topDests.slice(3, 8)) {
      const price = parseFloat(dest.price.total);
      const info = destInfoMap.get(dest.destination) || { city: dest.destination, country: '' };
      const { pricePoints, historicalLow, avg12m } = await getPriceData(
        origin,
        dest.destination,
        price
      );
      const { rating, percent } = dealRating(price, historicalLow);

      allResults.push({
        id: `${dest.origin}-${dest.destination}-${dest.departureDate}`,
        origin,
        destination: dest.destination,
        destinationName: `${info.city}, ${info.country}`.trim(),
        destinationCity: info.city,
        destinationCountry: info.country,
        departureDate: dest.departureDate,
        returnDate: dest.returnDate,
        price,
        currency: 'USD',
        airline: 'Various',
        airlineCode: '',
        stops: 1,
        duration: '',
        historicalLow,
        avg12m,
        dealRating: rating,
        dealPercent: percent,
        priceHistory: pricePoints,
        dataSource: 'amadeus',
      });
    }
  } else {
    // Single destination search
    const destCode = destinationCodes[0];

    // Get location info
    let destInfo = { city: destCode, country: '' };
    try {
      const locs = await searchLocations(destCode);
      if (locs.length) {
        destInfo = { city: locs[0].address.cityName, country: locs[0].address.countryName };
      }
    } catch {
      // ignore
    }

    // Get cheapest dates for each date range
    for (const range of dateRanges.slice(0, 3)) {
      const cheapestDates = await getCheapestDates(origin, destCode, range.month + '-01');
      const bestDate = cheapestDates.sort(
        (a, b) => parseFloat(a.price.total) - parseFloat(b.price.total)
      )[0];

      if (!bestDate) continue;

      const offers = await getFlightOffers(
        origin,
        destCode,
        bestDate.departureDate,
        bestDate.returnDate
      );

      const bestOffer = offers.sort(
        (a, b) => parseFloat(a.price.total) - parseFloat(b.price.total)
      )[0];

      if (!bestOffer) continue;

      const price = parseFloat(bestOffer.price.total);
      const airlineCode = bestOffer.validatingAirlineCodes[0] || '';
      const itinerary = bestOffer.itineraries[0];
      const segment = itinerary?.segments[0];

      const { pricePoints, historicalLow, avg12m } = await getPriceData(
        origin,
        destCode,
        price
      );
      const { rating, percent } = dealRating(price, historicalLow);

      allResults.push({
        id: bestOffer.id,
        origin,
        destination: destCode,
        destinationName: `${destInfo.city}, ${destInfo.country}`.trim(),
        destinationCity: destInfo.city,
        destinationCountry: destInfo.country,
        departureDate: bestDate.departureDate,
        returnDate: bestDate.returnDate,
        price,
        currency: bestOffer.price.currency,
        airline: AIRLINE_NAMES[airlineCode] || airlineCode,
        airlineCode,
        stops: segment?.numberOfStops || 0,
        duration: itinerary?.duration || '',
        historicalLow,
        avg12m,
        dealRating: rating,
        dealPercent: percent,
        priceHistory: pricePoints,
        dataSource: 'amadeus',
      });
    }
  }

  const merged = mergeAndDeduplicateResults(allResults);

  // If Amadeus returned nothing (keys not configured), show demo data
  if (merged.length === 0) {
    return makeDemoResults(origin, destinationCodes, dateRanges, params.tripDays ?? 7);
  }

  return merged;
}

async function getPriceData(
  origin: string,
  destination: string,
  currentPrice: number
): Promise<{ pricePoints: PricePoint[]; historicalLow: number | null; avg12m: number | null }> {
  // Check Supabase cache first
  const { pricePoints: cachedPoints, hasEnoughData } = await getCachedPriceHistory(
    origin,
    destination
  );

  let pricePoints = cachedPoints;

  if (!hasEnoughData) {
    // Check SerpAPI budget
    const { canCall } = await checkSerpApiBudget();

    if (canCall) {
      const { pricePoints: serpPoints } = await getPriceHistory(origin, destination);
      if (serpPoints.length > 0) {
        await logSerpApiCall(origin, destination);
        await savePriceSnapshots(origin, destination, serpPoints, 'serpapi');
        pricePoints = serpPoints;
      }
    }
  }

  // Save current price as snapshot
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  await savePriceSnapshots(
    origin,
    destination,
    [{ month: currentMonth, price: currentPrice }],
    'user_search'
  ).catch(() => {});

  if (pricePoints.length > 0) {
    await updatePriceSummary(origin, destination, pricePoints, currentPrice).catch(() => {});
  }

  const prices = pricePoints.map((p) => p.price);
  const historicalLow = prices.length > 0 ? Math.min(...prices) : null;
  const avg12m =
    prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null;

  return { pricePoints, historicalLow, avg12m };
}
