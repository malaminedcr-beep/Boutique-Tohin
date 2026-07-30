export type ShippingAddress = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_bdt: number;
  product: {
    name: string;
    brand: string;
  } | null;
};

export type Order = {
  id: string;
  user_id: string | null;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'cod' | 'bkash' | 'nagad';
  payment_status: 'pending' | 'paid' | 'failed';
  total_bdt: number;
  shipping_address: ShippingAddress;
  created_at: string;
  order_items: OrderItem[];
};
