import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: SEO_PAGE_META.examPracticeB2Writing.title,
  description: SEO_PAGE_META.examPracticeB2Writing.description,
  path: '/exam-practice/b2/exam-writing/',
});

export default function Layout({ children }) {
  return children;
}
