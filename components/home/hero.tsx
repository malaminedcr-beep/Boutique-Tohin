'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, type Variants } from 'motion/react';

type Slide = {
  key: string;
  image: string;
  /** Text-block background: 'light' => white panel · 'dark' => near-black panel. */
  panel: 'light' | 'dark';
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  /** Focus point kept in frame when the image is cropped. */
  objectPosition: string;
};

const SLIDES: Slide[] = [
  {
    key: 'monoi',
    image: '/images/hero/hero-monoi-v2.jpg',
    panel: 'dark',
    eyebrow: 'Scent of Summer',
    title: 'Nourished Skin, Island Glow',
    subtitle: '98% natural origin — Monoï de Tahiti body milk for silky, sun-kissed skin.',
    cta: 'Shop Now',
    href: '/product/16',
    objectPosition: 'center',
  },
  {
    key: 'effaclar',
    image: '/images/hero/hero-effaclar-v2.jpg',
    panel: 'light',
    eyebrow: 'Dermatologist Recommended',
    title: 'Clear Skin, Every Day',
    subtitle: 'Effaclar Serum — a daily peeling that visibly reduces imperfections.',
    cta: 'Shop Now',
    href: '/product/42',
    objectPosition: 'center',
  },
  {
    key: 'mineral89',
    image: '/images/hero/hero-mineral89-v2.jpg',
    panel: 'dark',
    eyebrow: 'New Arrival',
    title: 'Born From French Volcanoes',
    subtitle: '89 minerals. One drop of instant, lasting hydration.',
    cta: 'Discover',
    href: '/product/30',
    objectPosition: 'center',
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
  center: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut', delay: 0.05 } },
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
  const panelDark = slide.panel === 'dark';

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
      <div className="grid grid-cols-1 md:grid-cols-2 md:h-[560px]">
        {/* ── Image (clean, full-frame, no text) ─────────────────────── */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-canvas sm:aspect-[16/10] md:aspect-auto md:h-full">
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
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                style={{ objectPosition: slide.objectPosition }}
              />
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
        </div>

        {/* ── Text block (own background, left-aligned, editorial) ────── */}
        <div className="relative min-h-[340px] md:h-full">
          <AnimatePresence custom={direction}>
            <motion.div
              key={slide.key}
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className={`absolute inset-0 flex flex-col justify-center ${
                panelDark ? 'bg-ink' : 'bg-surface'
              }`}
            >
              <div className="flex flex-col items-start gap-5 px-8 py-12 text-left md:px-12 lg:px-16">
                {/* Badge / eyebrow */}
                <div className="flex items-center gap-3">
                  <span className="inline-block h-px w-8 bg-accent" />
                  <span
                    className={`text-[10px] uppercase tracking-[0.3em] ${
                      panelDark ? 'text-white/70' : 'text-muted'
                    }`}
                  >
                    {slide.eyebrow}
                  </span>
                </div>

                {/* Title */}
                <h1
                  className={`font-serif ${panelDark ? 'text-white' : 'text-ink'}`}
                  style={{
                    fontSize: 'clamp(1.9rem, 6vw, 3.25rem)',
                    lineHeight: 1.1,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p
                  className={`max-w-md text-sm leading-7 ${panelDark ? 'text-white/65' : 'text-muted'}`}
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {slide.subtitle}
                </p>

                {/* CTA — sharp rectangle, strong contrast, micro-interaction. */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="mt-1 inline-block"
                >
                  <Link
                    href={slide.href}
                    className={`inline-flex cursor-pointer items-center rounded-none px-9 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                      panelDark
                        ? 'bg-white text-ink hover:bg-white/90'
                        : 'bg-ink text-white hover:bg-ink/90'
                    }`}
                  >
                    {slide.cta}
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots — persistent, recoloured to the current panel. */}
          <div className="absolute bottom-6 left-8 z-10 flex items-center gap-2.5 md:left-12">
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
                  i === index ? 'bg-accent' : panelDark ? 'bg-white/30' : 'bg-ink/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
