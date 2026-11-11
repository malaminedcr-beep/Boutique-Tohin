/**
 * Launch promo — SINGLE SWITCH for the whole app.
 *
 * Flip it off in ONE place to end the promo everywhere (prices, strikethroughs,
 * badges, homepage launch hero and the top banner all read from here):
 *   • set the env var  NEXT_PUBLIC_LAUNCH_PROMO=off  (then redeploy), OR
 *   • change `PROMO_ACTIVE` default below to `false`.
 *
 * Original prices are NEVER overwritten. The discount is applied only at the
 * display layer AND in the server-side order recompute (`app/api/orders`), both
 * importing `discountedBdt()` so the amount shown == the amount actually charged.
 */

/** Launch discount, in percent. */
export const PROMO_PERCENT = 20;

/** Master switch. On by default; `NEXT_PUBLIC_LAUNCH_PROMO=off` disables it. */
export const PROMO_ACTIVE =
  PROMO_PERCENT > 0 && process.env.NEXT_PUBLIC_LAUNCH_PROMO !== 'off';

/** Short badge label, e.g. "-20%". */
export const PROMO_LABEL = `-${PROMO_PERCENT}%`;

/**
 * Discounted price in whole taka (rounded). Returns the original rounded price
 * when the promo is off. Discount is applied PER UNIT then multiplied by the
 * quantity on the server, so callers must discount the unit price, not a total,
 * to stay consistent with what the order will be charged.
 */
export function discountedBdt(original: number): number {
  if (!PROMO_ACTIVE) return Math.round(original);
  return Math.round(original * (1 - PROMO_PERCENT / 100));
}
