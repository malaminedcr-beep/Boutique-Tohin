import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductByRef, getSimilarProducts } from '../../../lib/supabase/products';
import { SITE_URL } from '../../../lib/seo';
import {
  productJsonLd,
  productMetaDescription,
  productSeoTitle,
} from '../../../lib/product-seo';
import ProductDetail from './product-detail';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProductByRef(Number(params.id));
  if (!product) return { title: 'Product not found' };

  const title = productSeoTitle(product);
  const description = productMetaDescription(product);
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

  const similarProducts = await getSimilarProducts(product.id, product.category);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // "<" is escaped so that no catalogue text can close the <script> tag.
          __html: JSON.stringify(productJsonLd(product)).replace(/</g, '\\u003c'),
        }}
      />
      <ProductDetail product={product} similarProducts={similarProducts} />
    </>
  );
}
