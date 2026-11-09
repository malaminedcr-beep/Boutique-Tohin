import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getVerifiedUser } from '../../lib/supabase/server';
import { getMyOrders, getMyAddresses, getMyProfile } from '../../lib/supabase/account';
import AccountClient from '../../components/account/account-client';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'My Account — French Beauty BD',
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await getVerifiedUser();
  if (!user) {
    redirect('/account/login?next=/account');
  }

  const [orders, addresses, profile] = await Promise.all([
    getMyOrders(user.id),
    getMyAddresses(user.id),
    getMyProfile(user.id),
  ]);

  return (
    <AccountClient
      userId={user.id}
      email={user.email ?? ''}
      isAdmin={profile.role === 'admin'}
      profile={{
        fullName: profile.fullName || (user.user_metadata?.full_name as string) || '',
        phone: profile.phone || '',
      }}
      orders={orders}
      addresses={addresses}
    />
  );
}
