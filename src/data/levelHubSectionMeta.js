/** Headers for level hub sections (/niveles/b2, etc.) — matches NivelesSectionHeader on /niveles */

export const EXAM_PRACTICE_HEADER = {
  eyebrow: 'Mock exams',
  title: 'Exam Practice',
  description:
    'Start a full exam simulation or open each paper on its own — Reading and Use of English, Writing, Listening, and Speaking.',
};

/** @type {Record<string, { eyebrow: string, description: string }>} */
export const LEVEL_TOPIC_SECTION_HEADERS = {
  'Reading and Writing': {
    eyebrow: 'Papers 1–2',
    description:
      'Reading tasks and short writing at A2 level — signs, messages, and guided production.',
  },
  'Reading and Use of English': {
    eyebrow: 'Paper 1',
    description: 'Grammar, vocabulary in context, and reading comprehension.',
  },
  'Use of English': {
    eyebrow: 'Use of English',
    description: 'Cloze tasks, word formation, key word transformations, and related grammar.',
  },
  Reading: {
    eyebrow: 'Reading',
    description: 'Reading comprehension, gapped text, and multiple matching.',
  },
  Writing: {
    eyebrow: 'Paper 2',
    description: 'Register, structure, and exam criteria for compulsory essays and choice tasks.',
  },
  Listening: {
    eyebrow: 'Paper 3',
    description: 'Short extracts, monologues, conversations, and multiple matching.',
  },
  Speaking: {
    eyebrow: 'Paper 4',
    description: 'The interview, long turn, collaborative task, and discussion.',
  },
};

export function getLevelTopicSectionHeader(title) {
  const meta = LEVEL_TOPIC_SECTION_HEADERS[title];
  return {
    eyebrow: meta?.eyebrow ?? 'Exam skills',
    title,
    description:
      meta?.description ??
      'Strategies, timing, and typical task formats for this exam skill.',
  };
}
