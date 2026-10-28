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
      // source_ok : true = vivant · false = mort (404/410) · null = non vérifiable
      // (403 anti-bot, 429, 5xx, timeout) — on ne crie pas « mort » à tort.
      let ok: boolean | null = null;
      if (url) {
        const verdict = await classify(url);
        ok = verdict === 'live' ? true : verdict === 'dead' ? false : null;
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
    live: results.filter((r) => r.ok === true).length,
    dead: results.filter((r) => r.ok === false).length,
    unverifiable: results.filter((r) => r.url && r.ok === null).length,
    results,
  };
  return NextResponse.json(summary);
}

type Verdict = 'live' | 'dead' | 'unknown';

/**
 * Classe un lien : 'live' (<400), 'dead' (404/410 — page supprimée), ou
 * 'unknown' (403 anti-bot, 429, 5xx, timeout, erreur réseau). Tente HEAD puis
 * GET, 10s par tentative. Ne jamais marquer « dead » sur un simple blocage bot.
 */
async function classify(url: string): Promise<Verdict> {
  let sawBlock = false;
  for (const method of ['HEAD', 'GET'] as const) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
        },
      });
      clearTimeout(timer);
      if (res.status < 400) return 'live';
      if (res.status === 404 || res.status === 410) return 'dead';
      // 403/405/429/5xx : bloqué ou indécis — retente en GET, sinon 'unknown'.
      sawBlock = true;
    } catch {
      clearTimeout(timer);
      sawBlock = true;
    }
  }
  return sawBlock ? 'unknown' : 'dead';
}
