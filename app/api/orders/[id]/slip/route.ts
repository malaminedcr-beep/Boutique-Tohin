import { NextResponse } from 'next/server';
import { createElement, type ReactElement } from 'react';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import { getOrderById } from '../../../../../lib/supabase/orders';
import OrderSlipPDF from '../../../../../components/admin/OrderSlipPDF';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Bon de commande PDF (serveur) pour une commande, réutilisant le composant
 * admin OrderSlipPDF (react-pdf). Appelé par n8n (WF1) pour attacher le PDF sur
 * la ligne Airtable. Protégé par la clé service-role Supabase en Bearer — secret
 * déjà présent en prod et dans le credential Supabase de n8n.
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const auth = request.headers.get('authorization') ?? '';
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const order = await getOrderById(params.id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const doc = createElement(OrderSlipPDF, { order }) as unknown as ReactElement<DocumentProps>;
  const pdf = await renderToBuffer(doc);

  return new Response(pdf, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="bon-commande-${order.order_number}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
