/**
 * scripts/pb-to-supabase.mjs
 * ----------------------------------------------------------------------------
 * Génère un fichier SQL (schéma + données) pour migrer les collections
 * PocketBase exportées (.migration/*.json) vers Postgres/Supabase.
 *
 * - Conserve les IDs PocketBase (text) comme clés primaires => relations intactes.
 * - orders.user "" (invité) -> NULL.
 * - gallery / shipping_address -> jsonb.
 *
 * Usage : node scripts/pb-to-supabase.mjs > .migration/import.sql
 */
import { readFileSync } from 'node:fs';

const load = (f) => JSON.parse(readFileSync(new URL(`../.migration/${f}`, import.meta.url), 'utf8'));
const products = load('products.json');
const users = [].concat(load('users.json'));
const orders = load('orders.json');
const items = load('order_items.json');

const q = (v) => {
  if (v === null || v === undefined || v === '') return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
};
const num = (v) => (v === null || v === undefined || v === '' ? 'NULL' : Number(v));
const bool = (v) => (v ? 'true' : 'false');
const json = (v) => `'${JSON.stringify(v ?? null).replace(/'/g, "''")}'::jsonb`;
const ts = (v) => (v ? `'${String(v).replace(' ', 'T')}'::timestamptz` : 'now()');

const out = [];
out.push('begin;');

// ── profiles (users) ────────────────────────────────────────────────────────
for (const u of users) {
  out.push(
    `insert into public.profiles (id, email, full_name, phone, address_line, city, role, created_at, updated_at) values (` +
      [q(u.id), q(u.email), q(u.full_name), q(u.phone), q(u.address_line), q(u.city), q(u.role || 'user'), ts(u.created), ts(u.updated)].join(', ') +
      `);`
  );
}

// ── products ────────────────────────────────────────────────────────────────
for (const p of products) {
  out.push(
    `insert into public.products (id, ref, sku, slug, name, brand, category, description, volume, price_bdt, price_eur, image_url, gallery, in_stock, is_new, is_bestseller) values (` +
      [
        q(p.id), num(p.ref), q(p.sku), q(p.slug), q(p.name), q(p.brand), q(p.category),
        q(p.description), q(p.volume), num(p.price_bdt), num(p.price_eur), q(p.image_url),
        json(p.gallery), bool(p.in_stock), bool(p.is_new), bool(p.is_bestseller),
      ].join(', ') +
      `);`
  );
}

// ── orders ──────────────────────────────────────────────────────────────────
for (const o of orders) {
  out.push(
    `insert into public.orders (id, user_id, status, payment_method, payment_status, total_bdt, shipping_address, created_at, updated_at) values (` +
      [
        q(o.id), q(o.user), q(o.status), q(o.payment_method), q(o.payment_status),
        num(o.total_bdt), json(o.shipping_address), ts(o.created), ts(o.updated),
      ].join(', ') +
      `);`
  );
}

// ── order_items ─────────────────────────────────────────────────────────────
for (const it of items) {
  out.push(
    `insert into public.order_items (id, order_id, product_id, quantity, unit_price_bdt, created_at, updated_at) values (` +
      [q(it.id), q(it.order), q(it.product), num(it.quantity), num(it.unit_price_bdt), ts(it.created), ts(it.updated)].join(', ') +
      `);`
  );
}

out.push('commit;');
process.stdout.write(out.join('\n') + '\n');
