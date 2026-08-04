import { createAdminPb } from './admin';
import type { Order } from '../types/orders';

/**
 * Admin order reads from PocketBase (superuser). Maps PocketBase records +
 * back-relation expand (`order_items_via_order.product`) to the existing UI
 * `Order` shape so the back-office components stay unchanged. SERVER-ONLY.
 */
function mapOrder(rec: any): Order {
  const items = rec.expand?.order_items_via_order ?? [];
  return {
    id: rec.id,
    user_id: rec.user || null,
    status: rec.status,
    payment_method: rec.payment_method,
    payment_status: rec.payment_status,
    total_bdt: rec.total_bdt,
    shipping_address: rec.shipping_address,
    created_at: rec.created,
    order_items: items.map((it: any) => ({
      id: it.id,
      order_id: it.order,
      product_id: it.product,
      quantity: it.quantity,
      unit_price_bdt: it.unit_price_bdt,
      product: it.expand?.product
        ? { name: it.expand.product.name, brand: it.expand.product.brand }
        : null,
    })),
  };
}

export async function getAllOrders(): Promise<Order[]> {
  const pb = await createAdminPb();
  const rows = await pb.collection('orders').getFullList({
    sort: '-created',
    expand: 'order_items_via_order.product',
  });
  return rows.map(mapOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const pb = await createAdminPb();
  try {
    const rec = await pb.collection('orders').getOne(id, {
      expand: 'order_items_via_order.product',
    });
    return mapOrder(rec);
  } catch {
    return null;
  }
}
