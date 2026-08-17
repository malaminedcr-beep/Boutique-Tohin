import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { SupabaseClient, User } from '@supabase/supabase-js';

/**
 * Per-request server Supabase client, seeded from the request cookies.
 * Import from Server Components / Route Handlers.
 *
 * Cookie writes throw in a Server Component (read-only) — they are swallowed;
 * session refresh is handled by middleware + the browser client.
 */
export function getServerSupabase(): SupabaseClient {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* called from a Server Component — safe to ignore */
          }
        },
      },
    },
  );
}

/**
 * Returns the authenticated user, validated against the Supabase Auth server
 * (getUser re-verifies the JWT — the cookie is never trusted blindly). Or null.
 */
export async function getVerifiedUser(): Promise<User | null> {
  const supabase = getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

/**
 * Returns the authenticated user ONLY if their profile role is 'admin'.
 * Role is read from the authoritative `profiles` table (own-row RLS).
 */
export async function getVerifiedAdmin(): Promise<User | null> {
  const supabase = getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return profile?.role === 'admin' ? user : null;
}
