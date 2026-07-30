import Header from '../../components/Header';
import Link from 'next/link';

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
              <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">Commande confirmée</p>
              <h1 className="text-4xl font-semibold text-black">Merci pour votre commande !</h1>
              <p className="text-lg text-charcoal/70">Numéro de commande: <span className="font-semibold text-black">{orderNumber}</span></p>
            </div>

            <div className="max-w-2xl mx-auto space-y-4 text-left bg-cream rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-black">Que se passe-t-il ensuite ?</h2>
              <div className="space-y-3 text-sm text-charcoal/80">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <p>Vous recevrez un email de confirmation avec les détails de votre commande.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <p>Votre commande sera préparée avec soin dans nos entrepôts français.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p>Expédition sous 2-3 jours ouvrés avec suivi en temps réel.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">4</span>
                  </div>
                  <p>Livraison à votre porte sous 7-10 jours ouvrés au Bangladesh.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-base leading-7 text-charcoal/80 max-w-2xl mx-auto">
                Votre commande de produits de beauté français authentiques est maintenant en cours de traitement.
                Nous vous tiendrons informé de chaque étape du processus.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-charcoal/90"
                >
                  Continuer mes achats
                </Link>
                <Link
                  href="/account"
                  className="inline-flex items-center justify-center rounded-full border border-charcoal/10 bg-white px-8 py-3 text-sm font-semibold text-black transition hover:border-black hover:bg-cream"
                >
                  Voir mes commandes
                </Link>
              </div>
            </div>

            <div className="pt-6 border-t border-charcoal/10">
              <p className="text-sm text-charcoal/60">
                Des questions ? Contactez notre service client au <a href="tel:+8801234567890" className="text-black hover:text-gold transition-colors">+880 123 456 7890</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}