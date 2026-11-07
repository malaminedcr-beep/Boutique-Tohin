'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, type Variants } from 'motion/react';

type Slide = {
  key: string;
  /** 4:5 artwork for mobile (clean empty space at the TOP for text). */
  portrait: string;
  /** 16:9 artwork for desktop (clean empty space on the LEFT for text). */
  landscape: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
};

const SLIDES: Slide[] = [
  {
    key: 'monoi',
    portrait: '/hero/monoi-portrait.webp',
    landscape: '/hero/monoi-landscape.webp',
    eyebrow: 'Scent of Summer',
    title: 'Nourished Skin, Island Glow',
    subtitle: '98% natural origin — Monoï de Tahiti body milk for silky, sun-kissed skin.',
    cta: 'Shop Now',
    href: '/product/16',
  },
  {
    key: 'effaclar',
    portrait: '/hero/effaclar-portrait.webp',
    landscape: '/hero/effaclar-landscape.webp',
    eyebrow: 'Dermatologist Recommended',
    title: 'Clear Skin, Every Day',
    subtitle: 'Effaclar Serum — a daily peeling that visibly reduces imperfections.',
    cta: 'Shop Now',
    href: '/product/42',
  },
  {
    key: 'mineral89',
    portrait: '/hero/mineral89-portrait.webp',
    landscape: '/hero/mineral89-landscape.webp',
    eyebrow: 'New Arrival',
    title: 'Born From French Volcanoes',
    subtitle: '89 minerals. One drop of instant, lasting hydration.',
    cta: 'Discover',
    href: '/product/30',
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
      {/* ── Full-bleed artwork: 4:5 on mobile, 16:9 on desktop ── */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-canvas md:aspect-[16/9]">
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
            {/* Art direction: portrait on mobile, landscape on desktop. */}
            <picture>
              <source media="(min-width: 768px)" srcSet={slide.landscape} />
              <img
                src={slide.portrait}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            </picture>

            {/* Legibility scrim: fades from the TOP on mobile, from the LEFT on desktop. */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-[58%] bg-gradient-to-b from-canvas/90 via-canvas/35 to-transparent md:hidden"
            />
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 hidden w-[62%] bg-gradient-to-r from-canvas/92 via-canvas/45 to-transparent md:block"
            />
          </motion.div>
        </AnimatePresence>

        {/* Text overlay — TOP on mobile, LEFT-centered on desktop. */}
        <AnimatePresence custom={direction}>
          <motion.div
            key={slide.key}
            variants={panelVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-start px-6 pt-8 text-center md:items-start md:justify-center md:px-14 md:pt-0 md:text-left lg:px-20"
          >
            <div className="flex w-full max-w-md flex-col items-center gap-3.5 md:max-w-[46%] md:items-start">
              {/* Framed eyebrow label. */}
              <span className="self-center border border-ink/25 px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-ink/70 md:self-start">
                {slide.eyebrow}
              </span>

              {/* Title */}
              <h1
                className="font-serif font-semibold text-ink"
                style={{
                  fontSize: 'clamp(1.7rem, 5vw, 3.35rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                }}
              >
                {slide.title}
              </h1>

              {/* Subtitle */}
              <p
                className="max-w-sm text-sm leading-7 text-muted md:max-w-xl md:text-base"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {slide.subtitle}
              </p>

              {/* CTA — full width on mobile, inline on desktop. */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="pointer-events-auto mt-1 w-full md:w-auto"
              >
                <Link
                  href={slide.href}
                  className="flex w-full cursor-pointer items-center justify-center rounded-none bg-accent px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition-colors hover:bg-accent/90 md:inline-flex md:w-auto"
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
          <div className="mx-auto flex max-w-7xl justify-center px-6 md:justify-start md:px-14 lg:px-20">
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
                  className={`h-2 rounded-full ${i === index ? 'bg-accent' : 'bg-ink/25'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
