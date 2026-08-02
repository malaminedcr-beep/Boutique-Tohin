import Link from 'next/link';
import { CATEGORIES, categoryHref } from '../../lib/categories';

function ArchCard({
  slug,
  label,
  bg,
  color,
}: {
  slug: string;
  label: string;
  bg: string;
  color: string;
}) {
  return (
    <Link
      href={categoryHref(slug)}
      className="group flex flex-col items-center gap-2 cursor-pointer"
    >
      {/* Arch shape */}
      <div
        className="relative w-full overflow-hidden transition-transform duration-200 ease-out group-hover:-translate-y-1.5"
        style={{
          aspectRatio: '3/4',
          borderRadius: '999px 999px 10px 10px',
          backgroundColor: bg,
        }}
      >
        <div className="absolute inset-0 flex items-end justify-center pb-6">
          <svg
            className="h-10 w-10 opacity-25"
            fill="none"
            stroke={color}
            strokeWidth={1.2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {/* Label pill */}
      <span
        className="rounded-full px-3 py-1 text-center text-[10px] font-semibold uppercase tracking-[0.12em] transition-opacity duration-200 group-hover:opacity-80"
        style={{ backgroundColor: bg, color }}
      >
        {label}
      </span>
    </Link>
  );
}

export default function CategoryArches() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        {/* Heading */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-[10px] uppercase tracking-[0.35em] text-muted">Browse</p>
          <h2 className="font-serif text-3xl text-ink">Shop by Category</h2>
        </div>

        {/* Single responsive grid (one source of truth: lib/categories) */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-6 md:gap-4">
          {CATEGORIES.map((cat) => (
            <ArchCard key={cat.slug} {...cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
