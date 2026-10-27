import '@/styles/app-routes.css';
import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: SEO_PAGE_META.updatePassword.title,
  description: SEO_PAGE_META.updatePassword.description,
  path: '/update-password/',
  robots: { index: false, follow: true },
});

export default function Layout({ children }) {
  return children;
}
