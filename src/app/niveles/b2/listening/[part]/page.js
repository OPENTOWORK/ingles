'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/b2-listening';
import { partInfo } from '@/data/part-info/b2-listening';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="b2"
      skillFolder="listening"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
