'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/c2-writing';
import { partInfo } from '@/data/part-info/c2-writing';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="c2"
      skillFolder="writing"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
