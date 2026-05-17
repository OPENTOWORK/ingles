import { TRAINING_LEVEL_COUNT } from '@/constants/trainingLevels';

export function generateStaticParams() {
  return Array.from({ length: TRAINING_LEVEL_COUNT }, (_, i) => ({
    levelNumber: `level-${i + 1}`,
  }));
}

export default function TrainingLevelNumberLayout({ children }) {
  return children;
}
