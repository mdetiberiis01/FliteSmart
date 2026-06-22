import { FlightResult } from '../serpapi/flight-search';
import { PricePoint } from '@/types/search';

const TEQUILA_API_KEY = process.env.TEQUILA_API_KEY || '';

function secondsToIsoDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `PT${h}H${m}M` : `PT${h}H`;
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function toTequilaDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

export async function searchFlightsTequila(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string
): Promise<{ flights: FlightResult[]; pricePoints: PricePoint[] }> {
  if (!TEQUILA_API_KEY) return { flights: [], pricePoints: [] };

  try {
    const url = new URL('https://api.tequila.kiwi.com/v2/search');
    url.searchParams.set('fly_from', origin);
    url.searchParams.set('fly_to', destination);
    const depPlus2 = addDays(departureDate, 2);
    url.searchParams.set('date_from', toTequilaDate(departureDate));
    url.searchParams.set('date_to', toTequilaDate(depPlus2));
    if (returnDate) {
      const retPlus2 = addDays(returnDate, 2);
      url.searchParams.set('return_from', toTequilaDate(returnDate));
      url.searchParams.set('return_to', toTequilaDate(retPlus2));
    }
    url.searchParams.set('curr', 'USD');
    url.searchParams.set('limit', '5');
    url.searchParams.set('sort', 'price');

    const response = await fetch(url.toString(), {
      headers: { apikey: TEQUILA_API_KEY },
    });
    if (!response.ok) {
      console.error('[tequila]', response.status, await response.text().catch(() => ''));
      return { flights: [], pricePoints: [] };
    }

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) return { flights: [], pricePoints: [] };

    const flights: FlightResult[] = (data.data as Record<string, unknown>[])
      .filter((item) => ((item.price as number) ?? 0) > 0)
      .map((item) => {
        const airlines = item.airlines as string[] | undefined;
        const airlineCode = airlines?.[0] ?? '';
        const localDep = item.local_departure as string | undefined;
        const localArr = item.local_arrival as string | undefined;
        const depDate = localDep ? localDep.split('T')[0] : departureDate;
        const depHour = localDep ? new Date(localDep).getHours() : undefined;
        const arrHour = localArr ? new Date(localArr).getHours() : undefined;
        const duration = item.duration as Record<string, number> | undefined;
        const durationSecs = duration?.departure ?? 0;
        type RouteSeg = { flyTo?: string; cityTo?: string; local_departure?: string; local_arrival?: string };
        const route = item.route as RouteSeg[] | undefined;

        // For round trips, outbound segments fly toward destination; return segments fly back.
        // Find split by locating where flyTo === origin (start of return journey).
        let outboundSegs = route ?? [];
        let returnSegs: RouteSeg[] = [];
        if (returnDate && route && route.length > 1) {
          const splitIdx = route.findIndex((seg) => seg.flyTo?.toUpperCase() === origin.toUpperCase());
          if (splitIdx > 0) {
            outboundSegs = route.slice(0, splitIdx);
            returnSegs = route.slice(splitIdx);
          }
        }

        const stops = Math.max(0, outboundSegs.length - 1);
        const layovers = outboundSegs.length > 1
          ? outboundSegs.slice(0, -1).map((seg) => seg.flyTo ?? '').filter(Boolean)
          : undefined;

        const lastReturnSeg = returnSegs.length > 0 ? returnSegs[returnSegs.length - 1] : null;
        const returnDepHour = lastReturnSeg?.local_departure
          ? new Date(lastReturnSeg.local_departure).getHours()
          : undefined;
        const returnArrHour = lastReturnSeg?.local_arrival
          ? new Date(lastReturnSeg.local_arrival).getHours()
          : undefined;

        return {
          price: item.price as number,
          airline: airlineCode,
          airlineCode,
          stops,
          layovers: layovers && layovers.length > 0 ? layovers : undefined,
          duration: secondsToIsoDuration(durationSecs),
          departureDate: depDate,
          departureHour: depHour,
          arrivalHour: arrHour,
          returnDepartureHour: returnDepHour,
          returnArrivalHour: returnArrHour,
          returnDate,
          bookingUrl: item.deep_link as string | undefined,
        };
      })
      .sort((a, b) => (a.price + a.stops * 60) - (b.price + b.stops * 60));

    return { flights, pricePoints: [] };
  } catch (err) {
    console.error('[tequila]', err);
    return { flights: [], pricePoints: [] };
  }
}
