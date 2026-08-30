import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT, whatsappTel } from '../../lib/contact';

export const metadata: Metadata = {
  title: 'Shipping & Delivery | French Beauty BD',
  description:
    'Free nationwide delivery across Bangladesh. Authentic French cosmetics sourced in France and delivered to your door in 2–3 weeks.',
};

const waHref = `https://wa.me/${whatsappTel.replace(/\D/g, '')}`;

/* ── Inline icon set (stroke, inherits accent via currentColor) ──────────── */
const icons = {
  truck: (
    <>
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H14v9H3z" />
      <path d="M14 8.5h3.2l2.3 2.7V14H14z" />
      <circle cx="7" cy="16.5" r="1.6" />
      <circle cx="16.5" cy="16.5" r="1.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </>
  ),
  wallet: (
    <>
      <rect x="3.5" y="6" width="17" height="13" rx="2" />
      <path d="M3.5 10h17" />
      <circle cx="16.5" cy="14.5" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5l1.8 4.7L18.5 10l-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-1.8z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s6.5-5.5 6.5-10.5A6.5 6.5 0 0 0 5.5 10.5C5.5 15.5 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.3" />
    </>
  ),
  bell: (
    <>
      <path d="M6.5 10a5.5 5.5 0 0 1 11 0c0 4 1.5 5.5 1.5 5.5H5s1.5-1.5 1.5-5.5z" />
      <path d="M10.2 19a2 2 0 0 0 3.6 0" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3.5h12v17l-2.4-1.5-2.4 1.5-2.4-1.5-2.4 1.5-2.4-1.5z" />
      <path d="M9 8h6M9 11.5h6M9 15h3.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5.5" y="10.5" width="13" height="9" rx="1.6" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
};

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const highlights = [
  { icon: icons.truck, label: 'Delivery', value: 'Free nationwide' },
  { icon: icons.clock, label: 'Arrives in', value: '2–3 weeks' },
  { icon: icons.wallet, label: 'Payment', value: 'bKash' },
  { icon: icons.sparkle, label: 'Guarantee', value: '100% authentic' },
];

const steps = [
  {
    n: '01',
    title: 'You place your order',
    text: 'Pay securely with bKash at checkout. You’ll receive a confirmation with your order number.',
  },
  {
    n: '02',
    title: 'Sourced in France',
    text: 'We source your products directly from France — genuine, certified, straight from the brand.',
  },
  {
    n: '03',
    title: 'Delivered to your door',
    text: 'Your parcel ships to Bangladesh and arrives at your address, anywhere in the country.',
  },
];

const details = [
  {
    icon: icons.pin,
    heading: 'Where we deliver',
    body: 'We deliver everywhere in Bangladesh — Dhaka, Chittagong and every district nationwide. Delivery is free on every order, with no minimum spend.',
  },
  {
    icon: icons.clock,
    heading: 'How long it takes',
    body: 'Because each order is sourced directly from France, please allow 2 to 3 weeks from confirmed payment to delivery. We’ll keep you posted along the way.',
  },
  {
    icon: icons.bell,
    heading: 'Tracking your order',
    body: (
      <>
        Follow your order status any time from your{' '}
        <Link href="/account" className="text-accent underline-offset-2 hover:underline">
          account
        </Link>
        . We’ll also reach out by email or WhatsApp if we need anything to complete your delivery.
      </>
    ),
  },
  {
    icon: icons.receipt,
    heading: 'Customs & duties',
    body: 'The price you see at checkout is the price you pay. There are no hidden customs fees or import duties charged on arrival.',
  },
  {
    icon: icons.lock,
    heading: 'Returns',
    body: 'All sales are final — we do not offer returns or exchanges. If your order arrives damaged or incorrect, message us within 48 hours with a photo and we’ll make it right.',
  },
];

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-20">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="animate-fadeUp">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted">French Beauty BD</p>
          <h1 className="mt-3 font-serif text-4xl leading-tight text-ink md:text-5xl">
            Shipping &amp; Delivery
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted">
            Authentic French cosmetics, sourced in France and delivered free to your door —
            anywhere in Bangladesh.
          </p>
        </div>

        {/* ── Highlight cards ────────────────────────────────────── */}
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {highlights.map((h) => (
            <div
              key={h.label}
              className="rounded-lg border border-hairline bg-surface p-5 shadow-card transition-transform duration-300 ease-soft-ease hover:-translate-y-1"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-highlight text-accent">
                <Glyph>{h.icon}</Glyph>
              </span>
              <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-muted">{h.label}</p>
              <p className="mt-1 font-serif text-lg text-ink">{h.value}</p>
            </div>
          ))}
        </div>

        {/* ── How it works ───────────────────────────────────────── */}
        <div className="mt-16">
          <h2 className="font-serif text-2xl text-ink">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="relative overflow-hidden rounded-lg border border-hairline bg-surface p-6 shadow-card"
              >
                <span className="font-serif text-4xl text-accent/25">{s.n}</span>
                <h3 className="mt-3 font-serif text-lg text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Details ────────────────────────────────────────────── */}
        <div className="mt-16 overflow-hidden rounded-lg border border-hairline bg-surface shadow-card">
          {details.map((d, i) => (
            <div
              key={d.heading}
              className={`flex gap-4 p-6 md:gap-5 md:p-7 ${i > 0 ? 'border-t border-hairline' : ''}`}
            >
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-highlight text-accent">
                <Glyph>{d.icon}</Glyph>
              </span>
              <div className="min-w-0">
                <h2 className="font-serif text-xl text-ink">{d.heading}</h2>
                <p className="mt-2 text-sm leading-7 text-ink/80">{d.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Contact CTA ────────────────────────────────────────── */}
        <div className="mt-10 rounded-lg border border-accent/20 bg-highlight p-7 text-center md:p-9">
          <h2 className="font-serif text-2xl text-ink">Questions about your delivery?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
            We’re happy to help with your order, timing or address — reach out any time.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={`mailto:${CONTACT.email}`}
              className="inline-flex w-full items-center justify-center rounded-none bg-ink px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-ink/90 sm:w-auto"
            >
              Email us
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-none border border-ink/20 bg-surface px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink transition-colors hover:border-accent hover:text-accent sm:w-auto"
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* ── Footer link ────────────────────────────────────────── */}
        <div className="mt-14 border-t border-hairline pt-6">
          <Link
            href="/"
            className="text-[11px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-accent"
          >
            ← Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
