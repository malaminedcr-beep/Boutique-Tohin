/**
 * Single source for public contact details, driven by env vars so they can be
 * updated without a code change. Set in .env.local and in Vercel:
 *   NEXT_PUBLIC_CONTACT_WHATSAPP="+8801XXXXXXXXX"   (full international format)
 *   NEXT_PUBLIC_CONTACT_EMAIL="hello@frenchbeautybd.com"
 * (NEXT_PUBLIC_ vars are safe to expose and are inlined at build time.)
 *
 * IMPORTANT: no placeholder fallbacks. A contact channel we don't have a real
 * value for resolves to null and is NOT rendered — a missing channel beats a
 * dead one (a fake number/link erodes trust and breaks tel:/wa.me links).
 */
function clean(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const CONTACT: { whatsapp: string | null; email: string | null } = {
  whatsapp: clean(process.env.NEXT_PUBLIC_CONTACT_WHATSAPP),
  email: clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL) || 'hello@frenchbeautybd.com',
};

/** WhatsApp number reduced to digits for wa.me/tel: links, or null if unset. */
export const whatsappTel = CONTACT.whatsapp
  ? CONTACT.whatsapp.replace(/[^\d]/g, '')
  : null;

/** Full wa.me chat link, or null when no number is configured. */
export const whatsappLink = whatsappTel ? `https://wa.me/${whatsappTel}` : null;
