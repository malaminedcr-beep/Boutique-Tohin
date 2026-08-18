import { NextResponse } from 'next/server';
import { createAdminSupabase } from '../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;
const PAYMENT_STATUSES = ['pending', 'paid', 'failed'] as const;

/**
 * Airtable → Supabase. Appelé par une automation Airtable quand le statut d'une
 * commande change. Sécurisé par un secret partagé (header x-airtable-secret).
 * Body attendu : { orderId, status?, paymentStatus? }.
 */
export async function POST(request: Request) {
  const secret = process.env.AIRTABLE_WEBHOOK_SECRET;
  if (!secret || request.headers.get('x-airtable-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const orderId = String(body?.orderId ?? '').trim();
  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
  }

  const patch: Record<string, string> = {};
  if (body.status != null) {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (body.paymentStatus != null) {
    if (!PAYMENT_STATUSES.includes(body.paymentStatus)) {
      return NextResponse.json({ error: 'Invalid paymentStatus' }, { status: 400 });
    }
    patch.payment_status = body.paymentStatus;
  }
  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from('orders')
    .update(patch)
    .eq('id', orderId)
    .select('id')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, orderId: data.id, updated: patch });
}
