import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. Bypasses RLS entirely.
 *
 * SERVER-ONLY. Never import this from a Client Component or expose the key
 * to the browser. Used for privileged operations behind an auth guard:
 *  - creating orders with a server-recomputed total (checkout)
 *  - reading all orders in the admin back-office
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (Supabase Dashboard → Settings → API → service_role).',
    );
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
