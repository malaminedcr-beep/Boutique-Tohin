'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '../../lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getBrowserSupabase();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await getBrowserSupabase().auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-ink border-t-transparent" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-canvas text-ink">
        <section className="mx-auto max-w-lg px-6 py-24 md:px-8">
          <div className="rounded-2xl border border-hairline bg-white p-10 shadow-card text-center space-y-6">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-muted">Customer area</p>
              <h1 className="font-serif text-3xl uppercase tracking-widest text-ink">My account</h1>
            </div>
            <p className="text-sm text-muted">
              Sign in to track your orders and access your purchase history.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/account/login"
                className="flex-1 border border-hairline bg-white px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:border-ink"
              >
                Sign in
              </Link>
              <Link
                href="/account/register"
                className="flex-1 border border-ink bg-ink px-6 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-accent hover:border-accent"
              >
                Create account
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const displayName =
    (user.user_metadata?.full_name as string) || user.email?.split('@')[0] || 'Customer';
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto max-w-3xl px-6 py-20 md:px-8 space-y-6">

        {/* Header */}
        <div className="rounded-2xl border border-hairline bg-white p-8 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.35em] text-muted">Customer area</p>
              <h1 className="font-serif text-2xl uppercase tracking-widest text-ink">{displayName}</h1>
              <p className="mt-1 text-sm text-muted">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 border border-hairline px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted transition-colors hover:border-ink hover:text-ink"
            >
              Log out
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-hairline bg-surface p-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted">Email</p>
              <p className="mt-1 text-sm font-medium text-ink">{user.email}</p>
            </div>
            <div className="rounded-lg border border-hairline bg-surface p-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted">Member since</p>
              <p className="mt-1 text-sm font-medium text-ink capitalize">{memberSince}</p>
            </div>
          </div>
        </div>

        {/* Commandes */}
        <div className="rounded-2xl border border-hairline bg-white p-8 shadow-card">
          <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
            My orders
          </h2>
          <div className="rounded-lg border border-hairline bg-surface p-8 text-center">
            <p className="text-sm text-muted">Order history — coming soon</p>
            <Link
              href="/shop"
              className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-accent hover:underline"
            >
              Explore the shop
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

      </section>
    </main>
  );
}
