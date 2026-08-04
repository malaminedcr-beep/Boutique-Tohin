import { NextResponse } from 'next/server';
import { createAdminPb } from '../../../lib/pocketbase/admin';
import { getServerPb, getVerifiedUser } from '../../../lib/pocketbase/server';

export const dynamic = 'force-dynamic';

const PAYMENT_METHODS = ['cod', 'bkash', 'nagad'] as const;
const REQUIRED_ADDRESS_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'phone',
  'address',
  'city',
] as const;

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Creates an order. The client sends ONLY [{ sku, quantity }] + payment method
 * + shipping address. Prices and the total are recomputed server-side from the
 * PocketBase `products` collection — the client never gets to set a price.
 * Writes run with the superuser client so the collection rules can stay locked
 * down (orders/order_items have no public create rule).
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

  let pb;
  try {
    pb = await createAdminPb();
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'PocketBase auth failed.' },
      { status: 500 },
    );
  }

  // Read authoritative prices from PocketBase (only ~37 products → fetch all).
  let products: Array<{ id: string; slug: string; price_bdt: number; in_stock: boolean }>;
  try {
    products = await pb.collection('products').getFullList({ fields: 'id,slug,price_bdt,in_stock' });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to read products.' },
      { status: 500 },
    );
  }

  const bySlug = new Map(products.map((p) => [p.slug, p]));
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
    return { product: product.id, quantity: r.quantity, unit_price_bdt: unitPrice };
  });

  // Link the order to the signed-in user if there is a valid session (guest allowed).
  const authUser = await getVerifiedUser(getServerPb());

  let order;
  try {
    order = await pb.collection('orders').create({
      user: authUser?.id ?? '',
      status: 'pending',
      payment_method: paymentMethod,
      payment_status: 'pending',
      total_bdt: total,
      shipping_address: shippingAddress,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create order.' },
      { status: 500 },
    );
  }

  try {
    for (const li of lineItems) {
      await pb.collection('order_items').create({ order: order.id, ...li });
    }
  } catch (e) {
    // Roll back the order so we never leave a total without its line items.
    // order_items cascade-delete with the order.
    await pb.collection('orders').delete(order.id).catch(() => {});
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Failed to create order items.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ orderId: order.id, total });
}
