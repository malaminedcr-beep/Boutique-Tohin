'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://french-beauty-bd.vercel.app';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${SITE_URL}/account/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <main className="min-h-screen bg-canvas text-ink">
        <section className="mx-auto max-w-lg px-6 py-24 md:px-8">
          <div className="rounded-2xl border border-hairline bg-white p-10 shadow-card text-center space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <svg className="h-7 w-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-[0.35em] text-muted">Email envoyé</p>
              <h1 className="font-serif text-3xl uppercase tracking-widest text-ink">Vérifiez votre boîte mail</h1>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Un lien de réinitialisation a été envoyé à{' '}
              <span className="font-semibold text-ink">{email}</span>.<br />
              Le lien expire dans 1 heure.
            </p>
            <Link
              href="/account/login"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted hover:text-ink transition-colors"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à la connexion
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
            <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-muted">Mon compte</p>
            <h1 className="font-serif text-3xl uppercase tracking-widest text-ink">Mot de passe oublié</h1>
            <p className="mt-3 text-sm text-muted">
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
            <button
              type="submit"
              disabled={loading}
              className="w-full border border-ink bg-ink px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-accent hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi…' : 'Envoyer le lien'}
            </button>
          </form>

          <p className="mt-8 text-center text-[12px] text-muted">
            <Link
              href="/account/login"
              className="inline-flex items-center gap-1.5 font-semibold text-ink hover:text-accent transition-colors"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour à la connexion
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
