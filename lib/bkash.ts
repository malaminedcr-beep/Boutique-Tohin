/**
 * Configuration du paiement bKash MANUEL (French Beauty BD).
 *
 * Pas de compte marchand / API bKash : le client envoie l'argent « Send Money »
 * vers un numéro personnel fixe, puis colle son TrxID sur le site. L'admin
 * vérifie le TrxID à la main dans /admin/paiements.
 *
 * Infos publiques (affichées au client dans la popup de paiement) :
 *   - BKASH_RECEIVER_NUMBER : numéro bKash local classique (format 01XXXXXXXXX,
 *     11 chiffres, zéro initial, SANS indicatif +880 — c'est le format que le
 *     client bangladais saisit dans son app bKash).
 *   - BKASH_RECEIVER_NAME   : nom du titulaire du compte.
 *
 * Ces valeurs ne sont pas secrètes (le client doit les voir), d'où le choix de
 * simples constantes plutôt que des variables d'environnement.
 */

/** Numéro bKash (personnel) qui reçoit les paiements « Send Money ». Format local 01XXXXXXXXX. */
export const BKASH_RECEIVER_NUMBER = '01764267322';

/** Nom du titulaire du compte bKash (affiché au client pour rassurer). */
export const BKASH_RECEIVER_NAME = 'MD. SHOZIB';

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
