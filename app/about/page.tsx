import Header from '../../components/Header';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-text">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
        <div className="space-y-10">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">À Propos</p>
            <h1 className="text-4xl font-semibold text-black md:text-5xl">Notre mission pour le Bangladesh</h1>
            <p className="max-w-3xl text-base leading-8 text-charcoal/80">
              French Beauty BD connecte les meilleurs produits cosmétiques français aux consommateurs bangladais, en garantissant authenticité, qualité et service personnalisé.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-charcoal/10 bg-white p-10 shadow-sm">
              <h2 className="text-2xl font-semibold text-black">Notre engagement qualité</h2>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-charcoal/75">
                <li>Import direct depuis des fournisseurs officiels en France.</li>
                <li>Contrôle de qualité rigoureux pour chaque lot reçu.</li>
                <li>Respect des normes européennes et des attentes dermatologiques.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-charcoal/10 bg-white p-10 shadow-sm">
              <h2 className="text-2xl font-semibold text-black">Notre service client</h2>
              <ul className="mt-6 space-y-4 text-sm leading-7 text-charcoal/75">
                <li>Assistance personnalisée sur WhatsApp et e-mail.</li>
                <li>Suivi des commandes en temps réel jusqu’à la livraison.</li>
                <li>Politique de retour claire et flexible.</li>
              </ul>
            </div>
          </div>

          <section id="contact" className="rounded-3xl border border-charcoal/10 bg-cream p-10 shadow-sm">
            <h2 className="text-2xl font-semibold text-black">Contact</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-charcoal/75">
              Pour toute question sur nos produits, vos commandes ou notre sélection de marques, contactez-nous directement.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">WhatsApp</p>
                <p className="mt-2 text-base font-medium text-black">+880 1234 567890</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">Email</p>
                <p className="mt-2 text-base font-medium text-black">support@frenchbeautybd.com</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-charcoal/60">Horaires</p>
                <p className="mt-2 text-base font-medium text-black">Lun-Dim 9h00 - 18h00</p>
              </div>
            </div>
          </section>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="text-sm font-semibold text-charcoal/80 transition hover:text-black">
              ← Retour à l’accueil
            </Link>
            <Link href="/brands" className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-charcoal/90">
              Voir nos marques
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
