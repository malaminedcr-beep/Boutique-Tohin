import Link from 'next/link';

type ArchItem = {
  label: string;
  href: string;
  bg: string;
  color: string;
};

const ROW1: ArchItem[] = [
  { label: 'Skincare', href: '/shop?category=face-care', bg: '#FFDDD6', color: '#C9513A' },
  { label: 'Haircare', href: '/shop?category=hair-care', bg: '#DCF0DC', color: '#2D7A2D' },
  { label: 'Bodycare', href: '/shop?category=body-care', bg: '#E0DAFF', color: '#5B4FCF' },
  { label: 'Makeup', href: '/shop?category=makeup', bg: '#FFE0EE', color: '#C9427A' },
  { label: 'Suncare', href: '/shop?category=suncare', bg: '#FFF3CC', color: '#A07000' },
];

const ROW2: ArchItem[] = [
  { label: 'Perfume', href: '/shop?category=mens-fragrance', bg: '#DDE4FF', color: '#3B50C9' },
  { label: 'Serum', href: '/shop?category=serum', bg: '#FFE0DA', color: '#C9513A' },
  { label: 'Face Wash', href: '/shop?category=face-wash', bg: '#D9EEFF', color: '#2B6CB0' },
  { label: 'Combo', href: '/shop?category=body-care', bg: '#E0F5E0', color: '#276127' },
];

function ArchCard({ label, href, bg, color }: ArchItem) {
  return (
    <Link href={href} className="group flex flex-col items-center gap-2 cursor-pointer">
      {/* Arch shape */}
      <div
        className="relative w-full overflow-hidden transition-transform duration-200 ease-out group-hover:-translate-y-1.5"
        style={{
          aspectRatio: '3/4',
          borderRadius: '999px 999px 10px 10px',
          backgroundColor: bg,
        }}
      >
        {/* Placeholder icon */}
        <div className="absolute inset-0 flex items-end justify-center pb-6">
          <svg
            className="h-10 w-10 opacity-25"
            fill="none"
            stroke={color}
            strokeWidth={1.2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

        {/* Desktop: two separate rows */}
        <div className="hidden md:block">
          <div className="mb-5 grid grid-cols-5 gap-4">
            {ROW1.map((cat) => (
              <ArchCard key={cat.label} {...cat} />
            ))}
          </div>
          <div className="mx-auto grid max-w-[82%] grid-cols-4 gap-4">
            {ROW2.map((cat) => (
              <ArchCard key={cat.label} {...cat} />
            ))}
          </div>
        </div>

        {/* Mobile: 3-column grid */}
        <div className="grid grid-cols-3 gap-3 md:hidden">
          {[...ROW1, ...ROW2].map((cat) => (
            <ArchCard key={cat.label} {...cat} />
          ))}
        </div>
      </div>
    </section>
  );
}
