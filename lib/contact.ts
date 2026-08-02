/**
 * Single source for public contact details. Driven by env vars so they can be
 * updated without touching the code. Fill these in .env.local:
 *   NEXT_PUBLIC_CONTACT_WHATSAPP="+880 1XXXXXXXXX"
 *   NEXT_PUBLIC_CONTACT_EMAIL="hello@frenchbeautybd.com"
 * (NEXT_PUBLIC_ vars are safe to expose and are inlined at build time.)
 */
export const CONTACT = {
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP?.trim() || '+880 1XXX-XXXXXX',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || 'hello@frenchbeautybd.com',
};

/** WhatsApp number reduced to digits + leading '+' for tel:/wa.me links. */
export const whatsappTel = CONTACT.whatsapp.replace(/[^\d+]/g, '');
