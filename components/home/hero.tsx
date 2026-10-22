'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, type Variants } from 'motion/react';

type Slide = {
  key: string;
  image: string;
  /** Empty side of the artwork where the text sits. */
  side: 'left' | 'right';
  /** 'dark' = dark text on light artwork · 'light' = light text on dark artwork. */
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
    image: '/images/hero/hero-monoi-v4.jpg',
    side: 'left',
    theme: 'dark',
    eyebrow: 'Scent of Summer',
    title: 'Nourished Skin, Island Glow',
    subtitle: '98% natural origin — Monoï de Tahiti body milk for silky, sun-kissed skin.',
    cta: 'Shop Now',
    href: '/product/16',
    // Bottle sits on the right — keep it in view on narrow crops.
    objectPosition: 'right center',
    scrim:
      'linear-gradient(to right, rgba(251,248,245,0.92) 0%, rgba(251,248,245,0.55) 34%, transparent 62%)',
  },
  {
    key: 'effaclar',
    image: '/images/hero/hero-effaclar-v4.jpg',
    side: 'left',
    theme: 'dark',
    eyebrow: 'Dermatologist Recommended',
    title: 'Clear Skin, Every Day',
    subtitle: 'Effaclar Serum — a daily peeling that visibly reduces imperfections.',
    cta: 'Shop Now',
    href: '/product/42',
    // Serum bottle is far right — anchor right so mobile shows the product.
    objectPosition: 'right center',
    scrim:
      'linear-gradient(to right, rgba(251,248,245,0.92) 0%, rgba(251,248,245,0.55) 34%, transparent 62%)',
  },
  {
    key: 'mineral89',
    image: '/images/hero/hero-mineral89-v3.jpg',
    side: 'right',
    theme: 'light',
    eyebrow: 'New Arrival',
    title: 'Born From French Volcanoes',
    subtitle: '89 minerals. One drop of instant, lasting hydration.',
    cta: 'Discover',
    href: '/product/30',
    // Vichy bottle sits left of centre — bias left so it isn't clipped on mobile.
    objectPosition: '15% center',
    scrim:
      'linear-gradient(to left, rgba(6,14,26,0.82) 0%, rgba(6,14,26,0.45) 34%, transparent 62%)',
  },
];

const AUTO_MS = 5500;

// Image crossfade: fade + a whisper of horizontal slide (no bounce, < 400ms).
const imageVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 20 : dir < 0 ? -20 : 0 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir > 0 ? -20 : dir < 0 ? 20 : 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  }),
};

// Text block: fade in and lift slightly (on load and on every slide change).
const panelVariants: Variants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut', delay: 0.1 } },
  exit: { opacity: 0, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);
  const touchStartX = useRef<number | null>(null);

  const count = SLIDES.length;

  const paginate = useCallback(
    (target: number, dir: number) => {
      setDirection(dir);
      setIndex(((target % count) + count) % count);
    },
    [count],
  );

  const next = useCallback(() => paginate(index + 1, 1), [index, paginate]);
  const prev = useCallback(() => paginate(index - 1, -1), [index, paginate]);
  const goTo = useCallback((i: number) => paginate(i, i > index ? 1 : -1), [index, paginate]);

  // Respect the user's reduced-motion preference (disables auto-rotation).
  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Auto-rotation. Re-runs (and resets the timer) on manual navigation.
  useEffect(() => {
    if (paused || reducedMotion.current) return;
    const id = setInterval(next, AUTO_MS);
    return () => clearInterval(id);
  }, [paused, next]);

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

  const slide = SLIDES[index];
  const lightText = slide.theme === 'light';

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured collections"
      className="relative w-full overflow-hidden bg-canvas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Full-bleed artwork with text overlaid ──────────────────── */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-canvas sm:aspect-[16/10] lg:aspect-[16/7]">
        <AnimatePresence custom={direction}>
          <motion.div
            key={slide.key}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority
              quality={90}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: slide.objectPosition }}
            />
            {/* Legibility scrim on the text side. */}
            <div aria-hidden className="absolute inset-0" style={{ background: slide.scrim }} />
          </motion.div>
        </AnimatePresence>

        {/* Text overlay (clicks pass through except the CTA). */}
        <AnimatePresence custom={direction}>
          <motion.div
            key={slide.key}
            variants={panelVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className={`pointer-events-none absolute inset-0 z-10 flex items-center ${
              slide.side === 'right' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex max-w-[82%] flex-col gap-4 px-6 sm:max-w-[60%] sm:px-10 md:max-w-[46%] md:px-14 lg:px-20 ${
                slide.side === 'right' ? 'items-end text-right' : 'items-start text-left'
              }`}
            >
              {/* Framed eyebrow label. */}
              <span
                className={`border px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] ${
                  lightText ? 'border-white/40 text-white/85' : 'border-ink/25 text-ink/70'
                }`}
              >
                {slide.eyebrow}
              </span>

              {/* Title */}
              <h1
                className={`font-serif font-semibold ${lightText ? 'text-white' : 'text-ink'}`}
                style={{
                  fontSize: 'clamp(2rem, 4.2vw, 3.5rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                }}
              >
                {slide.title}
              </h1>

              {/* Subtitle */}
              <p
                className={`max-w-xl text-sm leading-7 sm:text-base ${
                  lightText ? 'text-white/85' : 'text-muted'
                }`}
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {slide.subtitle}
              </p>

              {/* CTA — solid accent rectangle, sharp corners, micro-interaction. */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="pointer-events-auto mt-1 inline-block"
              >
                <Link
                  href={slide.href}
                  className="inline-flex cursor-pointer items-center rounded-none bg-accent px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition-colors hover:bg-accent/90"
                >
                  {slide.cta}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows (desktop only; mobile uses swipe). */}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-5 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white backdrop-blur transition-colors hover:bg-black/40 md:flex"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next slide"
          className="absolute right-5 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white backdrop-blur transition-colors hover:bg-black/40 md:flex"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dots. */}
        <div className="pointer-events-none absolute bottom-6 left-0 right-0 z-20">
          <div className="mx-auto flex max-w-7xl px-6 sm:px-10 md:px-14 lg:px-20">
            <div className="pointer-events-auto flex items-center gap-2.5">
              {SLIDES.map((s, i) => (
                <motion.button
                  key={s.key}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index}
                  animate={{ width: i === index ? 24 : 8 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className={`h-2 rounded-full ${
                    i === index ? 'bg-accent' : lightText ? 'bg-white/40' : 'bg-ink/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
