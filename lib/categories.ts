/**
 * Single source of truth for product categories.
 * Consumed by the navbar, footer, shop filters, homepage arches and product
 * cards. Every slug here MUST exist in the catalogue (data/products.json /
 * PocketBase `products.category`) — no phantom categories that lead to an empty
 * shop.
 */
export type Category = {
  slug: string;
  label: string;
  /** Theme colors for the homepage "Shop by Category" tiles. */
  bg: string;
  color: string;
};

export const CATEGORIES: Category[] = [
  { slug: 'face-care', label: 'Skincare', bg: '#FFDDD6', color: '#C9513A' },
  { slug: 'hair-care', label: 'Haircare', bg: '#DCF0DC', color: '#2D7A2D' },
  { slug: 'body-care', label: 'Bodycare', bg: '#E0DAFF', color: '#5B4FCF' },
  { slug: 'mens-fragrance', label: 'Perfume', bg: '#DDE4FF', color: '#3B50C9' },
];
// Note: les anciens tags produits `musc` et `deodorants` ont été reclassés
// (musc -> mens-fragrance/Perfume, deodorants -> body-care/Bodycare).

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.label]),
);

export function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? slug;
}

export function categoryHref(slug: string): string {
  return `/shop?category=${slug}`;
}
