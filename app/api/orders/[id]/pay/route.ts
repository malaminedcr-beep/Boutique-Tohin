import { NextResponse } from 'next/server';
import { createAdminSupabase } from '../../../../../lib/supabase/admin';
import { BKASH_RECEIVER_NUMBER, isPlausibleTrxId, normalizeTrxId } from '../../../../../lib/bkash';

export const dynamic = 'force-dynamic';

/**
 * Soumission du TrxID bKash par le CLIENT (paiement manuel).
 *
 * Le client (invité ou connecté) colle son TrxID après avoir envoyé l'argent.
 * On passe par le service-role — comme tout le reste des écritures `orders` de
 * l'app — plutôt que par un update direct anon : ça marche pour les commandes
 * invité (user_id null, non lisibles en RLS) et ça évite toute altération de
 * colonnes sensibles. La transition n'est autorisée que depuis
 * `en_attente_paiement` (garde `.eq`) pour empêcher un double submit.
 *
 * (Une policy RLS `orders_client_submit_payment` existe aussi côté DB, en
 * défense en profondeur, si un update direct depuis le navigateur est préféré.)
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const orderId = params.id;

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const trxid = normalizeTrxId(String(body?.trxid ?? ''));
  if (!trxid) {
    return NextResponse.json({ error: 'TrxID manquant.' }, { status: 400 });
  }
  if (!isPlausibleTrxId(trxid)) {
    return NextResponse.json(
      { error: 'TrxID invalide. Vérifiez le code reçu de bKash.' },
      { status: 400 },
    );
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

  const { data, error } = await supabase
    .from('orders')
    .update({
      trxid,
      trxid_submitted_at: new Date().toISOString(),
      payment_status: 'paiement_a_verifier',
      bkash_receiver_number: BKASH_RECEIVER_NUMBER,
    })
    .eq('id', orderId)
    .eq('payment_status', 'en_attente_paiement') // évite un double submit
    .select('id, order_number, payment_status')
    .maybeSingle();

  if (error) {
    // 23505 = violation de contrainte unique -> ce TrxID a déjà servi.
    if ((error as any).code === '23505') {
      return NextResponse.json(
        { error: 'Ce TrxID a déjà été utilisé. Vérifiez votre code ou contactez-nous.' },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aucune ligne mise à jour : commande introuvable OU déjà soumise/traitée.
  if (!data) {
    return NextResponse.json(
      { error: 'Paiement déjà soumis pour cette commande, ou commande introuvable.' },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, order: data });
}
