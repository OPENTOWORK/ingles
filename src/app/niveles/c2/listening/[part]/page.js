'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/c2-listening';
import { partInfo } from '@/data/part-info/c2-listening';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="c2"
      skillFolder="listening"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
