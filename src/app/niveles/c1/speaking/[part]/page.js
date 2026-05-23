'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/c1-speaking';
import { partInfo } from '@/data/part-info/c1-speaking';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="c1"
      skillFolder="speaking"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
