import { NextResponse } from 'next/server';
import { createAdminSupabase } from '../../../../lib/supabase/admin';
import { getServerSupabase } from '../../../../lib/supabase/server';
import { validatePassword } from '../../../../lib/password-policy';

export const dynamic = 'force-dynamic';

const MAX_PER_IP_PER_HOUR = 5;

function clientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

/**
 * Inscription côté serveur. Crée le compte via `signUp` → Supabase envoie l'email
 * de confirmation (SMTP custom Resend). Le lien pointe sur /auth/callback (échange
 * du code → session). Protégé par un honeypot et un rate-limit 5/IP/heure. Règle
 * de mot de passe imposée ici (pas seulement au front).
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot — champ caché que seuls les bots remplissent → faux succès silencieux.
  if (String(body?.company ?? '').trim() !== '') {
    return NextResponse.json({ ok: true, needsConfirmation: true });
  }

  const email = String(body?.email ?? '').trim().toLowerCase();
  const password = String(body?.password ?? '');
  const fullName = String(body?.fullName ?? '').trim();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const pwError = validatePassword(password);
  if (pwError) {
    return NextResponse.json({ error: pwError }, { status: 400 });
  }

  // Rate-limit : 5 inscriptions max par IP par heure (table service-role only).
  let admin;
  try {
    admin = createAdminSupabase();
  } catch {
    return NextResponse.json({ error: 'Server is not configured for sign-up.' }, { status: 500 });
  }
  const ip = clientIp(request);
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from('signup_throttle')
    .select('id', { count: 'exact', head: true })
    .eq('ip', ip)
    .gte('created_at', since);
  if ((count ?? 0) >= MAX_PER_IP_PER_HOUR) {
    return NextResponse.json(
      { error: 'Too many sign-up attempts from your network. Please try again later.' },
      { status: 429 },
    );
  }
  await admin.from('signup_throttle').insert({ ip });

  // Real sign-up → confirmation email via Resend SMTP; link lands on /auth/callback.
  const origin =
    request.headers.get('origin') ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://www.frenchbeautybd.com';

  const supabase = getServerSupabase();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  });

  if (error) {
    const msg = (error.message || '').toLowerCase();
    if (msg.includes('already') || msg.includes('registered')) {
      return NextResponse.json(
        { error: 'This email is already registered. Please sign in instead.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message || 'Registration failed.' }, { status: 400 });
  }

  // Confirm-email is on → the account must be verified via the email link.
  return NextResponse.json({ ok: true, needsConfirmation: true });
}
