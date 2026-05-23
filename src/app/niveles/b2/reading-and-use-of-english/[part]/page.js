'use client';

import LevelPartTipsPage from '@/components/niveles/LevelPartTipsPage';
import { exercisesConfig, getExercise } from '@/data/exercises/b2-reading-and-use-of-english';
import { partInfo } from '@/data/part-info/b2-reading-and-use-of-english';

export default function PartTipsPage() {
  return (
    <LevelPartTipsPage
      slug="b2"
      skillFolder="reading-and-use-of-english"
      exercisesConfig={exercisesConfig}
      getExercise={getExercise}
      partInfo={partInfo}
    />
  );
}
