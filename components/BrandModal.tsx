'use client';

import { useState } from 'react';

interface Brand {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  expertise: string[];
  heritage: string;
  image: string;
  foundedYear: number;
}

export function BrandModal({ brand, isOpen, onClose }: { brand: Brand | null; isOpen: boolean; onClose: () => void }) {
  if (!isOpen || !brand) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8">
      <div className="rounded-[2rem] bg-white shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-charcoal/10 bg-white p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-semibold text-black">{brand.name}</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-charcoal/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Brand Image Placeholder */}
          <div className="h-48 rounded-2xl border border-black/10 bg-cream flex items-center justify-center">
            <div className="text-6xl font-serif italic text-charcoal/30">{brand.name.charAt(0)}</div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">À propos</p>
            <p className="text-base leading-7 text-charcoal/80">{brand.fullDescription}</p>
          </div>

          {/* Heritage */}
          <div className="space-y-3 rounded-2xl bg-cream p-4 md:p-6">
            <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">Héritage</p>
            <p className="text-sm leading-6 text-charcoal/75">
              {brand.heritage}
            </p>
            <p className="text-xs font-semibold text-charcoal/60">Fondée en {brand.foundedYear}</p>
          </div>

          {/* Expertise */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">Domaines d'expertise</p>
            <div className="flex flex-wrap gap-2">
              {brand.expertise.map((exp) => (
                <span
                  key={exp}
                  className="rounded-full border border-black/20 bg-black/5 px-4 py-2 text-xs font-medium text-charcoal"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="border-t border-charcoal/10 pt-6">
            <a
              href={`/shop?brand=${brand.name}`}
              className="block w-full rounded-full bg-black px-6 py-4 text-center text-sm font-semibold text-white transition hover:bg-charcoal/90"
            >
              Découvrir les produits {brand.name}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
