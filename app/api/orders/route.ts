import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../lib/supabase/admin';
import { createClient } from '../../../lib/supabase/server';

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
 * `products` table — the client never gets to set a price. Inserts run with the
 * service-role key so RLS can stay locked down for anon/authenticated roles.
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

  const admin = createAdminClient();

  const slugs = [...new Set(requested.map((r) => r.slug))];
  const { data: products, error: productsError } = await admin
    .from('products')
    .select('id, slug, price_bdt, in_stock')
    .in('slug', slugs);

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 });
  }

  const bySlug = new Map((products ?? []).map((p) => [p.slug, p]));
  for (const slug of slugs) {
    const product = bySlug.get(slug);
    if (!product) return badRequest(`Unknown product: ${slug}.`);
    if (!product.in_stock) return badRequest(`Product out of stock: ${slug}.`);
  }

  let total = 0;
  const lineItems = requested.map((r) => {
    const product = bySlug.get(r.slug)!;
    const unitPrice = Number(product.price_bdt);
    total += unitPrice * r.quantity;
    return {
      product_id: product.id,
      quantity: r.quantity,
      unit_price_bdt: unitPrice,
    };
  });

  // Link the order to the signed-in user if there is a session (guest allowed).
  const server = createClient();
  const {
    data: { user },
  } = await server.auth.getUser();

  const { data: order, error: orderError } = await admin
    .from('orders')
    .insert({
      user_id: user?.id ?? null,
      status: 'pending',
      payment_method: paymentMethod,
      payment_status: 'pending',
      total_bdt: total,
      shipping_address: shippingAddress,
    })
    .select('id')
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: orderError?.message ?? 'Failed to create order.' },
      { status: 500 },
    );
  }

  const { error: itemsError } = await admin.from('order_items').insert(
    lineItems.map((li) => ({ order_id: order.id, ...li })),
  );

  if (itemsError) {
    // Roll back the order so we never leave a total without its line items.
    await admin.from('orders').delete().eq('id', order.id);
    return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  return NextResponse.json({ orderId: order.id, total });
}
