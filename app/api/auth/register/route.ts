import { NextResponse } from 'next/server';
import { createAdminSupabase } from '../../../../lib/supabase/admin';
import { validatePassword } from '../../../../lib/password-policy';

export const dynamic = 'force-dynamic';

/**
 * Inscription côté serveur. Le compte est créé DÉJÀ CONFIRMÉ via le client
 * service-role (`email_confirm: true`) : on contourne l'email de confirmation
 * Supabase. Le flux par défaut ("Confirm email" activé + SMTP par défaut peu
 * fiable) renvoyait "Error sending confirmation email" puis bloquait la
 * connexion ("email non confirmé") — ici l'utilisateur peut se connecter
 * aussitôt. La règle de mot de passe est imposée ici (pas seulement au front).
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
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

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // bypass the (broken) confirmation email — usable at once
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
