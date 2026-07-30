'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useCart } from '../../lib/cart-context';

type Product = {
  id: number;
  sku: string;
  name: string;
  brand: string;
  category: string;
  volume: string;
  priceEur: number;
  priceBdt: number;
  image: string;
  badge: string | null;
};

const fmt = (v: number) => `৳${v.toLocaleString('en-US')}`;

const CATEGORY_LABELS: Record<string, string> = {
  'face-care': 'Skincare',
  'face-wash': 'Face Wash',
  'moisturizer': 'Moisturizer',
  'serum': 'Serum',
  'sunscreen': 'Suncare',
  'toner': 'Toner',
  'eye-cream': 'Eye Cream',
  'hair-care': 'Haircare',
  'body-care': 'Bodycare',
  'makeup': 'Makeup',
  'mens-fragrance': 'Perfume',
};

function Stars({ rating = 4.5, count = 12 }: { rating?: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => {
        const filled = s <= Math.floor(rating);
        const half = !filled && s === Math.ceil(rating) && rating % 1 >= 0.5;
        return (
          <svg
            key={s}
            className="h-3 w-3"
            fill={filled || half ? '#C9513A' : '#E8E2D9'}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
      <span className="ml-0.5 text-[10px] text-muted">({count})</span>
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);
  const hasImage = Boolean(product.image && product.image !== 'placeholder');
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category;

  const badge =
    product.badge === 'bestseller'
      ? { label: 'Best Seller', bg: '#C9513A', color: '#FFFFFF' }
      : product.badge === 'new'
      ? { label: 'New', bg: '#FFF4F2', color: '#C9513A' }
      : null;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      volume: product.volume,
      priceEur: product.priceEur,
      priceBdt: product.priceBdt,
      image: product.image,
    });
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-hairline bg-white transition-shadow duration-200 hover:shadow-card">
      {/* Category tag — top left */}
      <div className="absolute left-2 top-2 z-10">
        <span className="rounded-full border border-hairline bg-white/90 px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.1em] text-muted backdrop-blur-sm">
          {categoryLabel}
        </span>
      </div>

      {/* Badge — top right */}
      {badge && (
        <div className="absolute right-2 top-2 z-10">
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]"
            style={{ backgroundColor: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
        </div>
      )}

      {/* Image area */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative w-full" style={{ aspectRatio: '4/5', background: '#F5F1ED' }}>
          {hasImage && !imgError ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-5 transition-transform duration-500 group-hover:scale-[1.04]"
              onError={() => setImgError(true)}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-serif text-5xl italic" style={{ color: '#DDD6CF' }}>
                {product.brand.charAt(0)}
              </span>
            </div>
          )}

          {/* Volume badge — bottom right of image */}
          {product.volume && (
            <span className="absolute bottom-2 right-2 rounded border border-hairline bg-white/90 px-1.5 py-0.5 text-[9px] font-medium text-muted">
              {product.volume}
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <p className="text-[9px] uppercase tracking-[0.25em] text-muted">{product.brand}</p>
          <Link href={`/product/${product.id}`}>
            <h3 className="mt-1 line-clamp-2 cursor-pointer text-[12px] font-medium leading-snug text-ink transition-colors hover:text-accent">
              {product.name}
            </h3>
          </Link>
        </div>

        <Stars rating={4.5} count={12} />

        <p className="text-[13px] font-semibold" style={{ color: '#C9513A' }}>
          {fmt(product.priceBdt)}
        </p>

        <button
          onClick={handleAdd}
          className="mt-auto w-full cursor-pointer rounded border border-accent py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent transition-all duration-200 hover:bg-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-accent/30"
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
