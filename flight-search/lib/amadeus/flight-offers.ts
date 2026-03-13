import { amadeusGet } from './client';
import { AmadeusFlightOffer } from '@/types/amadeus';

interface FlightOffersResponse {
  data: AmadeusFlightOffer[];
}

export async function getFlightOffers(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string,
  adults = 1
): Promise<AmadeusFlightOffer[]> {
  try {
    const params: Record<string, string> = {
      originLocationCode: origin,
      destinationLocationCode: destination,
      departureDate,
      adults: adults.toString(),
      max: '5',
      currencyCode: 'USD',
    };
    if (returnDate) params.returnDate = returnDate;

    const data = await amadeusGet<FlightOffersResponse>(
      '/v2/shopping/flight-offers',
      params
    );
    return data.data || [];
  } catch {
    return [];
  }
}
