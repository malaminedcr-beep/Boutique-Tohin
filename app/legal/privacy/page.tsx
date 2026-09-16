import LegalShell, { LegalSection } from '../../../components/legal/legal-shell';
import { CONTACT } from '../../../lib/contact';
import { pageMetadata } from '../../../lib/seo';
import { LEGAL } from '../../../lib/legal';

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'How French Beauty BD collects, uses and protects your personal data.',
  path: '/legal/privacy',
});

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      intro="This policy explains what personal data we collect and how we use it."
      lastUpdated="August 2026"
    >
      <LegalSection heading="1. Data we collect">
        <p>
          When you create an account or place an order we collect: name, email,
          phone number, delivery address, and order history. Payment is made via
          bKash; we do not store your bKash or mobile-wallet credentials.
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
          your data.
          {LEGAL.processors ? <> Third-party processors: <strong>{LEGAL.processors}</strong>.</> : null}
        </p>
      </LegalSection>

      <LegalSection heading="4. Storage & security">
        <p>
          Data is stored on our infrastructure provider (Supabase / Vercel).
          {LEGAL.retention ? <> Retention period: <strong>{LEGAL.retention}</strong>.</> : null}
        </p>
      </LegalSection>

      <LegalSection heading="5. Your rights">
        <p>
          You may request access, correction or deletion of your data by contacting
          us at <a href={`mailto:${CONTACT.email}`} className="text-accent hover:underline">{CONTACT.email}</a>.
        </p>
      </LegalSection>

      <LegalSection heading="6. Contact">
        <p>
          {LEGAL.dataController ? <>Data controller: <strong>{LEGAL.dataController}</strong>. </> : null}
          For any privacy request, contact us at{' '}
          <a href={`mailto:${CONTACT.email}`} className="text-accent hover:underline">{CONTACT.email}</a>.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
