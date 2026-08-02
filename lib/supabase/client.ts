import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Supabase client (cookie-based sessions).
 * Cookie storage is required so that the server (middleware, layouts, route
 * handlers) can read the authenticated session — localStorage cannot.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
