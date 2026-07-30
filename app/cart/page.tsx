'use client';

import Header from '../../components/Header';
import Link from 'next/link';
import { useCart } from '../../lib/cart-context';

const formatPrice = (value: number) => `৳${value.toLocaleString('en-US')}`;

export default function CartPage() {
  const { state, removeItem, updateQuantity, clearCart } = useCart();

  if (state.items.length === 0) {
    return (
      <main className="min-h-screen bg-background text-text">
        <Header />
        <section className="mx-auto max-w-5xl px-6 py-20 md:px-8">
          <div className="rounded-[2.5rem] border border-charcoal/10 bg-white p-10 shadow-soft">
            <div className="space-y-6 text-center">
              <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">Panier</p>
              <h1 className="text-4xl font-semibold text-black">Votre panier est vide</h1>
              <p className="max-w-2xl mx-auto text-base leading-7 text-charcoal/80">
                Ajoutez un produit à votre panier pour voir votre sélection ici. La boutique propose des soins visage, corps et parfums authentiques importés de France.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-charcoal/90"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-text">
      <Header />
      <section className="mx-auto max-w-6xl px-6 py-20 md:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">Panier</p>
            <h1 className="text-4xl font-semibold text-black">Votre sélection</h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.5fr]">
            {/* Cart Items */}
            <div className="space-y-6">
              {state.items.map((item) => (
                <div key={item.id} className="rounded-[2rem] border border-charcoal/10 bg-white p-6 shadow-soft">
                  <div className="flex gap-6">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[1rem] border border-black/10 bg-cream text-2xl font-serif italic text-charcoal">
                      {item.brand.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-serif text-lg text-black">{item.name}</h3>
                          <p className="text-sm text-charcoal/70">{item.brand} • {item.volume}</p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-charcoal/50 hover:text-red-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-charcoal/20 bg-white text-sm font-medium text-charcoal hover:border-charcoal/40"
                            >
                              -
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-charcoal/20 bg-white text-sm font-medium text-charcoal hover:border-charcoal/40"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-sm text-charcoal/70">× {formatPrice(item.priceBdt)}</span>
                        </div>
                        <span className="font-semibold text-black">{formatPrice(item.priceBdt * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-charcoal/10 bg-white p-6 shadow-soft">
                <h2 className="text-lg font-semibold text-black mb-4">Récapitulatif</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/70">Sous-total ({state.itemCount} article{state.itemCount > 1 ? 's' : ''})</span>
                    <span className="font-medium text-black">{formatPrice(state.total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-charcoal/70">Livraison</span>
                    <span className="font-medium text-black">Gratuite</span>
                  </div>
                  <div className="border-t border-charcoal/10 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-black">Total</span>
                      <span className="text-black">{formatPrice(state.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="block w-full rounded-full bg-black px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-charcoal/90"
                >
                  Procéder au paiement
                </Link>
                <Link
                  href="/shop"
                  className="block w-full rounded-full border border-charcoal/10 bg-white px-6 py-4 text-center text-sm font-semibold text-black transition hover:border-black hover:bg-cream"
                >
                  Continuer mes achats
                </Link>
                <button
                  onClick={clearCart}
                  className="block w-full rounded-full border border-red-200 bg-white px-6 py-4 text-center text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
                >
                  Vider le panier
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
