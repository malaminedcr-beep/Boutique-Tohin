#!/usr/bin/env node
/**
 * Pre-build guard: fails the build if an unfinished placeholder (or the wrong
 * canonical domain) reappears in the source. Wired as `prebuild`, so it runs
 * automatically before `next build` locally and on Vercel.
 *
 * Keep the marker list tight and meaningful — every entry here is something
 * that must never reach production HTML. Add new ones as real regressions are
 * found; do not add generic words (e.g. "placeholder") that have legitimate
 * uses such as input `placeholder=` attributes.
 */
const fs = require('fs');
const path = require('path');

const ROOTS = ['app', 'components', 'lib'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

/** Case-insensitive substrings that indicate unfinished / wrong content. */
const MARKERS = [
  'to be completed',
  'lorem ipsum',
  'french-beauty-bd.vercel.app', // canonical must stay on the real domain
  '1xxx-xxxxxx', // the old fake WhatsApp fallback
];

const offenders = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      scan(full);
    }
  }
}

function scan(file) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const lower = line.toLowerCase();
    for (const marker of MARKERS) {
      if (lower.includes(marker)) {
        offenders.push({ file, line: i + 1, marker, text: line.trim() });
      }
    }
  });
}

for (const root of ROOTS) {
  const abs = path.join(process.cwd(), root);
  if (fs.existsSync(abs)) walk(abs);
}

if (offenders.length > 0) {
  console.error('\n✗ Placeholder guard failed — unfinished content found in source:\n');
  for (const o of offenders) {
    console.error(`  ${o.file}:${o.line}  [${o.marker}]`);
    console.error(`      ${o.text}`);
  }
  console.error('\nProvide the real value (via env var + conditional rendering) before building.\n');
  process.exit(1);
}

console.log('✓ Placeholder guard passed — no unfinished markers in source.');
