/**
 * scripts/pb-schema.ts
 * ----------------------------------------------------------------------------
 * Crée le schéma PocketBase (collections + API rules équivalentes aux RLS
 * Supabase) sur l'instance locale. Idempotent : si une collection existe déjà,
 * elle est mise à jour (rules/fields).
 *
 * Usage : npx tsx scripts/pb-schema.ts
 * Requiert dans .env.local : NEXT_PUBLIC_POCKETBASE_URL (ou POCKETBASE_URL),
 * POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD.
 */
import { config } from 'dotenv';
import PocketBase from 'pocketbase';

config({ path: '.env.local' });

const URL =
  process.env.NEXT_PUBLIC_POCKETBASE_URL ||
  process.env.POCKETBASE_URL ||
  'http://127.0.0.1:8090';
const EMAIL = process.env.POCKETBASE_ADMIN_EMAIL!;
const PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD!;

const pb = new PocketBase(URL);

async function upsertCollection(def: any) {
  try {
    const existing = await pb.collections.getOne(def.name);
    await pb.collections.update(existing.id, def);
    console.log(`  ~ updated collection "${def.name}"`);
    return await pb.collections.getOne(def.name);
  } catch {
    const created = await pb.collections.create(def);
    console.log(`  + created collection "${def.name}"`);
    return created;
  }
}

async function main() {
  await pb.collection('_superusers').authWithPassword(EMAIL, PASSWORD);
  console.log('✓ superuser authenticated');

  // ── users : ajout des champs profil + role, rules « own row » ──────────────
  const users = await pb.collections.getOne('users');
  const userFieldNames = new Set(users.fields.map((f: any) => f.name));
  const extraUserFields = [
    { name: 'full_name', type: 'text' },
    { name: 'phone', type: 'text' },
    { name: 'address_line', type: 'text' },
    { name: 'city', type: 'text' },
    { name: 'role', type: 'select', maxSelect: 1, values: ['user', 'admin'] },
  ].filter((f) => !userFieldNames.has(f.name));

  await pb.collections.update(users.id, {
    fields: [...users.fields, ...extraUserFields],
    // Parité avec Supabase profiles_own (auth.uid() = id)
    listRule: 'id = @request.auth.id',
    viewRule: 'id = @request.auth.id',
    updateRule: 'id = @request.auth.id',
  });
  console.log(`  ~ users: +${extraUserFields.length} champ(s) + rules own-row`);

  // ── products : lecture publique, écriture superuser only ───────────────────
  await upsertCollection({
    name: 'products',
    type: 'base',
    fields: [
      { name: 'ref', type: 'number', required: true }, // id numérique stable (routes/panier vitrine)
      { name: 'sku', type: 'text', required: true },
      { name: 'slug', type: 'text', required: true },
      { name: 'name', type: 'text', required: true },
      { name: 'brand', type: 'text', required: true },
      { name: 'category', type: 'text', required: true },
      { name: 'description', type: 'text' },
      { name: 'volume', type: 'text' },
      { name: 'price_bdt', type: 'number', required: true, min: 0 },
      { name: 'price_eur', type: 'number' },
      { name: 'image_url', type: 'text' },
      { name: 'gallery', type: 'json' },
      { name: 'in_stock', type: 'bool' },
      { name: 'is_new', type: 'bool' },
      { name: 'is_bestseller', type: 'bool' },
    ],
    indexes: [
      'CREATE UNIQUE INDEX `idx_products_ref` ON `products` (`ref`)',
      'CREATE UNIQUE INDEX `idx_products_sku` ON `products` (`sku`)',
      'CREATE UNIQUE INDEX `idx_products_slug` ON `products` (`slug`)',
      'CREATE INDEX `idx_products_brand` ON `products` (`brand`)',
      'CREATE INDEX `idx_products_category` ON `products` (`category`)',
    ],
    listRule: '', // "" = public
    viewRule: '',
    createRule: null, // null = superuser only
    updateRule: null,
    deleteRule: null,
  });

  const productsCol = await pb.collections.getOne('products');
  const usersCol = await pb.collections.getOne('users');

  // ── orders : lecture de SES commandes, écriture serveur only ───────────────
  await upsertCollection({
    name: 'orders',
    type: 'base',
    fields: [
      { name: 'user', type: 'relation', collectionId: usersCol.id, maxSelect: 1, cascadeDelete: false },
      { name: 'status', type: 'select', required: true, maxSelect: 1, values: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
      { name: 'payment_method', type: 'select', required: true, maxSelect: 1, values: ['cod', 'bkash', 'nagad'] },
      { name: 'payment_status', type: 'select', required: true, maxSelect: 1, values: ['pending', 'paid', 'failed'] },
      { name: 'total_bdt', type: 'number', required: true, min: 0 },
      { name: 'shipping_address', type: 'json', required: true },
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ],
    listRule: 'user = @request.auth.id',
    viewRule: 'user = @request.auth.id',
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  const ordersCol = await pb.collections.getOne('orders');

  // ── order_items : lecture des lignes de SES commandes, écriture serveur only
  await upsertCollection({
    name: 'order_items',
    type: 'base',
    fields: [
      { name: 'order', type: 'relation', collectionId: ordersCol.id, required: true, maxSelect: 1, cascadeDelete: true },
      { name: 'product', type: 'relation', collectionId: productsCol.id, required: true, maxSelect: 1, cascadeDelete: false },
      { name: 'quantity', type: 'number', required: true, min: 1 },
      { name: 'unit_price_bdt', type: 'number', required: true, min: 0 },
      { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
      { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
    ],
    listRule: 'order.user = @request.auth.id',
    viewRule: 'order.user = @request.auth.id',
    createRule: null,
    updateRule: null,
    deleteRule: null,
  });

  console.log('\n✓ Schéma PocketBase en place.');
}

main().catch((e) => {
  console.error('✗', e?.response ?? e);
  process.exit(1);
});
