import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import CustomCursor from '../components/CustomCursor';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/navbar';
import AnnouncementBar from '../components/layout/announcement-bar';
import { CartProvider } from '../lib/cart-context';

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
  title: 'French Beauty BD',
  description: 'French Beauty BD brings authentic French cosmetics to Bangladesh with curated luxury rituals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${serif.variable} ${sans.variable} bg-canvas text-ink antialiased`} style={{ cursor: 'none' }}>
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
