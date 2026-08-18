/**
 * Airtable sync (SERVER-ONLY).
 * Miroir des commandes vers la base Airtable "BOUTIQUE" › table "Commandes".
 * Optionnel : si les variables d'env ne sont pas définies, les fonctions
 * no-op (le site continue de marcher sans Airtable).
 */
const API = 'https://api.airtable.com/v0';

const TOKEN = process.env.AIRTABLE_API_KEY;
const BASE = process.env.AIRTABLE_BASE_ID;
const TABLE = process.env.AIRTABLE_ORDERS_TABLE; // id "tbl…" ou nom "Commandes"

export function airtableConfigured(): boolean {
  return Boolean(TOKEN && BASE && TABLE);
}

export type AirtableOrder = {
  id: string;
  client: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  total_bdt: number;
  payment_method: string;
  payment_status: string;
  status: string;
  products: string;
  created_at: string;
};

function toFields(o: AirtableOrder) {
  return {
    'Order ID': o.id,
    Client: o.client,
    Email: o.email,
    'Téléphone': o.phone,
    Ville: o.city,
    Adresse: o.address,
    'Total (৳)': o.total_bdt,
    Paiement: o.payment_method,
    'Statut paiement': o.payment_status,
    Statut: o.status,
    Produits: o.products,
    'Créée le': o.created_at,
  };
}

/** Crée l'enregistrement de commande dans Airtable. Ne throw jamais. */
export async function pushOrderToAirtable(o: AirtableOrder): Promise<void> {
  if (!airtableConfigured()) return;
  try {
    const res = await fetch(`${API}/${BASE}/${encodeURIComponent(TABLE!)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ records: [{ fields: toFields(o) }], typecast: true }),
    });
    if (!res.ok) {
      console.error('[airtable] push failed', res.status, await res.text());
    }
  } catch (e) {
    console.error('[airtable] push error', e);
  }
}
