'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import { BrandModal } from '../../components/BrandModal';

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

const brands: Brand[] = [
  {
    id: 'cerave',
    name: 'CeraVe',
    description: 'Dermatologist-tested skincare for sensitive skin.',
    fullDescription: 'CeraVe is a dermatological brand that combines science and skincare. Developed with dermatologists, it focuses on helping to support and protect the skin barrier using ceramides and gentle ingredients.',
    expertise: ['Sensitive skin', 'Hydration', 'Dermatology', 'Soothing'],
    heritage: 'Developed with dermatologists, CeraVe has become a reference in clinically tested skincare.',
    image: '/images/cerave.jpg',
    foundedYear: 2005,
  },
  {
    id: 'yves-rocher',
    name: 'Yves Rocher',
    description: 'Natural cosmetics inspired by French botany.',
    fullDescription: 'Yves Rocher is a French beauty brand founded in Brittany, a pioneer in plant-based cosmetics. It combines the power of plants with a respectful approach to the environment and animal welfare.',
    expertise: ['Plant-based cosmetics', 'Organic beauty', 'Natural care', 'Sustainability'],
    heritage: 'Since 1968, Yves Rocher has championed natural beauty. Each product is formulated with botanical extracts from its own gardens in Brittany.',
    image: '/images/yves-rocher.jpg',
    foundedYear: 1968,
  },
  {
    id: 'vichy',
    name: 'Vichy',
    description: 'Active formulas enriched with thermal spa water.',
    fullDescription: 'Vichy is a French dermatological brand known for formulas based on Vichy thermal spa water. Its products are developed to target specific skin concerns and help strengthen the skin barrier.',
    expertise: ['Thermal water', 'Blemish-prone skin', 'Anti-ageing', 'Sensitive skin'],
    heritage: 'Since 1931, Vichy has drawn on the mineral-rich thermal water from the Vichy spring in France. This unique water is at the heart of every product.',
    image: '/images/vichy.jpg',
    foundedYear: 1931,
  },
];

export default function BrandsClient() {
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openBrandModal = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-background text-text">
      <Header />
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">Brands</p>
            <h1 className="text-4xl font-semibold text-black md:text-5xl">Our French partners</h1>
            <p className="max-w-3xl text-base leading-8 text-charcoal/80">
              Discover the brands selected by French Beauty BD for their cosmetic expertise, their commitment to quality and their authentic French heritage.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => openBrandModal(brand)}
                className="rounded-3xl border border-charcoal/10 bg-white p-8 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 text-left group cursor-pointer"
              >
                {/* Brand Letter Icon */}
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-black/10 to-black/5 flex items-center justify-center mb-4 group-hover:from-black/20 group-hover:to-black/10 transition-colors">
                  <span className="text-2xl font-serif font-semibold text-black">{brand.name.charAt(0)}</span>
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold text-black group-hover:text-gold transition-colors">{brand.name}</h2>
                  <p className="text-sm leading-6 text-charcoal/75">{brand.description}</p>

                  {/* Expertise Tags Preview */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {brand.expertise.slice(0, 2).map((exp) => (
                      <span
                        key={exp}
                        className="text-xs rounded-full bg-black/5 px-2 py-1 text-charcoal/70"
                      >
                        {exp}
                      </span>
                    ))}
                    {brand.expertise.length > 2 && (
                      <span className="text-xs text-charcoal/50">+{brand.expertise.length - 2}</span>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-xs text-charcoal/60">Since {brand.foundedYear}</p>
                  <span className="text-xs font-semibold text-gold group-hover:translate-x-1 transition-transform">
                    Learn more →
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <BrandModal brand={selectedBrand} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
