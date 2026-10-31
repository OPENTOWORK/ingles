import { Suspense } from 'react';
import TrainingHomeClient from './TrainingHomeClient';

export default function TrainingPage() {
  return (
    <Suspense fallback={null}>
      <TrainingHomeClient />
    </Suspense>
  );
}
