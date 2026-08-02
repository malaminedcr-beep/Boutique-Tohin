import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/seo';
import { getProducts } from '../lib/commerce/mock';

export default function sitemap(): MetadataRoute.Sitemap {
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

  const productEntries: MetadataRoute.Sitemap = getProducts().map((product) => ({
    url: `${SITE_URL}/product/${product.id}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
