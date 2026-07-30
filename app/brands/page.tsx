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
    description: 'Soins dermatologiques testés pour les peaux sensibles.',
    fullDescription: 'CeraVe est une marque dermatologique pionnière qui combine la science et les soins de la peau. Développée avec des dermatologues, elle se concentre sur la réparation et la protection de la barrière cutanée en utilisant des céramides et des ingrédients naturels.',
    expertise: ['Peaux sensibles', 'Hydratation', 'Dermatologie', 'Anti-inflammatoire'],
    heritage: 'Créée en collaboration avec la Société Nationale de Dermatologie, CeraVe s\'est imposée comme une référence en soins dermatologiques cliniquement prouvés.',
    image: '/images/cerave.jpg',
    foundedYear: 2005,
  },
  {
    id: 'yves-rocher',
    name: 'Yves Rocher',
    description: 'Cosmétiques naturels inspirés par la botanique française.',
    fullDescription: 'Yves Rocher est une marque française de beauté fondée en Bretagne, pionnière en phytocosmétique. Elle allie la puissance des plantes avec une approche respectueuse de l\'environnement et du bien-être animal.',
    expertise: ['Phytocosmétique', 'Beauté bio', 'Soins naturels', 'Durabilité'],
    heritage: 'Depuis 1968, Yves Rocher défend la beauté naturelle. Chaque produit est formulé à partir d\'extraits botaniques provenant de ses propres jardins de Bretagne.',
    image: '/images/yves-rocher.jpg',
    foundedYear: 1968,
  },
  {
    id: 'vichy',
    name: 'Vichy',
    description: 'Formules actives enrichies en eau thermale.',
    fullDescription: 'Vichy est une marque dermatologique française reconnue pour ses formules basées sur l\'eau thermale de Vichy. Ses produits sont développés scientifiquement pour traiter les problèmes de peau spécifiques et renforcer la barrière cutanée.',
    expertise: ['Eau thermale', 'Traitement acné', 'Anti-âge', 'Sensibilités'],
    heritage: 'Depuis 1931, Vichy exploite l\'eau thermale riche en minéraux de la source de Vichy en France. Cette eau unique est au cœur de tous les produits.',
    image: '/images/vichy.jpg',
    foundedYear: 1931,
  },
];

export default function BrandsPage() {
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
            <p className="text-xs uppercase tracking-[0.35em] text-charcoal/60">Marques</p>
            <h1 className="text-4xl font-semibold text-black md:text-5xl">Nos partenaires français</h1>
            <p className="max-w-3xl text-base leading-8 text-charcoal/80">
              Découvrez les marques sélectionnées par French Beauty BD pour leur expertise cosmétique, leur engagement qualité et leur héritage français authentique.
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
                  <p className="text-xs text-charcoal/60">Depuis {brand.foundedYear}</p>
                  <span className="text-xs font-semibold text-gold group-hover:translate-x-1 transition-transform">
                    En savoir plus →
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

