export interface RegionInfo {
  airports: string[];
  countries: string[];
  label: string;
}

export const REGIONS: Record<string, RegionInfo> = {
  // Airports are ordered so the first 6 span different countries for search diversity.
  'southeast asia': {
    label: 'Southeast Asia',
    countries: ['TH', 'VN', 'ID', 'MY', 'SG', 'PH', 'KH', 'LA', 'MM', 'BN'],
    // TH, SG, MY, ID, PH, VN — one per country, then secondaries
    airports: ['BKK', 'SIN', 'KUL', 'CGK', 'MNL', 'SGN', 'DPS', 'HAN', 'DAD', 'HKT', 'CNX', 'PEN', 'CEB', 'REP', 'PNH', 'RGN', 'VTE'],
  },
  'east asia': {
    label: 'East Asia',
    countries: ['JP', 'KR', 'CN', 'TW', 'HK', 'MO'],
    // JP, KR, CN (Shanghai), HK, TW, CN (Beijing) — one per country/territory first
    airports: ['NRT', 'ICN', 'PVG', 'HKG', 'TPE', 'PEK', 'HND', 'KIX', 'GMP', 'NGO', 'CAN', 'CTU', 'SZX', 'KHH', 'MFM'],
  },
  europe: {
    label: 'Europe',
    countries: ['GB', 'FR', 'DE', 'ES', 'IT', 'NL', 'PT', 'GR', 'CH', 'AT', 'BE', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'HU', 'IE', 'HR', 'RO', 'BG'],
    // UK, FR, DE, ES, IT, NL — already diverse
    airports: ['LHR', 'CDG', 'FRA', 'MAD', 'FCO', 'AMS', 'LIS', 'ATH', 'VIE', 'DUB', 'ARN', 'CPH', 'BCN', 'MUC', 'ZRH', 'BRU', 'OSL', 'HEL', 'BER', 'WAW', 'PRG', 'BUD', 'OPO', 'NAP', 'EDI', 'NCE', 'BIO', 'LYS', 'MXP'],
  },
  'western europe': {
    label: 'Western Europe',
    countries: ['GB', 'FR', 'DE', 'ES', 'IT', 'NL', 'PT', 'BE', 'CH', 'AT', 'IE'],
    // UK, FR, DE, ES, IT, NL — all different
    airports: ['LHR', 'CDG', 'FRA', 'MAD', 'FCO', 'AMS', 'LIS', 'VIE', 'DUB', 'BRU', 'BCN', 'MUC', 'ZRH', 'OPO', 'NAP', 'MXP'],
  },
  'eastern europe': {
    label: 'Eastern Europe',
    countries: ['PL', 'CZ', 'HU', 'RO', 'BG', 'SK', 'HR', 'RS', 'UA', 'GR'],
    // PL, CZ, HU, RO, BG, HR — all different
    airports: ['WAW', 'PRG', 'BUD', 'OTP', 'SOF', 'ZAG', 'BEG', 'KBP', 'ATH', 'SKG'],
  },
  'scandinavia': {
    label: 'Scandinavia',
    countries: ['SE', 'NO', 'DK', 'FI', 'IS'],
    // SE, DK, NO, FI, IS — all different
    airports: ['ARN', 'CPH', 'OSL', 'HEL', 'REK', 'GOT', 'BGO'],
  },
  'latin america': {
    label: 'Latin America',
    countries: ['MX', 'CO', 'BR', 'AR', 'PE', 'CL', 'CR', 'PA', 'EC', 'UY', 'PY', 'BO'],
    // MX, CO, BR, AR, PE, CL — one per country
    airports: ['MEX', 'BOG', 'GRU', 'EZE', 'LIM', 'SCL', 'SJO', 'PTY', 'UIO', 'MVD', 'CUN', 'MDE', 'GIG', 'GYE', 'ASU', 'VVI', 'GDL', 'MTY', 'COR'],
  },
  'south america': {
    label: 'South America',
    countries: ['BR', 'AR', 'PE', 'CL', 'CO', 'VE', 'EC', 'BO', 'UY', 'PY'],
    // BR, AR, PE, CO, CL, EC — one per country
    airports: ['GRU', 'EZE', 'LIM', 'BOG', 'SCL', 'UIO', 'MVD', 'CCS', 'ASU', 'VVI', 'GIG', 'MDE', 'GYE', 'COR', 'SSA', 'REC'],
  },
  'caribbean': {
    label: 'Caribbean',
    countries: ['CU', 'JM', 'DO', 'PR', 'BB', 'TT', 'LC', 'VC', 'AG', 'KN', 'GD', 'DM'],
    // JM, DO, PR, BS, CU, BB — one per island/territory
    airports: ['MBJ', 'SDQ', 'SJU', 'NAS', 'HAV', 'BGI', 'AUA', 'POS', 'PUJ', 'SXM', 'CUR', 'ANU', 'SLU', 'GND', 'PTP', 'FDF', 'KIN'],
  },
  'middle east': {
    label: 'Middle East',
    countries: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'JO', 'IL', 'LB', 'TR'],
    // AE, QA, TR, SA, IL, OM — one per country
    airports: ['DXB', 'DOH', 'IST', 'RUH', 'TLV', 'MCT', 'AMM', 'KWI', 'AUH', 'BAH', 'BEY', 'JED', 'SAW', 'ESB'],
  },
  africa: {
    label: 'Africa',
    countries: ['ZA', 'EG', 'NG', 'KE', 'MA', 'TZ', 'ET', 'GH', 'SN', 'CI', 'MU', 'UG', 'RW', 'ZM', 'ZW'],
    // ZA, EG, KE, NG, ET, MA — one per country
    airports: ['JNB', 'CAI', 'NBO', 'LOS', 'ADD', 'CMN', 'ACC', 'DKR', 'DAR', 'MRU', 'EBB', 'KGL', 'CPT', 'ABV', 'RAK', 'ABJ', 'LUN', 'HRE'],
  },
  oceania: {
    label: 'Oceania',
    countries: ['AU', 'NZ', 'FJ', 'PG', 'WS', 'TO', 'VU'],
    // AU, NZ, FJ, PG — one per country
    airports: ['SYD', 'AKL', 'NAN', 'POM', 'MEL', 'CHC', 'BNE', 'PER', 'ADL', 'OOL', 'WLG', 'APW'],
  },
  'south asia': {
    label: 'South Asia',
    countries: ['IN', 'PK', 'BD', 'LK', 'NP', 'AF', 'MV'],
    // IN, LK, PK, NP, MV, BD — one per country
    airports: ['DEL', 'CMB', 'ISB', 'KTM', 'MLE', 'DAC', 'BOM', 'BLR', 'MAA', 'HYD', 'CCU', 'AMD', 'GOI', 'COK', 'LHE', 'KHI'],
  },
  'central asia': {
    label: 'Central Asia',
    countries: ['KZ', 'UZ', 'KG', 'TJ', 'TM'],
    // UZ, KZ, KG, TJ, TM — one per country
    airports: ['TAS', 'ALA', 'FRU', 'DYU', 'ASB', 'NQZ', 'OSS'],
  },
  'north africa': {
    label: 'North Africa',
    countries: ['EG', 'MA', 'TN', 'DZ', 'LY'],
    // EG, MA, TN, DZ — one per country
    airports: ['CAI', 'CMN', 'TUN', 'ALG', 'HRG', 'RAK', 'SSH', 'ORN'],
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
