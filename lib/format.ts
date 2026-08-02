/**
 * Locale-aware formatting helpers (English UI, Bangladeshi Taka).
 * Use these instead of hardcoding `৳${n.toLocaleString(...)}` or `fr-FR` dates.
 */
const bdtNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** Price in BDT with the ৳ symbol, e.g. formatBdt(1980) -> "৳1,980". */
export function formatBdt(value: number): string {
  return `৳${bdtNumber.format(value)}`;
}

/** Short English date, e.g. "02 Aug 2026". */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
