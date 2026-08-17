'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBrowserSupabase } from '../../../lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Supabase reset emails redirect here with a recovery link. The client
    // detects it and opens a temporary session (PASSWORD_RECOVERY / SIGNED_IN).
    const supabase = getBrowserSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true);
        setChecked(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      setChecked(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);

    const { error: updateError } = await getBrowserSupabase().auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message || 'Could not reset the password.');
      setLoading(false);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push('/account/login'), 2500);
  };

  if (success) {
    return (
      <main className="min-h-screen bg-canvas text-ink">
        <section className="mx-auto max-w-lg px-6 py-24 md:px-8">
          <div className="rounded-2xl border border-hairline bg-white p-10 shadow-card text-center space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="font-serif text-3xl uppercase tracking-widest text-ink">Password updated</h1>
              <p className="mt-3 text-sm text-muted">Redirecting to sign in…</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (checked && !ready) {
    return (
      <main className="min-h-screen bg-canvas text-ink">
        <section className="mx-auto max-w-lg px-6 py-24 md:px-8">
          <div className="rounded-2xl border border-hairline bg-white p-10 shadow-card text-center space-y-6">
            <h1 className="font-serif text-3xl uppercase tracking-widest text-ink">Invalid link</h1>
            <p className="text-sm text-muted">
              This reset link is invalid or has expired.{' '}
              <Link href="/account/forgot-password" className="underline hover:text-ink">
                request a new link
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto max-w-lg px-6 py-24 md:px-8">
        <div className="rounded-2xl border border-hairline bg-white p-10 shadow-card">

          <div className="mb-8 text-center">
            <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-muted">My account</p>
            <h1 className="font-serif text-3xl uppercase tracking-widest text-ink">New password</h1>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
                New password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••  (min. 8 characters)"
                className="w-full border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
                Confirm password
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-accent transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full border border-ink bg-ink px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-accent hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
