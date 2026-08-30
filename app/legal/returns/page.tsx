import type { Metadata } from 'next';
import LegalShell, { LegalSection } from '../../../components/legal/legal-shell';
import { CONTACT } from '../../../lib/contact';

export const metadata: Metadata = {
  title: 'Returns & Refunds | French Beauty BD',
  description:
    'All sales are final. We do not offer returns or exchanges, but we make it right if your order arrives damaged or incorrect.',
};

export default function ReturnsPage() {
  return (
    <LegalShell
      title="Returns & Refunds"
      intro="Our policy on returns, exchanges and orders that arrive damaged or incorrect."
      lastUpdated="August 2026"
    >
      <LegalSection heading="1. All sales are final">
        <p>
          Because each order is sourced individually from France especially for you,
          we do not offer returns, exchanges or refunds once an order is confirmed.
          Please review your order carefully before completing payment.
        </p>
      </LegalSection>

      <LegalSection heading="2. Damaged or incorrect orders">
        <p>
          If your order arrives damaged, or you received the wrong item, contact us
          within <strong>48 hours</strong> of delivery with a clear photo of the item
          and packaging. We will review it and, where appropriate, arrange a
          replacement or refund at no cost to you — as a goodwill gesture.
        </p>
      </LegalSection>

      <LegalSection heading="3. Hygiene">
        <p>
          For hygiene and safety reasons, opened or used cosmetics cannot be returned
          or exchanged under any circumstances, except in the damaged-on-arrival case
          described above.
        </p>
      </LegalSection>

      <LegalSection heading="4. How to reach us">
        <p>
          Email <a href={`mailto:${CONTACT.email}`} className="text-accent hover:underline">{CONTACT.email}</a>{' '}
          or message us on WhatsApp at {CONTACT.whatsapp} with your order number, and
          we will help as quickly as we can.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
