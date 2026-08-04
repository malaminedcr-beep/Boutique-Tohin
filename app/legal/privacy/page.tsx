import type { Metadata } from 'next';
import LegalShell, { LegalSection } from '../../../components/legal/legal-shell';
import { CONTACT } from '../../../lib/contact';

export const metadata: Metadata = {
  title: 'Privacy Policy | French Beauty BD',
  description: 'How French Beauty BD collects, uses and protects your personal data.',
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      intro="This policy explains what personal data we collect and how we use it."
    >
      <LegalSection heading="1. Data we collect">
        <p>
          When you create an account or place an order we collect: name, email,
          phone number, delivery address, and order history. Payment is handled at
          delivery (COD) or via mobile money (bKash/Nagad); we do{' '}
          <strong>[TO BE COMPLETED: confirm]</strong> not store mobile-wallet credentials.
        </p>
      </LegalSection>

      <LegalSection heading="2. How we use it">
        <p>
          To process and deliver orders, provide customer support, and — where you
          consent — send updates. Legal basis: performance of the sales contract.
        </p>
      </LegalSection>

      <LegalSection heading="3. Sharing">
        <p>
          We share delivery details with our logistics partner in France and the
          local courier in Bangladesh strictly to fulfil your order. We do not sell
          your data. Third-party processors: <strong>[TO BE COMPLETED: list]</strong>.
        </p>
      </LegalSection>

      <LegalSection heading="4. Storage & security">
        <p>
          Data is stored on our infrastructure provider (PocketBase / Vercel).
          Retention period: <strong>[TO BE COMPLETED]</strong>.
        </p>
      </LegalSection>

      <LegalSection heading="5. Your rights">
        <p>
          You may request access, correction or deletion of your data by contacting
          us at <a href={`mailto:${CONTACT.email}`} className="text-accent hover:underline">{CONTACT.email}</a>.
        </p>
      </LegalSection>

      <LegalSection heading="6. Contact">
        <p>Data controller: <strong>[TO BE COMPLETED: legal entity + address]</strong>.</p>
      </LegalSection>
    </LegalShell>
  );
}
