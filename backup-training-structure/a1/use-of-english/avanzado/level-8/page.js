"use client";
import ExerciseLevel from '@/components/ExerciseLevel';
import { A1_USE_OF_ENGLISH } from '@/data/useOfEnglishExercises';

export default function Level8Page() {
  const exercises = A1_USE_OF_ENGLISH.avanzado.level8;

  return (
    <ExerciseLevel
      exercises={exercises}
      levelNumber={8}
      difficulty="avanzado"
      backLink="/training/a1/use-of-english/avanzado"
      nextLink="/training/a1/use-of-english/avanzado/level-9"
      storageKey="stars_a1_use-of-english_avanzado"
    />
  );
}
