/**
 * scripts/migrate-to-pocketbase.ts
 * ----------------------------------------------------------------------------
 * Seed initial de la collection `products` de PocketBase depuis
 * data/products.json. Idempotent (upsert par slug).
 *
 * data/products.json = source du SEED initial uniquement. En prod, la vitrine
 * lit PocketBase (source de vérité), pas le JSON.
 *
 * Usage : npx tsx scripts/migrate-to-pocketbase.ts
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import PocketBase from 'pocketbase';

config({ path: '.env.local' });

const URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL ||
  process.env.POCKETBASE_URL ||
  'http://127.0.0.1:8090';
const EMAIL = process.env.POCKETBASE_ADMIN_EMAIL!;
const PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD!;

type JsonProduct = {
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

const pb = new PocketBase(URL);

function toRecord(p: JsonProduct) {
  return {
    ref: p.id,
    sku: p.sku,
    slug: p.sku.toLowerCase(),
    name: p.name,
    brand: p.brand,
    category: p.category,
    description: '',
    volume: p.volume,
    price_bdt: p.priceBdt,
    price_eur: p.priceEur,
    image_url: p.image,
    gallery: p.gallery ?? [],
    in_stock: true,
    is_new: p.badge === 'new',
    is_bestseller: p.badge === 'bestseller',
  };
}

async function main() {
  await pb.collection('_superusers').authWithPassword(EMAIL, PASSWORD);
  console.log('✓ superuser authenticated');

  const json = JSON.parse(
    readFileSync(resolve(process.cwd(), 'data/products.json'), 'utf-8'),
  ) as JsonProduct[];

  let created = 0;
  let updated = 0;

  for (const p of json) {
    const slug = p.sku.toLowerCase();
    const data = toRecord(p);
    try {
      const existing = await pb
        .collection('products')
        .getFirstListItem(`slug="${slug}"`);
      await pb.collection('products').update(existing.id, data);
      updated++;
    } catch {
      await pb.collection('products').create(data);
      created++;
    }
  }

  const total = await pb.collection('products').getList(1, 1);
  console.log(`\n✓ Seed terminé — créés: ${created}, mis à jour: ${updated}`);
  console.log(`  Total produits dans PocketBase : ${total.totalItems}`);
}

main().catch((e) => {
  console.error('✗', e?.response ?? e);
  process.exit(1);
});
