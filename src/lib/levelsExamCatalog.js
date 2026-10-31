/**
 * Catálogos de partes por nivel CEFR (formato Cambridge / numeración global en Supabase).
 * A2 sigue en a2ExamCatalog.js; aquí B1, B2, C1 y C2.
 */

import { B2_EXAM_PARTS, getB2PartDef, parteNameB2, examenNameB2 } from '@/lib/b2ExamCatalog';

export const EXAM_GENERATION_SLUGS = ['b1', 'b2', 'c1', 'c2'];

const LEVEL_LABEL = {
  b1: 'B1',
  b2: 'B2',
  c1: 'C1',
  c2: 'C2',
};

/** @typedef {{ partNumber: number, section: string, mode: string, activity: string, needsAudio?: boolean, needsImages?: boolean, audioClips?: number, questionCount?: number, questionStart?: number, title?: string, directions?: string, wordMin?: number, wordMax?: number }} ExamPartDef */

const B1_CHOOSE_ANSWER = 'For each question, choose the correct answer.';

/**
 * B1 Preliminary (2020 format). Reading 1–6, Writing 7–8, Listening 9–12, Speaking 13–16.
 * `title` uses the paper's local part number; question numbers restart in each paper.
 * @type {ExamPartDef[]}
 */
export const B1_EXAM_PARTS = [
  {
    partNumber: 1,
    section: 'Reading',
    title: 'Part 1: Multiple choice (short texts)',
    mode: 'reading',
    activity: 'notice-mcq',
    questionCount: 5,
    questionStart: 1,
    directions: B1_CHOOSE_ANSWER,
  },
  {
    partNumber: 2,
    section: 'Reading',
    title: 'Part 2: Matching (people to texts)',
    mode: 'reading',
    activity: 'multiple-matching',
    questionCount: 5,
    questionStart: 6,
    directions:
      'For each question, choose the correct answer. Five people each want something different. Read the eight short texts (A–H) and decide which one is the most suitable for each person.',
  },
  {
    partNumber: 3,
    section: 'Reading',
    title: 'Part 3: Multiple choice (long text)',
    mode: 'reading',
    activity: 'multiple-choice',
    questionCount: 5,
    questionStart: 11,
    directions: B1_CHOOSE_ANSWER,
  },
  {
    partNumber: 4,
    section: 'Reading',
    title: 'Part 4: Gapped text (sentences)',
    mode: 'reading',
    activity: 'gapped-text',
    questionCount: 5,
    questionStart: 16,
    directions:
      'Five sentences have been removed from the text below. For each question, choose the correct answer. There are three extra sentences which you do not need to use.',
  },
  {
    partNumber: 5,
    section: 'Reading',
    title: 'Part 5: Multiple-choice cloze',
    mode: 'use-of-english',
    activity: 'multiple-choice-cloze',
    questionCount: 6,
    questionStart: 21,
    directions: B1_CHOOSE_ANSWER,
  },
  {
    partNumber: 6,
    section: 'Reading',
    title: 'Part 6: Open cloze',
    mode: 'use-of-english',
    activity: 'open-cloze',
    questionCount: 6,
    questionStart: 27,
    directions: 'For each question, write the correct answer. Write one word for each gap.',
  },
  {
    partNumber: 7,
    section: 'Writing',
    title: 'Part 1: Email',
    mode: 'writing',
    activity: 'email',
    questionCount: 1,
    questionStart: 1,
    directions: 'You must answer this question. Write your answer in about 100 words.',
  },
  {
    partNumber: 8,
    section: 'Writing',
    title: 'Part 2: Article or story',
    mode: 'writing',
    activity: 'part-2',
    questionCount: 1,
    questionStart: 2,
    directions: 'Choose one of these questions. Write your answer in about 100 words.',
  },
  {
    partNumber: 9,
    section: 'Listening',
    title: 'Part 1: Multiple choice (pictures)',
    mode: 'listening',
    activity: 'short-extracts',
    needsAudio: true,
    needsImages: true,
    audioClips: 7,
    questionCount: 7,
    questionStart: 1,
    directions: B1_CHOOSE_ANSWER,
  },
  {
    partNumber: 10,
    section: 'Listening',
    title: 'Part 2: Multiple choice (short dialogues)',
    mode: 'listening',
    activity: 'short-extracts',
    needsAudio: true,
    audioClips: 6,
    questionCount: 6,
    questionStart: 8,
    directions: B1_CHOOSE_ANSWER,
  },
  {
    partNumber: 11,
    section: 'Listening',
    title: 'Part 3: Gap fill (monologue)',
    mode: 'listening',
    activity: 'sentence-completion',
    needsAudio: true,
    audioClips: 1,
    questionCount: 6,
    questionStart: 14,
    directions:
      'For each question, write the correct answer in the gap. Write one or two words or a number or a date or a time.',
  },
  {
    partNumber: 12,
    section: 'Listening',
    title: 'Part 4: Multiple choice (interview)',
    mode: 'listening',
    activity: 'conversation',
    needsAudio: true,
    audioClips: 1,
    questionCount: 6,
    questionStart: 20,
    directions: B1_CHOOSE_ANSWER,
  },
  {
    partNumber: 13,
    section: 'Speaking',
    title: 'Part 1: Interview',
    mode: 'speaking',
    activity: 'interview',
    directions:
      'The examiner asks each candidate questions about themselves: personal details, daily life, school or work, free time, likes and dislikes (2–3 minutes).',
  },
  {
    partNumber: 14,
    section: 'Speaking',
    title: 'Part 2: Individual long turn (photo)',
    mode: 'speaking',
    activity: 'picture-description',
    needsImages: true,
    directions:
      'Each candidate talks on their own about a colour photograph for about one minute (2–3 minutes in total).',
  },
  {
    partNumber: 15,
    section: 'Speaking',
    title: 'Part 3: Collaborative task',
    mode: 'speaking',
    activity: 'collaborative',
    needsImages: true,
    directions:
      'The examiner describes a situation. The candidates talk together about the options in the pictures and decide which is best (2–3 minutes).',
  },
  {
    partNumber: 16,
    section: 'Speaking',
    title: 'Part 4: Discussion',
    mode: 'speaking',
    activity: 'discussion',
    directions:
      'The examiner asks questions related to the Part 3 topic. Candidates give their opinions and respond to each other (Parts 3 and 4 take about 6 minutes).',
  },
];

const C1_RUE = 'Reading and Use of English';

/**
 * C1 Advanced (2015 format). Reading and Use of English 1–8, Writing 9–10, Listening 11–14, Speaking 15–18.
 * `title` uses the paper's local part number; question numbers restart in each paper.
 * @type {ExamPartDef[]}
 */
export const C1_EXAM_PARTS = [
  {
    partNumber: 1,
    section: C1_RUE,
    title: 'Part 1: Multiple-choice cloze',
    mode: 'use-of-english',
    activity: 'multiple-choice-cloze',
    questionCount: 8,
    questionStart: 1,
    directions:
      'For questions 1 – 8, read the text below and decide which answer (A, B, C or D) best fits each gap. There is an example at the beginning (0).',
  },
  {
    partNumber: 2,
    section: C1_RUE,
    title: 'Part 2: Open cloze',
    mode: 'use-of-english',
    activity: 'open-cloze',
    questionCount: 8,
    questionStart: 9,
    directions:
      'For questions 9 – 16, read the text below and think of the word which best fits each gap. Use only one word in each gap. There is an example at the beginning (0).',
  },
  {
    partNumber: 3,
    section: C1_RUE,
    title: 'Part 3: Word formation',
    mode: 'use-of-english',
    activity: 'word-formation',
    questionCount: 8,
    questionStart: 17,
    directions:
      'For questions 17 – 24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the gap in the same line. There is an example at the beginning (0).',
  },
  {
    partNumber: 4,
    section: C1_RUE,
    title: 'Part 4: Key word transformations',
    mode: 'use-of-english',
    activity: 'key-word',
    questionCount: 6,
    questionStart: 25,
    directions:
      'For questions 25 – 30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between three and six words, including the word given. Here is an example (0).',
  },
  {
    partNumber: 5,
    section: C1_RUE,
    title: 'Part 5: Multiple choice (long text)',
    mode: 'reading',
    activity: 'multiple-choice',
    questionCount: 6,
    questionStart: 31,
    directions: 'For questions 31 – 36, choose the answer (A, B, C or D) which you think fits best according to the text.',
  },
  {
    partNumber: 6,
    section: C1_RUE,
    title: 'Part 6: Cross-text multiple matching',
    mode: 'reading',
    activity: 'multiple-matching',
    questionCount: 4,
    questionStart: 37,
    directions: 'For questions 37 – 40, choose from the texts A – D. The texts may be chosen more than once.',
  },
  {
    partNumber: 7,
    section: C1_RUE,
    title: 'Part 7: Gapped text (paragraphs)',
    mode: 'reading',
    activity: 'gapped-text',
    questionCount: 6,
    questionStart: 41,
    directions:
      'Six paragraphs have been removed from the text. Choose from the paragraphs A – G the one which fits each gap (41 – 46). There is one extra paragraph which you do not need to use.',
  },
  {
    partNumber: 8,
    section: C1_RUE,
    title: 'Part 8: Multiple matching',
    mode: 'reading',
    activity: 'multiple-matching',
    questionCount: 10,
    questionStart: 47,
    directions: 'For questions 47 – 56, choose from the sections (A – E). The sections may be chosen more than once.',
  },
  {
    partNumber: 9,
    section: 'Writing',
    title: 'Part 1: Essay',
    mode: 'writing',
    activity: 'essay',
    questionCount: 1,
    questionStart: 1,
    directions: 'You must answer this question. Write your answer in 220 – 260 words in an appropriate style.',
  },
  {
    partNumber: 10,
    section: 'Writing',
    title: 'Part 2: Email or letter, proposal, report or review',
    mode: 'writing',
    activity: 'part-2',
    questionCount: 1,
    questionStart: 2,
    directions:
      'Write an answer to one of the questions 2 – 4 in this part. Write your answer in 220 – 260 words in an appropriate style.',
  },
  {
    partNumber: 11,
    section: 'Listening',
    title: 'Part 1: Multiple choice (three short extracts)',
    mode: 'listening',
    activity: 'short-extracts',
    needsAudio: true,
    audioClips: 3,
    questionCount: 6,
    questionStart: 1,
    directions:
      'You will hear three different extracts. For questions 1 – 6, choose the answer (A, B or C) which fits best according to what you hear. There are two questions for each extract.',
  },
  {
    partNumber: 12,
    section: 'Listening',
    title: 'Part 2: Sentence completion',
    mode: 'listening',
    activity: 'sentence-completion',
    needsAudio: true,
    audioClips: 1,
    questionCount: 8,
    questionStart: 7,
    directions: 'For questions 7 – 14, complete the sentences with a word or short phrase.',
  },
  {
    partNumber: 13,
    section: 'Listening',
    title: 'Part 3: Multiple choice (conversation)',
    mode: 'listening',
    activity: 'conversation',
    needsAudio: true,
    audioClips: 1,
    questionCount: 6,
    questionStart: 15,
    directions: 'For questions 15 – 20, choose the answer (A, B, C or D) which fits best according to what you hear.',
  },
  {
    partNumber: 14,
    section: 'Listening',
    title: 'Part 4: Multiple matching (two tasks)',
    mode: 'listening',
    activity: 'multiple-matching',
    needsAudio: true,
    audioClips: 1,
    questionCount: 10,
    questionStart: 21,
    directions:
      'You will hear five short extracts. Task One: for questions 21 – 25, choose from the list (A – H). Task Two: for questions 26 – 30, choose from the list (A – H). While you listen you must complete both tasks.',
  },
  {
    partNumber: 15,
    section: 'Speaking',
    title: 'Part 1: Interview',
    mode: 'speaking',
    activity: 'interview',
    directions:
      'The examiner asks each candidate questions about themselves: where they live, work or study, free time, plans and opinions (2 minutes; 3 minutes for groups of three).',
  },
  {
    partNumber: 16,
    section: 'Speaking',
    title: 'Part 2: Long turn (three pictures)',
    mode: 'speaking',
    activity: 'long-turn',
    needsImages: true,
    directions:
      'Each candidate talks about two of three pictures for about 1 minute, answering the printed questions, then answers a short question about the partner’s pictures for about 30 seconds (about 4 minutes; 6 minutes for groups of three).',
  },
  {
    partNumber: 17,
    section: 'Speaking',
    title: 'Part 3: Collaborative task',
    mode: 'speaking',
    activity: 'collaborative',
    directions:
      'The candidates discuss a question and five written prompts for about 2 minutes, then have about 1 minute to reach a decision together (about 4 minutes; 6 minutes for groups of three).',
  },
  {
    partNumber: 18,
    section: 'Speaking',
    title: 'Part 4: Discussion',
    mode: 'speaking',
    activity: 'discussion',
    directions:
      'The examiner asks questions related to the Part 3 topic. Candidates express and justify opinions and respond to each other (about 5 minutes; 8 minutes for groups of three).',
  },
];

const C2_RUE = 'Reading and Use of English';

/**
 * C2 Proficiency. Reading and Use of English 1–7, Writing 8–9, Listening 10–13, Speaking 14–16.
 * `title` uses the paper's local part number; question numbers restart in each paper.
 * @type {ExamPartDef[]}
 */
export const C2_EXAM_PARTS = [
  {
    partNumber: 1,
    section: C2_RUE,
    title: 'Part 1: Multiple-choice cloze',
    mode: 'use-of-english',
    activity: 'multiple-choice-cloze',
    questionCount: 8,
    questionStart: 1,
    directions:
      'For questions 1 – 8, read the text below and decide which answer (A, B, C or D) best fits each gap. There is an example at the beginning (0).',
  },
  {
    partNumber: 2,
    section: C2_RUE,
    title: 'Part 2: Open cloze',
    mode: 'use-of-english',
    activity: 'open-cloze',
    questionCount: 8,
    questionStart: 9,
    directions:
      'For questions 9 – 16, read the text below and think of the word which best fits each space. Use only one word in each space. There is an example at the beginning (0).',
  },
  {
    partNumber: 3,
    section: C2_RUE,
    title: 'Part 3: Word formation',
    mode: 'use-of-english',
    activity: 'word-formation',
    questionCount: 8,
    questionStart: 17,
    directions:
      'For questions 17 – 24, read the text below. Use the word given in capitals at the end of some of the lines to form a word that fits in the space in the same line. There is an example at the beginning (0).',
  },
  {
    partNumber: 4,
    section: C2_RUE,
    title: 'Part 4: Key word transformations',
    mode: 'use-of-english',
    activity: 'key-word',
    questionCount: 6,
    questionStart: 25,
    directions:
      'For questions 25 – 30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between three and eight words, including the word given. Here is an example (0).',
  },
  {
    partNumber: 5,
    section: C2_RUE,
    title: 'Part 5: Multiple choice (long text)',
    mode: 'reading',
    activity: 'multiple-choice',
    questionCount: 6,
    questionStart: 31,
    directions: 'For questions 31 – 36, choose the answer (A, B, C or D) which you think fits best according to the text.',
  },
  {
    partNumber: 6,
    section: C2_RUE,
    title: 'Part 6: Gapped text (paragraphs)',
    mode: 'reading',
    activity: 'gapped-text',
    questionCount: 7,
    questionStart: 37,
    directions:
      'Seven paragraphs have been removed from the extract. Choose from the paragraphs A – H the one which fits each gap (37 – 43). There is one extra paragraph which you do not need to use.',
  },
  {
    partNumber: 7,
    section: C2_RUE,
    title: 'Part 7: Multiple matching',
    mode: 'reading',
    activity: 'multiple-matching',
    questionCount: 10,
    questionStart: 44,
    directions: 'For questions 44 – 53, choose from the sections (A – E). The sections may be chosen more than once.',
  },
  {
    partNumber: 8,
    section: 'Writing',
    title: 'Part 1: Essay (summary of two texts)',
    mode: 'writing',
    activity: 'essay',
    questionCount: 1,
    questionStart: 1,
    wordMin: 240,
    wordMax: 280,
    directions:
      'Read the two texts below. Write an essay summarising and evaluating the key points from both texts. Use your own words throughout as far as possible, and include your own ideas in your answers. Write your answer in 240 – 280 words.',
  },
  {
    partNumber: 9,
    section: 'Writing',
    title: 'Part 2: Article, letter, report or review',
    mode: 'writing',
    activity: 'part-2',
    questionCount: 1,
    questionStart: 2,
    wordMin: 280,
    wordMax: 320,
    directions:
      'Write an answer to one of the questions 2 – 4 in this part. Write your answer in 280 – 320 words in an appropriate style.',
  },
  {
    partNumber: 10,
    section: 'Listening',
    title: 'Part 1: Multiple choice (three short extracts)',
    mode: 'listening',
    activity: 'short-extracts',
    needsAudio: true,
    audioClips: 3,
    questionCount: 6,
    questionStart: 1,
    directions:
      'You will hear three different extracts. For questions 1 – 6, choose the answer (A, B or C) which fits best according to what you hear. There are two questions for each extract.',
  },
  {
    partNumber: 11,
    section: 'Listening',
    title: 'Part 2: Sentence completion',
    mode: 'listening',
    activity: 'sentence-completion',
    needsAudio: true,
    audioClips: 1,
    questionCount: 9,
    questionStart: 7,
    directions: 'For questions 7 – 15, complete the sentences with a word or short phrase.',
  },
  {
    partNumber: 12,
    section: 'Listening',
    title: 'Part 3: Multiple choice (discussion)',
    mode: 'listening',
    activity: 'conversation',
    needsAudio: true,
    audioClips: 1,
    questionCount: 5,
    questionStart: 16,
    directions: 'For questions 16 – 20, choose the answer (A, B, C or D) which fits best according to what you hear.',
  },
  {
    partNumber: 13,
    section: 'Listening',
    title: 'Part 4: Multiple matching (two tasks)',
    mode: 'listening',
    activity: 'multiple-matching',
    needsAudio: true,
    audioClips: 1,
    questionCount: 10,
    questionStart: 21,
    directions:
      'You will hear five short extracts. Task One: for questions 21 – 25, choose from the list (A – H). Task Two: for questions 26 – 30, choose from the list (A – H). While you listen, you must complete both tasks.',
  },
  {
    partNumber: 14,
    section: 'Speaking',
    title: 'Part 1: Interview',
    mode: 'speaking',
    activity: 'interview',
    directions:
      'The examiner asks each candidate questions about themselves: where they live, work or study, and how they spend their time (2 minutes; 3 minutes for groups of three).',
  },
  {
    partNumber: 15,
    section: 'Speaking',
    title: 'Part 2: Collaborative task (pictures)',
    mode: 'speaking',
    activity: 'collaborative',
    needsImages: true,
    directions:
      'The candidates talk together about two of the pictures for about 1 minute, then look at all the pictures and work through a decision-making task for about 3 minutes (about 4 minutes; 6 minutes for groups of three).',
  },
  {
    partNumber: 16,
    section: 'Speaking',
    title: 'Part 3: Long turn and discussion',
    mode: 'speaking',
    activity: 'long-turn',
    directions:
      'Each candidate talks on their own for about 2 minutes about a question on a card, the partner joins in for about 1 minute, and the examiner then leads a discussion on the topic (about 10 minutes).',
  },
];

const CATALOG_BY_SLUG = {
  b1: B1_EXAM_PARTS,
  b2: B2_EXAM_PARTS,
  c1: C1_EXAM_PARTS,
  c2: C2_EXAM_PARTS,
};

export function isExamGenerationSlug(slug) {
  return EXAM_GENERATION_SLUGS.includes(String(slug || '').toLowerCase());
}

export function getLevelExamLabel(slug) {
  return LEVEL_LABEL[String(slug || '').toLowerCase()] || String(slug || '').toUpperCase();
}

export function getLevelExamParts(slug) {
  const key = String(slug || '').toLowerCase();
  return CATALOG_BY_SLUG[key] || null;
}

export function getLevelExamPartDef(slug, partNumber) {
  const parts = getLevelExamParts(slug);
  if (!parts) return null;
  return parts.find((p) => p.partNumber === Number(partNumber)) || null;
}

export function parteNameForLevel(slug, partNumber) {
  const label = getLevelExamLabel(slug);
  return `Parte ${partNumber} ${label}`;
}

export function examenNameForLevel(slug, slot) {
  const label = getLevelExamLabel(slug);
  return `Examen ${slot} ${label}`;
}

export { getB2PartDef, parteNameB2, examenNameB2 };
