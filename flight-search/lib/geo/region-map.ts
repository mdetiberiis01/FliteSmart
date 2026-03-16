export interface RegionInfo {
  airports: string[];
  countries: string[];
  label: string;
}

export const REGIONS: Record<string, RegionInfo> = {
  'southeast asia': {
    label: 'Southeast Asia',
    countries: ['TH', 'VN', 'ID', 'MY', 'SG', 'PH', 'KH', 'LA', 'MM', 'BN'],
    airports: ['BKK', 'SIN', 'KUL', 'CGK', 'MNL', 'SGN', 'HAN', 'DPS', 'DAD', 'HKT', 'CNX', 'PEN', 'CEB', 'REP', 'PNH', 'RGN', 'VTE'],
  },
  'east asia': {
    label: 'East Asia',
    countries: ['JP', 'KR', 'CN', 'TW', 'HK', 'MO'],
    airports: ['NRT', 'HND', 'KIX', 'NGO', 'ICN', 'GMP', 'PVG', 'PEK', 'CAN', 'CTU', 'SZX', 'HKG', 'TPE', 'KHH', 'MFM'],
  },
  europe: {
    label: 'Europe',
    countries: ['GB', 'FR', 'DE', 'ES', 'IT', 'NL', 'PT', 'GR', 'CH', 'AT', 'BE', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'HU', 'IE', 'HR', 'RO', 'BG'],
    airports: ['LHR', 'CDG', 'FRA', 'MAD', 'FCO', 'AMS', 'BCN', 'MUC', 'LIS', 'ATH', 'MXP', 'ZRH', 'VIE', 'BRU', 'ARN', 'CPH', 'OSL', 'HEL', 'DUB', 'BER', 'WAW', 'PRG', 'BUD', 'OPO', 'NAP', 'EDI', 'NCE', 'BIO', 'LYS'],
  },
  'western europe': {
    label: 'Western Europe',
    countries: ['GB', 'FR', 'DE', 'ES', 'IT', 'NL', 'PT', 'BE', 'CH', 'AT', 'IE'],
    airports: ['LHR', 'CDG', 'FRA', 'MAD', 'FCO', 'AMS', 'BCN', 'MUC', 'LIS', 'MXP', 'ZRH', 'VIE', 'BRU', 'DUB', 'OPO', 'NAP'],
  },
  'eastern europe': {
    label: 'Eastern Europe',
    countries: ['PL', 'CZ', 'HU', 'RO', 'BG', 'SK', 'HR', 'RS', 'UA', 'GR'],
    airports: ['WAW', 'PRG', 'BUD', 'OTP', 'SOF', 'ZAG', 'BEG', 'KBP', 'ATH', 'SKG'],
  },
  'scandinavia': {
    label: 'Scandinavia',
    countries: ['SE', 'NO', 'DK', 'FI', 'IS'],
    airports: ['ARN', 'CPH', 'OSL', 'HEL', 'GOT', 'BGO', 'REK'],
  },
  'latin america': {
    label: 'Latin America',
    countries: ['MX', 'CO', 'BR', 'AR', 'PE', 'CL', 'CR', 'PA', 'EC', 'UY', 'PY', 'BO'],
    airports: ['MEX', 'CUN', 'BOG', 'MDE', 'GRU', 'GIG', 'EZE', 'COR', 'LIM', 'SCL', 'SJO', 'PTY', 'UIO', 'GYE', 'MVD', 'ASU', 'VVI', 'GDL', 'MTY'],
  },
  'south america': {
    label: 'South America',
    countries: ['BR', 'AR', 'PE', 'CL', 'CO', 'VE', 'EC', 'BO', 'UY', 'PY'],
    airports: ['GRU', 'GIG', 'EZE', 'COR', 'LIM', 'SCL', 'BOG', 'MDE', 'UIO', 'GYE', 'MVD', 'ASU', 'VVI', 'CCS', 'SSA', 'REC'],
  },
  'caribbean': {
    label: 'Caribbean',
    countries: ['CU', 'JM', 'DO', 'PR', 'BB', 'TT', 'LC', 'VC', 'AG', 'KN', 'GD', 'DM'],
    airports: ['MBJ', 'KIN', 'SDQ', 'PUJ', 'SJU', 'NAS', 'BGI', 'POS', 'ANU', 'SXM', 'CUR', 'AUA', 'HAV', 'SLU', 'GND', 'PTP', 'FDF'],
  },
  'middle east': {
    label: 'Middle East',
    countries: ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'JO', 'IL', 'LB', 'TR'],
    airports: ['DXB', 'AUH', 'DOH', 'RUH', 'JED', 'KWI', 'BAH', 'MCT', 'AMM', 'TLV', 'BEY', 'IST', 'SAW', 'ESB'],
  },
  africa: {
    label: 'Africa',
    countries: ['ZA', 'EG', 'NG', 'KE', 'MA', 'TZ', 'ET', 'GH', 'SN', 'CI', 'MU', 'UG', 'RW', 'ZM', 'ZW'],
    airports: ['JNB', 'CPT', 'CAI', 'LOS', 'ABV', 'NBO', 'MBA', 'CMN', 'RAK', 'DAR', 'ADD', 'ACC', 'ABJ', 'DKR', 'MRU', 'EBB', 'KGL', 'LUN', 'HRE'],
  },
  oceania: {
    label: 'Oceania',
    countries: ['AU', 'NZ', 'FJ', 'PG', 'WS', 'TO', 'VU'],
    airports: ['SYD', 'MEL', 'BNE', 'PER', 'ADL', 'OOL', 'AKL', 'WLG', 'CHC', 'NAN', 'POM', 'APW'],
  },
  'south asia': {
    label: 'South Asia',
    countries: ['IN', 'PK', 'BD', 'LK', 'NP', 'AF', 'MV'],
    airports: ['DEL', 'BOM', 'BLR', 'MAA', 'HYD', 'CCU', 'AMD', 'GOI', 'COK', 'ISB', 'LHE', 'KHI', 'DAC', 'CMB', 'KTM', 'MLE'],
  },
  'central asia': {
    label: 'Central Asia',
    countries: ['KZ', 'UZ', 'KG', 'TJ', 'TM'],
    airports: ['ALA', 'NQZ', 'TAS', 'OSS', 'FRU', 'DYU', 'ASB'],
  },
  'north africa': {
    label: 'North Africa',
    countries: ['EG', 'MA', 'TN', 'DZ', 'LY'],
    airports: ['CAI', 'HRG', 'SSH', 'CMN', 'RAK', 'TUN', 'ALG', 'ORN'],
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
