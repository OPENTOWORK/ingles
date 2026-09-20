import { SEO_PAGE_META } from '@/lib/siteSeo';

export const metadata = {
  title: SEO_PAGE_META.examTheory.title,
  description: SEO_PAGE_META.examTheory.description,
  alternates: { canonical: '/exam-strategies/' },
};

/** Hub overview is public; skill routes enforce plan access in TeoriaSectionGate / nested layouts. */
export default function ExamStrategiesLayout({ children }) {
  return children;
}
