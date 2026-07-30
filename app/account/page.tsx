import Header from '../../components/Header';
import Link from 'next/link';

export default function AccountPage() {
  return (
    <main className="min-h-screen bg-background text-text">
      <Header />
      <section className="mx-auto max-w-5xl px-6 py-20 md:px-8">
        <div className="rounded-[2.5rem] border border-charcoal/10 bg-white p-10 shadow-soft">
          <div className="space-y-6 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">Compte</p>
            <h1 className="text-4xl font-semibold text-black">Mon compte</h1>
            <p className="max-w-2xl mx-auto text-base leading-7 text-charcoal/80">
              Connectez-vous pour suivre vos commandes, gérer vos adresses et accéder à votre historique d'achats.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                href="/account/login"
                className="inline-flex items-center justify-center rounded-full border border-charcoal/10 bg-white px-8 py-3 text-sm font-semibold text-black transition hover:border-black"
              >
                Se connecter
              </Link>
              <Link
                href="/account/register"
                className="inline-flex items-center justify-center rounded-full bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-charcoal/90"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
