import { AmadeusToken } from '@/types/amadeus';

interface TokenCache {
  token: string;
  expiresAt: number;
}

let moduleCache: TokenCache | null = null;

const BASE_URL = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
const CLIENT_ID = process.env.AMADEUS_CLIENT_ID || '';
const CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET || '';

export async function getAmadeusToken(): Promise<string> {
  const now = Date.now();

  // Check module-level cache (valid for 60s buffer before expiry)
  if (moduleCache && moduleCache.expiresAt > now + 60_000) {
    return moduleCache.token;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET must be set');
  }

  const response = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Amadeus auth failed: ${response.status} ${error}`);
  }

  const data: AmadeusToken = await response.json();

  moduleCache = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return moduleCache.token;
}

export async function amadeusGet<T>(
  path: string,
  params: Record<string, string>,
  retried = false
): Promise<T> {
  const token = await getAmadeusToken();
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401 && !retried) {
    moduleCache = null;
    return amadeusGet<T>(path, params, true);
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Amadeus ${path} failed: ${response.status} ${error}`);
  }

  return response.json();
}
