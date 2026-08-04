'use client';

import { useMemo, useState, useEffect } from 'react';
import ProductCard from '../../components/product/product-card';
import { CATEGORIES as CATEGORY_SOURCE } from '../../lib/categories';
import { filterProducts } from '../../lib/commerce/filter';
import type { Product } from '../../lib/commerce/types';

const CATEGORIES = CATEGORY_SOURCE.map((c) => ({ label: c.label, value: c.slug }));

const PRICE_RANGES = [
  { label: '৳0 – ৳2,000', value: '0-2000' },
  { label: '৳2,000 – ৳3,000', value: '2000-3000' },
  { label: '৳3,000+', value: '3000-99999' },
];

const SORT_OPTIONS = [
  { label: 'Popular', value: 'popular' },
  { label: 'New Arrivals', value: 'new' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

/* ── small helpers ── */

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted">
      {children}
    </p>
  );
}

function CheckRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 py-[5px]">
      <span
        className="flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[3px] border transition-colors duration-150"
        style={{
          borderColor: checked ? '#C9513A' : '#D4CECC',
          backgroundColor: checked ? '#C9513A' : 'transparent',
        }}
      >
        {checked && (
          <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span className="text-[12px] text-ink transition-colors group-hover:text-accent">
        {label}
      </span>
    </label>
  );
}

/* ── main client ── */

export default function ShopClient({
  products,
  brands,
}: {
  products: Product[];
  brands: string[];
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedSort, setSelectedSort] = useState('popular');
  const [genderQuery, setGenderQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setGenderQuery(params.get('gender') ?? '');
    const cat = params.get('category') ?? '';
    if (cat && CATEGORIES.some((c) => c.value === cat)) setSelectedCategory(cat);
    const brand = params.get('brand') ?? '';
    if (brand && brands.includes(brand)) setSelectedBrand(brand);
  }, [brands]);

  const filteredProducts = useMemo(() => {
    const base = filterProducts(products, {
      gender: genderQuery,
      category: selectedCategory,
      brand: selectedBrand,
      price: selectedPrice,
    });
    if (selectedSort === 'price-asc') return [...base].sort((a, b) => a.priceBdt - b.priceBdt);
    if (selectedSort === 'price-desc') return [...base].sort((a, b) => b.priceBdt - a.priceBdt);
    if (selectedSort === 'new') return base.filter((p) => p.badge === 'new');
    return base;
  }, [products, genderQuery, selectedCategory, selectedBrand, selectedPrice, selectedSort]);

  const activeCategoryLabel =
    CATEGORIES.find((c) => c.value === selectedCategory)?.label ?? 'All Products';

  function clearAll() {
    setSelectedCategory('all');
    setSelectedBrand('');
    setSelectedPrice('all');
    setSelectedSort('popular');
    setGenderQuery('');
  }

  function toggleCategory(value: string) {
    setSelectedCategory((prev) => (prev === value ? 'all' : value));
  }
  function togglePrice(value: string) {
    setSelectedPrice((prev) => (prev === value ? 'all' : value));
  }
  function toggleBrand(value: string) {
    setSelectedBrand((prev) => (prev === value ? '' : value));
  }

  /* ── sidebar inner content (rendered in both desktop & drawer) ── */
  function renderSidebar() {
    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="pb-4 border-b border-hairline">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.18em] text-ink">
            {activeCategoryLabel}
          </h2>
          <p className="mt-1 text-[11px] text-muted">
            Showing {filteredProducts.length} Products
          </p>
        </div>

        {/* Sort */}
        <div className="py-4 border-b border-hairline">
          <SectionTitle>Sort by</SectionTitle>
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="w-full cursor-pointer rounded border border-hairline bg-white px-3 py-2 text-[12px] text-ink transition-colors focus:border-accent focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Availability */}
        <div className="py-4 border-b border-hairline">
          <SectionTitle>Availability</SectionTitle>
          <CheckRow label="In Stock" checked={true} onChange={() => {}} />
          <CheckRow label="Out of Stock" checked={false} onChange={() => {}} />
        </div>

        {/* Price */}
        <div className="py-4 border-b border-hairline">
          <SectionTitle>Price</SectionTitle>
          {PRICE_RANGES.map((r) => (
            <CheckRow
              key={r.value}
              label={r.label}
              checked={selectedPrice === r.value}
              onChange={() => togglePrice(r.value)}
            />
          ))}
        </div>

        {/* Category */}
        <div className="py-4 border-b border-hairline">
          <SectionTitle>Category</SectionTitle>
          {CATEGORIES.map((cat) => (
            <CheckRow
              key={cat.value}
              label={cat.label}
              checked={selectedCategory === cat.value}
              onChange={() => toggleCategory(cat.value)}
            />
          ))}
        </div>

        {/* Brand */}
        <div className="py-4 border-b border-hairline">
          <SectionTitle>Brand</SectionTitle>
          {brands.map((brand) => (
            <CheckRow
              key={brand}
              label={brand}
              checked={selectedBrand === brand}
              onChange={() => toggleBrand(brand)}
            />
          ))}
        </div>

        {/* Clear all */}
        <div className="pt-5">
          <button
            onClick={clearAll}
            className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.18em] text-accent transition-colors hover:underline"
          >
            Clear all
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">

      {/* ── Mobile: top bar with Filters button ── */}
      <div className="flex items-center justify-between border-b border-hairline bg-surface px-5 py-3 md:hidden">
        <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
          {filteredProducts.length} Products
        </p>
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex cursor-pointer items-center gap-2 rounded border border-hairline px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-ink transition-colors hover:border-accent hover:text-accent"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 4h18M6 10h12M9 16h6" />
          </svg>
          Filters
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setDrawerOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
          {/* Panel */}
          <aside
            className="absolute bottom-0 left-0 top-0 w-[280px] overflow-y-auto bg-white px-5 py-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink">
                Filters
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="cursor-pointer text-muted transition-colors hover:text-ink"
                aria-label="Close filters"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {renderSidebar()}
          </aside>
        </div>
      )}

      {/* ── Desktop: 2-column layout ── */}
      <div className="mx-auto flex max-w-7xl">

        {/* Sidebar (desktop only) */}
        <aside className="hidden w-[260px] shrink-0 border-r border-hairline bg-white md:block">
          <div
            className="sticky overflow-y-auto px-6 py-8"
            style={{ top: 0, maxHeight: '100vh' }}
          >
            {renderSidebar()}
          </div>
        </aside>

        {/* Product area */}
        <div className="flex-1 min-w-0 px-5 py-8 md:px-8">
          {/* Top bar */}
          <div className="mb-6 flex items-center justify-end">
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted hidden md:block">
              {filteredProducts.length} Products
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-lg border border-hairline bg-white p-16 text-center">
              <p className="font-serif text-xl italic text-ink">No products found</p>
              <p className="mt-3 text-sm text-muted">Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
