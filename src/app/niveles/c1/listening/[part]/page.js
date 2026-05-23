'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/c1-listening';
import { partInfo } from '@/data/part-info/c1-listening';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="c1"
      skillFolder="listening"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
