import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import CustomCursor from '../components/CustomCursor';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/navbar';
import AnnouncementBar from '../components/layout/announcement-bar';
import { CartProvider } from '../lib/cart-context';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, OG_DEFAULT } from '../lib/seo';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
});

const sans = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'French Beauty BD — Authentic French Cosmetics in Bangladesh',
    template: '%s | French Beauty BD',
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    url: SITE_URL,
    title: 'French Beauty BD — Authentic French Cosmetics in Bangladesh',
    description: SITE_DESCRIPTION,
    images: [{ url: OG_DEFAULT }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'French Beauty BD',
    description: SITE_DESCRIPTION,
    images: [OG_DEFAULT],
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}${OG_DEFAULT}`,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${sans.variable} bg-canvas text-ink antialiased`} style={{ cursor: 'none' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <CustomCursor />
        <CartProvider>
          <AnnouncementBar />
          <Navbar />
          {children}
        </CartProvider>
        <Footer />
      </body>
    </html>
  );
}
