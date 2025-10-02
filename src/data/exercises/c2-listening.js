// Ejercicios para C2 - listening
// Total de ejercicios por part

export const exercisesConfig = {
  "part-1": 12,
  "part-2": 12,
  "part-3": 12,
  "part-4": 12,
};

// Generador de ejercicios placeholder
export function getExercise(part, number) {
  return {
    title: `Ejercicio ${number}`,
    question: `Sample question for exercise ${number}.`,
    answer: `Sample answer placeholder.`
  };
}
