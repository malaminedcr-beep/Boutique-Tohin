import productsData from '../../data/products.json';

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
  gallery?: string[];
  badge: string | null;
};

const products = productsData as Product[];

const genderCategoryMap = {
  homme: ['mens-fragrance', 'musc', 'deodorants', 'body-care'],
  femme: ['face-care', 'body-care', 'hair-care', 'deodorants'],
};

const priceRangeMap = {
  '0-2000': [0, 2000],
  '2000-3000': [2000, 3000],
  '3000-99999': [3000, Infinity],
};

export function getProducts(filters?: {
  gender?: string;
  category?: string;
  brand?: string;
  price?: string;
}) {
  return products.filter((product) => {
    const genderCategories = filters?.gender ? genderCategoryMap[filters.gender as keyof typeof genderCategoryMap] : null;
    const matchesGender = !genderCategories || genderCategories.includes(product.category);
    const matchesCategory = !filters?.category || filters.category === 'all' || product.category === filters.category;
    const matchesBrand = !filters?.brand || filters.brand === 'Toutes les marques' || product.brand === filters.brand;
    const lookup = filters?.price && (filters.price in priceRangeMap ? priceRangeMap[filters.price as keyof typeof priceRangeMap] : undefined);
    const [min, max] = (lookup ?? [0, Infinity]) as [number, number];
    const matchesPrice = product.priceBdt >= min && product.priceBdt <= max;
    return matchesGender && matchesCategory && matchesBrand && matchesPrice;
  });
}

export function getProductById(id: number) {
  return products.find((product) => product.id === id) || null;
}

export function getFeaturedProducts(limit = 6) {
  return products.filter((product) => product.badge === 'bestseller').slice(0, limit);
}

export function getAllBrands() {
  return Array.from(new Set(products.map((product) => product.brand)));
}

export type { Product };
