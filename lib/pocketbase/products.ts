import PocketBase from 'pocketbase';
import type { Product } from '../commerce/types';
import { filterProducts, type ProductFilters } from '../commerce/filter';

/**
 * Lecture produits depuis PocketBase (source de vérité). SERVER-ONLY
 * (à appeler depuis des Server Components / route handlers).
 * La lecture est publique (rule products list/view = "") → pas d'auth requise.
 */
const URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8090';

/** PocketBase client whose requests bypass Next's fetch cache (always fresh). */
function serverPb(): PocketBase {
  const pb = new PocketBase(URL);
  pb.beforeSend = (url, options) => {
    (options as any).cache = 'no-store';
    return { url, options };
  };
  return pb;
}

type ProductRecord = {
  ref: number;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  volume: string;
  price_bdt: number;
  price_eur: number;
  image_url: string;
  gallery: string[] | null;
  in_stock: boolean;
  is_new: boolean;
  is_bestseller: boolean;
};

function toProduct(rec: ProductRecord): Product {
  return {
    id: rec.ref,
    sku: rec.sku,
    name: rec.name,
    brand: rec.brand,
    category: rec.category,
    volume: rec.volume,
    priceEur: rec.price_eur,
    priceBdt: rec.price_bdt,
    image: rec.image_url,
    gallery: rec.gallery && rec.gallery.length > 0 ? rec.gallery : undefined,
    badge: rec.is_bestseller ? 'bestseller' : rec.is_new ? 'new' : null,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const pb = serverPb();
  const items = await pb.collection('products').getFullList<ProductRecord>({ sort: 'ref' });
  return items.map(toProduct);
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  return filterProducts(await getAllProducts(), filters);
}

export async function getProductByRef(ref: number): Promise<Product | null> {
  if (!Number.isFinite(ref)) return null;
  const pb = serverPb();
  try {
    const rec = await pb.collection('products').getFirstListItem<ProductRecord>(`ref=${ref}`);
    return toProduct(rec);
  } catch {
    return null;
  }
}

export async function getAllBrands(): Promise<string[]> {
  const products = await getAllProducts();
  return Array.from(new Set(products.map((p) => p.brand)));
}
