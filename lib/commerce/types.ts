/** Shape produit consommée par la vitrine (id numérique = `ref` PocketBase). */
export type Product = {
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
