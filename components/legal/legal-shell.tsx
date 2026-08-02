import Link from 'next/link';

/** Shared layout for legal / informational pages (consistent typography). */
export default function LegalShell({
  title,
  intro,
  lastUpdated = '[TO BE COMPLETED]',
  children,
}: {
  title: string;
  intro?: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <section className="mx-auto max-w-3xl px-6 py-20 md:px-8">
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted">French Beauty BD</p>
        <h1 className="mt-3 font-serif text-4xl text-ink">{title}</h1>
        {intro && <p className="mt-4 text-sm leading-7 text-muted">{intro}</p>}
        <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted/70">
          Last updated: {lastUpdated}
        </p>

        <div className="mt-10 space-y-8">{children}</div>

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

/** A titled section inside a LegalShell. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-serif text-xl text-ink">{heading}</h2>
      <div className="space-y-3 text-sm leading-7 text-ink/80">{children}</div>
    </div>
  );
}
