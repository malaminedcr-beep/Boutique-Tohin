'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getBrowserPb } from '../../../lib/pocketbase/client';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await getBrowserPb().collection('users').create({
        email,
        password,
        passwordConfirm: password,
        full_name: fullName,
      });
      setSuccess(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.email?.message ||
        err?.response?.message ||
        (err instanceof Error ? err.message : 'Registration failed.');
      setError(msg);
      setLoading(false);
    }
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
              <p className="mb-1 text-[10px] uppercase tracking-[0.35em] text-muted">Registration successful</p>
              <h1 className="font-serif text-3xl uppercase tracking-widest text-ink">Account created!</h1>
            </div>
            <p className="text-sm text-muted">
              Your account <span className="font-semibold text-ink">{email}</span> has been
              created.<br />
              You can now sign in.
            </p>
            <Link
              href="/account/login"
              className="inline-flex items-center justify-center border border-ink bg-ink px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-accent hover:border-accent"
            >
              Sign in
            </Link>
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
            <h1 className="font-serif text-3xl uppercase tracking-widest text-ink">Sign up</h1>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="w-full border border-hairline bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted/40 outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
                Password
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
            <button
              type="submit"
              disabled={loading}
              className="w-full border border-ink bg-ink px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-accent hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating…' : 'Create my account'}
            </button>
          </form>

          <p className="mt-8 text-center text-[12px] text-muted">
            Already have an account?{' '}
            <Link href="/account/login" className="font-semibold text-ink hover:text-accent transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
