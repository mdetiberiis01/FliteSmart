export interface RegionInfo {
  airports: string[];
  countries: string[];
  label: string;
}

export const REGIONS: Record<string, RegionInfo> = {
  'southeast asia': {
    label: 'Southeast Asia',
    countries: ['TH', 'VN', 'ID', 'MY', 'SG', 'PH', 'KH', 'LA', 'MM', 'BN'],
    airports: ['BKK', 'SGN', 'CGK', 'KUL', 'SIN', 'MNL', 'HAN', 'DPS', 'REP', 'RGN'],
  },
  'east asia': {
    label: 'East Asia',
    countries: ['JP', 'KR', 'CN', 'TW', 'HK'],
    airports: ['NRT', 'HND', 'ICN', 'PEK', 'PVG', 'HKG', 'TPE'],
  },
  europe: {
    label: 'Europe',
    countries: ['GB', 'FR', 'DE', 'ES', 'IT', 'NL', 'PT', 'GR', 'CH', 'AT', 'BE', 'SE', 'NO', 'DK', 'PL', 'CZ', 'HU'],
    airports: ['LHR', 'CDG', 'FRA', 'MAD', 'FCO', 'AMS', 'LIS', 'ATH', 'ZRH', 'VIE', 'BRU', 'ARN', 'CPH'],
  },
  'western europe': {
    label: 'Western Europe',
    countries: ['GB', 'FR', 'DE', 'ES', 'IT', 'NL', 'PT', 'BE', 'CH', 'AT'],
    airports: ['LHR', 'CDG', 'FRA', 'MAD', 'FCO', 'AMS', 'LIS', 'BRU', 'ZRH', 'VIE'],
  },
  'latin america': {
    label: 'Latin America',
    countries: ['MX', 'CO', 'BR', 'AR', 'PE', 'CL', 'CR', 'PA'],
    airports: ['MEX', 'BOG', 'GRU', 'EZE', 'LIM', 'SCL', 'SJO', 'PTY'],
  },
  'south america': {
    label: 'South America',
    countries: ['BR', 'AR', 'PE', 'CL', 'CO', 'VE', 'EC', 'BO'],
    airports: ['GRU', 'EZE', 'LIM', 'SCL', 'BOG', 'CCS', 'UIO', 'VVI'],
  },
  'caribbean': {
    label: 'Caribbean',
    countries: ['CU', 'JM', 'DO', 'PR', 'BB', 'TT', 'LC', 'VC'],
    airports: ['HAV', 'KIN', 'SDQ', 'SJU', 'BGI', 'POS', 'SLU', 'SVD'],
  },
  'middle east': {
    label: 'Middle East',
    countries: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'JO', 'IL'],
    airports: ['DXB', 'RUH', 'DOH', 'KWI', 'BAH', 'MCT', 'AMM', 'TLV'],
  },
  africa: {
    label: 'Africa',
    countries: ['ZA', 'EG', 'NG', 'KE', 'MA', 'TZ', 'ET', 'GH'],
    airports: ['JNB', 'CAI', 'LOS', 'NBO', 'CMN', 'DAR', 'ADD', 'ACC'],
  },
  oceania: {
    label: 'Oceania',
    countries: ['AU', 'NZ', 'FJ', 'PG'],
    airports: ['SYD', 'MEL', 'AKL', 'NAN', 'POM'],
  },
  'south asia': {
    label: 'South Asia',
    countries: ['IN', 'PK', 'BD', 'LK', 'NP'],
    airports: ['DEL', 'BOM', 'MAA', 'KHI', 'DAC', 'CMB', 'KTM'],
  },
};

export function resolveRegionAirports(query: string): string[] | null {
  const normalized = query.toLowerCase().trim();

  // Direct match
  if (REGIONS[normalized]) {
    return REGIONS[normalized].airports;
  }

  // Partial match
  for (const [key, region] of Object.entries(REGIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return region.airports;
    }
  }

  return null;
}

export function getRegionLabel(query: string): string | null {
  const normalized = query.toLowerCase().trim();
  if (REGIONS[normalized]) return REGIONS[normalized].label;
  for (const [key, region] of Object.entries(REGIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return region.label;
    }
  }
  return null;
}
