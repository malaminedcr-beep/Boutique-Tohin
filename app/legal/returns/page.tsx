import type { Metadata } from 'next';
import LegalShell, { LegalSection } from '../../../components/legal/legal-shell';
import { CONTACT } from '../../../lib/contact';

export const metadata: Metadata = {
  title: 'Returns & Refunds | French Beauty BD',
  description: 'Our returns and refunds policy for orders delivered in Bangladesh.',
};

export default function ReturnsPage() {
  return (
    <LegalShell
      title="Returns & Refunds"
      intro="How to return an item and how refunds are handled."
    >
      <LegalSection heading="1. Return window">
        <p>
          You may request a return within <strong>[TO BE COMPLETED: e.g. 7]</strong> days of
          delivery. Items must be unused, unopened and in their original packaging.
        </p>
      </LegalSection>

      <LegalSection heading="2. Non-returnable items">
        <p>
          For hygiene reasons, opened or used cosmetics cannot be returned unless
          they are damaged or defective on arrival. Other exclusions: <strong>[TO BE COMPLETED]</strong>.
        </p>
      </LegalSection>

      <LegalSection heading="3. Damaged or wrong items">
        <p>
          If your item arrives damaged or incorrect, contact us within{' '}
          <strong>[TO BE COMPLETED: e.g. 48h]</strong> with a photo. We will arrange a
          replacement or full refund at no cost to you.
        </p>
      </LegalSection>

      <LegalSection heading="4. How to start a return">
        <p>
          Email <a href={`mailto:${CONTACT.email}`} className="text-accent hover:underline">{CONTACT.email}</a>{' '}
          or message us on WhatsApp at {CONTACT.whatsapp} with your order number.
        </p>
      </LegalSection>

      <LegalSection heading="5. Refunds">
        <p>
          Approved refunds are issued via <strong>[TO BE COMPLETED: bKash/Nagad/bank]</strong>{' '}
          within <strong>[TO BE COMPLETED: e.g. 7 business days]</strong>. Return shipping
          costs: <strong>[TO BE COMPLETED: who pays]</strong>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
