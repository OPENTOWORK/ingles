"use client";
import ExerciseLevel from '@/components/ExerciseLevel';
import { B1_USE_OF_ENGLISH } from '@/data/useOfEnglishExercises';

export default function Level1Page() {
  const exercises = B1_USE_OF_ENGLISH.basico.level1;

  return (
    <ExerciseLevel
      exercises={exercises}
      levelNumber={1}
      difficulty="basico"
      backLink="/training/b1/use-of-english/basico"
      nextLink="/training/b1/use-of-english/basico/level-2"
      storageKey="stars_b1_use-of-english_basico"
    />
  );
}
