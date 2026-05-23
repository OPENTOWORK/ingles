'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/c1-writing';
import { partInfo } from '@/data/part-info/c1-writing';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="c1"
      skillFolder="writing"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
