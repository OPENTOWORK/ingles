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
      'Description and interactive tips for reading tasks and short writing at A2 level — signs, messages, and guided production.',
  },
  'Reading and Use of English': {
    eyebrow: 'Paper 1',
    description:
      'Description and interactive tips for every part — grammar, vocabulary in context, and reading comprehension.',
  },
  'Use of English': {
    eyebrow: 'Use of English',
    description:
      'Description and interactive tips for cloze tasks, word formation, key word transformations, and related grammar.',
  },
  Reading: {
    eyebrow: 'Reading',
    description:
      'Description and interactive tips for reading comprehension, gapped text, and multiple matching.',
  },
  Writing: {
    eyebrow: 'Paper 2',
    description:
      'Description and interactive tips for compulsory essays and choice tasks — register, structure, and exam criteria.',
  },
  Listening: {
    eyebrow: 'Paper 3',
    description:
      'Description and interactive tips for short extracts, monologues, conversations, and multiple matching.',
  },
  Speaking: {
    eyebrow: 'Paper 4',
    description:
      'Description and interactive tips for the interview, long turn, collaborative task, and discussion.',
  },
};

export function getLevelTopicSectionHeader(title) {
  const meta = LEVEL_TOPIC_SECTION_HEADERS[title];
  return {
    eyebrow: meta?.eyebrow ?? 'Exam skills',
    title,
    description:
      meta?.description ??
      'Description and interactive tips for this exam skill — strategies, timing, and typical task formats.',
  };
}
