import Header from '../../../components/Header';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background text-text">
      <Header />
      <section className="mx-auto max-w-3xl px-6 py-24 md:px-8">
        <div className="rounded-[2.5rem] border border-charcoal/10 bg-white p-10 shadow-soft">
          <div className="space-y-6 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">Se connecter</p>
            <h1 className="text-4xl font-semibold text-black">Connexion</h1>
            <p className="max-w-2xl mx-auto text-base leading-7 text-charcoal/80">
              Accédez à votre compte pour suivre vos commandes et gérer vos informations.
            </p>
          </div>
          <form className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-charcoal/80">Email</label>
              <input type="email" className="mt-2 w-full rounded-3xl border border-charcoal/10 bg-cream px-5 py-4 text-sm text-black outline-none focus:border-black" placeholder="votre.email@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/80">Mot de passe</label>
              <input type="password" className="mt-2 w-full rounded-3xl border border-charcoal/10 bg-cream px-5 py-4 text-sm text-black outline-none focus:border-black" placeholder="••••••••" />
            </div>
            <button className="w-full rounded-full bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-charcoal/90">
              Se connecter
            </button>
          </form>
          <p className="mt-8 text-sm text-charcoal/70">
            Pas encore de compte ? <Link href="/account/register" className="font-semibold text-black">Créer un compte</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
