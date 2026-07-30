// scrape-images.mjs — Apify web-scraper ciblant amazon.fr (SSR, images dans le HTML)
import { createWriteStream, readFileSync, writeFileSync } from 'fs';
import { pipeline } from 'stream/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APIFY_TOKEN = process.env.APIFY_TOKEN;
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images');

const missingProducts = [
  // Yves Rocher
  { id: 18, sku: 'YR-007', name: 'Hair Care Conditioner',     filename: 'yr-hair-conditioner',       query: 'Yves Rocher après shampoing conditioner' },
  { id: 19, sku: 'YR-008', name: 'Fragrance Gardenia',        filename: 'yr-fragrance-gardenia',     query: 'Yves Rocher Gardenia eau de parfum' },
  { id: 20, sku: 'YR-009', name: 'Oud Intense',               filename: 'yr-oud-intense',            query: 'Yves Rocher Oud Intense parfum' },
  { id: 21, sku: 'YR-010', name: 'Vanilla Musk',              filename: 'yr-vanilla-musk',           query: 'Yves Rocher Vanille Musk parfum' },
  { id: 22, sku: 'YR-011', name: 'Rose Signature',            filename: 'yr-rose-signature',         query: 'Yves Rocher Rose Signature parfum' },
  { id: 24, sku: 'YR-013', name: 'Revitalizing Hair Oil',     filename: 'yr-hair-oil',               query: 'Yves Rocher huile soin cheveux' },
  { id: 25, sku: 'YR-014', name: 'Citrus Deodorant Spray',   filename: 'yr-citrus-deodorant',       query: 'Yves Rocher déodorant spray' },
  { id: 26, sku: 'YR-015', name: 'Soft Touch Deodorant',      filename: 'yr-soft-deodorant',         query: 'Yves Rocher déodorant bille' },
  { id: 29, sku: 'YR-018', name: 'Gentle Cleansing Foam',     filename: 'yr-cleansing-foam',         query: 'Yves Rocher mousse nettoyante visage' },
  // Vichy
  { id: 30, sku: 'VY-001', name: 'Mineral 89 Serum',          filename: 'vichy-mineral-89',          query: 'Vichy Mineral 89 sérum booster' },
  { id: 31, sku: 'VY-002', name: 'Aqualia Thermal Cream',     filename: 'vichy-aqualia-thermal',     query: 'Vichy Aqualia Thermal crème hydratante' },
  { id: 32, sku: 'VY-003', name: 'LiftActiv Night Cream',     filename: 'vichy-liftactiv-night',     query: 'Vichy LiftActiv crème nuit anti-âge' },
  { id: 33, sku: 'VY-004', name: 'Normaderm Acne Care',       filename: 'vichy-normaderm',           query: 'Vichy Normaderm soin anti-imperfections' },
  { id: 34, sku: 'VY-005', name: 'Anti-Dandruff Shampoo',     filename: 'vichy-dercos-antidandruff', query: 'Vichy Dercos shampooing antipelliculaire' },
  { id: 35, sku: 'VY-006', name: 'Homme Deodorant Spray',     filename: 'vichy-homme-deodorant',     query: 'Vichy Homme déodorant spray' },
  { id: 36, sku: 'VY-007', name: 'Eau Thermale Perfume',      filename: 'vichy-eau-thermale-perfume',query: 'Vichy eau thermale soin' },
  { id: 37, sku: 'VY-008', name: 'Elegant Musk',              filename: 'vichy-elegant-musk',        query: 'Vichy Idéal Body soin lait' },
];

// amazon.fr : SSR, images produits disponibles dans le HTML sans JS
const startUrls = missingProducts.map(p => ({
  url: `https://www.amazon.fr/s?k=${encodeURIComponent(p.query)}&language=fr_FR`,
  userData: { id: p.id, sku: p.sku, filename: p.filename, name: p.name },
}));

// pageFunction utilise context.$ (Cheerio) — pas context.page
const pageFunction = `
async function pageFunction(context) {
  const { $, request, log } = context;
  const { id, sku, filename, name } = request.userData || {};

  log.info('Processing: ' + name);

  let imageUrl = null;

  // Amazon search : images produits dans img.s-image (SSR)
  $('img.s-image').each(function () {
    const src = $(this).attr('src') || '';
    if (src.startsWith('https') && src.includes('images/I') && !src.includes('sprite')) {
      imageUrl = src;
      return false;
    }
  });

  // Fallback : toute image Amazon CDN
  if (!imageUrl) {
    $('img[src*="images-amazon"], img[src*="m.media-amazon"]').each(function () {
      const src = $(this).attr('src') || '';
      if (src.startsWith('https') && src.includes('images/I')) {
        imageUrl = src;
        return false;
      }
    });
  }

  log.info((imageUrl ? '✓ ' : '✗ ') + name + ' → ' + (imageUrl ? imageUrl.slice(0, 60) + '...' : 'NOT FOUND'));
  return { id, sku, filename, name, imageUrl: imageUrl || null };
}
`;

async function apifyRequest(endpoint, method = 'GET', body) {
  const res = await fetch(`https://api.apify.com/v2${endpoint}`, {
    method,
    headers: { 'Authorization': `Bearer ${APIFY_TOKEN}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Apify ${method} ${endpoint} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function pollUntilDone(runId) {
  process.stdout.write('⏳ ');
  let status = 'RUNNING';
  while (['RUNNING', 'READY'].includes(status)) {
    await new Promise(r => setTimeout(r, 8000));
    const s = await apifyRequest(`/actor-runs/${runId}`);
    status = s.data.status;
    process.stdout.write(status === 'RUNNING' ? '.' : ` ${status}\n`);
  }
  return status;
}

async function downloadImage(url, filename) {
  const ext = (url.match(/\.(webp|png|jpe?g)(\?|$)/i)?.[1] || 'jpg').replace('jpeg', 'jpg');
  const filepath = path.join(IMAGES_DIR, `${filename}.${ext}`);
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await pipeline(res.body, createWriteStream(filepath));
  return `${filename}.${ext}`;
}

async function main() {
  console.log(`\n🚀 Apify → amazon.fr — ${missingProducts.length} produits\n`);

  const run = await apifyRequest('/acts/apify~web-scraper/runs', 'POST', {
    startUrls,
    pageFunction,
    maxCrawlingDepth: 0,
    maxPagesPerCrawl: missingProducts.length + 5,
    proxyConfiguration: { useApifyProxy: true },
    waitUntil: ['domcontentloaded'],
  });

  const runId = run.data.id;
  const datasetId = run.data.defaultDatasetId;
  console.log(`✅ Run ID : ${runId}\n`);

  const finalStatus = await pollUntilDone(runId);
  if (finalStatus !== 'SUCCEEDED') throw new Error(`Run échoué : ${finalStatus}`);

  const dataset = await apifyRequest(`/datasets/${datasetId}/items?limit=100`);
  const items = Array.isArray(dataset) ? dataset : (dataset.data?.items ?? []);
  console.log(`\n📦 ${items.length} résultats\n`);

  const updates = {};
  for (const item of items) {
    if (!item || !item.sku) continue;
    if (!item.imageUrl) { console.log(`⚠️  ${item.name} → pas d'image`); continue; }
    try {
      const saved = await downloadImage(item.imageUrl, item.filename);
      updates[item.sku] = `/images/${saved}`;
      console.log(`✅ ${item.name} → /images/${saved}`);
    } catch (e) {
      console.log(`❌ ${item.name} → ${e.message}`);
    }
  }

  const productsPath = path.join(__dirname, '..', 'data', 'products.json');
  const products = JSON.parse(readFileSync(productsPath, 'utf-8'));
  let count = 0;
  for (const p of products) {
    if (updates[p.sku]) { p.image = updates[p.sku]; count++; }
  }
  writeFileSync(productsPath, JSON.stringify(products, null, 2));

  console.log(`\n🎉 ${count}/${missingProducts.length} produits mis à jour dans products.json`);
  const remaining = missingProducts.filter(p => !updates[p.sku]);
  if (remaining.length) {
    console.log(`\n⚠️  Encore manquants :`);
    remaining.forEach(p => console.log(`   - ${p.sku} ${p.name}`));
  }
}

main().catch(err => { console.error('\n❌', err.message); process.exit(1); });
