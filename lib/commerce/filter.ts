import type { Product } from './types';

/**
 * Filtrage produits (pur, isomorphe : réutilisable côté serveur ET client).
 * Ne dépend d'aucune source de données — opère sur un tableau déjà chargé.
 */
const genderCategoryMap = {
  homme: ['body-care', 'deodorants'],
  femme: ['face-care', 'body-care', 'hair-care', 'deodorants'],
};

const priceRangeMap = {
  '0-2000': [0, 2000],
  '2000-3000': [2000, 3000],
  '3000-99999': [3000, Infinity],
};

export type ProductFilters = {
  gender?: string;
  category?: string;
  brand?: string;
  price?: string;
};

export function filterProducts(products: Product[], filters?: ProductFilters): Product[] {
  return products.filter((product) => {
    const genderCategories = filters?.gender
      ? genderCategoryMap[filters.gender as keyof typeof genderCategoryMap]
      : null;
    const matchesGender = !genderCategories || genderCategories.includes(product.category);
    const matchesCategory =
      !filters?.category || filters.category === 'all' || product.category === filters.category;
    const matchesBrand =
      !filters?.brand || filters.brand === 'Toutes les marques' || product.brand === filters.brand;
    const lookup =
      filters?.price && (filters.price in priceRangeMap
        ? priceRangeMap[filters.price as keyof typeof priceRangeMap]
        : undefined);
    const [min, max] = (lookup ?? [0, Infinity]) as [number, number];
    const matchesPrice = product.priceBdt >= min && product.priceBdt <= max;
    return matchesGender && matchesCategory && matchesBrand && matchesPrice;
  });
}
