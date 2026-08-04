import { notFound } from 'next/navigation';
import { getServerPb, getVerifiedAdmin } from '../../lib/pocketbase/server';

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
  const pb = getServerPb();
  const admin = await getVerifiedAdmin(pb);
  if (!admin) notFound();
  return <>{children}</>;
}
