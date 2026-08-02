import { notFound } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Server-side guard for the internal management app (defense in depth with
 * middleware.ts). Any non-admin request renders a real 404.
 */
export default async function GestionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') notFound();

  return <>{children}</>;
}
