'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/b1-writing';
import { partInfo } from '@/data/part-info/b1-writing';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="b1"
      skillFolder="writing"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
