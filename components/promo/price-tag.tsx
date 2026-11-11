import { formatBdt } from '../../lib/format';
import { PROMO_ACTIVE, PROMO_LABEL, discountedBdt } from '../../lib/promo';

/** Small "-20%" pill in the brand accent. */
export function PromoBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-accent px-1.5 py-[3px] text-[9px] font-bold uppercase leading-none tracking-wide text-white ${className}`}
    >
      {PROMO_LABEL}
    </span>
  );
}

/**
 * Renders a price with the launch promo applied.
 *
 * Promo ON  → discounted price (styled via `priceClassName`) + original struck
 *             through + a `-20%` badge.
 * Promo OFF → just the original price with `priceClassName`.
 *
 * Pass `price` explicitly for line/cart totals (discounted PER UNIT then summed)
 * so the displayed total matches the server-recomputed one; for a single unit
 * price, omit it and let the component derive it.
 */
export default function PriceTag({
  original,
  price,
  priceClassName = '',
  className = '',
  badge = true,
  strikeClassName = 'text-[0.78em]',
}: {
  original: number;
  price?: number;
  priceClassName?: string;
  className?: string;
  badge?: boolean;
  strikeClassName?: string;
}) {
  const discounted = price ?? discountedBdt(original);
  const active = PROMO_ACTIVE && discounted < original;

  if (!active) {
    return <span className={`${priceClassName} ${className}`}>{formatBdt(original)}</span>;
  }

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 ${className}`}>
      <span className={priceClassName}>{formatBdt(discounted)}</span>
      <span className={`font-normal text-muted line-through ${strikeClassName}`}>
        {formatBdt(original)}
      </span>
      {badge && <PromoBadge className="self-center" />}
    </span>
  );
}
