import LegalShell, { LegalSection } from '../../../components/legal/legal-shell';
import { pageMetadata } from '../../../lib/seo';
import { LEGAL } from '../../../lib/legal';

export const metadata = pageMetadata({
  title: 'Terms of Service',
  description: 'The terms governing purchases and use of the French Beauty BD store.',
  path: '/legal/terms',
});

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      intro="These terms govern your use of French Beauty BD and any order you place with us."
      lastUpdated="August 2026"
    >
      <LegalSection heading="1. Who we are">
        <p>
          French Beauty BD sells authentic French cosmetics, imported from France,
          to customers in Bangladesh.
          {LEGAL.entity ? <> Our legal entity, registration and registered address: <strong>{LEGAL.entity}</strong>.</> : null}
        </p>
      </LegalSection>

      <LegalSection heading="2. Orders & acceptance">
        <p>
          An order is an offer to buy. A contract is formed only once we confirm
          the order. We may refuse or cancel an order (e.g. stock, pricing errors,
          or delivery area not served).
        </p>
      </LegalSection>

      <LegalSection heading="3. Prices & payment">
        <p>
          Prices are shown in Bangladeshi Taka (৳); the price shown at checkout is the
          price you pay, with no hidden customs fees or import duties on arrival.
          Payment is made via bKash only.
        </p>
      </LegalSection>

      <LegalSection heading="4. Delivery">
        <p>
          Delivery areas, timeframes and fees are described on our{' '}
          <a href="/shipping" className="text-accent hover:underline">Shipping page</a>.
        </p>
      </LegalSection>

      <LegalSection heading="5. Returns & refunds">
        <p>
          All sales are final: we do not offer returns or exchanges. Orders that
          arrive damaged or incorrect are handled as described on our{' '}
          <a href="/legal/returns" className="text-accent hover:underline">Returns &amp; Refunds page</a>.
        </p>
      </LegalSection>

      <LegalSection heading="6. Product information">
        <p>
          Product descriptions are provided for information only and do not
          constitute medical advice. Always read the manufacturer&apos;s label and
          patch-test where appropriate.
        </p>
      </LegalSection>

      {LEGAL.liability && (
        <LegalSection heading="7. Liability">
          <p>{LEGAL.liability}</p>
        </LegalSection>
      )}

      {(LEGAL.jurisdiction || LEGAL.courts) && (
        <LegalSection heading="8. Governing law">
          <p>
            {LEGAL.jurisdiction ? <>These terms are governed by the laws of <strong>{LEGAL.jurisdiction}</strong>. </> : null}
            {LEGAL.courts ? <>Disputes will be handled by <strong>{LEGAL.courts}</strong>.</> : null}
          </p>
        </LegalSection>
      )}
    </LegalShell>
  );
}
