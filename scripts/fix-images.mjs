// fix-images.mjs — associe chaque image au bon produit
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productsPath = path.join(__dirname, '..', 'data', 'products.json');
const products = JSON.parse(readFileSync(productsPath, 'utf-8'));

// Mapping SKU → image(s) correctes
const imageMap = {
  // ─── Yves Rocher ───────────────────────────────────────────────
  'YR-007': {
    image: '/images/Après-Shampooing Reconstituant Réparation.webp',
    gallery: [
      '/images/Après-Shampooing Reconstituant Réparation.webp',
      '/images/Après-Shampooing Reconstituant Réparation 2.webp',
      '/images/Après-Shampooing Reconstituant Réparation 3.webp',
    ]
  },
  'YR-008': {
    image: '/images/Garden Party - Eau de Parfum.webp',
    gallery: [
      '/images/Garden Party - Eau de Parfum.webp',
      '/images/Garden Party - Eau de Parfum 2.webp',
      '/images/Garden Party - Eau de Parfum 3.webp',
    ]
  },
  // Ces 7 produits avaient tous la même mauvaise image (bannière YR)
  // → reset placeholder jusqu'à téléchargement des vraies images
  'YR-009': { image: 'placeholder' },
  'YR-010': { image: 'placeholder' },
  'YR-011': { image: 'placeholder' },
  'YR-013': { image: 'placeholder' },
  'YR-014': { image: 'placeholder' },
  'YR-015': { image: 'placeholder' },
  'YR-018': { image: 'placeholder' },

  // ─── Vichy ─────────────────────────────────────────────────────
  'VY-001': {
    image: '/images/vichy-mineral-89.jpg',
  },
  'VY-002': {
    image: '/images/VICHY_AQUALIA_THERMAL_CREME_RICHE.png',
    gallery: [
      '/images/VICHY_AQUALIA_THERMAL_CREME_RICHE.png',
      '/images/aqualia-cream-rich-pack2.jpg',
      '/images/aqualia-cream-rich-pack3.jpg',
      '/images/aqualia-cream-rich-pack4.jpg',
    ]
  },
  'VY-003': {
    image: '/images/vichy-liftactiv-night.png',
    gallery: [
      '/images/vichy-liftactiv-night.png',
      '/images/2-creme de nuit.png',
      '/images/3-creme de nuit.png',
      '/images/4-creme de nuit.png',
    ]
  },
  'VY-004': {
    image: '/images/normaderm-phytosolution-pack1.jpg',
    gallery: [
      '/images/normaderm-phytosolution-pack1.jpg',
      '/images/normaderm-phytosolution-pack3.jpg',
      '/images/normaderm-phytosolution-pack5.jpg',
    ]
  },
  'VY-005': {
    image: '/images/DERCOS.png',
    gallery: [
      '/images/DERCOS.png',
      '/images/DERCOS2.png',
    ]
  },
  'VY-006': {
    image: '/images/VICHY_DEO_MEN_48H_ANTI_STAINS.jpg',
  },
  'VY-007': { image: 'placeholder' },
  'VY-008': { image: 'placeholder' },
};

let updated = 0;
for (const p of products) {
  const mapping = imageMap[p.sku];
  if (!mapping) continue;

  p.image = mapping.image;

  if (mapping.gallery) {
    p.gallery = mapping.gallery;
  } else if (mapping.image === 'placeholder') {
    delete p.gallery; // supprimer une éventuelle galerie invalide
  }

  updated++;
  console.log(`✅ ${p.sku} ${p.name} → ${mapping.image}`);
}

writeFileSync(productsPath, JSON.stringify(products, null, 2));
console.log(`\n✔ ${updated} produits mis à jour dans products.json`);
