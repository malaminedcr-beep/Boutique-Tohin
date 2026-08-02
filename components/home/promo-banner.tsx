import Link from 'next/link';
import ImageWithFallback from '../ui/image-with-fallback';

export default function PromoBanner() {
  return (
    <section className="border-y border-hairline bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex flex-col items-center gap-10 md:flex-row md:gap-16">
          {/* Left — copy */}
          <div className="flex-1 space-y-6">
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted">Featured</p>

            <h2
              className="font-serif text-ink"
              style={{ fontSize: 'clamp(1.9rem, 3vw, 2.8rem)', lineHeight: 1.15 }}
            >
              Less Steps.{' '}
              <em className="text-accent" style={{ fontStyle: 'italic' }}>
                Choose Smart
              </em>{' '}
              Skincare.
            </h2>

            <p className="max-w-sm text-sm leading-7 text-muted">
              Discover our curated French skincare routines — clinically proven, dermatologist-approved formulas for every skin type.
            </p>

            <Link
              href="/shop?category=face-care"
              className="inline-flex cursor-pointer items-center gap-2 rounded px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#C9513A' }}
            >
              Shop Skincare
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Right — banner image */}
          <div className="flex-1 w-full max-w-lg">
            <div
              className="relative w-full overflow-hidden rounded-2xl"
              style={{ aspectRatio: '4/3', background: '#F5F0EB' }}
            >
              <ImageWithFallback
                src="/images/hero/promo-skincare.jpg"
                alt="Curated French skincare routine"
                sizes="(max-width: 768px) 100vw, 512px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
