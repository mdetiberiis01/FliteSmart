import { amadeusGet } from './client';
import { AmadeusLocation } from '@/types/amadeus';

interface LocationsResponse {
  data: AmadeusLocation[];
}

export async function searchLocations(keyword: string): Promise<AmadeusLocation[]> {
  try {
    const data = await amadeusGet<LocationsResponse>(
      '/v1/reference-data/locations',
      {
        keyword,
        subType: 'AIRPORT,CITY',
        'page[limit]': '10',
        sort: 'analytics.travelers.score',
        view: 'FULL',
      }
    );
    return data.data || [];
  } catch {
    return [];
  }
}
