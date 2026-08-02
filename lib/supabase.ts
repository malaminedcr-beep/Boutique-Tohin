import { createClient } from './supabase/client';

/**
 * Backward-compatible browser client singleton.
 * Now cookie-based (via @supabase/ssr) so that server-side auth guards can
 * read the session. Only import this from Client Components.
 */
export const supabase = createClient();
