import { createAdminSupabase } from './admin';
import type { Order } from '../types/orders';

/**
 * Admin order reads from Supabase (service-role). Maps rows + embedded
 * order_items / products to the existing UI `Order` shape so the back-office
 * components stay unchanged. SERVER-ONLY.
 */
const ORDER_SELECT =
  '*, order_items ( id, order_id, product_id, quantity, unit_price_bdt, products ( name, brand ) )';

function mapOrder(rec: any): Order {
  const items = rec.order_items ?? [];
  return {
    id: rec.id,
    user_id: rec.user_id ?? null,
    status: rec.status,
    payment_method: rec.payment_method,
    payment_status: rec.payment_status,
    total_bdt: rec.total_bdt,
    shipping_address: rec.shipping_address,
    created_at: rec.created_at,
    order_items: items.map((it: any) => ({
      id: it.id,
      order_id: it.order_id,
      product_id: it.product_id,
      quantity: it.quantity,
      unit_price_bdt: it.unit_price_bdt,
      product: it.products
        ? { name: it.products.name, brand: it.products.brand }
        : null,
    })),
  };
}

export async function getAllOrders(): Promise<Order[]> {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return mapOrder(data);
}
