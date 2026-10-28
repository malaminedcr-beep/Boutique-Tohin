/**
 * Vérification de joignabilité d'un lien d'achat (SERVER-ONLY).
 * Utilisé par la génération du bon de commande (et la route /verify-sources).
 *
 * Verdict en 3 états pour rester honnête :
 *  - 'live'    : la page répond (<400)
 *  - 'dead'    : 404/410 — page supprimée
 *  - 'unknown' : 403 anti-bot, 429, 5xx, timeout, erreur réseau — on ne peut
 *                pas conclure (les sites de marque bloquent souvent les
 *                requêtes serveur), donc on ne crie pas « mort » à tort.
 */
export type SourceVerdict = 'live' | 'dead' | 'unknown';

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

export async function classifySourceUrl(url: string, timeoutMs = 7000): Promise<SourceVerdict> {
  let sawBlock = false;
  for (const method of ['HEAD', 'GET'] as const) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': UA },
      });
      clearTimeout(timer);
      if (res.status < 400) return 'live';
      if (res.status === 404 || res.status === 410) return 'dead';
      sawBlock = true; // 403/405/429/5xx : bloqué ou indécis → retente en GET
    } catch {
      clearTimeout(timer);
      sawBlock = true;
    }
  }
  return sawBlock ? 'unknown' : 'dead';
}

/** Mappe le verdict vers le booléen stocké/affiché : true=live, false=dead, null=unknown. */
export function verdictToOk(v: SourceVerdict): boolean | null {
  return v === 'live' ? true : v === 'dead' ? false : null;
}
