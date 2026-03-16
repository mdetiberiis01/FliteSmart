import { FlightResult } from '../serpapi/flight-search';
import { PricePoint } from '@/types/search';

const TEQUILA_API_KEY = process.env.TEQUILA_API_KEY || '';

function secondsToIsoDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `PT${h}H${m}M` : `PT${h}H`;
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
    url.searchParams.set('date_from', toTequilaDate(departureDate));
    url.searchParams.set('date_to', toTequilaDate(departureDate));
    if (returnDate) {
      url.searchParams.set('return_from', toTequilaDate(returnDate));
      url.searchParams.set('return_to', toTequilaDate(returnDate));
    }
    url.searchParams.set('curr', 'USD');
    url.searchParams.set('limit', '5');
    url.searchParams.set('sort', 'price');

    const response = await fetch(url.toString(), {
      headers: { apikey: TEQUILA_API_KEY },
    });
    if (!response.ok) return { flights: [], pricePoints: [] };

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) return { flights: [], pricePoints: [] };

    const flights: FlightResult[] = (data.data as Record<string, unknown>[])
      .filter((item) => ((item.price as number) ?? 0) > 0)
      .map((item) => {
        const airlines = item.airlines as string[] | undefined;
        const airlineCode = airlines?.[0] ?? '';
        const localDep = item.local_departure as string | undefined;
        const depDate = localDep ? localDep.split('T')[0] : departureDate;
        const duration = item.duration as Record<string, number> | undefined;
        const durationSecs = duration?.departure ?? 0;
        const route = item.route as unknown[] | undefined;

        return {
          price: item.price as number,
          airline: airlineCode,
          airlineCode,
          stops: Math.max(0, (route?.length ?? 1) - 1),
          duration: secondsToIsoDuration(durationSecs),
          departureDate: depDate,
          returnDate,
          bookingUrl: item.deep_link as string | undefined,
        };
      })
      .sort((a, b) => a.price - b.price);

    return { flights, pricePoints: [] };
  } catch {
    return { flights: [], pricePoints: [] };
  }
}
