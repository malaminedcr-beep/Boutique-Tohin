import Image from 'next/image';
import Link from 'next/link';

function Check() {
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  );
}

/**
 * "Authenticity" editorial band — evergreen (not tied to the launch promo).
 * Image + brand promise, in the rose/cream style. Sits after Best Sellers.
 */
export default function Authenticity() {
  return (
    <section className="bg-canvas py-16">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-2 md:gap-14 md:px-8">
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-hairline">
          <Image
            src="/promo/authentic-french-cosmetics.webp"
            alt="Authentic French skincare products arranged on rosé marble with dried flowers"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col items-start gap-5">
          <p className="text-[10px] uppercase tracking-[0.35em] text-accent">Our promise</p>
          <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">
            Authentic French cosmetics, guaranteed
          </h2>
          <p className="max-w-md text-sm leading-7 text-muted md:text-base">
            Every product is sourced directly in France and shipped to Bangladesh from our French
            partners — never local counterfeits. The very same formulas sold in French pharmacies,
            delivered to your door.
          </p>
          <ul className="space-y-2.5 text-sm text-ink">
            <li className="flex items-center gap-3"><Check /> Sourced directly in France</li>
            <li className="flex items-center gap-3"><Check /> 100% certified authentic</li>
            <li className="flex items-center gap-3"><Check /> Shipped from our French partners</li>
          </ul>
          <Link
            href="/shop"
            className="mt-2 inline-flex items-center gap-2 rounded-none bg-accent px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-accent/90"
          >
            Shop the collection
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
