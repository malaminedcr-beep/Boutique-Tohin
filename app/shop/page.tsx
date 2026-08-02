import type { Metadata } from 'next';
import { categoryLabel, CATEGORIES } from '../../lib/categories';
import { getAllBrands } from '../../lib/commerce/mock';
import { pageMetadata } from '../../lib/seo';
import ShopClient from './shop-client';

export function generateMetadata({
  searchParams,
}: {
  searchParams: { category?: string; brand?: string };
}): Metadata {
  const category = searchParams?.category;
  const brand = searchParams?.brand;

  let title = 'Shop All Products';
  if (category && CATEGORIES.some((c) => c.slug === category)) {
    title = `${categoryLabel(category)} — Shop`;
  } else if (brand && getAllBrands().includes(brand)) {
    title = `${brand} — Shop`;
  }

  return pageMetadata({
    title,
    description:
      'Browse authentic French cosmetics from CeraVe, Vichy and Yves Rocher, delivered across Bangladesh.',
    path: '/shop',
  });
}

export default function ShopPage() {
  return <ShopClient />;
}
