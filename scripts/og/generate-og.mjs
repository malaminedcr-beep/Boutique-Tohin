/**
 * Generates the default Open Graph image: public/og-default.png (or .jpg).
 *
 *   node scripts/og/generate-og.mjs
 *
 * - 2400×1260 (twice 1200×630): Facebook and WhatsApp scale it down, which
 *   keeps it sharp on high-density screens.
 * - The text is laid out by next/og (satori): the glyphs are converted to
 *   vector paths and then rasterised at full size. It is never an image of text.
 * - Product photos are only ever scaled DOWN (checked below); no blur, no
 *   opacity, no filter.
 * - Lossless PNG; if the PNG exceeds 1 MB, JPEG quality 90 (4:4:4) instead.
 *
 * Sources (see scripts/og/README.md):
 *   - CeraVe  : public/images/cerave-moisturizing-lotion-body.jpg (white background, cut out here)
 *   - Vichy   : public/images/vy-010-1.jpg (white background, cut out here)
 *   - LRP     : scripts/og/sources/lrp-effaclar-serum-official.png (official PNG, transparent)
 */
import { createRequire } from 'node:module';
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(join(ROOT, 'package.json'));
const sharp = require('sharp');
const React = require('react');
const h = React.createElement;

const W = 2400;
const H = 1260;
const MAX_BYTES = 1024 * 1024;

const C = {
  canvas: '#FAF8F5',
  panel: '#F1DDD2', // light terracotta from the site's palette
  ink: '#1A1A1A',
  accentDeep: '#A8402B', // darker accent: contrast ≥ 5:1 on the cream background
  accent: '#C9513A',
  white: '#FFFFFF',
};

// ── @vercel/og (bundled in Next) ────────────────────────────────────────────
// Its Node build uses path.join() on a file:// URL, which breaks on Windows.
// We import a temporary copy with those 3 lines fixed; node_modules is never touched.
async function loadImageResponse() {
  const src = join(ROOT, 'node_modules', 'next', 'dist', 'compiled', '@vercel', 'og');
  if (process.platform !== 'win32') {
    return (await import(pathToFileURL(join(src, 'index.node.js')).href)).ImageResponse;
  }
  const dst = join(tmpdir(), 'fbbd-vercel-og');
  await mkdir(dst, { recursive: true });
  for (const f of ['noto-sans-v27-latin-regular.ttf', 'yoga.wasm', 'resvg.wasm']) {
    await copyFile(join(src, f), join(dst, f));
  }
  const code = (await readFile(join(src, 'index.node.js'), 'utf8')).replace(
    /fileURLToPath\(join\(import\.meta\.url, "\.\.\/([^"]+)"\)\)/g,
    'fileURLToPath(new URL("./$1", import.meta.url))',
  );
  await writeFile(join(dst, 'index.node.mjs'), code);
  return (await import(pathToFileURL(join(dst, 'index.node.mjs')).href)).ImageResponse;
}

// ── Cutouts ─────────────────────────────────────────────────────────────────
/**
 * White background → transparent, by flood fill from the image borders: only
 * the white CONNECTED to the edge is removed (a white bottle stays intact).
 * A 1 px ring around the product gets a partial alpha so the edge stays clean.
 */
async function cutoutWhiteBackground(file) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: hgt } = info;
  const isBg = (i) => {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
    // The background is pure white (255); the white packaging goes down to ~236.
    // A tight threshold keeps the pumps and caps intact.
    return mn >= 251 && mx - mn <= 6;
  };
  const seen = new Uint8Array(w * hgt);
  const queue = new Int32Array(w * hgt);
  let head = 0, tail = 0;
  const push = (i) => {
    if (!seen[i] && isBg(i)) { seen[i] = 1; queue[tail++] = i; }
  };
  for (let x = 0; x < w; x++) { push(x); push((hgt - 1) * w + x); }
  for (let y = 0; y < hgt; y++) { push(y * w); push(y * w + w - 1); }
  while (head < tail) {
    const i = queue[head++];
    const x = i % w, y = (i - x) / w;
    if (x > 0) push(i - 1);
    if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w);
    if (y < hgt - 1) push(i + w);
  }
  // Second pass: JPEG compression leaves a "dirty" near-white fringe (not pure
  // 255) around the product. We let the background spread at most 5 px into
  // that near-white, which cleans the fringe without biting into a white pump.
  const nearWhite = (i) => {
    const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2];
    const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
    return mn >= 228 && mx - mn <= 22;
  };
  for (let pass = 0; pass < 5; pass++) {
    const grow = [];
    for (let i = 0; i < w * hgt; i++) {
      if (seen[i] || !nearWhite(i)) continue;
      const x = i % w;
      if ((x > 0 && seen[i - 1]) || (x < w - 1 && seen[i + 1]) || seen[i - w] || seen[i + w]) grow.push(i);
    }
    if (!grow.length) break;
    for (const i of grow) seen[i] = 1;
  }
  for (let i = 0; i < w * hgt; i++) {
    if (seen[i]) { data[i * 4 + 3] = 0; continue; }
    // Edge pixel (touches the background): alpha proportional to its "non-whiteness".
    const x = i % w;
    const touches = (x > 0 && seen[i - 1]) || (x < w - 1 && seen[i + 1]) || seen[i - w] || seen[i + w];
    if (touches) {
      const mn = Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
      if (mn > 235) data[i * 4 + 3] = Math.round(255 * Math.min(1, (255 - mn) / 20));
    }
  }
  return sharp(data, { raw: { width: w, height: hgt, channels: 4 } }).png().toBuffer();
}

/** Official PNG: removes the soft drop shadow (partial alpha), keeps the product. */
async function cutoutDropShadow(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) {
    const a = data[i];
    data[i] = a >= 235 ? 255 : a <= 170 ? 0 : Math.round(((a - 170) / 65) * 255);
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

/** Crops to the opaque area and returns { uri, width, height } at source resolution. */
async function trimmed(pngBuffer) {
  const { data, info } = await sharp(pngBuffer)
    .trim({ threshold: 1 })
    .png({ compressionLevel: 9 })
    .toBuffer({ resolveWithObject: true });
  return { uri: `data:image/png;base64,${data.toString('base64')}`, width: info.width, height: info.height };
}

// ── Layout ──────────────────────────────────────────────────────────────────
function pill(label) {
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        height: 96,
        padding: '0 44px',
        borderRadius: 999,
        border: `4px solid ${C.ink}`,
        background: C.white,
        color: C.ink,
        fontFamily: 'Inter',
        fontWeight: 600,
        fontSize: 40,
        whiteSpace: 'nowrap',
      },
    },
    label,
  );
}

function product(img, displayHeight, extraStyle = {}) {
  if (displayHeight > img.height) {
    throw new Error(`Upscale refused: ${displayHeight}px displayed > ${img.height}px source`);
  }
  const width = Math.round((img.width * displayHeight) / img.height);
  return h('img', { src: img.uri, width, height: displayHeight, style: extraStyle });
}

function layout({ cerave, lrp, vichy }) {
  return h(
    'div',
    { style: { width: W, height: H, display: 'flex', background: C.canvas } },
    // Left column: text
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 1330,
          padding: '104px 0 96px 120px',
        },
      },
      h(
        'div',
        {
          style: {
            display: 'flex',
            gap: 26,
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: 46,
            letterSpacing: 12,
            color: C.ink,
          },
        },
        h('span', null, 'FRENCH'),
        h('span', { style: { color: C.accentDeep } }, 'BEAUTY'),
        h('span', null, 'BD'),
      ),
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column' } },
        h(
          'div',
          {
            style: {
              display: 'flex',
              fontFamily: 'Inter',
              fontWeight: 700,
              fontSize: 50,
              color: C.accentDeep,
              marginBottom: 34,
            },
          },
          '100% Original — Bought in French pharmacies',
        ),
        h(
          'div',
          {
            style: {
              display: 'flex',
              fontFamily: 'Cormorant Garamond',
              fontWeight: 700,
              fontSize: 132,
              lineHeight: 1.02,
              color: C.ink,
            },
          },
          'Authentic French skincare, delivered in Bangladesh',
        ),
        h(
          'div',
          { style: { display: 'flex', gap: 28, marginTop: 56 } },
          pill('bKash & Nagad'),
          pill('Delivered in 2-3 weeks'),
        ),
      ),
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: 54,
            color: C.ink,
          },
        },
        h('div', { style: { display: 'flex', width: 64, height: 8, background: C.accent } }),
        'frenchbeautybd.com',
      ),
    ),
    // Right column: products on the coloured panel
    h(
      'div',
      {
        style: {
          display: 'flex',
          flex: 1,
          alignItems: 'flex-end',
          justifyContent: 'center',
          background: C.panel,
          padding: '0 70px 110px',
        },
      },
      product(cerave, 820, { marginRight: -30 }),
      product(vichy, 980, { marginRight: -20 }),
      product(lrp, 900),
    ),
  );
}

// ── Main ────────────────────────────────────────────────────────────────────
const ImageResponse = await loadImageResponse();
const font = (f) => readFile(join(ROOT, 'scripts', 'og', 'fonts', f));

const [cerave, vichy, lrp] = await Promise.all([
  cutoutWhiteBackground(join(ROOT, 'public', 'images', 'cerave-moisturizing-lotion-body.jpg')).then(trimmed),
  cutoutWhiteBackground(join(ROOT, 'public', 'images', 'vy-010-1.jpg')).then(trimmed),
  cutoutDropShadow(join(ROOT, 'scripts', 'og', 'sources', 'lrp-effaclar-serum-official.png')).then(trimmed),
]);
console.log(`sources (product cutout): CeraVe ${cerave.width}x${cerave.height}, Vichy ${vichy.width}x${vichy.height}, LRP ${lrp.width}x${lrp.height}`);

const response = new ImageResponse(layout({ cerave, lrp, vichy }), {
  width: W,
  height: H,
  fonts: [
    { name: 'Inter', data: await font('Inter-SemiBold.ttf'), weight: 600, style: 'normal' },
    { name: 'Inter', data: await font('Inter-Bold.ttf'), weight: 700, style: 'normal' },
    { name: 'Cormorant Garamond', data: await font('CormorantGaramond-Bold.ttf'), weight: 700, style: 'normal' },
  ],
});
const rendered = Buffer.from(await response.arrayBuffer());

// Lossless PNG re-compression (sharp, compression level 9): no quality loss.
// The image is fully opaque: the alpha channel is dropped (lighter, and more
// reliable on WhatsApp).
const png = await sharp(rendered)
  .flatten({ background: C.canvas })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toBuffer();
const pngPath = join(ROOT, 'public', 'og-default.png');
const jpgPath = join(ROOT, 'public', 'og-default.jpg');

if (png.length <= MAX_BYTES) {
  await writeFile(pngPath, png);
  if (existsSync(jpgPath)) await rm(jpgPath);
  console.log(`public/og-default.png — ${W}x${H}, PNG lossless, ${(png.length / 1024).toFixed(0)} KB`);
} else {
  const jpg = await sharp(rendered)
    .flatten({ background: C.canvas })
    .jpeg({ quality: 90, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toBuffer();
  if (jpg.length > MAX_BYTES) throw new Error(`JPEG q90 too heavy: ${jpg.length} bytes`);
  await writeFile(jpgPath, jpg);
  if (existsSync(pngPath)) await rm(pngPath);
  console.log(`PNG ${(png.length / 1024).toFixed(0)} KB > 1 MB → public/og-default.jpg — ${W}x${H}, JPEG q90 4:4:4, ${(jpg.length / 1024).toFixed(0)} KB`);
}
