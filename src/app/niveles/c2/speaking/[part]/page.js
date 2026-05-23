'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/c2-speaking';
import { partInfo } from '@/data/part-info/c2-speaking';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="c2"
      skillFolder="speaking"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
