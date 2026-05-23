'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/a2-listening';
import { partInfo } from '@/data/part-info/a2-listening';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="a2"
      skillFolder="listening"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
