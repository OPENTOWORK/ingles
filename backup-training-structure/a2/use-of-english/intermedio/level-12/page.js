"use client";
import ExerciseLevel from '@/components/ExerciseLevel';
import { A2_USE_OF_ENGLISH } from '@/data/useOfEnglishExercises';

export default function Level12Page() {
  const exercises = A2_USE_OF_ENGLISH.intermedio.level12;

  return (
    <ExerciseLevel
      exercises={exercises}
      levelNumber={12}
      difficulty="intermedio"
      backLink="/training/a2/use-of-english/intermedio"
      nextLink="/training/a2/use-of-english/avanzado"
      storageKey="stars_a2_use-of-english_intermedio"
    />
  );
}
