/**
 * Central English UI strings and structured labels.
 *
 * The site ships in a single language (English) with strings in the JSX, but
 * the reusable / structured copy lives here so a future locale (e.g. Bengali)
 * can be added by swapping this module rather than editing every component.
 *
 * IMPORTANT — cosmetic claims: product copy must stay cosmetic, never medical.
 * Use "helps strengthen / soothe / protect", never "repairs", "treats", "cures".
 */

/** Generic per-category product descriptions (claim-safe). */
export const PRODUCT_CATEGORY_DESCRIPTIONS: Record<string, string> = {
  'face-care':
    'A gentle, hydrating formula designed to help strengthen the skin barrier and soothe the skin.',
  'body-care':
    'A rich body care product to nourish and help restore hydration across the whole body.',
  'hair-care': 'A hair care product formulated to protect and enhance the hair.',
  deodorants: 'An effective deodorant offering long-lasting protection and comfort.',
};

export const PRODUCT_DESCRIPTION_FALLBACK =
  'Carefully selected for a refined beauty routine.';

/** Order lifecycle + payment labels used across the back-office. */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'COD — Cash on Delivery',
  bkash: 'bKash',
  nagad: 'Nagad',
};
