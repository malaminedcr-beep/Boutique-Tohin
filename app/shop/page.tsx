import type { Metadata } from 'next';
import { categoryLabel, CATEGORIES } from '../../lib/categories';
import { getProducts, getAllBrands } from '../../lib/pocketbase/products';
import { pageMetadata } from '../../lib/seo';
import ShopClient from './shop-client';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { category?: string; brand?: string };
}): Promise<Metadata> {
  const category = searchParams?.category;
  const brand = searchParams?.brand;

  let title = 'Shop All Products';
  if (category && CATEGORIES.some((c) => c.slug === category)) {
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

export default async function ShopPage() {
  const [products, brands] = await Promise.all([getProducts(), getAllBrands()]);
  return <ShopClient products={products} brands={brands} />;
}
