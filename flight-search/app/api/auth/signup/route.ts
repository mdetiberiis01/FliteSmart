import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, homeAirport, homeAirportName } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name' },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 },
      );
    }

    const admin = getAdminClient();

    // Use admin.createUser with email_confirm: true to skip the confirmation
    // email entirely — avoids SMTP dependency and lets users sign in immediately.
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name,
        ...(homeAirport ? { home_airport: homeAirport, home_airport_name: homeAirportName ?? homeAirport } : {}),
      },
    });

    if (error) throw error;

    return NextResponse.json({ userId: data.user?.id });
  } catch (err: unknown) {
    console.error('[auth/signup] error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
