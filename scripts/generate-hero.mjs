/**
 * Generate homepage hero backgrounds with the Gemini image API (Nano Banana).
 *
 * Run manually (NOT part of the build):
 *   node scripts/generate-hero.mjs
 *
 * For each of the 3 hero slides it sends the current PRODUCT PACKSHOT as a
 * reference (so the bottle / label / logo stay identical) and generates, per
 * slide, 2 formats (portrait 4:5 for mobile, landscape 16:9 for desktop) with
 * 3 variants each → 18 drafts in public/hero/drafts/.
 *
 * Model: gemini-3-pro-image (Nano Banana Pro, best quality). Override with
 *   GEMINI_IMAGE_MODEL=gemini-2.5-flash-image node scripts/generate-hero.mjs
 * NOTE: image generation needs a BILLING-ENABLED Gemini project (Free Tier has
 * 0 image quota). The key is read from .env.local and never printed/committed.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-3-pro-image';
const FALLBACK_MODEL = 'gemini-2.5-flash-image';
const IMAGE_SIZE = process.env.GEMINI_IMAGE_SIZE || '2K';
const VARIANTS = Number(process.env.GEMINI_VARIANTS || 3);
const MAX_USD = Number(process.env.GEMINI_MAX_USD || 3);
const OUT_DIR = path.join(ROOT, 'public/hero/drafts');

// Conservative per-image price estimates (USD, Standard tier, 2K) incl. input.
const PRICE = { 'gemini-3-pro-image': 0.14, 'gemini-2.5-flash-image': 0.042 };
const priceOf = (m) => PRICE[m] ?? 0.14;

let activeModel = MODEL; // flips to FALLBACK_MODEL if the primary ever fails
let spent = 0;

const FORMATS = [
  { name: 'portrait', ratio: '4:5', space: 'Leave the TOP 40% of the frame as clean, empty negative space for text.' },
  { name: 'landscape', ratio: '16:9', space: 'Leave the LEFT 45% of the frame as clean, empty negative space for text.' },
];

const SLIDES = [
  {
    key: 'monoi',
    packshot: 'public/images/yr-monoi-body-milk-packshot.webp',
    decor:
      'warm golden sand dusted with white tiaré and frangipani flowers, a soft tropical beach bokeh in the far background',
    tone: 'warm beige and sun-kissed golden tones',
  },
  {
    key: 'effaclar',
    packshot: 'public/images/lrp-002-1.jpg',
    decor:
      'a minimalist bathroom shelf of smooth matte stone with a few fresh water droplets, clean and clinical-chic',
    tone: 'soft neutral beige with a hint of cool fresh aqua',
  },
  {
    key: 'mineral89',
    packshot: 'public/images/vichy-mineral-89-packshot.jpg',
    decor:
      'wet dark volcanic stone with mineral water droplets and a thin film of water, fresh and pure',
    tone: 'cool mineral blue blended with soft beige',
  },
];

function loadKey() {
  const env = readFileSync(path.join(ROOT, '.env.local'), 'utf8');
  const line = env.split(/\r?\n/).find((l) => l.startsWith('GEMINI_API_KEY='));
  if (!line) throw new Error('GEMINI_API_KEY missing from .env.local');
  const key = line.slice('GEMINI_API_KEY='.length).trim();
  if (!key) throw new Error('GEMINI_API_KEY is empty');
  return key;
}

function mimeFor(file) {
  const ext = path.extname(file).toLowerCase();
  return ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
}

function buildPrompt(slide, format) {
  return [
    'Luxury editorial product photograph.',
    `Place the exact product bottle from the reference image on ${slide.decor}.`,
    'Golden-hour light, soft shadows, elegant and minimal composition,',
    `${slide.tone}.`,
    'Keep the bottle, label, cap and brand logo EXACTLY identical to the reference —',
    'do not redesign, re-letter, warp or restyle the packaging or any text on it.',
    format.space,
    'Photorealistic, high-end skincare advertising look. No added text, no words, no watermark, no logo overlay.',
  ].join(' ');
}

const KEY = loadKey();

async function callModel(model, slide, format, refB64, refMime, variant) {
  const body = {
    contents: [
      {
        parts: [
          { text: buildPrompt(slide, format) },
          { inline_data: { mime_type: refMime, data: refB64 } },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig: { aspectRatio: format.ratio, imageSize: IMAGE_SIZE },
    },
  };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const json = await res.json();
      const parts = json?.candidates?.[0]?.content?.parts ?? [];
      const inline = parts.map((p) => p.inlineData || p.inline_data).find((i) => i?.data);
      if (!inline?.data) throw new Error('no image part in response');
      const buf = Buffer.from(inline.data, 'base64');
      const ext = (inline.mimeType || inline.mime_type || 'image/jpeg').includes('png') ? 'png' : 'jpg';
      const file = path.join(OUT_DIR, `${slide.key}-${format.name}-v${variant}.${ext}`);
      writeFileSync(file, buf);
      return { file: path.relative(ROOT, file), bytes: buf.length, model };
    }
    const errText = await res.text(); // never contains the key
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      const wait = 12000 * attempt;
      console.warn(`  ↻ ${slide.key}/${format.name}/v${variant} [${model}]: HTTP ${res.status}, retry in ${wait / 1000}s`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    const err = new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
}

async function generateOne(slide, format, refB64, refMime, variant) {
  try {
    return await callModel(activeModel, slide, format, refB64, refMime, variant);
  } catch (e) {
    // Primary model failed → fall back to flash for this and all later images.
    if (activeModel !== FALLBACK_MODEL) {
      console.warn(`  ⚠ ${activeModel} failed (${e.message}) → switching to ${FALLBACK_MODEL}`);
      activeModel = FALLBACK_MODEL;
      return await callModel(activeModel, slide, format, refB64, refMime, variant);
    }
    throw e;
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const total = SLIDES.length * FORMATS.length * VARIANTS;
  console.log(`Model: ${MODEL} (fallback ${FALLBACK_MODEL}) | size: ${IMAGE_SIZE} | ${total} images max | cost cap $${MAX_USD}\n`);
  const results = [];
  let stopped = false;
  for (const slide of SLIDES) {
    if (stopped) break;
    const refPath = path.join(ROOT, slide.packshot);
    const refB64 = readFileSync(refPath).toString('base64');
    const refMime = mimeFor(slide.packshot);
    for (const format of FORMATS) {
      if (stopped) break;
      for (let v = 1; v <= VARIANTS; v++) {
        // Cost guard: stop BEFORE a call that could push us over the cap.
        if (spent + priceOf(activeModel) > MAX_USD) {
          console.warn(`\n⛔ Cost cap: ~$${spent.toFixed(2)} spent, next image would exceed $${MAX_USD}. Stopping.`);
          stopped = true;
          break;
        }
        try {
          const r = await generateOne(slide, format, refB64, refMime, v);
          spent += priceOf(r.model);
          console.log(`  ✓ ${r.file} (${Math.round(r.bytes / 1024)} KB) [${r.model}] — est. $${spent.toFixed(2)}`);
          results.push(r.file);
          await new Promise((res) => setTimeout(res, 1500)); // polite pacing
        } catch (e) {
          console.error(`  ✗ ${slide.key}/${format.name}/v${v}: ${e.message}`);
        }
      }
    }
  }
  console.log(`\nDone. ${results.length}/${total} drafts in public/hero/drafts/ — est. cost $${spent.toFixed(2)}`);
}

main().catch((e) => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
