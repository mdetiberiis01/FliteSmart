import { searchLocations } from '../amadeus/locations';
import { resolveRegionAirports, REGIONS } from './region-map';

// One primary airport per major global region, ordered for diversity.
// The orchestrator caps at 6, so the first 6 here span 6 different parts of the world.
const ANYWHERE_AIRPORTS = [
  'LHR',  // Europe       — London
  'NRT',  // East Asia    — Tokyo
  'BKK',  // SE Asia      — Bangkok
  'DXB',  // Middle East  — Dubai
  'JNB',  // Africa       — Johannesburg
  'GRU',  // S. America   — São Paulo
  'SYD',  // Oceania      — Sydney
  'DEL',  // South Asia   — New Delhi
  'MBJ',  // Caribbean    — Montego Bay
  'ICN',  // East Asia    — Seoul
  'CDG',  // Europe       — Paris
  'MNL',  // SE Asia      — Manila
  'CAI',  // Africa       — Cairo
  'SCL',  // S. America   — Santiago
  'AKL',  // Oceania      — Auckland
  'IST',  // Middle East  — Istanbul
  'SIN',  // SE Asia      — Singapore
  'FCO',  // Europe       — Rome
  'BOG',  // S. America   — Bogotá
  'NBO',  // Africa       — Nairobi
];

// Fallback lookup for popular cities — used when Amadeus is not configured
// prettier-ignore
const CITY_TO_IATA: Record<string, string[]> = {
  'tokyo': ['NRT', 'HND'],        'osaka': ['KIX'],
  'bali': ['DPS'],                'jakarta': ['CGK'],
  'paris': ['CDG', 'ORY'],        'london': ['LHR', 'LGW'],
  'new york': ['JFK', 'EWR'],     'los angeles': ['LAX'],
  'barcelona': ['BCN'],           'madrid': ['MAD'],
  'phuket': ['HKT'],              'bangkok': ['BKK', 'DMK'],
  'dubai': ['DXB'],               'abu dhabi': ['AUH'],
  'seoul': ['ICN'],               'singapore': ['SIN'],
  'rome': ['FCO'],                'milan': ['MXP', 'LIN'],
  'amsterdam': ['AMS'],           'frankfurt': ['FRA'],
  'mexico city': ['MEX'],         'cancun': ['CUN'],
  'são paulo': ['GRU'],           'rio de janeiro': ['GIG'],
  'sydney': ['SYD'],              'melbourne': ['MEL'],
  'istanbul': ['IST'],            'athens': ['ATH'],
  'lisbon': ['LIS'],              'prague': ['PRG'],
  'vienna': ['VIE'],              'zurich': ['ZRH'],
  'kuala lumpur': ['KUL'],        'manila': ['MNL'],
  'johannesburg': ['JNB'],        'cape town': ['CPT'],
  'toronto': ['YYZ'],             'vancouver': ['YVR'],
  'chicago': ['ORD', 'MDW'],      'miami': ['MIA'],
  'san francisco': ['SFO'],       'seattle': ['SEA'],
  'lima': ['LIM'],                'santiago': ['SCL'],
  'buenos aires': ['EZE'],        'bogota': ['BOG'],
  'new delhi': ['DEL'],           'mumbai': ['BOM'],
  'cairo': ['CAI'],               'nairobi': ['NBO'],
  'auckland': ['AKL'],            'honolulu': ['HNL'],
  'denver': ['DEN'],              'dallas': ['DFW'],
  // US domestic — extended
  'atlanta': ['ATL'],             'boston': ['BOS'],
  'las vegas': ['LAS'],           'phoenix': ['PHX'],
  'washington': ['DCA', 'IAD'],   'washington dc': ['DCA', 'IAD'],
  'minneapolis': ['MSP'],         'detroit': ['DTW'],
  'philadelphia': ['PHL'],        'orlando': ['MCO'],
  'nashville': ['BNA'],           'charlotte': ['CLT'],
  'austin': ['AUS'],              'portland': ['PDX'],
  'salt lake city': ['SLC'],      'san diego': ['SAN'],
  'tampa': ['TPA'],               'pittsburgh': ['PIT'],
  'raleigh': ['RDU'],             'kansas city': ['MCI'],
  'st louis': ['STL'],            'columbus': ['CMH'],
  'indianapolis': ['IND'],        'cincinnati': ['CVG'],
  'cleveland': ['CLE'],           'milwaukee': ['MKE'],
  'new orleans': ['MSY'],         'memphis': ['MEM'],
  'oklahoma city': ['OKC'],       'albuquerque': ['ABQ'],
  'richmond': ['RIC'],            'jacksonville': ['JAX'],
  'sacramento': ['SMF'],          'san jose': ['SJC'],
  'oakland': ['OAK'],             'burlington': ['BTV'],
  'hartford': ['BDL'],            'buffalo': ['BUF'],
  'anchorage': ['ANC'],           'juneau': ['JNU'],
  'boise': ['BOI'],               'tucson': ['TUS'],
  'el paso': ['ELP'],             'little rock': ['LIT'],
  'louisville': ['SDF'],          'omaha': ['OMA'],
  'providence': ['PVD'],          'albany': ['ALB'],
};

export async function resolveDestination(destination: string): Promise<string[]> {
  const lower = destination.toLowerCase().trim();

  // "anywhere" → globally diverse set, one per major region
  if (lower === 'anywhere') return ANYWHERE_AIRPORTS;

  // Check if it's a region
  const regionAirports = resolveRegionAirports(destination);
  if (regionAirports) return regionAirports;

  // Check if it looks like an IATA code (3 uppercase letters)
  if (/^[A-Z]{3}$/.test(destination)) {
    return [destination];
  }

  // Local city lookup — works without any API key
  if (CITY_TO_IATA[lower]) {
    return CITY_TO_IATA[lower];
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
