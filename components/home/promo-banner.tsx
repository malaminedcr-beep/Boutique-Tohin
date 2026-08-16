import Link from 'next/link';

export default function PromoBanner() {
  return (
    <section className="border-y border-hairline bg-white py-16">
      <div className="mx-auto max-w-3xl px-6 text-center md:px-8">
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted">Featured</p>

        <h2
          className="mt-4 font-serif text-ink"
          style={{ fontSize: 'clamp(1.9rem, 3vw, 2.8rem)', lineHeight: 1.15 }}
        >
          Less Steps.{' '}
          <em className="text-accent" style={{ fontStyle: 'italic' }}>
            Choose Smart
          </em>{' '}
          Skincare.
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
          Discover our curated French skincare routines — clinically proven, dermatologist-approved formulas for every skin type.
        </p>

        <div className="mt-8">
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
      </div>
    </section>
  );
}
