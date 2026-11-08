import { getServerSupabase } from './server';

/**
 * Customer-facing account reads. SERVER-ONLY. Uses the per-request user session
 * client, so Row Level Security scopes everything to the signed-in user:
 *  - orders: policy orders_select_owner_or_admin (user_id = auth.uid())
 *  - order_items: readable only if the parent order is readable
 *  - addresses: policy addresses_select_own (user_id = auth.uid())
 * No service-role here → a user can never see another customer's data.
 */

export type AccountProduct = {
  ref: number | null;
  sku: string | null;
  name: string;
  brand: string;
  volume: string;
  priceBdt: number;
  priceEur: number;
  image: string | null;
  purchasable: boolean;
};

export type AccountOrderItem = {
  quantity: number;
  unitPriceBdt: number;
  product: AccountProduct | null;
};

export type AccountOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalBdt: number;
  createdAt: string;
  trackingNumber: string | null;
  shippingAddress: Record<string, any> | null;
  items: AccountOrderItem[];
};

export type AccountAddress = {
  id: string;
  fullName: string;
  phone: string;
  district: string | null;
  zone: string | null;
  addressLine: string;
  isDefault: boolean;
};

const ORDER_SELECT =
  'id, order_number, status, payment_method, payment_status, total_bdt, created_at, tracking_number, shipping_address, ' +
  'order_items ( quantity, unit_price_bdt, products ( ref, sku, name, brand, volume, price_bdt, price_eur, image_url, in_stock, price_status ) )';

function mapOrder(rec: any): AccountOrder {
  return {
    id: rec.id,
    orderNumber: rec.order_number,
    status: rec.status,
    paymentMethod: rec.payment_method,
    paymentStatus: rec.payment_status,
    totalBdt: rec.total_bdt,
    createdAt: rec.created_at,
    trackingNumber: rec.tracking_number ?? null,
    shippingAddress: rec.shipping_address ?? null,
    items: (rec.order_items ?? []).map((it: any): AccountOrderItem => {
      const p = it.products;
      return {
        quantity: it.quantity,
        unitPriceBdt: it.unit_price_bdt,
        product: p
          ? {
              ref: p.ref ?? null,
              sku: p.sku ?? null,
              name: p.name,
              brand: p.brand ?? '',
              volume: p.volume ?? '',
              priceBdt: p.price_bdt ?? it.unit_price_bdt,
              priceEur: p.price_eur ?? 0,
              image: p.image_url ?? null,
              purchasable: !!p.in_stock && p.price_status !== 'draft',
            }
          : null,
      };
    }),
  };
}

export async function getMyOrders(): Promise<AccountOrder[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_SELECT)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapOrder);
}

export async function getMyAddresses(): Promise<AccountAddress[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('addresses')
    .select('id, full_name, phone, district, zone, address_line, is_default')
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });
  if (error) return [];
  return (data ?? []).map((a: any) => ({
    id: a.id,
    fullName: a.full_name,
    phone: a.phone,
    district: a.district ?? null,
    zone: a.zone ?? null,
    addressLine: a.address_line,
    isDefault: a.is_default,
  }));
}

export async function getMyProfile(): Promise<{ fullName: string; phone: string }> {
  const supabase = getServerSupabase();
  const { data } = await supabase.from('profiles').select('full_name, phone').maybeSingle();
  return { fullName: data?.full_name ?? '', phone: data?.phone ?? '' };
}
