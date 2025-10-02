"use client";
import ExerciseLevel from '@/components/ExerciseLevel';
import { A1_USE_OF_ENGLISH } from '@/data/useOfEnglishExercises';

export default function Level3Page() {
  const exercises = A1_USE_OF_ENGLISH.intermedio.level3;

  return (
    <ExerciseLevel
      exercises={exercises}
      levelNumber={3}
      difficulty="intermedio"
      backLink="/training/a1/use-of-english/intermedio"
      nextLink="/training/a1/use-of-english/intermedio/level-4"
      storageKey="stars_a1_use-of-english_intermedio"
    />
  );
}
