import Link from 'next/link';
import { CATEGORIES, categoryHref } from '../../lib/categories';
import { getAllBrands } from '../../lib/supabase/products';

const HELP_LINKS = [
  { label: 'Track Order', href: '/account' },
  { label: 'Shipping Info', href: '/shipping' },
  { label: 'Returns', href: '/legal/returns' },
  { label: 'Contact', href: '/about#contact' },
  { label: 'FAQ', href: '/faq' },
];

export default async function Footer() {
  // Brands from Supabase (source of truth); guarded so a build without
  // Supabase reachable doesn't fail.
  let BRAND_LINKS: string[] = [];
  try {
    BRAND_LINKS = await getAllBrands();
  } catch {
    BRAND_LINKS = [];
  }

  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-hairline md:grid-cols-4 md:divide-x md:divide-y-0">
        {/* Brand description */}
        <div className="space-y-4 p-10">
          <p className="font-serif text-base tracking-[0.22em] text-ink">
            FRENCH <span className="text-accent">BEAUTY</span> BD
          </p>
          <p className="max-w-xs text-sm leading-7 text-muted">
            Authentic French cosmetics, imported from France. Guaranteed authenticity, fast delivery across Bangladesh.
          </p>
        </div>

        {/* Shop */}
        <div className="space-y-4 p-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Shop</p>
          <ul className="space-y-3">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={categoryHref(cat.slug)}
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Brands */}
        <div className="space-y-4 p-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Brands</p>
          <ul className="space-y-3">
            {BRAND_LINKS.map((brand) => (
              <li key={brand}>
                <Link
                  href={`/shop?brand=${encodeURIComponent(brand)}`}
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  {brand}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div className="space-y-4 p-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Help</p>
          <ul className="space-y-3">
            {HELP_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-10 py-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">
            © French Beauty BD 2026 — All rights reserved
          </p>
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-muted">
            <Link href="/legal/terms" className="transition-colors hover:text-ink">Terms</Link>
            <Link href="/legal/privacy" className="transition-colors hover:text-ink">Privacy</Link>
          </div>
          <div className="flex items-center gap-2.5">
            {['COD', 'bKash', 'Nagad'].map((method) => (
              <span
                key={method}
                className="border border-hairline px-3 py-1 text-[9px] uppercase tracking-[0.2em] text-muted transition-colors hover:border-accent hover:text-accent"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
