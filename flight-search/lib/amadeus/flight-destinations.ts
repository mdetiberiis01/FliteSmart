import { amadeusGet } from './client';
import { AmadeusFlightDestination } from '@/types/amadeus';

interface FlightDestinationsResponse {
  data: AmadeusFlightDestination[];
  meta?: {
    currency: string;
  };
}

export async function getFlightDestinations(
  origin: string,
  maxPrice?: number,
  departureDate?: string
): Promise<AmadeusFlightDestination[]> {
  try {
    const params: Record<string, string> = { origin };
    if (maxPrice) params.maxPrice = maxPrice.toString();
    if (departureDate) params.departureDate = departureDate;

    const data = await amadeusGet<FlightDestinationsResponse>(
      '/v1/shopping/flight-destinations',
      params
    );
    return data.data || [];
  } catch {
    return [];
  }
}
