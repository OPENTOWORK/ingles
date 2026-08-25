import ExamStrategiesFeatureGuard from '@/components/exam/ExamStrategiesFeatureGuard';

export default function TeoriaExamPartTipsLayout({ children }) {
  return <ExamStrategiesFeatureGuard>{children}</ExamStrategiesFeatureGuard>;
}
