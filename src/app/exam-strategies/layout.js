import { SEO_PAGE_META } from '@/lib/siteSeo';
import ExamStrategiesFeatureGuard from '@/components/exam/ExamStrategiesFeatureGuard';

export const metadata = {
  title: SEO_PAGE_META.examTheory.title,
  description: SEO_PAGE_META.examTheory.description,
  alternates: { canonical: '/exam-strategies/' },
};

export default function ExamStrategiesLayout({ children }) {
  return <ExamStrategiesFeatureGuard>{children}</ExamStrategiesFeatureGuard>;
}
