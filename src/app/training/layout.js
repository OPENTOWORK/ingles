import '@/styles/app-routes.css';
import '@/styles/training-theme.css';
import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: SEO_PAGE_META.training.title,
  description: SEO_PAGE_META.training.description,
  path: '/training/',
});

export default function TrainingLayout({ children }) {
  return children;
}
