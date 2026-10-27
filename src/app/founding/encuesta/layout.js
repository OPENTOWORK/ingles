import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: SEO_PAGE_META.foundingSurvey.title,
  description: SEO_PAGE_META.foundingSurvey.description,
  path: '/founding/encuesta/',
  robots: { index: false, follow: true },
});

export default function FoundingSurveyLayout({ children }) {
  return children;
}
