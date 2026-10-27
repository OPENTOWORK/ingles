import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: SEO_PAGE_META.examPracticeB2Listening.title,
  description: SEO_PAGE_META.examPracticeB2Listening.description,
  path: '/exam-practice/b2/exam-listening/',
});

export default function Layout({ children }) {
  return children;
}
