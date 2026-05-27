// Ejercicios para A2 - speaking
// Total de ejercicios por part

export const exercisesConfig = {
  "part-1": 12,
  "part-2": 12,
  "part-3": 12,
  "part-4": 12,
  "part-12": 12,
  "part-13": 12,
  "part-14": 12,
};

// Generador de ejercicios placeholder
export function getExercise(part, number) {
  return {
    title: `Ejercicio ${number}`,
    question: `Sample question for exercise ${number}.`,
    answer: `Sample answer placeholder.`
  };
}
