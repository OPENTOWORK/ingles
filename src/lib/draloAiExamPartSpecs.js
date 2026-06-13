/**
 * Cambridge exam part specs for Dralo AI (aligned with Levels B2 structure).
 * Question counts scale down for A2/B1; B2+ use full paper counts.
 */

const LEVEL_SCALE = {
  A2: 0.45,
  B1: 0.65,
  B2: 1,
  C1: 1,
  C2: 1,
};

/** B2 First question counts per Dralo activity id */
export const B2_EXAM_QUESTION_COUNTS = {
  'use-of-english': {
    'multiple-choice-cloze': 8,
    'open-cloze': 8,
    'word-formation': 8,
    'key-word': 6,
  },
  reading: {
    'multiple-choice': 6,
    'gapped-text': 6,
    'multiple-matching': 10,
  },
  listening: {
    'short-extracts': 8,
    'sentence-completion': 10,
    /** B2 Listening Part 4 (Dralo part 13): seven MCQ items Q24–30 */
    conversation: 7,
    /** B2 Listening Part 3 (Dralo part 12): five speakers Q19–23 */
    'multiple-matching': 5,
  },
};

export function getExamQuestionCount(mode, activity, level = 'B2') {
  const base = B2_EXAM_QUESTION_COUNTS[mode]?.[activity];
  if (!base) return 4;
  const scale = LEVEL_SCALE[level] ?? 1;
  return Math.max(2, Math.round(base * scale));
}

/** Cambridge-style directions (from Levels B2 part descriptions) */
export const EXAM_DIRECTIONS = {
  'use-of-english': {
    'multiple-choice-cloze': `Part 1: Multiple-choice cloze
For questions 1–8, read the text below and choose the best word (A, B, C or D) for each gap. There is an example at the beginning (0).`,
    'open-cloze': `Part 2: Open cloze
For questions 9–16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap. There is an example at the beginning (0).`,
    'word-formation': `Part 3: Word formation
For questions 17–24, read the text below. Use the word given in capitals at the end of each line to form a word that fits in the gap. There is an example at the beginning (0).`,
    'key-word': `Part 4: Key word transformations
For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between two and five words, including the word given. There is an example at the beginning (0).`,
  },
  reading: {
    'multiple-choice': `Part 5: Multiple choice (reading)
Read the text and choose the answer (A, B, C or D) which you think fits best according to the text.`,
    'gapped-text': `Part 6: Gapped text
Six sentences have been removed from the article. Choose from the sentences A–G the one which fits each gap. There is one extra sentence which you do not need to use.`,
    'multiple-matching': `Part 7: Multiple matching
Read the article in which people talk about their experiences. For each question, choose from the people (A–D). The people may be chosen more than once.`,
  },
  listening: {
    'short-extracts': `Part 1: Multiple choice (short extracts)
You will hear people talking in eight different situations. For questions 1–8, choose the best answer (A, B or C).`,
    'sentence-completion': `Part 2: Sentence completion
You will hear a monologue. For questions 9–18, complete the sentences with 1–3 words you hear.`,
    conversation: `Part 4: Multiple choice (interview)
You will hear an interview or conversation between two speakers. For questions 24–30, choose the best answer (A, B or C).`,
    'multiple-matching': `Part 3: Multiple matching (speakers)
You will hear five different speakers. For questions 19–23, choose from the list (A–H) what each speaker expresses. Use the letters only once. There are three extra letters which you do not need to use.`,
  },
  writing: {
    essay: `Part 1: Compulsory essay
In your English class you have been talking about a topic. Now your teacher has asked you to write an essay. Write an essay using all the notes and give reasons for your point of view.`,
    'part-2': `Part 2: Writing task
Write one of the following: an article, a formal/semi-formal letter, a report, or a review. Include all the points in the task.`,
  },
};

export function getExamDirections(mode, activity) {
  return EXAM_DIRECTIONS[mode]?.[activity] || '';
}
