'use client';

import Link from 'next/link';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Hero() {
  const month = MONTHS[new Date().getMonth()];

  return (
    <section
      className="relative flex items-center overflow-hidden bg-canvas"
      style={{ minHeight: 'max(82vh, 560px)' }}
    >
      {/* Subtle dot texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #D6CFC6 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      {/* Soft radial gradient */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 70% at 30% 50%, rgba(201,81,58,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center gap-16 px-6 py-20 md:px-8">
        {/* LEFT — copy */}
        <div className="flex-[3] space-y-8">
          <div className="flex items-center gap-3">
            <span className="inline-block h-px w-8 bg-accent" />
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted">
              New Arrivals — {month}
            </p>
          </div>

          <h1
            className="font-serif text-ink"
            style={{ fontSize: 'clamp(2.6rem, 5vw, 4.4rem)', lineHeight: 1.08, letterSpacing: '-0.01em' }}
          >
            La beauté française,{' '}
            <em className="text-accent" style={{ fontStyle: 'italic' }}>
              livrée chez vous
            </em>
          </h1>

          <p className="max-w-md text-sm leading-7 text-muted" style={{ fontFamily: 'var(--font-sans)' }}>
            Authentic French cosmetics delivered across Bangladesh. Dermatologist-selected, premium quality — from France to your doorstep.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/shop"
              className="inline-flex cursor-pointer items-center gap-2 rounded px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90 active:opacity-80"
              style={{ backgroundColor: '#C9513A' }}
            >
              Shop Now
            </Link>
            <Link
              href="/shop"
              className="inline-flex cursor-pointer items-center gap-2 rounded border border-hairline px-8 py-3.5 text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:border-accent hover:text-accent"
            >
              View Collections
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6 pt-2">
            {['100% Authentic', 'Free Delivery BD', 'Cash on Delivery'].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent opacity-70" />
                <span className="text-[11px] text-muted">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — image placeholder */}
        <div className="hidden flex-[2] items-center justify-center md:flex">
          <div
            className="relative flex w-full max-w-[380px] flex-col items-center justify-center overflow-hidden"
            style={{
              aspectRatio: '3/4',
              borderRadius: '60% 60% 8px 8px',
              background: '#F0EAE4',
              border: '2px dashed #D8CFC6',
            }}
          >
            <svg
              className="h-14 w-14"
              fill="none"
              stroke="#C8BFBA"
              strokeWidth={1}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-3 text-[10px] uppercase tracking-[0.3em]" style={{ color: '#C8BFBA' }}>
              Hero Image
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
