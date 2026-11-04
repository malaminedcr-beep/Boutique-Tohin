import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../../../lib/supabase/server';
import { validatePassword } from '../../../../lib/password-policy';

export const dynamic = 'force-dynamic';

/**
 * Inscription côté serveur. La règle de mot de passe est imposée ICI (pas
 * seulement dans le navigateur) — un appel direct avec un mot de passe faible
 * est rejeté. Compense l'absence de "leaked password protection" (plan Pro) et
 * le fait qu'on ne puisse pas forcer la règle dans la config Auth sans token
 * de management. Réplique le signUp du front (email de confirmation inclus).
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = String(body?.email ?? '').trim();
  const password = String(body?.password ?? '');
  const fullName = String(body?.fullName ?? '').trim();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const pwError = validatePassword(password);
  if (pwError) {
    return NextResponse.json({ error: pwError }, { status: 400 });
  }

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
      emailRedirectTo: `${origin}/account/login`,
    },
  });
  if (error) {
    return NextResponse.json(
      { error: error.message || 'Registration failed.' },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
