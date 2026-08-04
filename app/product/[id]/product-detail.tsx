'use client';

import Header from '../../../components/Header';
import Link from 'next/link';
import type { Product } from '../../../lib/commerce/types';
import { useCart } from '../../../lib/cart-context';
import { useState, useEffect, useCallback } from 'react';
import { formatBdt } from '../../../lib/format';
import {
  PRODUCT_CATEGORY_DESCRIPTIONS,
  PRODUCT_DESCRIPTION_FALLBACK,
} from '../../../lib/i18n/strings';

const getDescription = (product: Product) =>
  product.name +
  ' - ' +
  (PRODUCT_CATEGORY_DESCRIPTIONS[product.category] ?? PRODUCT_DESCRIPTION_FALLBACK);

export default function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];
  const activeImage = images[activeIndex];

  const prev = useCallback(() => setActiveIndex(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActiveIndex(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, prev, next]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        sku: product.sku,
        name: product.name,
        brand: product.brand,
        volume: product.volume,
        priceEur: product.priceEur,
        priceBdt: product.priceBdt,
        image: product.image,
      });
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <main className="min-h-screen bg-background text-text">
      <Header />

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white text-lg hover:bg-white/30 transition"
          >
            ✕
          </button>

          <div className="relative flex items-center gap-4 px-4" onClick={e => e.stopPropagation()}>
            {images.length > 1 && (
              <button
                onClick={prev}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-black text-2xl shadow hover:bg-white transition"
              >
                ‹
              </button>
            )}

            <div className="relative">
              <img
                src={activeImage}
                alt={product.name}
                className="max-h-[80vh] max-w-[80vw] rounded-2xl object-contain shadow-2xl"
              />
              {images.length > 1 && (
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                  {activeIndex + 1} / {images.length}
                </span>
              )}
            </div>

            {images.length > 1 && (
              <button
                onClick={next}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-black text-2xl shadow hover:bg-white transition"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}

      <section className="mx-auto max-w-6xl px-6 py-20 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="space-y-8">
            <div className="rounded-[2.5rem] border border-charcoal/10 bg-white p-8 shadow-sm">
              <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="space-y-4">
                  <button
                    onClick={() => setLightboxOpen(true)}
                    className="block w-full overflow-hidden rounded-[2rem] border border-black/10 bg-cream cursor-zoom-in"
                  >
                    <img
                      src={activeImage}
                      alt={product.name}
                      className="w-full aspect-square object-cover"
                    />
                  </button>

                  {images.length > 1 && (
                    <div className="flex gap-3 justify-center flex-wrap">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveIndex(i)}
                          className={`overflow-hidden rounded-xl border-2 p-0.5 transition ${activeIndex === i ? 'border-black' : 'border-transparent hover:border-charcoal/30'}`}
                        >
                          <img src={img} alt={`${product.name} view ${i + 1}`} className="h-14 w-14 rounded-lg object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">{product.brand}</p>
                    <h1 className="text-4xl font-semibold text-black">{product.name}</h1>
                    <p className="text-sm uppercase tracking-[0.3em] text-charcoal/70">{product.volume}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-3xl font-semibold text-black">{formatBdt(product.priceBdt)}</p>
                    <p className="text-sm leading-7 text-charcoal/75">{getDescription(product)}</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-charcoal/70">Details</p>
                    <ul className="space-y-2 text-sm leading-7 text-charcoal/75">
                      <li>Category: {product.category.replace('-', ' ')}</li>
                      <li>Product reference: {product.sku}</li>
                      <li>Brand: {product.brand}</li>
                      <li>Volume: {product.volume}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full border border-charcoal/10 bg-white px-6 py-3 text-center text-sm font-semibold text-black transition hover:border-black hover:bg-cream"
              >
                Back to shop
              </Link>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-charcoal/20 bg-white text-sm font-medium text-charcoal hover:border-charcoal/40"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-charcoal/20 bg-white text-sm font-medium text-charcoal hover:border-charcoal/40"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition ${
                    addedToCart ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-charcoal/90'
                  }`}
                >
                  {addedToCart ? 'Added!' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>

          <aside className="space-y-6 rounded-[2.5rem] border border-charcoal/10 bg-white p-8 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-black">Additional details</h2>
              <p className="mt-3 text-sm leading-7 text-charcoal/75">
                Every product is selected to offer a premium cosmetic experience, tailored to the specific needs of Bangladesh.
              </p>
            </div>
            <div className="space-y-4 rounded-3xl bg-cream p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">Service</p>
              <ul className="space-y-3 text-sm leading-7 text-charcoal/75">
                <li>Secure and fast delivery.</li>
                <li>After-sales support available.</li>
                <li>Easy returns if needed.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
