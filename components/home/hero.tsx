'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Slide = {
  key: string;
  image: string;
  /** Empty side of the artwork where the text goes. */
  side: 'left' | 'right';
  /** Text color scheme depending on the artwork background. */
  theme: 'dark' | 'light';
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  /** Focus point kept in frame when the banner is cropped (mobile). */
  objectPosition: string;
  /** Legibility scrim on the text side. */
  scrim: string;
};

const SLIDES: Slide[] = [
  {
    key: 'monoi',
    image: '/images/hero/hero-monoi-v2.jpg',
    side: 'left',
    theme: 'dark',
    eyebrow: 'Scent of Summer',
    title: 'Nourished Skin, Island Glow',
    subtitle: '98% natural origin — Monoï de Tahiti body milk',
    cta: 'Shop Now',
    href: '/product/16',
    objectPosition: 'right center',
    scrim:
      'linear-gradient(to right, rgba(251,248,245,0.92) 0%, rgba(251,248,245,0.55) 34%, transparent 62%)',
  },
  {
    key: 'effaclar',
    image: '/images/hero/hero-effaclar-v2.jpg',
    side: 'left',
    theme: 'dark',
    eyebrow: 'Dermatologist Recommended',
    title: 'Clear Skin, Every Day',
    subtitle: 'Effaclar Serum — daily peeling for visibly reduced imperfections',
    cta: 'Shop Now',
    href: '/product/42',
    objectPosition: 'right center',
    scrim:
      'linear-gradient(to right, rgba(251,248,245,0.92) 0%, rgba(251,248,245,0.55) 34%, transparent 62%)',
  },
  {
    key: 'mineral89',
    image: '/images/hero/hero-mineral89-v2.jpg',
    side: 'right',
    theme: 'light',
    eyebrow: 'New Arrival',
    title: 'Born From French Volcanoes',
    subtitle: '89 minerals. One drop of instant hydration.',
    cta: 'Discover',
    href: '/product/30',
    objectPosition: 'left center',
    scrim:
      'linear-gradient(to left, rgba(6,14,26,0.82) 0%, rgba(6,14,26,0.45) 34%, transparent 62%)',
  },
];

const AUTO_MS = 5500;

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);
  const touchStartX = useRef<number | null>(null);

  const count = SLIDES.length;
  const goTo = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);

  // Respect the user's reduced-motion preference (disables auto-rotation).
  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Auto-rotation. Re-runs (and resets the timer) on manual navigation.
  useEffect(() => {
    if (paused || reducedMotion.current) return;
    const id = setInterval(next, AUTO_MS);
    return () => clearInterval(id);
  }, [paused, index, next]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      const delta = e.changedTouches[0].clientX - touchStartX.current;
      if (delta > 50) prev();
      else if (delta < -50) next();
    }
    touchStartX.current = null;
    setPaused(false);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative w-full overflow-hidden bg-canvas aspect-[3/4] sm:aspect-[16/10] md:aspect-[1024/572]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {SLIDES.map((slide, i) => {
        const active = i === index;
        const dark = slide.theme === 'light'; // 'light' theme => text is light (on dark art)
        return (
          <div
            key={slide.key}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-700 ease-soft-ease ${
              active ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
          >
            {/* Artwork */}
            <Image
              src={slide.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: slide.objectPosition }}
            />

            {/* Legibility scrim on the text side */}
            <div aria-hidden className="absolute inset-0" style={{ background: slide.scrim }} />

            {/* Text overlay (clicks pass through except the CTA) */}
            <div
              className={`pointer-events-none absolute inset-0 z-10 flex items-center ${
                slide.side === 'right' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex max-w-[80%] flex-col gap-3 px-6 sm:max-w-[62%] sm:gap-4 sm:px-10 md:max-w-[46%] md:px-14 lg:px-20 ${
                  slide.side === 'right' ? 'items-end text-right' : 'items-start text-left'
                }`}
              >
                {/* Eyebrow */}
                <div
                  className={`flex items-center gap-3 ${
                    slide.side === 'right' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <span className="inline-block h-px w-8 bg-accent" />
                  <p
                    className={`text-[10px] uppercase tracking-[0.32em] ${
                      dark ? 'text-white/80' : 'text-muted'
                    }`}
                  >
                    {slide.eyebrow}
                  </p>
                </div>

                {/* Title */}
                <h1
                  className={`font-serif ${dark ? 'text-white' : 'text-ink'}`}
                  style={{
                    fontSize: 'clamp(1.75rem, 4.2vw, 4rem)',
                    lineHeight: 1.08,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p
                  className={`max-w-md text-xs leading-6 sm:text-sm sm:leading-7 ${
                    dark ? 'text-white/85' : 'text-muted'
                  }`}
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {slide.subtitle}
                </p>

                {/* Real CTA button */}
                <div className="pointer-events-auto pt-1">
                  <Link
                    href={slide.href}
                    className="inline-flex cursor-pointer items-center gap-2 rounded px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition-opacity hover:opacity-90 active:opacity-80"
                    style={{ backgroundColor: '#C9513A' }}
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Prev / Next arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-white/80 text-ink backdrop-blur transition-colors hover:border-accent hover:text-accent md:left-6"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-white/80 text-ink backdrop-blur transition-colors hover:border-accent hover:text-accent md:right-6"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 md:bottom-6">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.key}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full shadow-sm transition-all duration-300 ${
              i === index ? 'w-6 bg-accent' : 'w-2 bg-white/70 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
