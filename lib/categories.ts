/**
 * Single source of truth for product categories.
 * Consumed by the navbar, footer, shop filters, homepage arches and product
 * cards. Every slug here MUST exist in the catalogue (Supabase
 * `products.category`) — no phantom categories that lead to an empty shop.
 */
export type Category = {
  slug: string;
  label: string;
  /** Theme colors for the homepage "Shop by Category" tiles. */
  bg: string;
  color: string;
  /** Visual for the homepage "Shop by Category" tiles (in /public). */
  image: string;
};

export const CATEGORIES: Category[] = [
  { slug: 'face-care', label: 'Skincare', bg: '#FFDDD6', color: '#C9513A', image: '/images/categories/face-care.jpg' },
  { slug: 'hair-care', label: 'Haircare', bg: '#DCF0DC', color: '#2D7A2D', image: '/images/categories/hair-care.jpg' },
  { slug: 'body-care', label: 'Bodycare', bg: '#E0DAFF', color: '#5B4FCF', image: '/images/categories/body-care.jpg' },
  { slug: 'deodorants', label: 'Deodorants', bg: '#D9EEFF', color: '#2B6CB0', image: '/images/categories/deodorants.jpg' },
];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c.label]),
);

export function categoryLabel(slug: string): string {
  return CATEGORY_LABELS[slug] ?? slug;
}

export function categoryHref(slug: string): string {
  return `/shop?category=${slug}`;
}
