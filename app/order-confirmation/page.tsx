import type { Metadata } from 'next';
import Header from '../../components/Header';
import Link from 'next/link';
import { CONTACT, whatsappTel } from '../../lib/contact';
import { getOrderById } from '../../lib/supabase/orders';
import { formatBdt } from '../../lib/format';

export const metadata: Metadata = {
  title: 'Order Confirmation',
  robots: { index: false, follow: false },
  alternates: { canonical: '/order-confirmation' },
};

// Cette page dépend de la commande réelle (?order=<id>) : jamais de rendu statique
// figé (l'ancien `FB-${Date.now()}` était gelé au build → toujours le même numéro).
export const dynamic = 'force-dynamic';

type Tone = 'success' | 'pending' | 'danger';

/**
 * État affiché en fonction du VRAI statut de paiement. On n'affiche « confirmé »
 * QUE si le paiement est réellement validé (payment_status = 'paye', ou la commande
 * a déjà avancé en confirmed/shipped/delivered). Tant que le paiement bKash est en
 * cours de vérification, on reste honnête : « reçue — vérification en cours ».
 */
function paymentView(order: Awaited<ReturnType<typeof getOrderById>>) {
  const ps = order?.payment_status;
  const st = order?.status ?? '';
  const method = order?.payment_method;

  const isPaid = ps === 'paye' || ['confirmed', 'shipped', 'delivered'].includes(st);

  if (isPaid) {
    return {
      tone: 'success' as Tone,
      eyebrow: 'Order confirmed',
      heading: 'Thank you for your order!',
      note: null as string | null,
    };
  }
  if (ps === 'refuse') {
    return {
      tone: 'danger' as Tone,
      eyebrow: 'Payment not validated',
      heading: 'We couldn’t validate your payment',
      note: 'We could not match your bKash payment for this order. Please contact us so we can help — do not ship or resend money before checking with us.',
    };
  }
  if (method === 'bkash' && ps === 'en_attente_paiement') {
    return {
      tone: 'pending' as Tone,
      eyebrow: 'Order received',
      heading: 'Complete your bKash payment',
      note: 'We haven’t received your payment yet. Send the exact amount via bKash and submit your TrxID to confirm your order. Your order is not confirmed until the payment is verified.',
    };
  }
  if (method === 'cod') {
    return {
      tone: 'success' as Tone,
      eyebrow: 'Order placed',
      heading: 'Thank you for your order!',
      note: 'You’ll pay on delivery. We’ll be in touch to arrange your order.',
    };
  }
  // bKash TrxID soumis → en cours de vérification (cas par défaut).
  return {
    tone: 'pending' as Tone,
    eyebrow: 'Order received',
    heading: 'We’re verifying your payment',
    note: 'Your order is placed and your bKash TrxID has been received. We’re checking it against the payment now — your order is not confirmed yet. You’ll get a confirmation email as soon as the payment is validated.',
  };
}

const TONE_STYLES: Record<Tone, { ring: string; icon: string; badge: string; path: string }> = {
  success: {
    ring: 'bg-green-100',
    icon: 'text-green-600',
    badge: 'bg-highlight text-accent',
    path: 'M5 13l4 4L19 7', // check
  },
  pending: {
    ring: 'bg-amber-100',
    icon: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-700',
    path: 'M12 8v4l3 3M12 3a9 9 0 100 18 9 9 0 000-18z', // clock
  },
  danger: {
    ring: 'bg-red-100',
    icon: 'text-red-600',
    badge: 'bg-red-50 text-red-700',
    path: 'M6 18L18 6M6 6l12 12', // x
  },
};

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const orderId = searchParams?.order;
  const order = orderId ? await getOrderById(orderId) : null;

  // Numéro réel FBD-YYMMDD-XXXXX (fallback propre si commande introuvable).
  const orderNumber = order?.order_number ?? '—';
  const view = paymentView(order);
  const tone = TONE_STYLES[view.tone];
  const isPaid = view.tone === 'success';

  return (
    <main className="min-h-screen bg-background text-text">
      <Header />
      <section className="mx-auto max-w-4xl px-6 py-20 md:px-8">
        <div className="rounded-[2.5rem] border border-charcoal/10 bg-white p-10 shadow-soft text-center">
          <div className="space-y-6">
            <div className={`mx-auto w-16 h-16 ${tone.ring} rounded-full flex items-center justify-center`}>
              <svg className={`w-8 h-8 ${tone.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tone.path} />
              </svg>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">{view.eyebrow}</p>
              <h1 className="text-4xl font-semibold text-black">{view.heading}</h1>
              <p className="text-lg text-charcoal/70">Order number: <span className="font-semibold text-black">{orderNumber}</span></p>
              {order && (
                <p className="text-sm text-charcoal/60">Total: <span className="font-semibold text-black">{formatBdt(order.total_bdt)}</span></p>
              )}
              {view.note && (
                <p className={`mx-auto max-w-md rounded-2xl px-4 py-3 text-sm font-medium ${tone.badge}`}>
                  {view.note}
                </p>
              )}
            </div>

            <div className="max-w-2xl mx-auto space-y-4 text-left bg-cream rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-black">What happens next?</h2>
              <div className="space-y-3 text-sm text-charcoal/80">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <p>
                    {isPaid
                      ? 'You will receive a confirmation email with your order details.'
                      : 'We verify your bKash payment, then send you a confirmation email. Your order is only confirmed after this step.'}
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <p>Once confirmed, your order is carefully prepared in our French warehouses.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p>Shipped from France with tracking, and delivered to your door in Bangladesh (2–3 weeks).</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-charcoal/90"
                >
                  Continue shopping
                </Link>
                <Link
                  href="/account"
                  className="inline-flex items-center justify-center rounded-full border border-charcoal/10 bg-white px-8 py-3 text-sm font-semibold text-black transition hover:border-black hover:bg-cream"
                >
                  View my orders
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-charcoal/10">
              <p className="text-sm text-charcoal/60">
                Questions? Contact our customer service at <a href={`tel:${whatsappTel}`} className="text-black hover:text-gold transition-colors">{CONTACT.whatsapp}</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
