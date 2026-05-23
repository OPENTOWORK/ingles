// Ejercicios para A2 - listening
// Total de ejercicios por part

export const exercisesConfig = {
  "part-1": 12,
  "part-2": 12,
  "part-3": 12,
  "part-4": 12,
  "part-8": 12,
  "part-9": 12,
  "part-10": 12,
  "part-11": 12,
};

// Generador de ejercicios placeholder
export function getExercise(part, number) {
  return {
    title: `Ejercicio ${number}`,
    question: `Sample question for exercise ${number}.`,
    answer: `Sample answer placeholder.`
  };
}
