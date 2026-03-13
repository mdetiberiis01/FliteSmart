import { amadeusGet } from './client';
import { AmadeusFlightDate } from '@/types/amadeus';

interface FlightDatesResponse {
  data: AmadeusFlightDate[];
}

export async function getCheapestDates(
  origin: string,
  destination: string,
  departureDate?: string,
  oneWay = false
): Promise<AmadeusFlightDate[]> {
  try {
    const params: Record<string, string> = { origin, destination };
    if (departureDate) params.departureDate = departureDate;
    if (oneWay) params.oneWay = 'true';

    const data = await amadeusGet<FlightDatesResponse>(
      '/v1/shopping/flight-dates',
      params
    );
    return data.data || [];
  } catch {
    return [];
  }
}
