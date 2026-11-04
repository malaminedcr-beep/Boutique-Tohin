import type { Metadata } from 'next';
import { categoryLabel, CATEGORIES } from '../../lib/categories';
import { getProducts, getAllBrands } from '../../lib/supabase/products';
import { pageMetadata } from '../../lib/seo';
import ShopClient from './shop-client';

export const dynamic = 'force-dynamic';

type ShopSearchParams = {
  category?: string;
  brand?: string;
  price?: string;
  sort?: string;
  gender?: string;
  q?: string;
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: ShopSearchParams;
}): Promise<Metadata> {
  const category = searchParams?.category;
  const brand = searchParams?.brand;
  const q = searchParams?.q?.trim();

  let title = 'Shop All Products';
  if (q) {
    title = `Search: ${q} — Shop`;
  } else if (category && CATEGORIES.some((c) => c.slug === category)) {
    title = `${categoryLabel(category)} — Shop`;
  } else if (brand && (await getAllBrands()).includes(brand)) {
    title = `${brand} — Shop`;
  }

  return pageMetadata({
    title,
    description:
      'Browse authentic French cosmetics from CeraVe, Vichy and Yves Rocher, delivered across Bangladesh.',
    path: '/shop',
  });
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: ShopSearchParams;
}) {
  const [products, brands] = await Promise.all([getProducts(), getAllBrands()]);

  // The URL is the source of truth: validate searchParams here (server) so the
  // initial render — and the JS-disabled HTML — reflect the active filters.
  // Groups are multi-select (comma-separated); only known values are kept.
  const VALID_PRICES = new Set(['0-2000', '2000-3000', '3000-99999']);
  const split = (v?: string) =>
    (v ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  const initial = {
    categories: split(searchParams?.category).filter((c) =>
      CATEGORIES.some((cat) => cat.slug === c),
    ),
    brands: split(searchParams?.brand).filter((b) => brands.includes(b)),
    prices: split(searchParams?.price).filter((p) => VALID_PRICES.has(p)),
    sort: searchParams?.sort ?? 'popular',
    gender: searchParams?.gender ?? '',
    q: searchParams?.q?.trim() ?? '',
  };

  return <ShopClient products={products} brands={brands} initial={initial} />;
}
