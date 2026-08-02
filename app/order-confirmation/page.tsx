import Header from '../../components/Header';
import Link from 'next/link';
import { CONTACT, whatsappTel } from '../../lib/contact';

export default function OrderConfirmationPage() {
  const orderNumber = `FB-${Date.now().toString().slice(-8)}`;

  return (
    <main className="min-h-screen bg-background text-text">
      <Header />
      <section className="mx-auto max-w-4xl px-6 py-20 md:px-8">
        <div className="rounded-[2.5rem] border border-charcoal/10 bg-white p-10 shadow-soft text-center">
          <div className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">Order confirmed</p>
              <h1 className="text-4xl font-semibold text-black">Thank you for your order!</h1>
              <p className="text-lg text-charcoal/70">Order number: <span className="font-semibold text-black">{orderNumber}</span></p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4 text-left bg-cream rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-black">What happens next?</h2>
              <div className="space-y-3 text-sm text-charcoal/80">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <p>You will receive a confirmation email with your order details.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <p>Your order will be carefully prepared in our French warehouses.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p>Shipped within 2-3 business days with real-time tracking.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <p>Delivered to your door within 7-10 business days in Bangladesh.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-base leading-7 text-charcoal/80 max-w-2xl mx-auto">
                Your order of authentic French beauty products is now being processed.
                We will keep you informed at every step of the way.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-charcoal/90"
                >
                  Continue shopping
                </Link>
                <Link
                  href="/account"
                  className="inline-flex items-center justify-center rounded-full border border-charcoal/10 bg-white px-8 py-3 text-sm font-semibold text-black transition hover:border-black hover:bg-cream"
                >
                  View my orders
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-charcoal/10">
              <p className="text-sm text-charcoal/60">
                Questions? Contact our customer service at <a href={`tel:${whatsappTel}`} className="text-black hover:text-gold transition-colors">{CONTACT.whatsapp}</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}