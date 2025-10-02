"use client";
import ExerciseLevel from '@/components/ExerciseLevel';
import { A2_USE_OF_ENGLISH } from '@/data/useOfEnglishExercises';

export default function Level10Page() {
  const exercises = A2_USE_OF_ENGLISH.intermedio.level10;

  return (
    <ExerciseLevel
      exercises={exercises}
      levelNumber={10}
      difficulty="intermedio"
      backLink="/training/a2/use-of-english/intermedio"
      nextLink="/training/a2/use-of-english/intermedio/level-11"
      storageKey="stars_a2_use-of-english_intermedio"
    />
  );
}
