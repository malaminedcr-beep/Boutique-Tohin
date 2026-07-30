'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import { useCart } from '../../lib/cart-context';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

const fmt = (v: number) => `৳${v.toLocaleString('en-US')}`;

type PaymentMethod = 'cod' | 'bkash' | 'nagad';

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (state.items.length === 0) {
    return (
      <main className="min-h-screen bg-background text-text">
        <Header />
        <section className="mx-auto max-w-5xl px-6 py-20 md:px-8">
          <div className="rounded-[2.5rem] border border-charcoal/10 bg-white p-10 shadow-soft text-center space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">Checkout</p>
            <h1 className="text-4xl font-semibold text-black">Votre panier est vide</h1>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-charcoal/90"
            >
              Aller à la boutique
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
      // 1. Récupérer les produits Supabase pour mapper SKU → UUID
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, slug');

      if (productsError) throw productsError;

      const skuToId: Record<string, string> = {};
      if (products) {
        for (const item of state.items) {
          const prefix = item.sku.toLowerCase();
          const match = products.find(p => p.slug.startsWith(prefix));
          if (match) skuToId[item.sku] = match.id;
        }
      }

      // 2. Créer la commande
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          status: 'pending',
          payment_method: paymentMethod,
          payment_status: 'pending',
          total_bdt: state.total,
          shipping_address: formData,
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      // 3. Insérer les lignes de commande
      const orderItems = state.items
        .filter(item => skuToId[item.sku])
        .map(item => ({
          order_id: order.id,
          product_id: skuToId[item.sku],
          quantity: item.quantity,
          unit_price_bdt: item.priceBdt,
        }));

      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);
        if (itemsError) throw itemsError;
      }

      // 4. Succès
      clearCart();
      window.location.href = `/order-confirmation?order=${order.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue. Réessayez.');
      setIsProcessing(false);
    }
  };

  const btnLabel = () => {
    if (isProcessing) return 'Traitement…';
    if (paymentMethod === 'cod') return `Commander — ${fmt(state.total)}`;
    if (paymentMethod === 'bkash') return `Payer avec bKash — ${fmt(state.total)}`;
    return `Payer avec Nagad — ${fmt(state.total)}`;
  };

  const btnClass = () => {
    if (isProcessing) return 'bg-gray-400 cursor-not-allowed';
    if (paymentMethod === 'bkash') return 'bg-pink-600 hover:bg-pink-700';
    if (paymentMethod === 'nagad') return 'bg-orange-500 hover:bg-orange-600';
    return 'bg-black hover:bg-charcoal/90';
  };

  return (
    <main className="min-h-screen bg-background text-text">
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-20 md:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">Checkout</p>
            <h1 className="text-4xl font-semibold text-black">Finaliser ma commande</h1>
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
                <h2 className="text-lg font-semibold text-black mb-6">Informations de livraison</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-charcoal/70 mb-2">Prénom</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required
                      className="w-full rounded-lg border border-charcoal/20 px-4 py-3 text-sm focus:border-black focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal/70 mb-2">Nom</label>
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
                  <label className="block text-sm font-medium text-charcoal/70 mb-2">Téléphone</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required
                    placeholder="+880 1XX XXX XXXX"
                    className="w-full rounded-lg border border-charcoal/20 px-4 py-3 text-sm focus:border-black focus:outline-none" />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-charcoal/70 mb-2">Adresse</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} required rows={3}
                    className="w-full rounded-lg border border-charcoal/20 px-4 py-3 text-sm focus:border-black focus:outline-none" />
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-charcoal/70 mb-2">Ville</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} required
                      className="w-full rounded-lg border border-charcoal/20 px-4 py-3 text-sm focus:border-black focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-charcoal/70 mb-2">Code postal</label>
                    <input type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} required
                      className="w-full rounded-lg border border-charcoal/20 px-4 py-3 text-sm focus:border-black focus:outline-none" />
                  </div>
                </div>
              </div>

              {/* ── Paiement ── */}
              <div className="rounded-[2rem] border border-charcoal/10 bg-white p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-black mb-6">Paiement</h2>
                <div className="space-y-3">

                  {/* COD */}
                  <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${paymentMethod === 'cod' ? 'border-black bg-gray-50' : 'border-charcoal/20 hover:border-charcoal/40'}`}>
                    <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="h-4 w-4" />
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-stone-800 text-xs font-bold text-white">৳</div>
                    <div>
                      <div className="font-medium text-black">Cash on Delivery (COD)</div>
                      <div className="text-xs text-charcoal/60">Payez à la livraison</div>
                    </div>
                  </label>

                  {/* bKash */}
                  <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-charcoal/20 hover:border-charcoal/40'}`}>
                    <input type="radio" name="payment" value="bkash" checked={paymentMethod === 'bkash'} onChange={() => setPaymentMethod('bkash')} className="h-4 w-4" />
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-pink-600 text-sm font-bold text-white">b</div>
                    <div>
                      <div className="font-medium text-black">bKash</div>
                      <div className="text-xs text-charcoal/60">Mobile banking</div>
                    </div>
                  </label>

                  {/* Nagad */}
                  <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${paymentMethod === 'nagad' ? 'border-orange-400 bg-orange-50' : 'border-charcoal/20 hover:border-charcoal/40'}`}>
                    <input type="radio" name="payment" value="nagad" checked={paymentMethod === 'nagad'} onChange={() => setPaymentMethod('nagad')} className="h-4 w-4" />
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-orange-500 text-xs font-bold text-white">N</div>
                    <div>
                      <div className="font-medium text-black">Nagad</div>
                      <div className="text-xs text-charcoal/60">Mobile banking</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* ── Récapitulatif ── */}
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-charcoal/10 bg-white p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-black mb-4">Récapitulatif</h2>
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
                    <span className="text-charcoal/70">Sous-total</span>
                    <span className="font-medium text-black">{fmt(state.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/70">Livraison</span>
                    <span className="font-medium text-black">Gratuite</span>
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
                    Traitement…
                  </span>
                ) : btnLabel()}
              </button>

              <Link
                href="/cart"
                className="block w-full rounded-full border border-charcoal/10 bg-white px-6 py-4 text-center text-sm font-semibold text-black transition hover:border-black hover:bg-cream"
              >
                Retour au panier
              </Link>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
