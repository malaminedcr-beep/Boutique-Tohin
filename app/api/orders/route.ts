import { NextResponse } from 'next/server';
import { createAdminSupabase } from '../../../lib/supabase/admin';
import { getVerifiedUser } from '../../../lib/supabase/server';
import { pushOrderToAirtable } from '../../../lib/airtable';
import { BKASH_RECEIVER_NUMBER } from '../../../lib/bkash';

export const dynamic = 'force-dynamic';

const PAYMENT_METHODS = ['cod', 'bkash', 'nagad'] as const;
const REQUIRED_ADDRESS_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'address',
] as const;

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Creates an order. The client sends ONLY [{ sku, quantity }] + payment method
 * + shipping address. Prices and the total are recomputed server-side from the
 * Supabase `products` table — the client never gets to set a price. Writes run
 * with the service-role client so RLS can stay locked down (orders/order_items
 * have no public write policy).
 */
export async function POST(request: Request) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body.');
  }

  const { items, paymentMethod, shippingAddress } = body ?? {};

  if (!Array.isArray(items) || items.length === 0) {
    return badRequest('Cart is empty.');
  }
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return badRequest('Invalid payment method.');
  }
  if (
    !shippingAddress ||
    REQUIRED_ADDRESS_FIELDS.some(
      (f) => typeof shippingAddress[f] !== 'string' || !shippingAddress[f].trim(),
    )
  ) {
    return badRequest('Incomplete shipping address.');
  }

  // Normalize + validate line items. sku maps to products.slug (lowercased).
  const requested: { slug: string; quantity: number }[] = [];
  for (const raw of items) {
    const sku = String(raw?.sku ?? '').trim();
    const quantity = Number(raw?.quantity);
    if (!sku) return badRequest('Missing product identifier.');
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      return badRequest('Invalid quantity.');
    }
    requested.push({ slug: sku.toLowerCase(), quantity });
  }

  let supabase;
  try {
    supabase = createAdminSupabase();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Supabase init failed.' },
      { status: 500 },
    );
  }

  // Read authoritative prices from Supabase (only ~44 products → fetch all).
  const { data: products, error: productsErr } = await supabase
    .from('products')
    .select('id, slug, name, price_bdt, in_stock');
  if (productsErr) {
    return NextResponse.json({ error: productsErr.message }, { status: 500 });
  }

  const bySlug = new Map((products ?? []).map((p) => [p.slug, p]));
  for (const { slug } of requested) {
    const product = bySlug.get(slug);
    if (!product) return badRequest(`Unknown product: ${slug}.`);
    if (!product.in_stock) return badRequest(`Product out of stock: ${slug}.`);
  }

  let total = 0;
  const lineItems = requested.map((r) => {
    const product = bySlug.get(r.slug)!;
    const unitPrice = Number(product.price_bdt);
    total += unitPrice * r.quantity;
    return { product_id: product.id as string, quantity: r.quantity, unit_price_bdt: unitPrice };
  });

  // Link the order to the signed-in user if there is a valid session (guest allowed).
  const authUser = await getVerifiedUser();

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .insert({
      user_id: authUser?.id ?? null,
      status: 'pending',
      payment_method: paymentMethod,
      payment_status: 'en_attente_paiement',
      total_bdt: total,
      shipping_address: shippingAddress,
      // Pour bKash (manuel) : on mémorise le numéro à créditer dès la création.
      bkash_receiver_number: paymentMethod === 'bkash' ? BKASH_RECEIVER_NUMBER : null,
    })
    .select('id, order_number')
    .single();
  if (orderErr || !order) {
    return NextResponse.json(
      { error: orderErr?.message ?? 'Failed to create order.' },
      { status: 500 },
    );
  }

  const { error: itemsErr } = await supabase
    .from('order_items')
    .insert(lineItems.map((li) => ({ order_id: order.id, ...li })));
  if (itemsErr) {
    // Roll back the order so we never leave a total without its line items.
    // order_items cascade-delete with the order.
    await supabase.from('orders').delete().eq('id', order.id);
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  // Miroir vers Airtable (best-effort, ne bloque jamais la commande).
  await pushOrderToAirtable({
    id: order.id,
    client: `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim(),
    email: shippingAddress.email,
    phone: shippingAddress.phone,
    city: shippingAddress.city,
    address: [shippingAddress.address, shippingAddress.postalCode].filter(Boolean).join(' '),
    total_bdt: total,
    payment_method: paymentMethod,
    payment_status: 'en_attente_paiement',
    status: 'pending',
    products: requested.map((r) => `${bySlug.get(r.slug)!.name} x${r.quantity}`).join('\n'),
    created_at: new Date().toISOString(),
  });

  return NextResponse.json({ orderId: order.id, orderNumber: order.order_number, total });
}
