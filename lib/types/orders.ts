export type ShippingAddress = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  postalCode?: string;
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

export type PaymentStatus =
  | 'en_attente_paiement'
  | 'paiement_a_verifier'
  | 'paye'
  | 'expire'
  | 'refuse';

export type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'cod' | 'bkash' | 'nagad';
  payment_status: PaymentStatus;
  total_bdt: number;
  shipping_address: ShippingAddress;
  created_at: string;
  // Champs du flux bKash manuel
  trxid: string | null;
  trxid_submitted_at: string | null;
  verified_at: string | null;
  verified_by: string | null;
  bkash_receiver_number: string | null;
  payment_notes: string | null;
  order_items: OrderItem[];
};
