/**
 * Manual mobile-payment config (French Beauty BD) — shared by bKash & Nagad.
 *
 * No merchant API: the customer sends money ("Send Money") to a fixed personal
 * wallet, then uploads a screenshot of the confirmation. bKash and Nagad use the
 * SAME receiver number/name — a single source of truth, no per-method duplication.
 *
 * These values are public (the customer must see them), hence plain constants.
 */

export type PaymentMethod = 'bkash' | 'nagad';

/** Server/client whitelist of accepted payment methods. */
export const PAYMENT_METHODS: readonly PaymentMethod[] = ['bkash', 'nagad'] as const;

export function isPaymentMethod(v: unknown): v is PaymentMethod {
  return v === 'bkash' || v === 'nagad';
}

/** Shared "Send Money" receiver — identical for bKash and Nagad. */
export const PAYMENT_RECEIVER_NUMBER = '01764267322';
export const PAYMENT_RECEIVER_NAME = 'MD. SHOZIB';

/** Account type to use on the customer side (Send Money to a personal wallet). */
export const PAYMENT_ACCOUNT_TYPE = 'Personal';

/** Display label per method (used in UI, Telegram, slip, emails). */
export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  bkash: 'bKash',
  nagad: 'Nagad',
};

// ── Back-compat aliases (older imports still resolve to the shared values) ──
export const BKASH_RECEIVER_NUMBER = PAYMENT_RECEIVER_NUMBER;
export const BKASH_RECEIVER_NAME = PAYMENT_RECEIVER_NAME;
export const BKASH_ACCOUNT_TYPE = PAYMENT_ACCOUNT_TYPE;

/** Minimal plausible TrxID length (alphanumeric code from bKash/Nagad). */
export const TRXID_MIN_LENGTH = 8;

/** Normalise a TrxID: trim + uppercase (bKash/Nagad TrxIDs are uppercase). */
export function normalizeTrxId(raw: string): string {
  return raw.trim().toUpperCase();
}

/** Basic client/server validation of a TrxID before submission. */
export function isPlausibleTrxId(raw: string): boolean {
  const t = normalizeTrxId(raw);
  return /^[A-Z0-9]+$/.test(t) && t.length >= TRXID_MIN_LENGTH && t.length <= 24;
}
