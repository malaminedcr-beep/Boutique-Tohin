'use client';

import { useEffect, useState } from 'react';
import { formatBdt } from '../../lib/format';
import {
  PAYMENT_ACCOUNT_TYPE,
  PAYMENT_RECEIVER_NAME,
  PAYMENT_RECEIVER_NUMBER,
  PAYMENT_METHOD_LABEL,
  normalizeTrxId,
  type PaymentMethod,
} from '../../lib/bkash';

type Props = {
  open: boolean;
  method: PaymentMethod;
  orderId: string;
  orderNumber: string;
  totalBdt: number;
  onClose: () => void;
  onSuccess: () => void;
};

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/** Reusable copy-to-clipboard button (clipboard API). */
function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable (insecure context) — ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${label}`}
      className="shrink-0 rounded-lg border border-hairline bg-canvas px-2.5 py-1 text-xs font-medium text-ink transition hover:border-accent hover:text-accent active:scale-95"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

/** A copyable info row (label + value + copy button). */
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
  method,
  orderId,
  orderNumber,
  totalBdt,
  onClose,
  onSuccess,
}: Props) {
  const label = PAYMENT_METHOD_LABEL[method];
  const accentDot = method === 'bkash' ? 'bg-pink-600' : 'bg-orange-500';
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [trxid, setTrxid] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock body scroll while the popup is open.
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  // Revoke the preview object URL when it changes or on unmount.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (!open) return null;

  const canSubmit = !!file && !submitting;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (!ACCEPTED_TYPES.includes(picked.type)) {
      setError('Unsupported file. Please upload a JPG, PNG or WEBP image.');
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError('Image is too large (max 5 MB).');
      return;
    }
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(picked);
    });
    setFile(picked);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError('Please upload a screenshot of your bKash payment confirmation.');
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const cleanTrx = normalizeTrxId(trxid);
      if (cleanTrx) body.append('trxid', cleanTrx);

      // No explicit Content-Type: the browser sets the multipart boundary.
      const res = await fetch(`/api/orders/${orderId}/pay`, { method: 'POST', body });
      const result = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(result?.error ?? 'Submission failed. Please try again.');
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
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
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 border-b border-hairline bg-surface px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white ${accentDot}`}>
              {label.charAt(0)}
            </span>
            <div>
              <h2 id="bkash-popup-title" className="font-serif text-lg font-semibold text-ink">
                {label} Payment
              </h2>
              <p className="text-[11px] text-muted">Order {orderNumber}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-muted transition hover:bg-canvas hover:text-ink"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {/* Amount highlight */}
          <div className="rounded-2xl border border-accent/20 bg-highlight px-4 py-4 text-center">
            <p className="text-[11px] uppercase tracking-wider text-muted">Exact amount to send</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-accent">{formatBdt(totalBdt)}</p>
          </div>

          {/* Info to copy */}
          <div className="space-y-2">
            <InfoRow label={`${label} number (Send Money)`} value={PAYMENT_RECEIVER_NUMBER} mono />
            <InfoRow label="Recipient name" value={PAYMENT_RECEIVER_NAME} />
            <InfoRow label="Order number" value={orderNumber} mono />
          </div>

          {/* Numbered instructions */}
          <ol className="space-y-2 rounded-2xl border border-hairline bg-surface px-4 py-4 text-sm text-ink">
            {[
              <>Open the <span className="font-semibold">{label}</span> app and choose <span className="font-semibold">“Send Money”</span> ({PAYMENT_ACCOUNT_TYPE}).</>,
              <>Send exactly <span className="font-semibold text-accent">{formatBdt(totalBdt)}</span> to the number above.</>,
              <>Take a <span className="font-semibold">screenshot</span> of the bKash confirmation.</>,
              <>Upload that screenshot below, then submit.</>,
            ].map((step, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                  {i + 1}
                </span>
                <span className="leading-snug">{step}</span>
              </li>
            ))}
          </ol>

          <form onSubmit={handleSubmit} className="space-y-4" id="bkash-form">
            {/* Screenshot upload (required) */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                Payment screenshot <span className="text-accent">*</span>
              </label>

              {preview ? (
                <div className="relative overflow-hidden rounded-xl border border-hairline bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Payment screenshot preview" className="max-h-64 w-full object-contain" />
                  <label
                    htmlFor="proof"
                    className="absolute bottom-2 right-2 cursor-pointer rounded-full bg-ink/80 px-3 py-1 text-[11px] font-medium text-white hover:bg-ink"
                  >
                    Change
                  </label>
                </div>
              ) : (
                <label
                  htmlFor="proof"
                  className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-hairline bg-surface px-4 py-8 text-center transition hover:border-accent"
                >
                  <span className="text-sm font-medium text-ink">Tap to upload a screenshot</span>
                  <span className="text-[11px] text-muted">JPG, PNG or WEBP — max 5 MB</span>
                </label>
              )}

              <input
                id="proof"
                name="file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handleFileChange}
                className="sr-only"
              />
            </div>

            {/* TrxID (optional) */}
            <div>
              <label htmlFor="trxid" className="mb-1.5 block text-sm font-medium text-ink">
                {label} TrxID <span className="font-normal text-muted">— optional</span>
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
                placeholder="e.g. 9AB3CD5EF2"
                className="w-full rounded-xl border border-hairline bg-surface px-4 py-3 font-mono text-sm uppercase tracking-wider text-ink placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <p className="mt-1 text-[11px] text-muted">Helps us find your transaction faster.</p>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* ── Footer (actions) ── */}
        <div className="space-y-2 border-t border-hairline bg-surface px-5 py-4">
          <button
            type="submit"
            form="bkash-form"
            disabled={!canSubmit}
            className="w-full rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white transition enabled:hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-muted/40"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending…
              </span>
            ) : (
              'I’ve paid — Submit'
            )}
          </button>
          <p className="text-center text-[11px] leading-snug text-muted">
            Your order will be confirmed as soon as we have verified the payment.
          </p>
        </div>
      </div>
    </div>
  );
}
