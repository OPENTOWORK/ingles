'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/a2-speaking';
import { partInfo } from '@/data/part-info/a2-speaking';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="a2"
      skillFolder="speaking"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
