import { NextResponse } from 'next/server';
import { getVerifiedAdmin } from '../../../../../lib/supabase/server';
import { getOrderById } from '../../../../../lib/supabase/orders';

export const dynamic = 'force-dynamic';

/**
 * Returns a single order (with items) for the admin order slip.
 * Reads via service-role behind a verified admin check. Unauthorized -> 404.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const admin = await getVerifiedAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const order = await getOrderById(params.id);
  if (!order) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(order);
}
