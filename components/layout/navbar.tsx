'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCart } from '../../lib/cart-context';
import { CATEGORIES, categoryHref } from '../../lib/categories';

const navCategories = CATEGORIES.map((c) => ({
  label: c.label,
  href: categoryHref(c.slug),
}));

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const { state } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/95 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-6 px-6 md:px-8">

        {/* Logo */}
        <Link href="/" className="shrink-0 font-serif text-[17px] tracking-[0.22em] text-ink">
          FRENCH <span className="text-accent">BEAUTY</span> BD
        </Link>

        {/* Centre nav */}
        <nav className="hidden items-center md:flex">
          {navCategories.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-4 text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Droite: search + cart */}
        <div className="flex items-center gap-4">
          <div className="relative hidden max-w-[320px] md:block">
            <input
              type="text"
              placeholder="Search products..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-[280px] border border-hairline bg-surface px-4 py-2 pr-10 text-[12px] text-ink placeholder:text-muted/40 outline-none focus:border-accent/40 transition-colors"
            />
            <svg className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <Link
            href="/account"
            className="flex h-8 w-8 cursor-pointer items-center justify-center border border-hairline text-muted transition-colors hover:border-accent hover:text-accent"
            aria-label="Account"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>

          <Link
            href="/cart"
            className="relative flex h-8 w-8 cursor-pointer items-center justify-center border border-hairline text-muted transition-colors hover:border-accent hover:text-accent"
            aria-label="Cart"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z" />
            </svg>
            {state.itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {state.itemCount}
              </span>
            )}
          </Link>

          <button
            className="flex h-8 w-8 cursor-pointer items-center justify-center border border-hairline text-muted transition-colors hover:border-ink hover:text-ink md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-hairline bg-surface px-6 py-5 md:hidden">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full border border-hairline bg-canvas px-4 py-2.5 text-[12px] text-ink placeholder:text-muted/40 outline-none"
            />
          </div>
          <div className="space-y-1">
            {navCategories.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
