import '@/styles/app-routes.css';
import '@/styles/dralo-ai.css';
import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: SEO_PAGE_META.precios.title,
  description: SEO_PAGE_META.precios.description,
  path: '/precios/',
});

export default function PreciosLayout({ children }) {
  return children;
}
