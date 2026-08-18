/**
 * Configuration du paiement bKash MANUEL (French Beauty BD).
 *
 * Pas de compte marchand / API bKash : le client envoie l'argent « Send Money »
 * vers un numéro personnel fixe, puis colle son TrxID sur le site. L'admin
 * vérifie le TrxID à la main dans /admin/paiements.
 *
 * ⚠️ PLACEHOLDERS À REMPLACER (infos publiques, affichées au client) :
 *   - BKASH_RECEIVER_NUMBER : le numéro bKash qui reçoit l'argent  -> `0000000000`
 *   - BKASH_RECEIVER_NAME   : le nom du titulaire du compte        -> `XXXXXXXXXX`
 *
 * Ces valeurs ne sont pas secrètes (le client doit les voir), d'où le choix de
 * simples constantes plutôt que des variables d'environnement.
 */

/** Numéro bKash (personnel) qui reçoit les paiements « Send Money ». */
export const BKASH_RECEIVER_NUMBER = '0000000000';

/** Nom du titulaire du compte bKash (affiché au client pour rassurer). */
export const BKASH_RECEIVER_NAME = 'XXXXXXXXXX';

/** Type de compte bKash à utiliser côté client (Send Money vers un perso). */
export const BKASH_ACCOUNT_TYPE = 'Personal';

/** Longueur minimale plausible d'un TrxID bKash (10 caractères alphanumériques). */
export const TRXID_MIN_LENGTH = 8;

/** Normalise un TrxID saisi : trim + majuscules (les TrxID bKash sont en MAJ). */
export function normalizeTrxId(raw: string): string {
  return raw.trim().toUpperCase();
}

/** Validation basique côté client/serveur d'un TrxID avant soumission. */
export function isPlausibleTrxId(raw: string): boolean {
  const t = normalizeTrxId(raw);
  return /^[A-Z0-9]+$/.test(t) && t.length >= TRXID_MIN_LENGTH && t.length <= 24;
}
