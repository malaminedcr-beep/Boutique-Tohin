import Link from 'next/link';

const SHOP_LINKS = ['Skincare', 'Haircare', 'Bodycare', 'Makeup', 'Perfume'];

const BRAND_LINKS = ['CeraVe', 'Vichy', 'La Roche-Posay', 'Yves Rocher', 'Bioderma'];

const HELP_LINKS = [
  { label: 'Track Order', href: '/account' },
  { label: 'Shipping Info', href: '/about' },
  { label: 'Returns', href: '/about' },
  { label: 'Contact', href: '/about#contact' },
  { label: 'FAQ', href: '/about' },
];

export default function Footer() {
  return (
    <footer className="border-t border-hairline bg-canvas">
      <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-hairline md:grid-cols-4 md:divide-x md:divide-y-0">
        {/* Brand description */}
        <div className="space-y-4 p-10">
          <p className="font-serif text-base tracking-[0.22em] text-ink">
            FRENCH <span className="text-accent">BEAUTY</span> BD
          </p>
          <p className="max-w-xs text-sm leading-7 text-muted">
            Importateur officiel de produits cosmétiques français pour le Bangladesh. Authenticité garantie, livraison rapide.
          </p>
        </div>

        {/* Shop */}
        <div className="space-y-4 p-10">
          <p className="text-[10px] uppercase tracking-[0.3em] text-muted">Shop</p>
          <ul className="space-y-3">
            {SHOP_LINKS.map((cat) => (
              <li key={cat}>
                <Link
                  href={`/shop?category=${cat.toLowerCase()}`}
                  className="text-sm text-muted transition-colors hover:text-ink"
                >
                  {cat}
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
            © French Beauty BD 2026 — Tous droits réservés
          </p>
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
