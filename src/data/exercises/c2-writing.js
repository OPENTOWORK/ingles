import { extendExercisesConfigWithGlobalKeys } from '@/data/exercises/extendExercisesConfig';

// Ejercicios para C2 - writing
// Total de ejercicios por part

const baseExercisesConfig = {
  "part-1": 12,
  "part-2": 12,
};

export const exercisesConfig = extendExercisesConfigWithGlobalKeys(baseExercisesConfig, 8);

// Generador de ejercicios placeholder
export function getExercise(part, number) {
  return {
    title: `Ejercicio ${number}`,
    question: `Sample question for exercise ${number}.`,
    answer: `Sample answer placeholder.`
  };
}
