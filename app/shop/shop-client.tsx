'use client';

import { useMemo, useState, useEffect } from 'react';
import ProductCard from '../../components/product/product-card';
import { CATEGORIES as CATEGORY_SOURCE, categoryLabel } from '../../lib/categories';
import type { Product } from '../../lib/commerce/types';

export type ShopInitialFilters = {
  categories: string[];
  brands: string[];
  prices: string[];
  sort: string;
  gender: string;
  q: string;
};

const CATEGORIES = CATEGORY_SOURCE.map((c) => ({ label: c.label, value: c.slug }));

const PRICE_RANGES = [
  { label: '৳0 – ৳2,000', value: '0-2000' },
  { label: '৳2,000 – ৳3,000', value: '2000-3000' },
  { label: '৳3,000+', value: '3000-99999' },
];

// Non-overlapping, half-open bounds [min, max) — a product falls in exactly one.
const PRICE_BOUNDS: Record<string, [number, number]> = {
  '0-2000': [0, 2000],
  '2000-3000': [2000, 3000],
  '3000-99999': [3000, Infinity],
};

const SORT_OPTIONS = [
  { label: 'Popular', value: 'popular' },
  { label: 'New Arrivals', value: 'new' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
];

// For/Gender → categories map (gender is URL-driven, no sidebar control).
const GENDER_CATEGORIES: Record<string, string[]> = {
  homme: ['body-care', 'deodorants'],
  femme: ['face-care', 'body-care', 'hair-care', 'deodorants'],
};

function inAnyPrice(price: number, ranges: string[]): boolean {
  if (ranges.length === 0) return true;
  return ranges.some((r) => {
    const [min, max] = PRICE_BOUNDS[r] ?? [0, Infinity];
    return price >= min && (max === Infinity ? true : price < max);
  });
}

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
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <span
        aria-hidden
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
  initial,
}: {
  products: Product[];
  brands: string[];
  initial: ShopInitialFilters;
}) {
  // Multi-select state (OR within a group, AND between groups). Initialised from
  // the URL-derived props so the server HTML and the first client render match.
  const [categories, setCategories] = useState<string[]>(initial.categories);
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initial.brands);
  const [prices, setPrices] = useState<string[]>(initial.prices);
  const [sort, setSort] = useState(initial.sort);
  const [gender] = useState(initial.gender);
  const [query] = useState(initial.q);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Keep the URL in sync WITHOUT a server round-trip (history API, not router) —
  // instant filtering client-side, shareable/bookmarkable URL, clean history.
  useEffect(() => {
    const params = new URLSearchParams();
    if (categories.length) params.set('category', categories.join(','));
    if (selectedBrands.length) params.set('brand', selectedBrands.join(','));
    if (prices.length) params.set('price', prices.join(','));
    if (sort !== 'popular') params.set('sort', sort);
    if (gender) params.set('gender', gender);
    if (query) params.set('q', query);
    const qs = params.toString();
    window.history.replaceState(null, '', qs ? `/shop?${qs}` : '/shop');
  }, [categories, selectedBrands, prices, sort, gender, query]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const genderCats = gender ? GENDER_CATEGORIES[gender] : null;
    const base = products.filter((p) => {
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      const matchesGender = !genderCats || genderCats.includes(p.category);
      const matchesCategory = categories.length === 0 || categories.includes(p.category);
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
      const matchesPrice = inAnyPrice(p.priceBdt, prices);
      return matchesQuery && matchesGender && matchesCategory && matchesBrand && matchesPrice;
    });
    if (sort === 'price-asc') return [...base].sort((a, b) => a.priceBdt - b.priceBdt);
    if (sort === 'price-desc') return [...base].sort((a, b) => b.priceBdt - a.priceBdt);
    if (sort === 'new') {
      return [...base].sort((a, b) => (b.badge === 'new' ? 1 : 0) - (a.badge === 'new' ? 1 : 0));
    }
    return base;
  }, [products, query, gender, categories, selectedBrands, prices, sort]);

  const activeHeading = query
    ? `Search: “${query}”`
    : categories.length === 1 && selectedBrands.length === 0
    ? categoryLabel(categories[0])
    : selectedBrands.length === 1 && categories.length === 0
    ? selectedBrands[0]
    : 'All Products';

  const hasActiveFilters =
    categories.length > 0 ||
    selectedBrands.length > 0 ||
    prices.length > 0 ||
    sort !== 'popular' ||
    !!query ||
    !!gender;

  function clearAll() {
    setCategories([]);
    setSelectedBrands([]);
    setPrices([]);
    setSort('popular');
    // gender & query are URL-seeded and read-only in the UI; clearing the
    // checkbox groups + sort is the "reset" the sidebar controls expose.
  }

  function toggle(list: string[], setList: (v: string[]) => void, value: string) {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  /* ── sidebar inner content (rendered in both desktop & drawer) ── */
  function renderSidebar() {
    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className="pb-4 border-b border-hairline">
          <h2 className="text-[13px] font-bold uppercase tracking-[0.18em] text-ink">
            {activeHeading}
          </h2>
          <p className="mt-1 text-[11px] text-muted">
            Showing {filteredProducts.length} Products
          </p>
        </div>

        {/* Sort */}
        <div className="py-4 border-b border-hairline">
          <SectionTitle>Sort by</SectionTitle>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full cursor-pointer rounded border border-hairline bg-white px-3 py-2 text-[12px] text-ink transition-colors focus:border-accent focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div className="py-4 border-b border-hairline">
          <SectionTitle>Price</SectionTitle>
          {PRICE_RANGES.map((r) => (
            <CheckRow
              key={r.value}
              label={r.label}
              checked={prices.includes(r.value)}
              onChange={() => toggle(prices, setPrices, r.value)}
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
              checked={categories.includes(cat.value)}
              onChange={() => toggle(categories, setCategories, cat.value)}
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
              checked={selectedBrands.includes(brand)}
              onChange={() => toggle(selectedBrands, setSelectedBrands, brand)}
            />
          ))}
        </div>

        {/* Clear all */}
        <div className="pt-5">
          <button
            onClick={clearAll}
            disabled={!hasActiveFilters}
            className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.18em] text-accent transition-colors hover:underline disabled:cursor-default disabled:text-muted disabled:no-underline"
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
            {/* Apply/close — mobile convenience */}
            <button
              onClick={() => setDrawerOpen(false)}
              className="mt-6 w-full border border-ink bg-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-accent hover:border-accent"
            >
              Show {filteredProducts.length} Products
            </button>
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
          <div className="mb-6 flex items-end justify-between gap-4">
            <h1 className="font-serif text-2xl text-ink md:text-3xl">{activeHeading}</h1>
            <p className="shrink-0 text-[11px] uppercase tracking-[0.2em] text-muted hidden md:block">
              Showing {filteredProducts.length} Products
            </p>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-lg border border-hairline bg-white p-16 text-center">
              <p className="font-serif text-xl italic text-ink">No products found</p>
              <p className="mt-3 text-sm text-muted">Try adjusting or clearing your filters.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearAll}
                  className="mt-5 inline-flex cursor-pointer items-center border border-ink px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-ink hover:text-white"
                >
                  Clear all filters
                </button>
              )}
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
