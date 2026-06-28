/**
 * Shared helpers for B2 Reading improved content (exams 1–6).
 */

export function mcq(num, questionType, prompt, options, answer) {
  return {
    id: `q${num}`,
    number: num,
    type: 'multiple-choice',
    questionType,
    prompt,
    options: ['A', 'B', 'C', 'D'].map((L) => ({ letter: L, text: options[L] })),
    answer,
  };
}

export function match(num, prompt, answer) {
  return { id: `q${num}`, number: num, type: 'matching', prompt, answer };
}

export const PART5_DIRECTIONS =
  'You are going to read a magazine article. For questions 31–36, choose the answer (A, B, C or D) which you think fits best according to the text.';

export const PART7_INTRO =
  'Which person (A–D) …? The people may be chosen more than once.';
