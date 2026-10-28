import { NextResponse } from 'next/server';
import { createAdminSupabase } from '../../../../../lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Vérifie, pour chaque ligne d'une commande, le lien d'achat de référence
 * (products.source_url) : joignable / encore en ligne ? Écrit un snapshot sur
 * order_items (source_url + source_ok + source_checked_at). Appelé par n8n (WF4)
 * au moment où la commande passe en 'confirmed'. Protégé par la clé service-role
 * Supabase en Bearer — même schéma que la route /slip.
 *
 * Le re-lecture de prix (source_price_eur) est best-effort et laissée vide ici :
 * chaque revendeur a un HTML différent, on ne garantit que le lien + la date.
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const auth = request.headers.get('authorization') ?? '';
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminSupabase();

  const { data: items, error } = await supabase
    .from('order_items')
    .select('id, products ( source_url )')
    .eq('order_id', params.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'No items for this order.' }, { status: 404 });
  }

  const checkedAt = new Date().toISOString();

  // Vérifie chaque lien en parallèle (HEAD→GET fallback), 10s max par lien.
  const results = await Promise.all(
    items.map(async (it: any) => {
      const url: string | null = it.products?.source_url ?? null;
      let ok: boolean | null = null;
      if (url) {
        ok = await isReachable(url);
      }
      const { error: upErr } = await supabase
        .from('order_items')
        .update({
          source_url: url,
          source_ok: ok,
          source_checked_at: checkedAt,
        })
        .eq('id', it.id);
      return { id: it.id, url, ok, written: !upErr };
    }),
  );

  const summary = {
    orderId: params.id,
    checkedAt,
    total: results.length,
    withLink: results.filter((r) => r.url).length,
    reachable: results.filter((r) => r.ok === true).length,
    unreachable: results.filter((r) => r.ok === false).length,
    results,
  };
  return NextResponse.json(summary);
}

/** True if the URL answers < 400. Tries HEAD, falls back to GET. 10s timeout. */
async function isReachable(url: string): Promise<boolean> {
  for (const method of ['HEAD', 'GET'] as const) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          // Certains revendeurs renvoient 403 aux requêtes sans UA « navigateur ».
          'User-Agent':
            'Mozilla/5.0 (compatible; FrenchBeautyBD-OrderBot/1.0; +https://www.frenchbeautybd.com)',
        },
      });
      clearTimeout(timer);
      if (res.status < 400) return true;
      // HEAD parfois interdit (405) : on laisse la boucle tenter le GET.
      if (method === 'HEAD' && (res.status === 405 || res.status === 403)) continue;
      return false;
    } catch {
      clearTimeout(timer);
      // HEAD a échoué : tente le GET ; si le GET échoue aussi → injoignable.
      if (method === 'GET') return false;
    }
  }
  return false;
}
