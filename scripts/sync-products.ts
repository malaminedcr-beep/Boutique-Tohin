/**
 * scripts/sync-products.ts
 * ----------------------------------------------------------------------------
 * Compares the storefront catalogue (data/products.json) against the Supabase
 * `products` table and prints a divergence report. It ONLY writes when run with
 * --apply. Join key: products.slug === products.json sku (lowercased).
 *
 * Usage:
 *   npx tsx scripts/sync-products.ts            # dry-run: report only
 *   npx tsx scripts/sync-products.ts --apply    # upsert JSON -> Supabase
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const APPLY = process.argv.includes('--apply');

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
  badge: string | null;
};

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string | null;
  price_bdt: number;
  price_eur: number;
  image_url: string | null;
  in_stock: boolean;
  is_new: boolean | null;
  is_bestseller: boolean | null;
};

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !SERVICE_KEY) {
  console.error(
    '✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local',
  );
  process.exit(1);
}

const supabase = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

function loadJson(): JsonProduct[] {
  const raw = readFileSync(resolve(process.cwd(), 'data/products.json'), 'utf-8');
  return JSON.parse(raw) as JsonProduct[];
}

async function main() {
  const json = loadJson();
  const { data: dbRows, error } = await supabase
    .from('products')
    .select(
      'id, slug, name, brand, category, price_bdt, price_eur, image_url, in_stock, is_new, is_bestseller',
    );
  if (error) {
    console.error('✗ Supabase read failed:', error.message);
    process.exit(1);
  }

  const db = (dbRows ?? []) as DbProduct[];
  const dbBySlug = new Map(db.map((p) => [p.slug, p]));
  const jsonBySlug = new Map(json.map((p) => [p.sku.toLowerCase(), p]));

  const missingInDb: JsonProduct[] = [];
  const orphanInDb: DbProduct[] = [];
  const priceDiffs: string[] = [];
  const nameDiffs: string[] = [];

  for (const p of json) {
    const slug = p.sku.toLowerCase();
    const row = dbBySlug.get(slug);
    if (!row) {
      missingInDb.push(p);
      continue;
    }
    if (Number(row.price_bdt) !== p.priceBdt || Number(row.price_eur) !== p.priceEur) {
      priceDiffs.push(
        `  ${slug}: BDT ${row.price_bdt}→${p.priceBdt}, EUR ${row.price_eur}→${p.priceEur}`,
      );
    }
    if (row.name !== p.name) {
      nameDiffs.push(`  ${slug}: "${row.name}"  →  "${p.name}"`);
    }
  }

  for (const row of db) {
    if (!jsonBySlug.has(row.slug)) orphanInDb.push(row);
  }

  // ── Report ────────────────────────────────────────────────────────────────
  console.log('\n=== Catalogue divergence report ===');
  console.log(`JSON products:     ${json.length}`);
  console.log(`Supabase products: ${db.length}`);
  console.log(`\nMissing in Supabase (would INSERT): ${missingInDb.length}`);
  missingInDb.forEach((p) => console.log(`  ${p.sku.toLowerCase()}  ${p.name}`));
  console.log(`\nOrphans in Supabase (not in JSON):  ${orphanInDb.length}`);
  orphanInDb.forEach((p) => console.log(`  ${p.slug}  ${p.name}`));
  console.log(`\nPrice mismatches (would UPDATE):    ${priceDiffs.length}`);
  priceDiffs.forEach((l) => console.log(l));
  console.log(`\nName mismatches (would UPDATE):     ${nameDiffs.length}`);
  nameDiffs.forEach((l) => console.log(l));

  if (!APPLY) {
    console.log('\nDry-run only. Re-run with --apply to write these changes.\n');
    return;
  }

  // ── Apply (upsert by slug) ──────────────────────────────────────────────────
  const payload = json.map((p) => ({
    slug: p.sku.toLowerCase(),
    name: p.name,
    brand: p.brand,
    category: p.category,
    price_bdt: p.priceBdt,
    price_eur: p.priceEur,
    image_url: p.image,
    is_new: p.badge === 'new',
    is_bestseller: p.badge === 'bestseller',
  }));

  console.log(`\nApplying upsert for ${payload.length} products…`);
  const { error: upsertError } = await supabase
    .from('products')
    .upsert(payload, { onConflict: 'slug' });

  if (upsertError) {
    console.error('✗ Upsert failed:', upsertError.message);
    process.exit(1);
  }
  console.log('✓ Upsert complete. Orphans (if any) were left untouched.\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
