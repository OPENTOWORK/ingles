'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/b2-writing';
import { partInfo } from '@/data/part-info/b2-writing';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="b2"
      skillFolder="writing"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
