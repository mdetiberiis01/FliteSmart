import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/client';
import { sendConfirmationEmail } from '@/lib/resend/send-alert-email';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

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

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) throw error;

    const confirmationUrl = data.properties.action_link;
    await sendConfirmationEmail(email, confirmationUrl);

    return NextResponse.json({ userId: data.user.id });
  } catch (err: unknown) {
    console.error('[auth/signup] error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
