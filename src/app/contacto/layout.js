import '@/styles/app-routes.css';
import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: SEO_PAGE_META.contact.title,
  description: SEO_PAGE_META.contact.description,
  path: '/contacto/',
});

export default function Layout({ children }) {
  return children;
}
