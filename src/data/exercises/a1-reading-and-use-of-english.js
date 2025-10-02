// Ejercicios para A1 - reading-and-use-of-english
// Total de ejercicios por part

export const exercisesConfig = {
  "part-1": 12,
  "part-2": 12,
  "part-3": 12,
  "part-4": 12,
  "part-5": 12,
  "part-6": 24,
  "part-7": 12,
  "part-8": 12,
};

// Generador de ejercicios placeholder
export function getExercise(part, number) {
  return {
    title: `Ejercicio ${number}`,
    question: `Sample question for exercise ${number}.`,
    answer: `Sample answer placeholder.`
  };
}
