'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/b1-speaking';
import { partInfo } from '@/data/part-info/b1-speaking';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="b1"
      skillFolder="speaking"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
