import type { Metadata } from 'next';

/** Canonical site origin (no trailing slash). Override via NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://french-beauty-bd.vercel.app'
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
