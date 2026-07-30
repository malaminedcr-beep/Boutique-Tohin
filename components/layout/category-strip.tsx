'use client';

import Link from 'next/link';

const CATEGORIES = [
  { label: 'All', href: '/shop' },
  { label: 'Skincare', href: '/shop?category=face-care' },
  { label: 'Face Wash', href: '/shop?category=face-wash' },
  { label: 'Moisturizer', href: '/shop?category=moisturizer' },
  { label: 'Serum', href: '/shop?category=serum' },
  { label: 'Sunscreen', href: '/shop?category=sunscreen' },
  { label: 'Toner', href: '/shop?category=toner' },
  { label: 'Eye Cream', href: '/shop?category=eye-cream' },
  { label: 'Haircare', href: '/shop?category=hair-care' },
  { label: 'Bodycare', href: '/shop?category=body-care' },
  { label: 'Makeup', href: '/shop?category=makeup' },
  { label: 'Perfume', href: '/shop?category=mens-fragrance' },
];

export default function CategoryStrip({ active = 'All' }: { active?: string }) {
  return (
    <div className="overflow-x-auto border-b border-t border-hairline bg-surface" style={{ scrollbarWidth: 'none' }}>
      <div className="flex min-w-max">
        {CATEGORIES.map((cat, i) => {
          const isActive = cat.label.toLowerCase() === active.toLowerCase();
          return (
            <Link
              key={cat.label}
              href={cat.href}
              className={[
                'relative flex shrink-0 cursor-pointer items-center px-7 py-[18px] text-[10px] uppercase tracking-[0.2em] transition-colors',
                i < CATEGORIES.length - 1 ? 'border-r border-hairline' : '',
                isActive
                  ? 'bg-highlight text-accent'
                  : 'text-muted hover:bg-highlight hover:text-ink',
              ].join(' ')}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
