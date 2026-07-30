import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { Order } from '../../lib/types/orders';

const ACCENT = '#C9513A';
const DARK = '#1A1614';
const MUTED = '#7A7068';
const HAIRLINE = '#E8E2D9';
const LIGHT = '#FBF8F5';
const WHITE = '#FFFFFF';

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: DARK,
    backgroundColor: WHITE,
    padding: 18,
  },
  // ── Header ──────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: ACCENT,
    borderBottomStyle: 'solid',
  },
  brandName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
    letterSpacing: 0.8,
  },
  brandSub: {
    fontSize: 6,
    color: MUTED,
    marginTop: 2,
  },
  orderMeta: {
    alignItems: 'flex-end',
  },
  orderLabel: {
    fontSize: 6,
    color: MUTED,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  orderNum: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  orderDate: {
    fontSize: 6.5,
    color: MUTED,
    marginTop: 2,
  },
  // ── Adresse ─────────────────────────────────
  sectionLabel: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: MUTED,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  section: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: HAIRLINE,
    borderBottomStyle: 'solid',
  },
  customerName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 3,
  },
  detail: {
    fontSize: 7.5,
    color: DARK,
    lineHeight: 1.5,
  },
  detailMuted: {
    fontSize: 7,
    color: MUTED,
  },
  // ── Table produits ───────────────────────────
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: LIGHT,
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderTopWidth: 0.5,
    borderTopColor: HAIRLINE,
    borderTopStyle: 'solid',
    borderBottomWidth: 0.5,
    borderBottomColor: HAIRLINE,
    borderBottomStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: HAIRLINE,
    borderBottomStyle: 'solid',
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingHorizontal: 6,
    paddingVertical: 5,
    backgroundColor: LIGHT,
    borderBottomWidth: 0.5,
    borderBottomColor: HAIRLINE,
    borderBottomStyle: 'solid',
  },
  colProduct: { flex: 3 },
  colQty: { width: 22, textAlign: 'center' },
  colPrice: { width: 48, textAlign: 'right' },
  colTotal: { width: 48, textAlign: 'right' },
  thText: {
    fontSize: 6.5,
    fontFamily: 'Helvetica-Bold',
    color: MUTED,
  },
  tdText: {
    fontSize: 7.5,
    color: DARK,
  },
  tdBrand: {
    fontSize: 6,
    color: MUTED,
  },
  // ── Total ────────────────────────────────────
  totalBlock: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  totalInner: {
    width: 140,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  totalLabel: {
    fontSize: 7.5,
    color: MUTED,
  },
  totalValue: {
    fontSize: 7.5,
    color: DARK,
  },
  totalFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: DARK,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  totalFinalLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
  },
  totalFinalValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: ACCENT,
  },
  // ── Paiement + statut ───────────────────────
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    alignItems: 'center',
  },
  badgePayment: {
    backgroundColor: ACCENT,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
  },
  badgePaymentText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
    letterSpacing: 0.5,
  },
  badgeStatus: {
    borderWidth: 0.5,
    borderColor: HAIRLINE,
    borderStyle: 'solid',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
  },
  badgeStatusText: {
    fontSize: 7,
    color: MUTED,
  },
  // ── Footer ──────────────────────────────────
  footer: {
    marginTop: 14,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: HAIRLINE,
    borderTopStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 6,
    color: MUTED,
  },
  footerBold: {
    fontSize: 6,
    fontFamily: 'Helvetica-Bold',
    color: MUTED,
  },
});

const fmt = (n: number) => `৳${n.toLocaleString('en-US')}`;

const SHORT_ID = (id: string) => id.split('-')[0].toUpperCase();

const FORMAT_DATE = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: 'COD',
  bkash: 'bKash',
  nagad: 'Nagad',
};

export default function OrderSlipPDF({ order }: { order: Order }) {
  const addr = order.shipping_address;
  const items = order.order_items ?? [];
  const subtotal = items.reduce((s, i) => s + i.unit_price_bdt * i.quantity, 0);

  return (
    <Document
      title={`Bon-${SHORT_ID(order.id)}`}
      author="French Beauty BD"
    >
      <Page size="A6" style={s.page}>

        {/* ── HEADER ── */}
        <View style={s.header}>
          <View>
            <Text style={s.brandName}>FRENCH BEAUTY BD</Text>
            <Text style={s.brandSub}>Cosmétiques français · Bangladesh</Text>
          </View>
          <View style={s.orderMeta}>
            <Text style={s.orderLabel}>BON DE COMMANDE</Text>
            <Text style={s.orderNum}>#{SHORT_ID(order.id)}</Text>
            <Text style={s.orderDate}>{FORMAT_DATE(order.created_at)}</Text>
          </View>
        </View>

        {/* ── ADRESSE LIVRAISON ── */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>LIVRER À</Text>
          <Text style={s.customerName}>{addr.firstName} {addr.lastName}</Text>
          <Text style={s.detail}>{addr.phone}</Text>
          <Text style={s.detail}>{addr.address}</Text>
          <Text style={s.detail}>{addr.city}{addr.postalCode ? `, ${addr.postalCode}` : ''} · Bangladesh</Text>
          {addr.email ? <Text style={s.detailMuted}>{addr.email}</Text> : null}
        </View>

        {/* ── TABLE PRODUITS ── */}
        <View>
          <Text style={s.sectionLabel}>PRODUITS</Text>
          <View style={s.tableHeader}>
            <Text style={[s.thText, s.colProduct]}>Produit</Text>
            <Text style={[s.thText, s.colQty]}>Qté</Text>
            <Text style={[s.thText, s.colPrice]}>Prix unit.</Text>
            <Text style={[s.thText, s.colTotal]}>Sous-total</Text>
          </View>
          {items.map((item, idx) => (
            <View key={item.id} style={idx % 2 === 1 ? s.tableRowAlt : s.tableRow}>
              <View style={s.colProduct}>
                <Text style={s.tdText}>{item.product?.name ?? '—'}</Text>
                <Text style={s.tdBrand}>{item.product?.brand ?? ''}</Text>
              </View>
              <Text style={[s.tdText, s.colQty]}>{item.quantity}</Text>
              <Text style={[s.tdText, s.colPrice]}>{fmt(item.unit_price_bdt)}</Text>
              <Text style={[s.tdText, s.colTotal]}>{fmt(item.unit_price_bdt * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* ── TOTAL ── */}
        <View style={s.totalBlock}>
          <View style={s.totalInner}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Sous-total</Text>
              <Text style={s.totalValue}>{fmt(subtotal)}</Text>
            </View>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Livraison</Text>
              <Text style={s.totalValue}>Gratuite</Text>
            </View>
            <View style={s.totalFinalRow}>
              <Text style={s.totalFinalLabel}>TOTAL</Text>
              <Text style={s.totalFinalValue}>{fmt(order.total_bdt)}</Text>
            </View>
          </View>
        </View>

        {/* ── PAIEMENT + STATUT ── */}
        <View style={s.badges}>
          <View style={s.badgePayment}>
            <Text style={s.badgePaymentText}>{PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</Text>
          </View>
          <View style={s.badgeStatus}>
            <Text style={s.badgeStatusText}>{STATUS_LABELS[order.status] ?? order.status}</Text>
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={s.footer}>
          <Text style={s.footerBold}>frenchbeautybd.com</Text>
          <Text style={s.footerText}>Cosmétiques authentiques • Livraison Bangladesh</Text>
          <Text style={s.footerText}>ID: {order.id.substring(0, 8)}</Text>
        </View>

      </Page>
    </Document>
  );
}
