'use client';

import { useEffect, useState } from 'react';
import { formatBdt } from '../../lib/format';
import {
  BKASH_ACCOUNT_TYPE,
  BKASH_RECEIVER_NAME,
  BKASH_RECEIVER_NUMBER,
  isPlausibleTrxId,
  normalizeTrxId,
} from '../../lib/bkash';

type Props = {
  open: boolean;
  orderId: string;
  orderNumber: string;
  totalBdt: number;
  onClose: () => void;
  onSuccess: () => void;
};

/** Petit bouton « copier » réutilisable (clipboard API). */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard indisponible (contexte non sécurisé) — on ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copier ${label}`}
      className="shrink-0 rounded-lg border border-hairline bg-canvas px-2.5 py-1 text-xs font-medium text-ink transition hover:border-accent hover:text-accent active:scale-95"
    >
      {copied ? '✓ Copié' : 'Copier'}
    </button>
  );
}

/** Une ligne d'info copiable (label + valeur + bouton copier). */
function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-surface px-3.5 py-3">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
        <p className={`truncate text-sm font-semibold text-ink ${mono ? 'font-mono' : ''}`}>
          {value}
        </p>
      </div>
      <CopyButton value={value} label={label} />
    </div>
  );
}

export default function PaymentPopup({
  open,
  orderId,
  orderNumber,
  totalBdt,
  onClose,
  onSuccess,
}: Props) {
  const [trxid, setTrxid] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verrouille le scroll du body quand la popup est ouverte.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  if (!open) return null;

  const trimmed = normalizeTrxId(trxid);
  const canSubmit = isPlausibleTrxId(trimmed) && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isPlausibleTrxId(trimmed)) {
      setError('Entrez un TrxID valide (le code alphanumérique reçu de bKash).');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trxid: trimmed }),
      });
      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result?.error ?? 'La soumission a échoué. Réessayez.');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'La soumission a échoué. Réessayez.');
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="bkash-popup-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-canvas shadow-soft sm:rounded-3xl">
        {/* ── En-tête ── */}
        <div className="flex items-center justify-between gap-3 border-b border-hairline bg-surface px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600 text-sm font-bold text-white">
              b
            </span>
            <div>
              <h2 id="bkash-popup-title" className="font-serif text-lg font-semibold text-ink">
                Paiement bKash
              </h2>
              <p className="text-[11px] text-muted">Commande {orderNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-1.5 text-muted transition hover:bg-canvas hover:text-ink"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Corps (scrollable) ── */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {/* Montant en évidence */}
          <div className="rounded-2xl border border-accent/20 bg-highlight px-4 py-4 text-center">
            <p className="text-[11px] uppercase tracking-wider text-muted">Montant exact à envoyer</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-accent">{formatBdt(totalBdt)}</p>
          </div>

          {/* Infos à copier */}
          <div className="space-y-2">
            <InfoRow label="Numéro bKash (Send Money)" value={BKASH_RECEIVER_NUMBER} mono />
            <InfoRow label="Nom du destinataire" value={BKASH_RECEIVER_NAME} />
            <InfoRow label="Numéro de commande" value={orderNumber} mono />
          </div>

          {/* Instructions numérotées */}
          <ol className="space-y-2 rounded-2xl border border-hairline bg-surface px-4 py-4 text-sm text-ink">
            {[
              <>Ouvrez l’app <span className="font-semibold">bKash</span> et choisissez <span className="font-semibold">« Send Money »</span> ({BKASH_ACCOUNT_TYPE}).</>,
              <>Envoyez exactement <span className="font-semibold text-accent">{formatBdt(totalBdt)}</span> au numéro ci-dessus.</>,
              <>À la fin, bKash vous donne un <span className="font-semibold">TrxID</span> (ex : 9AB3CD5EF2).</>,
              <>Copiez ce TrxID et collez-le ci-dessous, puis validez.</>,
            ].map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="leading-snug">{step}</span>
              </li>
            ))}
          </ol>

          {/* Champ TrxID */}
          <form onSubmit={handleSubmit} className="space-y-3" id="trxid-form">
            <div>
              <label htmlFor="trxid" className="mb-1.5 block text-sm font-medium text-ink">
                Votre TrxID bKash
              </label>
              <input
                id="trxid"
                name="trxid"
                type="text"
                inputMode="text"
                autoCapitalize="characters"
                autoComplete="off"
                value={trxid}
                onChange={(e) => setTrxid(e.target.value)}
                placeholder="ex : 9AB3CD5EF2"
                className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 font-mono text-sm uppercase tracking-wider text-ink placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* ── Pied (actions) ── */}
        <div className="space-y-2 border-t border-hairline bg-surface px-5 py-4">
          <button
            type="submit"
            form="trxid-form"
            disabled={!canSubmit}
            className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white transition enabled:hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-muted/40"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Envoi…
              </span>
            ) : (
              'J’ai payé — Soumettre le TrxID'
            )}
          </button>
          <p className="text-center text-[11px] leading-snug text-muted">
            Votre commande sera confirmée dès que nous aurons vérifié le paiement.
          </p>
        </div>
      </div>
    </div>
  );
}
