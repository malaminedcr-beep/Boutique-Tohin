import Header from '../../components/Header';
import Link from 'next/link';
import { CONTACT } from '../../lib/contact';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({
  title: 'About',
  description:
    'French Beauty BD connects the best French cosmetics with Bangladeshi shoppers — guaranteed authenticity, quality and personalised service.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-text">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
        <div className="space-y-10">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">About</p>
            <h1 className="text-4xl font-semibold text-black md:text-5xl">Our mission for Bangladesh</h1>
            <p className="max-w-3xl text-base leading-8 text-charcoal/80">
              French Beauty BD connects the best French cosmetics with Bangladeshi shoppers, guaranteeing authenticity, quality and personalised service.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-charcoal/10 bg-white p-10 shadow-sm">
              <h2 className="text-2xl font-semibold text-black">Our quality commitment</h2>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-charcoal/75">
                <li>Products sourced directly from France.</li>
                <li>Careful quality checks on every batch we receive.</li>
                <li>Aligned with European standards and dermatological expectations.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-charcoal/10 bg-white p-10 shadow-sm">
              <h2 className="text-2xl font-semibold text-black">Our customer service</h2>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-charcoal/75">
                <li>Personalised support on WhatsApp and email.</li>
                <li>Real-time order tracking through to delivery.</li>
                <li>Clear and flexible returns policy.</li>
              </ul>
            </div>
          </div>

          <section id="contact" className="rounded-3xl border border-charcoal/10 bg-cream p-10 shadow-sm">
            <h2 className="text-2xl font-semibold text-black">Contact</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-charcoal/75">
              For any question about our products, your orders or our brand selection, get in touch with us directly.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">WhatsApp</p>
                <p className="mt-2 text-base font-medium text-black">{CONTACT.whatsapp}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">Email</p>
                <p className="mt-2 text-base font-medium text-black">{CONTACT.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">Hours</p>
                <p className="mt-2 text-base font-medium text-black">Mon-Sun 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-sm font-semibold text-charcoal/80 transition hover:text-black">
              ← Back to home
            </Link>
            <Link href="/brands" className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-charcoal/90">
              See our brands
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
