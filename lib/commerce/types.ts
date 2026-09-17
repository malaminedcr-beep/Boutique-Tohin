export type ProductVariant = {
  volume: string;
  priceBdt: number;
  isDefault: boolean;
};

/** Shape produit consommée par la vitrine (id numérique = `ref` Supabase). */
export type Product = {
  id: number;
  sku: string;
  name: string;
  /** French packaging name, shown as a discreet subtitle when it differs from `name`. */
  nameFr?: string;
  brand: string;
  category: string;
  description?: string;
  keyFeatures?: string;
  ingredients?: string;
  howToUse?: string;
  volume: string;
  priceEur: number;
  priceBdt: number;
  image: string;
  gallery?: string[];
  badge: string | null;
  inStock: boolean;
  /**
   * Pricing lifecycle. 'draft' = price not finalised: the product is shown but
   * cannot be added to the cart or ordered. Anything else (incl. undefined) is
   * treated as a normal, purchasable price.
   */
  priceStatus?: string;
  variants?: ProductVariant[];
};

/** A product is only purchasable when in stock AND its price is finalised. */
export function isPurchasable(product: { inStock: boolean; priceStatus?: string }): boolean {
  return product.inStock && product.priceStatus !== 'draft';
}
