import '@/styles/app-routes.css';
import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: SEO_PAGE_META.login.title,
  description: SEO_PAGE_META.login.description,
  path: '/login/',
  robots: { index: false, follow: true },
});

export default function Layout({ children }) {
  return children;
}
