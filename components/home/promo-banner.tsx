import Link from 'next/link';

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

          {/* Right — image placeholder */}
          <div className="flex-1 w-full max-w-lg">
            <div
              className="flex w-full items-center justify-center rounded-2xl"
              style={{
                aspectRatio: '4/3',
                background: '#F5F0EB',
                border: '2px dashed #D8CFC6',
              }}
            >
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <svg
                  className="h-12 w-12"
                  fill="none"
                  stroke="#C8BFBA"
                  strokeWidth={1}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: '#C8BFBA' }}>
                  Banner Image
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
