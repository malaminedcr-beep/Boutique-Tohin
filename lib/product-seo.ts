import type { Product, ProductVariant } from './commerce/types';
import { discountedBdt } from './promo';
import { formatBdt } from './format';
import {
  PRODUCT_CATEGORY_DESCRIPTIONS,
  PRODUCT_DESCRIPTION_FALLBACK,
} from './i18n/strings';
import { SITE_URL } from './seo';

/**
 * SEO helpers for product pages. They mirror what the product page shows
 * (`product-detail.tsx`): the default variant is preselected, and the launch
 * promo is applied through `discountedBdt()`. That way the title, the meta
 * description and the schema.org price always match the visible price.
 */

const META_DESCRIPTION_MAX = 160;

/** Variant preselected on the page, or null if the product has no variants. */
export function defaultVariant(product: Product): ProductVariant | null {
  return product.variants?.find((v) => v.isDefault) ?? null;
}

/** Volume shown by default ("177 ml"). */
export function defaultVolume(product: Product): string {
  return defaultVariant(product)?.volume ?? product.volume;
}

/** Price charged for the default selection, with the promo applied (taka). */
export function defaultPriceBdt(product: Product): number {
  return discountedBdt(defaultVariant(product)?.priceBdt ?? product.priceBdt);
}

function hasPublicPrice(product: Product): boolean {
  return product.priceStatus !== 'draft' && product.priceBdt > 0;
}

/** Description as plain text: the markdown markers and line breaks are removed. */
function plainText(text: string): string {
  return text
    .replace(/\*\*/g, '')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Cuts at a sentence end if one fits, otherwise at a word boundary. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const sentenceEnd = slice.lastIndexOf('. ');
  if (sentenceEnd >= max * 0.5) return slice.slice(0, sentenceEnd + 1);
  const wordEnd = slice.lastIndexOf(' ');
  return `${slice.slice(0, wordEnd > 0 ? wordEnd : max).replace(/[,;:—–-]+$/, '').trim()}…`;
}

/** Full description (plain text) used for the schema. */
export function productDescriptionText(product: Product): string {
  const raw = product.description?.trim();
  if (raw) return plainText(raw);
  return `${product.name} - ${
    PRODUCT_CATEGORY_DESCRIPTIONS[product.category] ?? PRODUCT_DESCRIPTION_FALLBACK
  }`;
}

/** Search-intent title, e.g. "CeraVe Facial Moisturizing Lotion 177 ml — Price in Bangladesh". */
export function productSeoTitle(product: Product): string {
  const volume = defaultVolume(product);
  return `${product.brand} ${product.name}${volume ? ` ${volume}` : ''} — Price in Bangladesh`;
}

/**
 * Unique meta description (at most 160 characters): the start of the real
 * product description, then the price and the authenticity/delivery promise.
 */
export function productMetaDescription(product: Product): string {
  const tail = hasPublicPrice(product)
    ? ` Original from France, ${formatBdt(defaultPriceBdt(product))}, delivered across Bangladesh.`
    : ' Original from France, delivered across Bangladesh.';
  const room = META_DESCRIPTION_MAX - tail.length;
  return `${clip(productDescriptionText(product), room)}${tail}`;
}

function absoluteImage(src: string): string {
  return src.startsWith('http') ? src : `${SITE_URL}${src}`;
}

/**
 * schema.org Product. There is one Offer per variant, priced exactly as the
 * page shows it (promo included), and the default variant comes first.
 * Draft products (price not yet set) get no Offer: announcing a price of 0
 * would be wrong.
 */
export function productJsonLd(product: Product) {
  const url = `${SITE_URL}/product/${product.id}`;
  const images = (product.gallery?.length ? product.gallery : [product.image])
    .filter((src) => src && src !== 'placeholder')
    .map(absoluteImage);

  const offer = (priceBdt: number, volume?: string) => ({
    '@type': 'Offer',
    ...(volume ? { name: `${product.name} ${volume}` } : {}),
    price: discountedBdt(priceBdt),
    priceCurrency: 'BDT',
    availability: product.inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/NewCondition',
    url,
    seller: { '@type': 'Organization', name: 'French Beauty BD' },
  });

  const variants = product.variants?.length
    ? [...product.variants].sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
    : null;

  const offers = !hasPublicPrice(product)
    ? undefined
    : variants
      ? variants.map((v) => offer(v.priceBdt, v.volume))
      : offer(product.priceBdt, product.volume || undefined);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${product.name}${defaultVolume(product) ? ` ${defaultVolume(product)}` : ''}`,
    brand: { '@type': 'Brand', name: product.brand },
    sku: product.sku,
    image: images,
    description: productDescriptionText(product),
    url,
    ...(offers ? { offers } : {}),
  };
}
