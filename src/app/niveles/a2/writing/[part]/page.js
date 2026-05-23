'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/a2-writing';
import { partInfo } from '@/data/part-info/a2-writing';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="a2"
      skillFolder="writing"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
