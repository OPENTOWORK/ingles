/** SP-EX001 — B2 First Speaking Part 1 (Interview). British English. Versioned bank. */

export const SPEAKING_B2_EXAM_CODE = 'SP-EX001';
export const SPEAKING_B2_EXAM_VERSION = 1;
export const SPEAKING_B2_PART = 1;
export const SPEAKING_B2_TARGET_DURATION_SEC = 120;

export const SPEAKING_B2_INTRODUCTION = {
  id: 'SP-EX001-P1-INTRO',
  spokenText: 'Good morning. My name is Emma. And what is your name?',
  closingText: 'Thank you. That is the end of Part 1.',
};

export const SPEAKING_B2_EX001_QUESTIONS = [
  {
    id: 'SP-EX001-P1-Q01',
    examId: SPEAKING_B2_EXAM_CODE,
    part: 1,
    theme: 'Education',
    level: 'B2',
    question: 'What do you enjoy most about studying English?',
    communicativeAims: ['express preference', 'give reasons', 'talk about learning'],
    allowedFollowUps: ['Why is that?', 'Can you tell me a bit more?'],
    reviewStatus: 'approved',
    version: 1,
    sortOrder: 1,
  },
  {
    id: 'SP-EX001-P1-Q02',
    examId: SPEAKING_B2_EXAM_CODE,
    part: 1,
    theme: 'Free time',
    level: 'B2',
    question: 'How do you usually spend your weekends?',
    communicativeAims: ['describe routines', 'talk about leisure', 'use present simple'],
    allowedFollowUps: ['Why do you enjoy that?', 'Do you do the same things every weekend?'],
    reviewStatus: 'approved',
    version: 1,
    sortOrder: 2,
  },
  {
    id: 'SP-EX001-P1-Q03',
    examId: SPEAKING_B2_EXAM_CODE,
    part: 1,
    theme: 'Travel',
    level: 'B2',
    question: 'Do you prefer visiting new places or returning to places you know? Why?',
    communicativeAims: ['compare options', 'justify a preference'],
    allowedFollowUps: ['Can you give me an example?'],
    reviewStatus: 'approved',
    version: 1,
    sortOrder: 3,
  },
  {
    id: 'SP-EX001-P1-Q04',
    examId: SPEAKING_B2_EXAM_CODE,
    part: 1,
    theme: 'Technology',
    level: 'B2',
    question: 'How has technology changed the way you communicate with your friends?',
    communicativeAims: ['describe change', 'use present perfect', 'give an opinion'],
    allowedFollowUps: ['Is that a good change, in your view?'],
    reviewStatus: 'approved',
    version: 1,
    sortOrder: 4,
  },
  {
    id: 'SP-EX001-P1-Q05',
    examId: SPEAKING_B2_EXAM_CODE,
    part: 1,
    theme: 'Future plans',
    level: 'B2',
    question: 'Is there a new skill you would like to learn in the future?',
    communicativeAims: ['talk about future hopes', 'give reasons'],
    allowedFollowUps: ['Why would you like to learn that?'],
    reviewStatus: 'approved',
    version: 1,
    sortOrder: 5,
  },
];

export const SPEAKING_B2_EX001_EXAM = {
  code: SPEAKING_B2_EXAM_CODE,
  title: 'SP-EX001 — Part 1 Interview',
  part: SPEAKING_B2_PART,
  cefr: 'B2',
  version: SPEAKING_B2_EXAM_VERSION,
  reviewStatus: 'approved',
  durationTargetSec: SPEAKING_B2_TARGET_DURATION_SEC,
  questions: SPEAKING_B2_EX001_QUESTIONS,
  introduction: SPEAKING_B2_INTRODUCTION,
};

const QUESTION_BY_ID = new Map(SPEAKING_B2_EX001_QUESTIONS.map((q) => [q.id, q]));

export function getSpeakingB2Exam(code = SPEAKING_B2_EXAM_CODE) {
  if (code !== SPEAKING_B2_EXAM_CODE) return null;
  return SPEAKING_B2_EX001_EXAM;
}

export function getSpeakingB2Question(questionId) {
  return QUESTION_BY_ID.get(questionId) || null;
}

export function listApprovedSpeakingB2Questions(code = SPEAKING_B2_EXAM_CODE) {
  const exam = getSpeakingB2Exam(code);
  if (!exam) return [];
  return exam.questions.filter((q) => q.reviewStatus === 'approved');
}

export function isAuthorisedFollowUp(questionId, followUp) {
  const question = getSpeakingB2Question(questionId);
  if (!question) return false;
  const target = String(followUp || '').trim().toLowerCase();
  return question.allowedFollowUps.some((item) => item.trim().toLowerCase() === target);
}
