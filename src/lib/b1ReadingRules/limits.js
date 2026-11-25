/** Machine-readable B1 Reading limits. Prompts and validators import these values. */

export const B1_PART3_PASSAGE_LIMITS = {
  min: 180,
  max: 520,
  targetMin: 280,
  targetMax: 360,
  slight: 24,
};

export const B1_PART5_PASSAGE_LIMITS = {
  targetMin: 110,
  targetMax: 160,
  hardMin: 90,
};

export const B1_PART_SHAPE = {
  1: { questions: [1, 5], options: 3, letters: ['A', 'B', 'C'] },
  2: { questions: [6, 10], texts: 8, letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] },
  3: { questions: [11, 15], options: 4, letters: ['A', 'B', 'C', 'D'] },
  4: { questions: [16, 20], sentences: 8, unused: 3, letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] },
  5: { questions: [21, 26], options: 4, letters: ['A', 'B', 'C', 'D'] },
  6: { questions: [27, 32], wordsPerGap: 1 },
};

export const B1_PART4_COHESION_DEVICES = [
  'pronoun-reference',
  'chronology',
  'contrast',
  'cause-effect',
  'lexical-link',
  'logical-progression',
];
