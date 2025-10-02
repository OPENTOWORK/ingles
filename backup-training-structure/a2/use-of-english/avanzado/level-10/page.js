"use client";
import ExerciseLevel from '@/components/ExerciseLevel';
import { A2_USE_OF_ENGLISH } from '@/data/useOfEnglishExercises';

export default function Level10Page() {
  const exercises = A2_USE_OF_ENGLISH.avanzado.level10;

  return (
    <ExerciseLevel
      exercises={exercises}
      levelNumber={10}
      difficulty="avanzado"
      backLink="/training/a2/use-of-english/avanzado"
      nextLink="/training/a2/use-of-english/avanzado/level-11"
      storageKey="stars_a2_use-of-english_avanzado"
    />
  );
}
