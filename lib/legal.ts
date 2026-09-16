/**
 * Legal / regulatory values that only the operator can supply (legal entity,
 * jurisdiction, data-protection specifics). Driven by env vars; set in Vercel:
 *   NEXT_PUBLIC_LEGAL_ENTITY          e.g. "French Beauty BD Ltd, reg. 12345, Dhaka"
 *   NEXT_PUBLIC_LEGAL_JURISDICTION    e.g. "Bangladesh"
 *   NEXT_PUBLIC_LEGAL_COURTS          e.g. "the courts of Dhaka, Bangladesh"
 *   NEXT_PUBLIC_LEGAL_LIABILITY       full limitation-of-liability wording (lawyer-reviewed)
 *   NEXT_PUBLIC_PRIVACY_PROCESSORS    e.g. "Supabase, Vercel, Resend, our courier"
 *   NEXT_PUBLIC_PRIVACY_RETENTION     e.g. "5 years after your last order"
 *   NEXT_PUBLIC_LEGAL_DATA_CONTROLLER e.g. "French Beauty BD Ltd, <address>"
 *
 * IMPORTANT: no placeholder fallbacks. Anything unset resolves to null and the
 * corresponding sentence/section is not rendered — we never ship
 * "[TO BE COMPLETED]" to a live legal page.
 */
function env(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const LEGAL = {
  entity: env(process.env.NEXT_PUBLIC_LEGAL_ENTITY),
  jurisdiction: env(process.env.NEXT_PUBLIC_LEGAL_JURISDICTION),
  courts: env(process.env.NEXT_PUBLIC_LEGAL_COURTS),
  liability: env(process.env.NEXT_PUBLIC_LEGAL_LIABILITY),
  processors: env(process.env.NEXT_PUBLIC_PRIVACY_PROCESSORS),
  retention: env(process.env.NEXT_PUBLIC_PRIVACY_RETENTION),
  dataController: env(process.env.NEXT_PUBLIC_LEGAL_DATA_CONTROLLER),
};
