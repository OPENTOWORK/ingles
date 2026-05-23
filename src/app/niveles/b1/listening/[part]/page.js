'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/b1-listening';
import { partInfo } from '@/data/part-info/b1-listening';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="b1"
      skillFolder="listening"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
