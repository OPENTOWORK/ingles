import '@/styles/app-routes.css';
import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: SEO_PAGE_META.examStrategies.title,
  description: SEO_PAGE_META.examStrategies.description,
  path: '/exam-strategies/',
});

/** Hub overview is public; skill routes enforce plan access in TeoriaSectionGate / nested layouts. */
export default function ExamStrategiesLayout({ children }) {
  return children;
}
