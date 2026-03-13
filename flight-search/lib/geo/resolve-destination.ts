import { searchLocations } from '../amadeus/locations';
import { resolveRegionAirports, REGIONS } from './region-map';

// All airports across all regions — used for "anywhere"
const ALL_REGION_AIRPORTS = Array.from(
  new Set(Object.values(REGIONS).flatMap((r) => r.airports))
);

export async function resolveDestination(destination: string): Promise<string[]> {
  const lower = destination.toLowerCase().trim();

  // "anywhere" → every region airport
  if (lower === 'anywhere') return ALL_REGION_AIRPORTS;

  // Check if it's a region
  const regionAirports = resolveRegionAirports(destination);
  if (regionAirports) return regionAirports;

  // Check if it looks like an IATA code (3 uppercase letters)
  if (/^[A-Z]{3}$/.test(destination)) {
    return [destination];
  }

  // Search via Amadeus locations API
  try {
    const locations = await searchLocations(destination);
    if (locations.length === 0) return [];

    // Return up to 5 airport/city codes
    return locations
      .slice(0, 5)
      .map((loc) => loc.iataCode)
      .filter(Boolean);
  } catch {
    return [];
  }
}
