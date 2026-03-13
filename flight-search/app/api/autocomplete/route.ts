import { NextRequest, NextResponse } from 'next/server';
import { searchLocations } from '@/lib/amadeus/locations';
import { REGIONS } from '@/lib/geo/region-map';

export interface AutocompleteResult {
  iataCode: string;
  name: string;
  cityName: string;
  countryName: string;
  detailedName: string;
  subType: string;
  category: 'airport' | 'city' | 'region';
  score: number;
}

// Static fallback — used when Amadeus API keys aren't configured
const STATIC_AIRPORTS: AutocompleteResult[] = [
  { iataCode: 'JFK', name: 'John F Kennedy Intl', cityName: 'New York', countryName: 'United States', detailedName: 'John F Kennedy Intl', subType: 'AIRPORT', category: 'airport', score: 100 },
  { iataCode: 'LGA', name: 'LaGuardia', cityName: 'New York', countryName: 'United States', detailedName: 'LaGuardia', subType: 'AIRPORT', category: 'airport', score: 90 },
  { iataCode: 'EWR', name: 'Newark Liberty Intl', cityName: 'Newark', countryName: 'United States', detailedName: 'Newark Liberty Intl', subType: 'AIRPORT', category: 'airport', score: 85 },
  { iataCode: 'LAX', name: 'Los Angeles Intl', cityName: 'Los Angeles', countryName: 'United States', detailedName: 'Los Angeles Intl', subType: 'AIRPORT', category: 'airport', score: 100 },
  { iataCode: 'SFO', name: 'San Francisco Intl', cityName: 'San Francisco', countryName: 'United States', detailedName: 'San Francisco Intl', subType: 'AIRPORT', category: 'airport', score: 95 },
  { iataCode: 'ORD', name: "O'Hare Intl", cityName: 'Chicago', countryName: 'United States', detailedName: "O'Hare Intl", subType: 'AIRPORT', category: 'airport', score: 95 },
  { iataCode: 'MDW', name: 'Midway Intl', cityName: 'Chicago', countryName: 'United States', detailedName: 'Midway Intl', subType: 'AIRPORT', category: 'airport', score: 80 },
  { iataCode: 'MIA', name: 'Miami Intl', cityName: 'Miami', countryName: 'United States', detailedName: 'Miami Intl', subType: 'AIRPORT', category: 'airport', score: 90 },
  { iataCode: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', cityName: 'Atlanta', countryName: 'United States', detailedName: 'Hartsfield-Jackson Atlanta Intl', subType: 'AIRPORT', category: 'airport', score: 95 },
  { iataCode: 'BOS', name: 'Logan Intl', cityName: 'Boston', countryName: 'United States', detailedName: 'Logan Intl', subType: 'AIRPORT', category: 'airport', score: 90 },
  { iataCode: 'SEA', name: 'Seattle-Tacoma Intl', cityName: 'Seattle', countryName: 'United States', detailedName: 'Seattle-Tacoma Intl', subType: 'AIRPORT', category: 'airport', score: 88 },
  { iataCode: 'DFW', name: 'Dallas/Fort Worth Intl', cityName: 'Dallas', countryName: 'United States', detailedName: 'Dallas/Fort Worth Intl', subType: 'AIRPORT', category: 'airport', score: 92 },
  { iataCode: 'DEN', name: 'Denver Intl', cityName: 'Denver', countryName: 'United States', detailedName: 'Denver Intl', subType: 'AIRPORT', category: 'airport', score: 88 },
  { iataCode: 'LAS', name: 'Harry Reid Intl', cityName: 'Las Vegas', countryName: 'United States', detailedName: 'Harry Reid Intl', subType: 'AIRPORT', category: 'airport', score: 88 },
  { iataCode: 'PHX', name: 'Phoenix Sky Harbor Intl', cityName: 'Phoenix', countryName: 'United States', detailedName: 'Phoenix Sky Harbor Intl', subType: 'AIRPORT', category: 'airport', score: 85 },
  { iataCode: 'IAD', name: 'Dulles Intl', cityName: 'Washington', countryName: 'United States', detailedName: 'Dulles Intl', subType: 'AIRPORT', category: 'airport', score: 85 },
  { iataCode: 'DCA', name: 'Reagan National', cityName: 'Washington', countryName: 'United States', detailedName: 'Reagan National', subType: 'AIRPORT', category: 'airport', score: 82 },
  { iataCode: 'HNL', name: 'Daniel K. Inouye Intl', cityName: 'Honolulu', countryName: 'United States', detailedName: 'Daniel K. Inouye Intl', subType: 'AIRPORT', category: 'airport', score: 82 },
  { iataCode: 'MSP', name: 'Minneapolis-Saint Paul Intl', cityName: 'Minneapolis', countryName: 'United States', detailedName: 'Minneapolis-Saint Paul Intl', subType: 'AIRPORT', category: 'airport', score: 82 },
  { iataCode: 'DTW', name: 'Detroit Metropolitan Wayne County', cityName: 'Detroit', countryName: 'United States', detailedName: 'Detroit Metropolitan Wayne County', subType: 'AIRPORT', category: 'airport', score: 80 },
  { iataCode: 'LHR', name: 'Heathrow', cityName: 'London', countryName: 'United Kingdom', detailedName: 'Heathrow', subType: 'AIRPORT', category: 'airport', score: 100 },
  { iataCode: 'LGW', name: 'Gatwick', cityName: 'London', countryName: 'United Kingdom', detailedName: 'Gatwick', subType: 'AIRPORT', category: 'airport', score: 90 },
  { iataCode: 'STN', name: 'Stansted', cityName: 'London', countryName: 'United Kingdom', detailedName: 'Stansted', subType: 'AIRPORT', category: 'airport', score: 85 },
  { iataCode: 'CDG', name: 'Charles de Gaulle', cityName: 'Paris', countryName: 'France', detailedName: 'Charles de Gaulle', subType: 'AIRPORT', category: 'airport', score: 100 },
  { iataCode: 'ORY', name: 'Orly', cityName: 'Paris', countryName: 'France', detailedName: 'Orly', subType: 'AIRPORT', category: 'airport', score: 85 },
  { iataCode: 'FRA', name: 'Frankfurt Intl', cityName: 'Frankfurt', countryName: 'Germany', detailedName: 'Frankfurt Intl', subType: 'AIRPORT', category: 'airport', score: 100 },
  { iataCode: 'MUC', name: 'Munich Intl', cityName: 'Munich', countryName: 'Germany', detailedName: 'Munich Intl', subType: 'AIRPORT', category: 'airport', score: 90 },
  { iataCode: 'BER', name: 'Berlin Brandenburg', cityName: 'Berlin', countryName: 'Germany', detailedName: 'Berlin Brandenburg', subType: 'AIRPORT', category: 'airport', score: 85 },
  { iataCode: 'AMS', name: 'Amsterdam Schiphol', cityName: 'Amsterdam', countryName: 'Netherlands', detailedName: 'Amsterdam Schiphol', subType: 'AIRPORT', category: 'airport', score: 100 },
  { iataCode: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', cityName: 'Madrid', countryName: 'Spain', detailedName: 'Adolfo Suárez Madrid-Barajas', subType: 'AIRPORT', category: 'airport', score: 95 },
  { iataCode: 'BCN', name: 'Barcelona El Prat', cityName: 'Barcelona', countryName: 'Spain', detailedName: 'Barcelona El Prat', subType: 'AIRPORT', category: 'airport', score: 92 },
  { iataCode: 'FCO', name: 'Leonardo da Vinci Intl', cityName: 'Rome', countryName: 'Italy', detailedName: 'Leonardo da Vinci Intl', subType: 'AIRPORT', category: 'airport', score: 95 },
  { iataCode: 'MXP', name: 'Malpensa Intl', cityName: 'Milan', countryName: 'Italy', detailedName: 'Malpensa Intl', subType: 'AIRPORT', category: 'airport', score: 90 },
  { iataCode: 'ZRH', name: 'Zurich', cityName: 'Zurich', countryName: 'Switzerland', detailedName: 'Zurich', subType: 'AIRPORT', category: 'airport', score: 90 },
  { iataCode: 'VIE', name: 'Vienna Intl', cityName: 'Vienna', countryName: 'Austria', detailedName: 'Vienna Intl', subType: 'AIRPORT', category: 'airport', score: 88 },
  { iataCode: 'ATH', name: 'Athens Intl', cityName: 'Athens', countryName: 'Greece', detailedName: 'Athens Intl', subType: 'AIRPORT', category: 'airport', score: 88 },
  { iataCode: 'LIS', name: 'Lisbon Portela', cityName: 'Lisbon', countryName: 'Portugal', detailedName: 'Lisbon Portela', subType: 'AIRPORT', category: 'airport', score: 88 },
  { iataCode: 'CPH', name: 'Copenhagen', cityName: 'Copenhagen', countryName: 'Denmark', detailedName: 'Copenhagen', subType: 'AIRPORT', category: 'airport', score: 85 },
  { iataCode: 'ARN', name: 'Stockholm Arlanda', cityName: 'Stockholm', countryName: 'Sweden', detailedName: 'Stockholm Arlanda', subType: 'AIRPORT', category: 'airport', score: 85 },
  { iataCode: 'OSL', name: 'Oslo Gardermoen', cityName: 'Oslo', countryName: 'Norway', detailedName: 'Oslo Gardermoen', subType: 'AIRPORT', category: 'airport', score: 82 },
  { iataCode: 'HEL', name: 'Helsinki-Vantaa', cityName: 'Helsinki', countryName: 'Finland', detailedName: 'Helsinki-Vantaa', subType: 'AIRPORT', category: 'airport', score: 82 },
  { iataCode: 'DXB', name: 'Dubai Intl', cityName: 'Dubai', countryName: 'United Arab Emirates', detailedName: 'Dubai Intl', subType: 'AIRPORT', category: 'airport', score: 100 },
  { iataCode: 'DOH', name: 'Hamad Intl', cityName: 'Doha', countryName: 'Qatar', detailedName: 'Hamad Intl', subType: 'AIRPORT', category: 'airport', score: 95 },
  { iataCode: 'AUH', name: 'Abu Dhabi Intl', cityName: 'Abu Dhabi', countryName: 'United Arab Emirates', detailedName: 'Abu Dhabi Intl', subType: 'AIRPORT', category: 'airport', score: 88 },
  { iataCode: 'TLV', name: 'Ben Gurion Intl', cityName: 'Tel Aviv', countryName: 'Israel', detailedName: 'Ben Gurion Intl', subType: 'AIRPORT', category: 'airport', score: 88 },
  { iataCode: 'NRT', name: 'Narita Intl', cityName: 'Tokyo', countryName: 'Japan', detailedName: 'Narita Intl', subType: 'AIRPORT', category: 'airport', score: 100 },
  { iataCode: 'HND', name: 'Haneda', cityName: 'Tokyo', countryName: 'Japan', detailedName: 'Haneda', subType: 'AIRPORT', category: 'airport', score: 98 },
  { iataCode: 'KIX', name: 'Kansai Intl', cityName: 'Osaka', countryName: 'Japan', detailedName: 'Kansai Intl', subType: 'AIRPORT', category: 'airport', score: 90 },
  { iataCode: 'ICN', name: 'Incheon Intl', cityName: 'Seoul', countryName: 'South Korea', detailedName: 'Incheon Intl', subType: 'AIRPORT', category: 'airport', score: 100 },
  { iataCode: 'PEK', name: 'Beijing Capital Intl', cityName: 'Beijing', countryName: 'China', detailedName: 'Beijing Capital Intl', subType: 'AIRPORT', category: 'airport', score: 98 },
  { iataCode: 'PVG', name: 'Shanghai Pudong Intl', cityName: 'Shanghai', countryName: 'China', detailedName: 'Shanghai Pudong Intl', subType: 'AIRPORT', category: 'airport', score: 98 },
  { iataCode: 'HKG', name: 'Hong Kong Intl', cityName: 'Hong Kong', countryName: 'Hong Kong', detailedName: 'Hong Kong Intl', subType: 'AIRPORT', category: 'airport', score: 100 },
  { iataCode: 'TPE', name: 'Taiwan Taoyuan Intl', cityName: 'Taipei', countryName: 'Taiwan', detailedName: 'Taiwan Taoyuan Intl', subType: 'AIRPORT', category: 'airport', score: 95 },
  { iataCode: 'SIN', name: 'Changi', cityName: 'Singapore', countryName: 'Singapore', detailedName: 'Changi', subType: 'AIRPORT', category: 'airport', score: 100 },
  { iataCode: 'BKK', name: 'Suvarnabhumi', cityName: 'Bangkok', countryName: 'Thailand', detailedName: 'Suvarnabhumi', subType: 'AIRPORT', category: 'airport', score: 100 },
  { iataCode: 'DMK', name: 'Don Mueang Intl', cityName: 'Bangkok', countryName: 'Thailand', detailedName: 'Don Mueang Intl', subType: 'AIRPORT', category: 'airport', score: 85 },
  { iataCode: 'KUL', name: 'Kuala Lumpur Intl', cityName: 'Kuala Lumpur', countryName: 'Malaysia', detailedName: 'Kuala Lumpur Intl', subType: 'AIRPORT', category: 'airport', score: 95 },
  { iataCode: 'CGK', name: 'Soekarno-Hatta Intl', cityName: 'Jakarta', countryName: 'Indonesia', detailedName: 'Soekarno-Hatta Intl', subType: 'AIRPORT', category: 'airport', score: 95 },
  { iataCode: 'DPS', name: 'Ngurah Rai Intl', cityName: 'Bali', countryName: 'Indonesia', detailedName: 'Ngurah Rai Intl', subType: 'AIRPORT', category: 'airport', score: 92 },
  { iataCode: 'MNL', name: 'Ninoy Aquino Intl', cityName: 'Manila', countryName: 'Philippines', detailedName: 'Ninoy Aquino Intl', subType: 'AIRPORT', category: 'airport', score: 90 },
  { iataCode: 'SGN', name: 'Tan Son Nhat Intl', cityName: 'Ho Chi Minh City', countryName: 'Vietnam', detailedName: 'Tan Son Nhat Intl', subType: 'AIRPORT', category: 'airport', score: 90 },
  { iataCode: 'HAN', name: 'Noi Bai Intl', cityName: 'Hanoi', countryName: 'Vietnam', detailedName: 'Noi Bai Intl', subType: 'AIRPORT', category: 'airport', score: 88 },
  { iataCode: 'SYD', name: 'Sydney Kingsford Smith', cityName: 'Sydney', countryName: 'Australia', detailedName: 'Sydney Kingsford Smith', subType: 'AIRPORT', category: 'airport', score: 100 },
  { iataCode: 'MEL', name: 'Melbourne', cityName: 'Melbourne', countryName: 'Australia', detailedName: 'Melbourne', subType: 'AIRPORT', category: 'airport', score: 95 },
  { iataCode: 'BNE', name: 'Brisbane', cityName: 'Brisbane', countryName: 'Australia', detailedName: 'Brisbane', subType: 'AIRPORT', category: 'airport', score: 88 },
  { iataCode: 'AKL', name: 'Auckland Intl', cityName: 'Auckland', countryName: 'New Zealand', detailedName: 'Auckland Intl', subType: 'AIRPORT', category: 'airport', score: 92 },
  { iataCode: 'DEL', name: 'Indira Gandhi Intl', cityName: 'New Delhi', countryName: 'India', detailedName: 'Indira Gandhi Intl', subType: 'AIRPORT', category: 'airport', score: 98 },
  { iataCode: 'BOM', name: 'Chhatrapati Shivaji Intl', cityName: 'Mumbai', countryName: 'India', detailedName: 'Chhatrapati Shivaji Intl', subType: 'AIRPORT', category: 'airport', score: 95 },
  { iataCode: 'GRU', name: 'São Paulo Guarulhos Intl', cityName: 'São Paulo', countryName: 'Brazil', detailedName: 'São Paulo Guarulhos Intl', subType: 'AIRPORT', category: 'airport', score: 98 },
  { iataCode: 'GIG', name: 'Rio de Janeiro Galeão Intl', cityName: 'Rio de Janeiro', countryName: 'Brazil', detailedName: 'Rio de Janeiro Galeão Intl', subType: 'AIRPORT', category: 'airport', score: 92 },
  { iataCode: 'EZE', name: 'Ministro Pistarini Intl', cityName: 'Buenos Aires', countryName: 'Argentina', detailedName: 'Ministro Pistarini Intl', subType: 'AIRPORT', category: 'airport', score: 92 },
  { iataCode: 'BOG', name: 'El Dorado Intl', cityName: 'Bogotá', countryName: 'Colombia', detailedName: 'El Dorado Intl', subType: 'AIRPORT', category: 'airport', score: 90 },
  { iataCode: 'LIM', name: 'Jorge Chávez Intl', cityName: 'Lima', countryName: 'Peru', detailedName: 'Jorge Chávez Intl', subType: 'AIRPORT', category: 'airport', score: 88 },
  { iataCode: 'SCL', name: 'Arturo Merino Benítez Intl', cityName: 'Santiago', countryName: 'Chile', detailedName: 'Arturo Merino Benítez Intl', subType: 'AIRPORT', category: 'airport', score: 88 },
  { iataCode: 'MEX', name: 'Benito Juárez Intl', cityName: 'Mexico City', countryName: 'Mexico', detailedName: 'Benito Juárez Intl', subType: 'AIRPORT', category: 'airport', score: 95 },
  { iataCode: 'CUN', name: 'Cancún Intl', cityName: 'Cancún', countryName: 'Mexico', detailedName: 'Cancún Intl', subType: 'AIRPORT', category: 'airport', score: 90 },
  { iataCode: 'YYZ', name: 'Toronto Pearson Intl', cityName: 'Toronto', countryName: 'Canada', detailedName: 'Toronto Pearson Intl', subType: 'AIRPORT', category: 'airport', score: 98 },
  { iataCode: 'YVR', name: 'Vancouver Intl', cityName: 'Vancouver', countryName: 'Canada', detailedName: 'Vancouver Intl', subType: 'AIRPORT', category: 'airport', score: 92 },
  { iataCode: 'YUL', name: 'Montreal-Trudeau Intl', cityName: 'Montreal', countryName: 'Canada', detailedName: 'Montreal-Trudeau Intl', subType: 'AIRPORT', category: 'airport', score: 88 },
  { iataCode: 'JNB', name: 'O.R. Tambo Intl', cityName: 'Johannesburg', countryName: 'South Africa', detailedName: 'O.R. Tambo Intl', subType: 'AIRPORT', category: 'airport', score: 95 },
  { iataCode: 'CPT', name: 'Cape Town Intl', cityName: 'Cape Town', countryName: 'South Africa', detailedName: 'Cape Town Intl', subType: 'AIRPORT', category: 'airport', score: 90 },
  { iataCode: 'CAI', name: 'Cairo Intl', cityName: 'Cairo', countryName: 'Egypt', detailedName: 'Cairo Intl', subType: 'AIRPORT', category: 'airport', score: 90 },
  { iataCode: 'NBO', name: 'Jomo Kenyatta Intl', cityName: 'Nairobi', countryName: 'Kenya', detailedName: 'Jomo Kenyatta Intl', subType: 'AIRPORT', category: 'airport', score: 88 },
  { iataCode: 'CMN', name: 'Mohammed V Intl', cityName: 'Casablanca', countryName: 'Morocco', detailedName: 'Mohammed V Intl', subType: 'AIRPORT', category: 'airport', score: 85 },
];

function searchStaticAirports(q: string): AutocompleteResult[] {
  const normalized = q.toLowerCase().trim();
  return STATIC_AIRPORTS.filter(
    (a) =>
      a.iataCode.toLowerCase().includes(normalized) ||
      a.name.toLowerCase().includes(normalized) ||
      a.cityName.toLowerCase().includes(normalized) ||
      a.countryName.toLowerCase().includes(normalized)
  ).sort((a, b) => b.score - a.score).slice(0, 8);
}

function matchingRegions(q: string): AutocompleteResult[] {
  const normalized = q.toLowerCase().trim();
  const matches: AutocompleteResult[] = [];
  for (const [key, region] of Object.entries(REGIONS)) {
    if (key.includes(normalized) || region.label.toLowerCase().includes(normalized)) {
      matches.push({
        iataCode: '',
        name: region.label,
        cityName: '',
        countryName: '',
        detailedName: region.label,
        subType: 'REGION',
        category: 'region',
        score: 100,
      });
    }
  }
  return matches;
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  const type = request.nextUrl.searchParams.get('type') || 'origin';

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const results: AutocompleteResult[] = [];

  // For destination queries, prepend matching regions
  if (type === 'destination') {
    results.push(...matchingRegions(q));
  }

  // Try Amadeus first
  let amadeusResults: AutocompleteResult[] = [];
  try {
    const locations = await searchLocations(q);
    amadeusResults = locations.map((loc) => ({
      iataCode: loc.iataCode,
      name: loc.name,
      cityName: loc.address?.cityName || '',
      countryName: loc.address?.countryName || '',
      detailedName: loc.detailedName,
      subType: loc.subType,
      category: (loc.subType === 'AIRPORT' ? 'airport' : 'city') as 'airport' | 'city',
      score: loc.analytics?.travelers?.score || 0,
    }));
  } catch {
    // Amadeus unavailable — fall through to static data
  }

  // Use Amadeus results if available, otherwise fall back to static list
  if (amadeusResults.length > 0) {
    results.push(...amadeusResults);
  } else {
    results.push(...searchStaticAirports(q));
  }

  return NextResponse.json(results);
}
