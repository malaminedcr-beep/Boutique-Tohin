import { NextResponse } from 'next/server';
import { createAdminSupabase } from '../../../../../lib/supabase/admin';
import { getVerifiedAdmin } from '../../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * File d'attente admin : commandes bKash dont le TrxID est à vérifier.
 * payment_status = 'paiement_a_verifier', triées par soumission (plus ancien
 * d'abord). Admin-only (getVerifiedAdmin, système d'auth existant du projet).
 */
export async function GET() {
  const admin = await getVerifiedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from('orders')
    .select(
      'id, order_number, total_bdt, trxid, trxid_submitted_at, bkash_receiver_number, shipping_address',
    )
    .eq('payment_status', 'paiement_a_verifier')
    .order('trxid_submitted_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data ?? [] });
}
