import LegalShell, { LegalSection } from '../../components/legal/legal-shell';
import { CONTACT } from '../../lib/contact';
import { pageMetadata } from '../../lib/seo';

export const metadata = pageMetadata({
  title: 'FAQ',
  description: 'Answers to common questions about products, orders, payment and delivery.',
  path: '/faq',
});

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
          We accept payment via bKash only.
        </p>
      </LegalSection>

      <LegalSection heading="How long does delivery take?">
        <p>
          As our products are sourced directly from France, delivery takes between
          2 to 3 weeks.
        </p>
      </LegalSection>

      <LegalSection heading="Can I return a product?">
        <p>
          We do not accept product returns.
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
