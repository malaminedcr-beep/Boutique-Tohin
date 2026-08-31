import { createClient } from '@supabase/supabase-js';
import type { Product } from '../commerce/types';
import { filterProducts, type ProductFilters } from '../commerce/filter';

/**
 * Product reads from Supabase (source of truth). SERVER-ONLY
 * (call from Server Components / route handlers). Reads are public
 * (RLS products_public_read) → the anon key is enough, no session needed.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function db() {
  return createClient(url, anon, {
    auth: { persistSession: false },
    // Always read live prices/stock from Supabase. Without this, Next.js/Vercel
    // stores the supabase-js fetch in the Data Cache (even on force-dynamic pages),
    // so admin edits in Supabase would not appear until the next redeploy.
    global: {
      fetch: (input: RequestInfo | URL, init?: RequestInit) =>
        fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}

type ProductRow = {
  ref: number;
  sku: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string | null;
  volume: string | null;
  price_bdt: number;
  price_eur: number | null;
  image_url: string | null;
  gallery: string[] | null;
  in_stock: boolean;
  is_new: boolean;
  is_bestseller: boolean;
};

function toProduct(rec: ProductRow): Product {
  return {
    id: rec.ref,
    sku: rec.sku,
    name: rec.name,
    brand: rec.brand,
    category: rec.category,
    volume: rec.volume ?? '',
    priceEur: rec.price_eur ?? 0,
    priceBdt: rec.price_bdt,
    image: rec.image_url ?? '',
    gallery: rec.gallery && rec.gallery.length > 0 ? rec.gallery : undefined,
    badge: rec.is_bestseller ? 'bestseller' : rec.is_new ? 'new' : null,
    inStock: rec.in_stock,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await db()
    .from('products')
    .select('*')
    .order('ref', { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(toProduct);
}

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
  // Storefront only shows purchasable products. Out-of-stock rows act as
  // drafts (e.g. new products awaiting price) and stay hidden until restocked.
  const inStock = (await getAllProducts()).filter((p) => p.inStock);
  return filterProducts(inStock, filters);
}

export async function getProductByRef(ref: number): Promise<Product | null> {
  if (!Number.isFinite(ref)) return null;
  const { data, error } = await db()
    .from('products')
    .select('*')
    .eq('ref', ref)
    .maybeSingle();
  if (error || !data) return null;
  const product = toProduct(data as ProductRow);
  // Draft / out-of-stock products are not publicly reachable.
  if (!product.inStock) return null;
  return product;
}

export async function getAllBrands(): Promise<string[]> {
  const products = await getAllProducts();
  return Array.from(new Set(products.map((p) => p.brand)));
}
