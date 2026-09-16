import type { Metadata } from 'next';

/**
 * Canonical site origin (no trailing slash). The canonical host is the apex-www
 * production domain; the *.vercel.app deployment URL must never be used as the
 * canonical origin (it would split ranking signals across two domains).
 * Override via NEXT_PUBLIC_SITE_URL only with another real production origin.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.frenchbeautybd.com'
).replace(/\/$/, '');

export const SITE_NAME = 'French Beauty BD';
export const SITE_DESCRIPTION =
  'Authentic French cosmetics, imported from France and delivered across Bangladesh. CeraVe, Vichy and Yves Rocher — guaranteed authenticity, free nationwide delivery and secure bKash payment.';

/** Default Open Graph image (1200x630). */
export const OG_DEFAULT = '/images/og-default.jpg';

type PageMetaInput = {
  title: string;
  description?: string;
  /** Absolute path starting with "/", used for canonical + OG url. */
  path: string;
  image?: string;
};

/** Builds consistent per-page metadata (canonical + Open Graph + Twitter). */
export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  image = OG_DEFAULT,
}: PageMetaInput): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'website',
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}
