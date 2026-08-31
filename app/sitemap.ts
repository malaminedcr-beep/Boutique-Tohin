import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/seo';
import { getAllProducts } from '../lib/supabase/products';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes = [
    '',
    '/shop',
    '/about',
    '/brands',
    '/faq',
    '/shipping',
    '/legal/terms',
    '/legal/privacy',
    '/legal/returns',
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = (await getAllProducts()).filter((product) => product.inStock);
    productEntries = products.map((product) => ({
      url: `${SITE_URL}/product/${product.id}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch {
    // Supabase indisponible au build : on renvoie au moins les routes statiques.
  }

  return [...staticEntries, ...productEntries];
}
