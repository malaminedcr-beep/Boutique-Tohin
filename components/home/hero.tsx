'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Slide = {
  key: string;
  eyebrow: string;
  title: string;
  /** Highlighted (italic accent) part of the headline. */
  titleEm: string;
  text: string;
  cta: string;
  href: string;
  image: string;
  alt: string;
  /** Full-bleed background behind the slide (kept light & airy). */
  background: string;
};

const SLIDES: Slide[] = [
  {
    key: 'monoi',
    eyebrow: 'Yves Rocher — Monoï de Tahiti',
    title: 'Nourished Skin,',
    titleEm: 'Island Glow',
    text: 'Tahitian monoï oil for silky, radiant skin — a tropical ritual delivered across Bangladesh.',
    cta: 'Shop Now',
    href: '/shop?category=body-care',
    image: '/images/hero/hero-monoi.webp',
    alt: 'Yves Rocher Monoï de Tahiti body and hair collection',
    background:
      'radial-gradient(ellipse 80% 90% at 72% 32%, rgba(45,122,122,0.12) 0%, transparent 62%), linear-gradient(115deg, #E4F1EF 0%, #FBF8F5 55%)',
  },
  {
    key: 'effaclar',
    eyebrow: 'La Roche-Posay — Effaclar Serum',
    title: 'Clear Skin,',
    titleEm: 'Every Day',
    text: 'A daily anti-blemish serum that refines skin texture and fades marks — dermatologist-trusted.',
    cta: 'Shop Now',
    href: '/shop?category=face-care',
    image: '/images/hero/hero-effaclar.jpg',
    alt: 'La Roche-Posay Effaclar Serum bottle',
    background:
      'radial-gradient(ellipse 80% 90% at 72% 32%, rgba(43,108,176,0.12) 0%, transparent 62%), linear-gradient(115deg, #E1ECF3 0%, #FBF8F5 55%)',
  },
  {
    key: 'mineral89',
    eyebrow: 'Vichy — Minéral 89',
    title: 'Born From',
    titleEm: 'French Volcanoes',
    text: 'A hydrating daily booster with volcanic mineralizing water and hyaluronic acid, for plumped, stronger skin.',
    cta: 'Discover',
    href: '/shop?category=face-care',
    image: '/images/hero/hero-mineral89.jpg',
    alt: 'Vichy Minéral 89 hydrating booster bottle',
    background:
      'radial-gradient(ellipse 80% 90% at 72% 32%, rgba(30,90,150,0.14) 0%, transparent 62%), linear-gradient(115deg, #DCEAF2 0%, #EFF5F8 55%)',
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
      className="relative w-full overflow-hidden bg-canvas"
      style={{ minHeight: 'max(78vh, 600px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {SLIDES.map((slide, i) => {
        const active = i === index;
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
            style={{ background: slide.background }}
          >
            <div className="mx-auto flex h-full w-full max-w-7xl flex-col-reverse items-center gap-8 px-6 py-14 md:flex-row md:gap-16 md:px-8 md:py-20">
              {/* Copy */}
              <div className="flex-[3] space-y-6 text-center md:text-left">
                <div className="flex items-center justify-center gap-3 md:justify-start">
                  <span className="inline-block h-px w-8 bg-accent" />
                  <p className="text-[10px] uppercase tracking-[0.32em] text-muted">
                    {slide.eyebrow}
                  </p>
                </div>

                <h1
                  className="font-serif text-ink"
                  style={{
                    fontSize: 'clamp(2.3rem, 5vw, 4.2rem)',
                    lineHeight: 1.08,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {slide.title}{' '}
                  <em className="text-accent" style={{ fontStyle: 'italic' }}>
                    {slide.titleEm}
                  </em>
                </h1>

                <p
                  className="mx-auto max-w-md text-sm leading-7 text-muted md:mx-0"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {slide.text}
                </p>

                <div className="pt-1">
                  <Link
                    href={slide.href}
                    className="inline-flex cursor-pointer items-center gap-2 rounded px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-opacity hover:opacity-90 active:opacity-80"
                    style={{ backgroundColor: '#C9513A' }}
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>

              {/* Product image (blends via soft white glow) */}
              <div className="flex flex-[2] items-center justify-center">
                <div className="relative aspect-[4/3] w-full max-w-[280px] md:aspect-square md:max-w-[440px]">
                  <div
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 50%, #ffffff 42%, transparent 74%)',
                    }}
                  />
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 768px) 80vw, 440px"
                    className="object-contain"
                  />
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
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.key}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? 'w-6 bg-accent' : 'w-2 bg-ink/25 hover:bg-ink/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
