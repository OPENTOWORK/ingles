import { pageMetadata, SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = pageMetadata({
  title: SEO_PAGE_META.examPracticeB2Reading.title,
  description: SEO_PAGE_META.examPracticeB2Reading.description,
  path: '/exam-practice/b2/exam-reading-and-use-of-english/',
});

export default function Layout({ children }) {
  return children;
}
