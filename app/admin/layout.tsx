import { notFound } from 'next/navigation';
import { getVerifiedAdmin } from '../../lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Authoritative server-side guard for the admin back-office (defense in depth
 * with middleware.ts). Any non-admin request renders a real 404.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getVerifiedAdmin();
  if (!admin) notFound();
  return <>{children}</>;
}
