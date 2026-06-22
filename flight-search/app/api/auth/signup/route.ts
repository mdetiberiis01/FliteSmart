import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

// Update FROM_EMAIL to a verified Resend domain once one is configured
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'FliteSmart <onboarding@resend.dev>';

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
    const redirectTo = `${APP_URL}/auth/confirm`;

    // generateLink creates the user (unconfirmed) and returns a one-time confirmation URL
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        data: {
          full_name: name,
          ...(homeAirport
            ? { home_airport: homeAirport, home_airport_name: homeAirportName ?? homeAirport }
            : {}),
        },
        redirectTo,
      },
    });

    if (error) throw error;

    const confirmUrl = data.properties.action_link;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: 'Confirm your FliteSmart account',
        html: buildConfirmationEmail(name, confirmUrl),
      }),
    });

    if (!emailRes.ok) {
      const errData = await emailRes.json().catch(() => ({}));
      throw new Error(`Failed to send confirmation email: ${errData.message || emailRes.statusText}`);
    }

    return NextResponse.json({ userId: data.user?.id, pendingConfirmation: true });
  } catch (err: unknown) {
    console.error('[auth/signup] error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildConfirmationEmail(name: string, confirmUrl: string): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:480px;">
        <tr><td align="center" style="padding-bottom:24px;">
          <span style="font-size:20px;font-weight:700;color:#0f172a;letter-spacing:-0.5px;">&#9992; FliteSmart</span>
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;padding:40px 36px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;">Confirm your email</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
            Hi ${name}, thanks for joining FliteSmart! Click the button below to confirm your email address and activate your account.
          </p>
          <a href="${confirmUrl}"
             style="display:inline-block;background:#0077b6;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:12px;">
            Confirm email
          </a>
          <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">
            If you didn't create a FliteSmart account, you can safely ignore this email.<br />
            This link expires in 24 hours.
          </p>
        </td></tr>
        <tr><td align="center" style="padding-top:24px;">
          <p style="font-size:12px;color:#94a3b8;margin:0;">© ${year} FliteSmart &middot; Not affiliated with any airline</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
