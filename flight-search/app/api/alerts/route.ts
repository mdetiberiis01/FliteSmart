import { NextRequest, NextResponse } from 'next/server';
import { saveAlert } from '@/lib/supabase/alerts';
import { updateAlert } from '@/lib/supabase/user-alerts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, origin, originName, destination, maxPrice, userId, flexibility, customDateStart, customDateEnd, tripDays } = body;

    if (!email || !origin || !destination || !maxPrice) {
      return NextResponse.json(
        { error: 'Missing required fields: email, origin, destination, maxPrice' },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const price = Number(maxPrice);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'maxPrice must be a positive number' }, { status: 400 });
    }

    await saveAlert({
      email,
      origin,
      origin_name: originName,
      destination,
      max_price: price,
      user_id: userId,
      flexibility,
      custom_date_start: customDateStart,
      custom_date_end: customDateEnd,
      trip_days: tripDays,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[alerts] POST error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, origin, originName, destination, maxPrice, flexibility, customDateStart, customDateEnd, tripDays } = await req.json();

    if (!id || !origin || !destination || !maxPrice) {
      return NextResponse.json(
        { error: 'Missing required fields: id, origin, destination, maxPrice' },
        { status: 400 },
      );
    }

    const price = Number(maxPrice);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'maxPrice must be a positive number' }, { status: 400 });
    }

    await updateAlert(id, { origin, origin_name: originName, destination, max_price: price, flexibility, custom_date_start: customDateStart, custom_date_end: customDateEnd, trip_days: tripDays });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[alerts] PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
