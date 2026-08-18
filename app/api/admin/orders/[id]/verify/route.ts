import { NextResponse } from 'next/server';
import { createAdminSupabase } from '../../../../../../lib/supabase/admin';
import { getVerifiedAdmin } from '../../../../../../lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Validation / refus d'un paiement bKash par l'ADMIN.
 *
 * Auth : on réutilise le système admin existant du projet — getVerifiedAdmin()
 * revalide le JWT Supabase (auth.getUser, le cookie n'est jamais fait confiance)
 * puis vérifie profiles.role = 'admin'. Aucun nouveau système de session à créer.
 *
 * Body : { action: 'valider' | 'refuser', adminName?: string }
 * La transition n'est appliquée que si payment_status = 'paiement_a_verifier'
 * (garde `.eq`), pour ne jamais re-traiter une commande déjà validée/refusée.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const admin = await getVerifiedAdmin();
  if (!admin) {
    // On ne révèle pas l'existence de la route aux non-admins.
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const action = body?.action;
  if (action !== 'valider' && action !== 'refuser') {
    return NextResponse.json(
      { error: "action doit être 'valider' ou 'refuser'." },
      { status: 400 },
    );
  }

  const nextStatus = action === 'valider' ? 'paye' : 'refuse';
  const adminName =
    typeof body?.adminName === 'string' && body.adminName.trim()
      ? body.adminName.trim()
      : admin.email ?? admin.id;

  const supabase = createAdminSupabase();

  const { data, error } = await supabase
    .from('orders')
    .update({
      payment_status: nextStatus,
      verified_at: new Date().toISOString(),
      verified_by: adminName,
    })
    .eq('id', params.id)
    .eq('payment_status', 'paiement_a_verifier') // ne re-traite jamais une commande déjà tranchée
    .select('id, order_number, payment_status, verified_at, verified_by')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      { error: 'Commande introuvable ou déjà traitée.' },
      { status: 409 },
    );
  }

  return NextResponse.json({ ok: true, order: data });
}
