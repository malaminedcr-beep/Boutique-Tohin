'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import { useCart } from '../../lib/cart-context';
import { useState } from 'react';
import { formatBdt as fmt } from '../../lib/format';
import PaymentPopup from '../../components/checkout/PaymentPopup';

type PaymentMethod = 'cod' | 'bkash' | 'nagad';

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
  });
  // bKash est la seule méthode de paiement.
  const paymentMethod: PaymentMethod = 'bkash';
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Popup bKash (paiement manuel) : ouverte après création de la commande.
  const [bkashOrder, setBkashOrder] = useState<{
    orderId: string;
    orderNumber: string;
    total: number;
  } | null>(null);

  if (state.items.length === 0) {
    return (
      <main className="min-h-screen bg-background text-text">
        <Header />
        <section className="mx-auto max-w-5xl px-6 py-20 md:px-8">
          <div className="rounded-[2.5rem] border border-charcoal/10 bg-white p-10 shadow-soft text-center space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">Checkout</p>
            <h1 className="text-4xl font-semibold text-black">Your cart is empty</h1>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-charcoal/90"
            >
              Go to shop
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      // Send ONLY identifiers + quantities. Prices and the total are
      // recomputed server-side in /api/orders — never trusted from the client.
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: state.items.map(item => ({ sku: item.sku, quantity: item.quantity })),
          paymentMethod,
          shippingAddress: formData,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result?.error ?? 'Something went wrong. Please try again.');

      // bKash manuel : on garde le panier et on ouvre la popup pour le TrxID.
      // Le panier n'est vidé qu'après soumission réussie du paiement.
      if (paymentMethod === 'bkash') {
        setBkashOrder({
          orderId: result.orderId,
          orderNumber: result.orderNumber,
          total: result.total ?? state.total,
        });
        setIsProcessing(false);
        return;
      }

      clearCart();
      window.location.href = `/order-confirmation?order=${result.orderId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  const btnLabel = () =>
    isProcessing ? 'Processing…' : `Pay with bKash — ${fmt(state.total)}`;

  const btnClass = () =>
    isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-700';

  return (
    <main className="min-h-screen bg-background text-text">
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-20 md:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">Checkout</p>
            <h1 className="text-4xl font-semibold text-black">Complete your order</h1>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">

            {/* ── Livraison ── */}
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-charcoal/10 bg-white p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-black mb-6">Shipping information</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-charcoal/70 mb-2">First name</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required
                      className="w-full rounded-lg border border-charcoal/20 px-4 py-3 text-sm focus:border-black focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal/70 mb-2">Last name</label>
                    <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required
                      className="w-full rounded-lg border border-charcoal/20 px-4 py-3 text-sm focus:border-black focus:outline-none" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-charcoal/70 mb-2">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} required
                    className="w-full rounded-lg border border-charcoal/20 px-4 py-3 text-sm focus:border-black focus:outline-none" />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-charcoal/70 mb-2">Phone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                    placeholder="+880 1XX XXX XXXX"
                    className="w-full rounded-lg border border-charcoal/20 px-4 py-3 text-sm focus:border-black focus:outline-none" />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-charcoal/70 mb-2">Address</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} required rows={3}
                    className="w-full rounded-lg border border-charcoal/20 px-4 py-3 text-sm focus:border-black focus:outline-none" />
                </div>
              </div>

              {/* ── Paiement ── */}
              <div className="rounded-[2rem] border border-charcoal/10 bg-white p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-black mb-6">Payment</h2>

                {/* bKash — seule méthode de paiement, sélectionnée par défaut */}
                <div className="flex items-center gap-3 rounded-xl border border-pink-500 bg-pink-50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-pink-600 text-sm font-bold text-white">b</div>
                  <div>
                    <div className="font-medium text-black">bKash</div>
                    <div className="text-xs text-charcoal/60">Mobile banking</div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Récapitulatif ── */}
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-charcoal/10 bg-white p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-black mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-charcoal/70">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-black">{fmt(item.priceBdt * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-charcoal/10 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/70">Subtotal</span>
                    <span className="font-medium text-black">{fmt(state.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/70">Delivery</span>
                    <span className="font-medium text-black">Free</span>
                  </div>
                  <div className="border-t border-charcoal/10 pt-2 flex justify-between text-lg font-semibold">
                    <span className="text-black">Total</span>
                    <span className="text-black">{fmt(state.total)}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`w-full rounded-full px-6 py-4 text-center text-sm font-semibold text-white transition ${btnClass()}`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing…
                  </span>
                ) : btnLabel()}
              </button>

              <Link
                href="/cart"
                className="block w-full rounded-full border border-charcoal/10 bg-white px-6 py-4 text-center text-sm font-semibold text-black transition hover:border-black hover:bg-cream"
              >
                Back to cart
              </Link>
            </div>
          </form>
        </div>
      </section>

      {bkashOrder && (
        <PaymentPopup
          open
          orderId={bkashOrder.orderId}
          orderNumber={bkashOrder.orderNumber}
          totalBdt={bkashOrder.total}
          onClose={() => setBkashOrder(null)}
          onSuccess={() => {
            const id = bkashOrder.orderId;
            clearCart();
            window.location.href = `/order-confirmation?order=${id}`;
          }}
        />
      )}
    </main>
  );
}
