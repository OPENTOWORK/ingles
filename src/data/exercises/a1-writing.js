// Ejercicios para A1 - writing
// Total de ejercicios por part

export const exercisesConfig = {
  "part-1": 12,
  "part-2": 12,
};

// Generador de ejercicios placeholder
export function getExercise(part, number) {
  return {
    title: `Ejercicio ${number}`,
    question: `Sample question for exercise ${number}.`,
    answer: `Sample answer placeholder.`
  };
}
