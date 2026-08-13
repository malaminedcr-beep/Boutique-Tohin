import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES, categoryHref } from '../../lib/categories';

function ArchCard({
  slug,
  label,
  bg,
  color,
  image,
}: {
  slug: string;
  label: string;
  bg: string;
  color: string;
  image: string;
}) {
  return (
    <Link
      href={categoryHref(slug)}
      className="group flex flex-col items-center gap-3 cursor-pointer"
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
        <Image
          src={image}
          alt={label}
          fill
          sizes="(max-width: 640px) 45vw, 22vw"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
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

        {/* Symmetric grid: 2×2 on mobile, 1×4 from tablet up
            (one source of truth: lib/categories) */}
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
          {CATEGORIES.map((cat) => (
            <ArchCard key={cat.slug} {...cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
