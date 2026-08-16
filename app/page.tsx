import Link from 'next/link';
import Hero from '../components/home/hero';
import CategoryArches from '../components/home/category-arches';
import PromoBanner from '../components/home/promo-banner';
import ProductCard from '../components/product/product-card';
import { getProducts } from '../lib/pocketbase/products';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await getProducts();
  const bestSellers = products.filter((p) => p.badge === 'bestseller').slice(0, 10);
  const newArrivals = products.filter((p) => p.badge === 'new').slice(0, 10);

  return (
    <main className="bg-canvas text-ink">
      {/* Section 1 — Hero */}
      <Hero />

      {/* Section 2 — Best Sellers */}
      <section className="py-16 bg-canvas">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          {/* Heading */}
          <div className="mb-10 text-center">
            <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-muted">Most loved</p>
            <h2 className="font-serif text-3xl uppercase tracking-widest text-ink">
              Best Sellers
            </h2>
          </div>

          {/* Product Grid — 5 cols desktop / 2 cols mobile */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/shop"
              className="inline-flex cursor-pointer items-center gap-2 rounded border border-hairline px-8 py-3 text-[11px] uppercase tracking-[0.2em] text-ink transition-colors hover:border-accent hover:text-accent"
            >
              Shop all products
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3 — Categories en Arches */}
      <CategoryArches />

      {/* Section 4 — New Arrivals */}
      <section className="py-16 bg-canvas">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          {/* Heading */}
          <div className="mb-10 text-center">
            <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-muted">Just arrived</p>
            <h2 className="font-serif text-3xl uppercase tracking-widest text-ink">
              New Arrivals
            </h2>
          </div>

          {/* Product Grid — 5 cols desktop / 2 cols mobile */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/shop"
              className="inline-flex cursor-pointer items-center gap-2 rounded border border-hairline px-8 py-3 text-[11px] uppercase tracking-[0.2em] text-ink transition-colors hover:border-accent hover:text-accent"
            >
              View all products
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 5 — Promo Banner (Featured) */}
      <PromoBanner />
    </main>
  );
}
