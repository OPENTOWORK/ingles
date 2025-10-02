"use client";
import ExerciseLevel from '@/components/ExerciseLevel';
import { B1_USE_OF_ENGLISH } from '@/data/useOfEnglishExercises';

export default function Level7Page() {
  const exercises = B1_USE_OF_ENGLISH.basico.level7;
  return <ExerciseLevel exercises={exercises} levelNumber={7} difficulty="basico" backLink="/training/b1/use-of-english/basico" nextLink="/training/b1/use-of-english/basico/level-8" storageKey="stars_b1_use-of-english_basico" />;
}