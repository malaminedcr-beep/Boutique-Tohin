'use client';

import { useEffect, useState } from 'react';
import type { Order } from '../../../../../lib/types/orders';
import { formatBdt as fmt } from '../../../../../lib/format';
import {
  ORDER_STATUS_LABELS as STATUS_LABEL,
  PAYMENT_METHOD_LABELS as PAYMENT_LABEL,
} from '../../../../../lib/i18n/strings';

const SHORT_ID = (id: string) => id.split('-')[0].toUpperCase();
const FORMAT_DATE = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

export default function SlipPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/orders/${params.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Commande introuvable');
        return res.json();
      })
      .then((data) => {
        setOrder(data as Order);
        // Auto-print après rendu
        setTimeout(() => window.print(), 400);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur'));
  }, [params.id]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-red-600">
        Order not found: {error}
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          <span className="text-sm text-muted">Generating slip…</span>
        </div>
      </div>
    );
  }

  const addr = order.shipping_address;
  const items = order.order_items ?? [];
  const subtotal = items.reduce((s, i) => s + i.unit_price_bdt * i.quantity, 0);

  return (
    <>
      {/* ── CSS print global ── */}
      <style>{`
        @page {
          size: 105mm 148mm;
          margin: 0;
        }
        @media print {
          /* Cacher TOUT le DOM (navbar, footer, boutons, url, date, titre) */
          body * { visibility: hidden; }
          /* Afficher uniquement le bon */
          .slip-wrapper,
          .slip-wrapper * { visibility: visible; }
          /* Positionner le bon en haut à gauche, pleine page */
          .slip-wrapper {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 105mm !important;
            min-height: 148mm !important;
            box-shadow: none !important;
            border: none !important;
            padding: 10mm 10mm !important;
          }
        }
        @media screen {
          body {
            background: #f0ede8;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            padding: 2rem;
            min-height: 100vh;
          }
        }
      `}</style>

      {/* ── Bouton imprimer (masqué à l'impression) ── */}
      <div className="no-print mb-4 flex gap-3">
        <button
          onClick={() => window.print()}
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-accent/90 transition"
        >
          Print / Save PDF
        </button>
        <button
          onClick={() => window.close()}
          className="rounded-full border border-hairline bg-surface px-6 py-2.5 text-sm font-medium text-muted hover:text-ink transition"
        >
          Close
        </button>
      </div>

      {/* ── Bon A6 ── */}
      <div
        className="slip-wrapper"
        style={{
          width: '105mm',
          minHeight: '148mm',
          background: 'white',
          padding: '14mm 10mm',
          fontFamily: 'Georgia, serif',
          fontSize: '9pt',
          color: '#1A1614',
          boxShadow: '0 4px 32px rgba(0,0,0,0.12)',
          border: '1px solid #E8E2D9',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '8pt', marginBottom: '8pt', borderBottom: '1.5pt solid #C9513A' }}>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '13pt', fontWeight: 700, color: '#C9513A', letterSpacing: '0.04em' }}>
              FRENCH BEAUTY BD
            </div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '7pt', color: '#7A7068', marginTop: '2pt' }}>
              French cosmetics · Bangladesh
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '6pt', color: '#7A7068', fontWeight: 700, letterSpacing: '0.08em', marginBottom: '2pt' }}>
              ORDER SLIP
            </div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt', fontWeight: 700, color: '#1A1614' }}>
              #{SHORT_ID(order.id)}
            </div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '7pt', color: '#7A7068', marginTop: '1pt' }}>
              {FORMAT_DATE(order.created_at)}
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div style={{ marginBottom: '8pt', paddingBottom: '8pt', borderBottom: '0.5pt solid #E8E2D9' }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '6pt', fontWeight: 700, color: '#7A7068', letterSpacing: '0.1em', marginBottom: '4pt' }}>
            SHIP TO
          </div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt', fontWeight: 700, color: '#1A1614', marginBottom: '3pt' }}>
            {addr.firstName} {addr.lastName}
          </div>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '8pt', color: '#1A1614', lineHeight: 1.6 }}>
            {addr.phone}<br />
            {addr.address}<br />
            {addr.city}{addr.postalCode ? `, ${addr.postalCode}` : ''} · Bangladesh
          </div>
          {addr.email && (
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '7pt', color: '#7A7068', marginTop: '2pt' }}>
              {addr.email}
            </div>
          )}
        </div>

        {/* Produits */}
        <div style={{ marginBottom: '8pt' }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: '6pt', fontWeight: 700, color: '#7A7068', letterSpacing: '0.1em', marginBottom: '4pt' }}>
            PRODUCTS
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Arial, sans-serif', fontSize: '8pt' }}>
            <thead>
              <tr style={{ background: '#FBF8F5', borderTop: '0.5pt solid #E8E2D9', borderBottom: '0.5pt solid #E8E2D9' }}>
                <th style={{ textAlign: 'left', padding: '4pt 4pt 4pt 4pt', fontSize: '6.5pt', color: '#7A7068', fontWeight: 700 }}>Product</th>
                <th style={{ textAlign: 'center', padding: '4pt', fontSize: '6.5pt', color: '#7A7068', fontWeight: 700, width: '18pt' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '4pt', fontSize: '6.5pt', color: '#7A7068', fontWeight: 700, width: '38pt' }}>Unit</th>
                <th style={{ textAlign: 'right', padding: '4pt 4pt 4pt 4pt', fontSize: '6.5pt', color: '#7A7068', fontWeight: 700, width: '38pt' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} style={{ background: idx % 2 === 1 ? '#FBF8F5' : 'white', borderBottom: '0.5pt solid #E8E2D9' }}>
                  <td style={{ padding: '4pt 4pt' }}>
                    <div style={{ fontWeight: 600, color: '#1A1614' }}>{item.product?.name ?? '—'}</div>
                    <div style={{ fontSize: '6.5pt', color: '#7A7068' }}>{item.product?.brand ?? ''}</div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '4pt', color: '#1A1614' }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', padding: '4pt', color: '#1A1614' }}>{fmt(item.unit_price_bdt)}</td>
                  <td style={{ textAlign: 'right', padding: '4pt', color: '#1A1614', fontWeight: 600 }}>{fmt(item.unit_price_bdt * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8pt' }}>
          <div style={{ width: '120pt', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7.5pt', color: '#7A7068', marginBottom: '2pt' }}>
              <span>Subtotal</span><span>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7.5pt', color: '#7A7068', marginBottom: '4pt' }}>
              <span>Delivery</span><span>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', background: '#1A1614', color: 'white', padding: '5pt 8pt', borderRadius: '3pt' }}>
              <span style={{ fontWeight: 700, fontSize: '9pt' }}>TOTAL</span>
              <span style={{ fontWeight: 700, fontSize: '9pt', color: '#C9513A' }}>{fmt(order.total_bdt)}</span>
            </div>
          </div>
        </div>

        {/* Paiement & statut */}
        <div style={{ display: 'flex', gap: '6pt', alignItems: 'center', marginBottom: '10pt', fontFamily: 'Arial, sans-serif' }}>
          <span style={{ background: '#C9513A', color: 'white', fontSize: '7pt', fontWeight: 700, padding: '3pt 7pt', borderRadius: '3pt', letterSpacing: '0.05em' }}>
            {PAYMENT_LABEL[order.payment_method] ?? order.payment_method.toUpperCase()}
          </span>
          <span style={{ border: '0.5pt solid #E8E2D9', color: '#7A7068', fontSize: '7pt', padding: '3pt 7pt', borderRadius: '3pt' }}>
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
        </div>

        {/* Footer */}
        <div style={{ borderTop: '0.5pt solid #E8E2D9', paddingTop: '6pt', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'Arial, sans-serif', fontSize: '6pt', color: '#7A7068' }}>
          <span style={{ fontWeight: 700 }}>frenchbeautybd.com</span>
          <span>Authentic cosmetics · BD</span>
          <span>ID: {order.id.substring(0, 8)}</span>
        </div>
      </div>
    </>
  );
}
