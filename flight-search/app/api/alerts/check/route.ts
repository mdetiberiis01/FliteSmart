import { NextRequest, NextResponse } from 'next/server';
import { getActiveAlerts, markAlerted } from '@/lib/supabase/alerts';
import { orchestrateSearch } from '@/lib/search/orchestrator';
import { sendPriceAlertEmail, sendDealAlertEmail } from '@/lib/resend/send-alert-email';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function shouldAlert(lastAlertedAt: string | null | undefined): boolean {
  if (!lastAlertedAt) return true;
  return Date.now() - new Date(lastAlertedAt).getTime() > ONE_DAY_MS;
}

function isAuthorized(req: NextRequest): boolean {
  if (!process.env.CRON_SECRET) return true;
  const bearer = req.headers.get('authorization');
  const legacy = req.headers.get('x-cron-secret');
  return bearer === `Bearer ${process.env.CRON_SECRET}` || legacy === process.env.CRON_SECRET;
}

async function runChecks() {
  const alerts = await getActiveAlerts();
  const results: { id: string; status: string }[] = [];

  for (const alert of alerts) {
    if (!shouldAlert(alert.last_alerted_at)) {
      results.push({ id: alert.id!, status: 'skipped (cooldown)' });
      continue;
    }

    try {
      const searchResults = await orchestrateSearch({
        origin: alert.origin,
        destination: alert.destination,
        flexibility: 'anytime',
      });

      if (searchResults.length === 0) {
        results.push({ id: alert.id!, status: 'no results' });
        continue;
      }

      const best = searchResults.reduce((a, b) => (a.price < b.price ? a : b));
      let alerted = false;

      if (best.price <= alert.max_price) {
        await sendPriceAlertEmail(
          alert.email,
          alert.origin_name || alert.origin,
          best.destinationName || alert.destination,
          best.price,
          best.bookingUrl || 'https://flitesmart.com',
        );
        alerted = true;
      } else if (
        best.dealRating === 'great' &&
        best.dealPercent !== null &&
        best.dealPercent >= 30
      ) {
        await sendDealAlertEmail(
          alert.email,
          alert.origin_name || alert.origin,
          best.destinationName || alert.destination,
          best.price,
          best.dealPercent,
          best.bookingUrl || 'https://flitesmart.com',
        );
        alerted = true;
      }

      if (alerted) {
        await markAlerted(alert.id!);
        results.push({ id: alert.id!, status: 'alerted' });
      } else {
        results.push({ id: alert.id!, status: 'no trigger' });
      }
    } catch (err) {
      console.error(`[alerts/check] error for alert ${alert.id}:`, err);
      results.push({ id: alert.id!, status: 'error' });
    }
  }

  return { checked: alerts.length, results };
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await runChecks();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[alerts/check] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const data = await runChecks();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[alerts/check] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
