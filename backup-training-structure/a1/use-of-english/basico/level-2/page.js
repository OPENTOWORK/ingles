"use client";
import ExerciseLevel from '@/components/ExerciseLevel';
import { A1_USE_OF_ENGLISH } from '@/data/useOfEnglishExercises';

export default function Level2Page() {
  const exercises = A1_USE_OF_ENGLISH.basico.level2;

  return (
    <ExerciseLevel
      exercises={exercises}
      levelNumber={2}
      difficulty="basico"
      backLink="/training/a1/use-of-english/basico"
      nextLink="/training/a1/use-of-english/basico/level-3"
      storageKey="stars_a1_use-of-english_basico"
    />
  );
}