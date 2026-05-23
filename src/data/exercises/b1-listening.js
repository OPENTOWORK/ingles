import { extendExercisesConfigWithGlobalKeys } from '@/data/exercises/extendExercisesConfig';

// Ejercicios para B1 - listening
// Total de ejercicios por part

const baseExercisesConfig = {
  "part-1": 12,
  "part-2": 12,
  "part-3": 12,
  "part-4": 12,
};

export const exercisesConfig = extendExercisesConfigWithGlobalKeys(baseExercisesConfig, 9);

// Generador de ejercicios placeholder
export function getExercise(part, number) {
  return {
    title: `Ejercicio ${number}`,
    question: `Sample question for exercise ${number}.`,
    answer: `Sample answer placeholder.`
  };
}
