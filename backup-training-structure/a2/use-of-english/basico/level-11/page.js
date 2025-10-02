"use client";
import ExerciseLevel from '@/components/ExerciseLevel';
import { A2_USE_OF_ENGLISH } from '@/data/useOfEnglishExercises';

export default function Level11Page() {
  const exercises = A2_USE_OF_ENGLISH.basico.level11;

  return (
    <ExerciseLevel
      exercises={exercises}
      levelNumber={11}
      difficulty="basico"
      backLink="/training/a2/use-of-english/basico"
      nextLink="/training/a2/use-of-english/basico/level-12"
      storageKey="stars_a2_use-of-english_basico"
    />
  );
}
