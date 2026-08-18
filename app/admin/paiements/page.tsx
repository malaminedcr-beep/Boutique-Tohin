'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatBdt } from '../../../lib/format';

/**
 * File d'attente de vérification des paiements bKash (paiement manuel).
 * Mobile-first (consultée surtout au téléphone). Auto-refresh toutes les 30 s.
 *
 * Protégée par le garde admin existant (middleware.ts + app/admin/layout.tsx
 * via getVerifiedAdmin) — cette page vit sous /admin/*. Les routes API appelées
 * revérifient aussi le rôle admin (défense en profondeur).
 */

type PendingOrder = {
  id: string;
  order_number: string;
  total_bdt: number;
  trxid: string | null;
  trxid_submitted_at: string | null;
  bkash_receiver_number: string | null;
  shipping_address: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    city?: string;
  } | null;
};

const REFRESH_MS = 30_000;

/** « il y a X min » à partir d'un ISO. */
function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.floor(h / 24)} j`;
}

export default function AdminPaiementsPage() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Force le recalcul des "il y a X min" sans refetch.
  const [, setTick] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders/pending', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Chargement impossible.');
      setOrders(data.orders ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial + auto-refresh 30 s.
  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  // Rafraîchit l'affichage relatif chaque minute.
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  async function decide(id: string, action: 'valider' | 'refuser') {
    if (action === 'refuser' && !confirm('Refuser ce paiement ?')) return;
    setBusyId(id);
    // Optimiste : on retire la ligne de la file tout de suite.
    const prev = orders;
    setOrders((o) => o.filter((x) => x.id !== id));
    try {
      const res = await fetch(`/api/admin/orders/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Action impossible.');
    } catch (e) {
      // Rollback + message
      setOrders(prev);
      setError(e instanceof Error ? e.message : 'Action impossible.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="min-h-screen bg-canvas pb-24 pt-6">
      <div className="mx-auto max-w-2xl px-4">
        {/* En-tête */}
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-accent">
              French Beauty BD
            </p>
            <h1 className="mt-0.5 font-serif text-2xl font-semibold text-ink">
              Paiements à vérifier
            </h1>
            <p className="mt-0.5 text-sm text-muted">
              {orders.length} en attente · auto-refresh 30 s
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="shrink-0 rounded-full border border-hairline bg-surface px-3.5 py-2 text-xs font-medium text-ink shadow-card transition hover:border-accent hover:text-accent"
          >
            Rafraîchir
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* État de chargement initial */}
        {loading && (
          <div className="rounded-2xl border border-hairline bg-surface py-16 text-center text-sm text-muted shadow-card">
            Chargement…
          </div>
        )}

        {/* État vide */}
        {!loading && orders.length === 0 && !error && (
          <div className="rounded-2xl border border-hairline bg-surface py-16 text-center shadow-card">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-highlight text-accent">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium text-ink">Aucun paiement en attente</p>
            <p className="mt-1 text-sm text-muted">Les nouveaux TrxID apparaîtront ici automatiquement.</p>
          </div>
        )}

        {/* Liste */}
        <div className="space-y-3">
          {orders.map((o) => {
            const addr = o.shipping_address ?? {};
            const client = `${addr.firstName ?? ''} ${addr.lastName ?? ''}`.trim() || 'Client';
            const busy = busyId === o.id;
            return (
              <div
                key={o.id}
                className="rounded-2xl border border-hairline bg-surface p-4 shadow-card"
              >
                {/* Ligne haute : commande + montant */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-accent">{o.order_number}</p>
                    <p className="mt-0.5 truncate font-medium text-ink">{client}</p>
                    {addr.phone && (
                      <a
                        href={`tel:${addr.phone}`}
                        className="text-sm text-muted underline-offset-2 hover:text-accent hover:underline"
                      >
                        {addr.phone}
                      </a>
                    )}
                    {addr.city && <p className="text-xs text-muted">{addr.city}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-serif text-lg font-semibold text-ink">{formatBdt(o.total_bdt)}</p>
                    <p className="text-[11px] text-muted">{timeAgo(o.trxid_submitted_at)}</p>
                  </div>
                </div>

                {/* TrxID */}
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-hairline bg-canvas px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-muted">TrxID soumis</p>
                    <p className="truncate font-mono text-sm font-semibold text-ink">{o.trxid ?? '—'}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => decide(o.id, 'refuser')}
                    className="rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition enabled:hover:bg-red-100 disabled:opacity-50"
                  >
                    Refuser
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => decide(o.id, 'valider')}
                    className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition enabled:hover:bg-accent/90 disabled:opacity-50"
                  >
                    {busy ? '…' : 'Valider'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
