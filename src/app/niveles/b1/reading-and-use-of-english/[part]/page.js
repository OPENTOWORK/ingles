'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/b1-reading-and-use-of-english';
import { partInfo } from '@/data/part-info/b1-reading-and-use-of-english';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="b1"
      skillFolder="reading-and-use-of-english"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
