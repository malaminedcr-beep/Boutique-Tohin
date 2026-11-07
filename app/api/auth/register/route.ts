import { NextResponse } from 'next/server';
import { createAdminSupabase } from '../../../../lib/supabase/admin';
import { validatePassword } from '../../../../lib/password-policy';

export const dynamic = 'force-dynamic';

const MAX_PER_IP_PER_HOUR = 5;

function clientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

/**
 * Inscription côté serveur. Le compte est créé DÉJÀ CONFIRMÉ via le client
 * service-role (`email_confirm: true`) tant que le SMTP custom n'est pas
 * branché (le flux email par défaut échouait). Protégé par un honeypot et un
 * rate-limit de 5 inscriptions / IP / heure. Règle de mot de passe imposée ici.
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot — un champ caché que seuls les bots remplissent. Si rempli, on
  // fait semblant de réussir sans rien créer (ne révèle pas le piège).
  if (String(body?.company ?? '').trim() !== '') {
    return NextResponse.json({ ok: true });
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

  let admin;
  try {
    admin = createAdminSupabase();
  } catch {
    return NextResponse.json({ error: 'Server is not configured for sign-up.' }, { status: 500 });
  }

  // Rate-limit : 5 inscriptions max par IP par heure.
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

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // bypass the (unconfigured) confirmation email for now
    user_metadata: { full_name: fullName },
  });

  if (error) {
    const msg = (error.message || '').toLowerCase();
    if (
      (error as any).status === 422 ||
      msg.includes('already') ||
      msg.includes('registered') ||
      msg.includes('exists')
    ) {
      return NextResponse.json(
        { error: 'This email is already registered. Please sign in instead.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message || 'Registration failed.' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
