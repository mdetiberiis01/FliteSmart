import { SerpApiResponse, SerpApiPriceInsights } from '@/types/serpapi';
import { PricePoint } from '@/types/search';

const SERPAPI_KEY = process.env.SERPAPI_KEY || '';

export async function getPriceHistory(
  origin: string,
  destination: string
): Promise<{ insights: SerpApiPriceInsights | null; pricePoints: PricePoint[] }> {
  if (!SERPAPI_KEY) {
    return { insights: null, pricePoints: [] };
  }

  try {
    const url = new URL('https://serpapi.com/search');
    url.searchParams.set('engine', 'google_flights');
    url.searchParams.set('departure_id', origin);
    url.searchParams.set('arrival_id', destination);
    url.searchParams.set('type', '2'); // round trip
    url.searchParams.set('api_key', SERPAPI_KEY);
    url.searchParams.set('show_hidden', 'true');

    const response = await fetch(url.toString());
    if (!response.ok) return { insights: null, pricePoints: [] };

    const data: SerpApiResponse = await response.json();
    const insights = data.price_insights || null;

    const pricePoints: PricePoint[] = [];
    if (insights?.price_history) {
      for (const [timestamp, price] of insights.price_history) {
        const date = new Date(timestamp);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        pricePoints.push({ month, price });
      }
    }

    return { insights, pricePoints };
  } catch {
    return { insights: null, pricePoints: [] };
  }
}
