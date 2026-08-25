import ExamStrategiesFeatureGuard from '@/components/exam/ExamStrategiesFeatureGuard';

export default function TeoriaExamStrategiesLayout({ children }) {
  return <ExamStrategiesFeatureGuard>{children}</ExamStrategiesFeatureGuard>;
}
