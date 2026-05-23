'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/b2-speaking';
import { partInfo } from '@/data/part-info/b2-speaking';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="b2"
      skillFolder="speaking"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
