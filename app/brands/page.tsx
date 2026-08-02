import { pageMetadata } from '../../lib/seo';
import BrandsClient from './brands-client';

export const metadata = pageMetadata({
  title: 'Brands',
  description:
    'Discover the French cosmetics brands we carry — CeraVe, Vichy and Yves Rocher — selected for their expertise, quality and authentic French heritage.',
  path: '/brands',
});

export default function BrandsPage() {
  return <BrandsClient />;
}
