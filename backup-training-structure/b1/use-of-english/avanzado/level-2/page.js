"use client";
import ExerciseLevel from '@/components/ExerciseLevel';
import { B1_USE_OF_ENGLISH } from '@/data/useOfEnglishExercises';

export default function Level2Page() {
  const exercises = B1_USE_OF_ENGLISH.avanzado.level2;

  return (
    <ExerciseLevel
      exercises={exercises}
      levelNumber={2}
      difficulty="avanzado"
      backLink="/training/b1/use-of-english/avanzado"
      nextLink="/training/b1/use-of-english/avanzado/level-3"
      storageKey="stars_b1_use-of-english_avanzado"
    />
  );
}
