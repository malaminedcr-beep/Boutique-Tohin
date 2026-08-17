'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser Supabase singleton. @supabase/ssr keeps the auth session in cookies
 * so the server can read it on the next request. Import only from Client
 * Components.
 */
let _sb: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient {
  if (_sb) return _sb;
  _sb = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  return _sb;
}
