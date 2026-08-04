import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductByRef } from '../../../lib/pocketbase/products';
import {
  PRODUCT_CATEGORY_DESCRIPTIONS,
  PRODUCT_DESCRIPTION_FALLBACK,
} from '../../../lib/i18n/strings';
import { SITE_URL } from '../../../lib/seo';
import ProductDetail from './product-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProductByRef(Number(params.id));
  if (!product) return { title: 'Product not found' };

  const title = `${product.name} ${product.volume} — ${product.brand}`;
  const description =
    PRODUCT_CATEGORY_DESCRIPTIONS[product.category] ?? PRODUCT_DESCRIPTION_FALLBACK;
  const path = `/product/${product.id}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      url: `${SITE_URL}${path}`,
      title,
      description,
      images: [{ url: product.image }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProductByRef(Number(params.id));
  if (!product) notFound();

  const description =
    PRODUCT_CATEGORY_DESCRIPTIONS[product.category] ?? PRODUCT_DESCRIPTION_FALLBACK;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    brand: { '@type': 'Brand', name: product.brand },
    sku: product.sku,
    image: `${SITE_URL}${product.image}`,
    description,
    offers: {
      '@type': 'Offer',
      price: product.priceBdt,
      priceCurrency: 'BDT',
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/product/${product.id}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} />
    </>
  );
}
