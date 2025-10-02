"use client";
import ExerciseLevel from '@/components/ExerciseLevel';
import { A1_USE_OF_ENGLISH } from '@/data/useOfEnglishExercises';

export default function Level12Page() {
  const exercises = A1_USE_OF_ENGLISH.avanzado.level12;

  return (
    <ExerciseLevel
      exercises={exercises}
      levelNumber={12}
      difficulty="avanzado"
      backLink="/training/a1/use-of-english/avanzado"
      nextLink="/training/a1"
      storageKey="stars_a1_use-of-english_avanzado"
    />
  );
}
