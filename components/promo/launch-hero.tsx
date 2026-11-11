import Link from 'next/link';
import { PROMO_ACTIVE, PROMO_PERCENT } from '../../lib/promo';

/**
 * Launch-offer hero shown at the very top of the homepage. Rendered only while
 * the promo is active (single switch in `lib/promo`). Matches the site's
 * rose/cream editorial style.
 */
export default function LaunchHero() {
  if (!PROMO_ACTIVE) return null;

  return (
    <section className="relative overflow-hidden border-b border-hairline bg-gradient-to-br from-[#FFF4F2] via-canvas to-[#FDECE8]">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-10 text-center md:py-14">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-white/70 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.3em] text-accent">
          Grand Opening
        </span>

        <h2
          className="font-serif text-ink"
          style={{ fontSize: 'clamp(1.8rem, 5vw, 3.4rem)', lineHeight: 1.1, letterSpacing: '-0.01em' }}
        >
          <span className="font-semibold text-accent">{PROMO_PERCENT}% OFF</span> on all products
        </h2>

        <p className="max-w-xl text-sm leading-7 text-muted md:text-base">
          Celebrate our launch — enjoy {PROMO_PERCENT}% off the entire catalogue of authentic French
          cosmetics, delivered across Bangladesh.
        </p>

        <Link
          href="/shop"
          className="mt-2 inline-flex items-center gap-2 rounded-none bg-accent px-9 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition-colors hover:bg-accent/90"
        >
          Shop now
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
