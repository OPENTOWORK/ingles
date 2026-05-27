import { extendExercisesConfigWithGlobalKeys } from '@/data/exercises/extendExercisesConfig';

const baseExercisesConfig = {
  'part-1': 12,
  'part-2': 12,
  'part-3': 12,
  'part-4': 12,
  'part-5': 12,
};

export const exercisesConfig = extendExercisesConfigWithGlobalKeys(baseExercisesConfig, 8);

const SAMPLE_MATCHING = {
  rubric:
    'You will hear Julia talking to her mother about food for a party. What will each person bring?',
  left: ['Julia (example)', 'Peter', 'Maria', 'Tom', 'Anna'],
  options: [
    { letter: 'A', text: 'bread' },
    { letter: 'B', text: 'cake' },
    { letter: 'C', text: 'cheese' },
    { letter: 'D', text: 'chicken' },
    { letter: 'E', text: 'fruit' },
    { letter: 'F', text: 'juice' },
    { letter: 'G', text: 'salad' },
    { letter: 'H', text: 'soup' },
  ],
  example: { person: 'Julia', answer: 'B' },
  answers: { Peter: 'D', Maria: 'E', Tom: 'G', Anna: 'F' },
};

export function getExercise(part, number) {
  const p = Number(part);
  if (p === 5 || p === 12) {
    return {
      title: `Ejercicio ${number} — Matching (Cambridge Part 5)`,
      type: 'matching',
      question: SAMPLE_MATCHING.rubric,
      matching: SAMPLE_MATCHING,
      answer:
        'Listen twice. Match each person to A–H. Three letters are not used. Expect paraphrasing and distractors on the recording.',
    };
  }
  return {
    title: `Ejercicio ${number}`,
    question: `Sample question for exercise ${number}.`,
    answer: `Sample answer placeholder.`,
  };
}
