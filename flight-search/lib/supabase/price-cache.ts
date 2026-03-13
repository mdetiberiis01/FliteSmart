import { supabaseAdmin } from './client';
import { PricePoint } from '@/types/search';

export async function getCachedPriceHistory(
  origin: string,
  destination: string
): Promise<{ pricePoints: PricePoint[]; hasEnoughData: boolean }> {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  const cutoff = `${twelveMonthsAgo.getFullYear()}-${String(twelveMonthsAgo.getMonth() + 1).padStart(2, '0')}`;

  const { data, error } = await supabaseAdmin
    .from('price_snapshots')
    .select('travel_month, min_price')
    .eq('origin', origin)
    .eq('destination', destination)
    .gte('travel_month', cutoff)
    .order('travel_month', { ascending: true });

  if (error || !data) return { pricePoints: [], hasEnoughData: false };

  // Group by month, pick lowest price
  const byMonth = new Map<string, number>();
  for (const row of data) {
    const existing = byMonth.get(row.travel_month);
    if (!existing || row.min_price < existing) {
      byMonth.set(row.travel_month, Number(row.min_price));
    }
  }

  const pricePoints: PricePoint[] = Array.from(byMonth.entries()).map(([month, price]) => ({
    month,
    price,
  }));

  return {
    pricePoints,
    hasEnoughData: pricePoints.length >= 8,
  };
}

export async function savePriceSnapshots(
  origin: string,
  destination: string,
  pricePoints: PricePoint[],
  source: string
): Promise<void> {
  if (!pricePoints.length) return;

  const rows = pricePoints.map((p) => ({
    origin,
    destination,
    travel_month: p.month,
    min_price: p.price,
    currency: 'USD',
    source,
  }));

  await supabaseAdmin.from('price_snapshots').upsert(rows, {
    onConflict: 'origin,destination,travel_month,source,searched_at',
    ignoreDuplicates: true,
  });
}

export async function updatePriceSummary(
  origin: string,
  destination: string,
  pricePoints: PricePoint[],
  currentPrice: number
): Promise<void> {
  if (!pricePoints.length) return;

  const prices = pricePoints.map((p) => p.price);
  const historicalLow = Math.min(...prices);
  const avg12m = prices.reduce((a, b) => a + b, 0) / prices.length;

  // Group by travel_month
  const byMonth = new Map<string, number[]>();
  for (const p of pricePoints) {
    if (!byMonth.has(p.month)) byMonth.set(p.month, []);
    byMonth.get(p.month)!.push(p.price);
  }

  for (const [travel_month, monthPrices] of byMonth.entries()) {
    await supabaseAdmin.from('price_summary').upsert({
      origin,
      destination,
      travel_month,
      historical_low: Math.min(historicalLow, ...monthPrices),
      avg_12m: avg12m,
      last_seen_price: currentPrice,
      data_points: monthPrices.length,
      updated_at: new Date().toISOString(),
    });
  }
}

export async function checkSerpApiBudget(): Promise<{ used: number; canCall: boolean }> {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { data } = await supabaseAdmin
    .from('serpapi_call_log')
    .select('id', { count: 'exact' })
    .eq('month_key', monthKey);

  const used = (data as unknown as { count: number } | null)?.count ?? 0;
  return { used, canCall: used < 90 };
}

export async function logSerpApiCall(origin: string, destination: string): Promise<void> {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  await supabaseAdmin.from('serpapi_call_log').insert({
    origin,
    destination,
    month_key: monthKey,
  });
}
