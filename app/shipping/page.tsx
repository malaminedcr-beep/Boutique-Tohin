import type { Metadata } from 'next';
import LegalShell, { LegalSection } from '../../components/legal/legal-shell';

export const metadata: Metadata = {
  title: 'Shipping | French Beauty BD',
  description: 'Delivery areas, timeframes and fees for French Beauty BD orders.',
};

export default function ShippingPage() {
  return (
    <LegalShell
      title="Shipping & Delivery"
      intro="Where we deliver, how long it takes, and what it costs."
    >
      <LegalSection heading="1. Delivery areas">
        <p>
          We deliver across Bangladesh, including Dhaka and Chittagong. Areas we do
          not currently serve: <strong>[TO BE COMPLETED]</strong>.
        </p>
      </LegalSection>

      <LegalSection heading="2. Timeframes">
        <p>
          Orders are sourced in France and shipped to Bangladesh. Estimated delivery:{' '}
          <strong>[TO BE COMPLETED: e.g. 7–10 business days]</strong>. Dhaka metro:{' '}
          <strong>[TO BE COMPLETED]</strong>. Outside Dhaka: <strong>[TO BE COMPLETED]</strong>.
        </p>
      </LegalSection>

      <LegalSection heading="3. Shipping fees">
        <p>
          Standard delivery fee: <strong>[TO BE COMPLETED]</strong>. Free delivery
          threshold: <strong>[TO BE COMPLETED]</strong>.
        </p>
      </LegalSection>

      <LegalSection heading="4. Order tracking">
        <p>
          You can follow your order status from your{' '}
          <a href="/account" className="text-accent hover:underline">account</a>. You will
          also receive updates by <strong>[TO BE COMPLETED: email/WhatsApp/SMS]</strong>.
        </p>
      </LegalSection>

      <LegalSection heading="5. Customs & duties">
        <p><strong>[TO BE COMPLETED: whether import duties are included in the price or billed separately.]</strong></p>
      </LegalSection>
    </LegalShell>
  );
}
