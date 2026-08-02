import type { Metadata } from 'next';
import LegalShell, { LegalSection } from '../../components/legal/legal-shell';
import { CONTACT } from '../../lib/contact';

export const metadata: Metadata = {
  title: 'FAQ | French Beauty BD',
  description: 'Answers to common questions about products, orders, payment and delivery.',
};

export default function FaqPage() {
  return (
    <LegalShell
      title="Frequently Asked Questions"
      intro="Quick answers about our products, orders, payment and delivery."
    >
      <LegalSection heading="Are your products authentic?">
        <p>
          Yes. All products are authentic French cosmetics, sourced in France and
          shipped to Bangladesh. Authenticity is guaranteed.
        </p>
      </LegalSection>

      <LegalSection heading="How can I pay?">
        <p>
          We accept Cash on Delivery (COD), bKash and Nagad. Mobile payment steps:{' '}
          <strong>[TO BE COMPLETED]</strong>.
        </p>
      </LegalSection>

      <LegalSection heading="How long does delivery take?">
        <p>
          See our <a href="/shipping" className="text-accent hover:underline">Shipping page</a>{' '}
          for areas, timeframes and fees.
        </p>
      </LegalSection>

      <LegalSection heading="Can I return a product?">
        <p>
          Yes, under the conditions on our{' '}
          <a href="/legal/returns" className="text-accent hover:underline">Returns &amp; Refunds page</a>.
        </p>
      </LegalSection>

      <LegalSection heading="How do I contact you?">
        <p>
          Email <a href={`mailto:${CONTACT.email}`} className="text-accent hover:underline">{CONTACT.email}</a>{' '}
          or WhatsApp {CONTACT.whatsapp}.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
