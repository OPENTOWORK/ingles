"use client";
import ExerciseLevel from '@/components/ExerciseLevel';
import { B1_USE_OF_ENGLISH } from '@/data/useOfEnglishExercises';

export default function Level9Page() {
  const exercises = B1_USE_OF_ENGLISH.avanzado.level9;

  return (
    <ExerciseLevel
      exercises={exercises}
      levelNumber={9}
      difficulty="avanzado"
      backLink="/training/b1/use-of-english/avanzado"
      nextLink="/training/b1/use-of-english/avanzado/level-10"
      storageKey="stars_b1_use-of-english_avanzado"
    />
  );
}
