import { NextRequest, NextResponse } from 'next/server';
import { getCachedPriceHistory } from '@/lib/supabase/price-cache';
import { getPriceHistory } from '@/lib/serpapi/price-history';
import {
  checkSerpApiBudget,
  logSerpApiCall,
  savePriceSnapshots,
} from '@/lib/supabase/price-cache';

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.searchParams.get('origin');
  const destination = request.nextUrl.searchParams.get('destination');

  if (!origin || !destination) {
    return NextResponse.json({ error: 'origin and destination required' }, { status: 400 });
  }

  // Check cache first
  const { pricePoints, hasEnoughData } = await getCachedPriceHistory(origin, destination);

  if (hasEnoughData) {
    return NextResponse.json({ pricePoints, source: 'cache' });
  }

  // Try SerpAPI if budget allows
  const { canCall } = await checkSerpApiBudget();
  if (canCall) {
    const { pricePoints: serpPoints } = await getPriceHistory(origin, destination);
    if (serpPoints.length > 0) {
      await logSerpApiCall(origin, destination);
      await savePriceSnapshots(origin, destination, serpPoints, 'serpapi');
      return NextResponse.json({ pricePoints: serpPoints, source: 'serpapi' });
    }
  }

  return NextResponse.json({
    pricePoints,
    source: 'partial-cache',
    notice: pricePoints.length < 8 ? 'Limited history available' : undefined,
  });
}
