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

/** @typedef {{ partNumber: number, section: string, mode: string, activity: string, needsAudio?: boolean, audioClips?: number, questionCount?: number, title?: string }} ExamPartDef */

/** @type {ExamPartDef[]} */
export const B1_EXAM_PARTS = [
  { partNumber: 1, section: 'Reading', mode: 'use-of-english', activity: 'multiple-choice-cloze' },
  { partNumber: 2, section: 'Reading', mode: 'use-of-english', activity: 'open-cloze' },
  { partNumber: 3, section: 'Reading', mode: 'use-of-english', activity: 'word-formation' },
  { partNumber: 4, section: 'Reading', mode: 'use-of-english', activity: 'key-word' },
  { partNumber: 5, section: 'Reading', mode: 'reading', activity: 'multiple-choice' },
  { partNumber: 6, section: 'Reading', mode: 'reading', activity: 'gapped-text' },
  { partNumber: 7, section: 'Writing', mode: 'writing', activity: 'email' },
  { partNumber: 8, section: 'Writing', mode: 'writing', activity: 'part-2' },
  { partNumber: 9, section: 'Listening', mode: 'listening', activity: 'short-extracts', needsAudio: true, audioClips: 7, questionCount: 7 },
  { partNumber: 10, section: 'Listening', mode: 'listening', activity: 'conversation', needsAudio: true, audioClips: 1, questionCount: 6 },
  { partNumber: 11, section: 'Listening', mode: 'listening', activity: 'sentence-completion', needsAudio: true, audioClips: 1, questionCount: 6 },
  { partNumber: 12, section: 'Listening', mode: 'listening', activity: 'conversation', needsAudio: true, audioClips: 1, questionCount: 6 },
  { partNumber: 13, section: 'Speaking', mode: 'speaking', activity: 'interview' },
  { partNumber: 14, section: 'Speaking', mode: 'speaking', activity: 'collaborative' },
  { partNumber: 15, section: 'Speaking', mode: 'speaking', activity: 'picture-description' },
  { partNumber: 16, section: 'Speaking', mode: 'speaking', activity: 'discussion' },
];

/** @type {ExamPartDef[]} */
export const C1_EXAM_PARTS = [
  { partNumber: 1, section: 'Use of English', mode: 'use-of-english', activity: 'multiple-choice-cloze' },
  { partNumber: 2, section: 'Use of English', mode: 'use-of-english', activity: 'open-cloze' },
  { partNumber: 3, section: 'Use of English', mode: 'use-of-english', activity: 'word-formation' },
  { partNumber: 4, section: 'Use of English', mode: 'use-of-english', activity: 'key-word' },
  { partNumber: 5, section: 'Reading', mode: 'reading', activity: 'multiple-choice' },
  { partNumber: 6, section: 'Reading', mode: 'reading', activity: 'multiple-matching', questionCount: 4 },
  { partNumber: 7, section: 'Reading', mode: 'reading', activity: 'gapped-text' },
  { partNumber: 8, section: 'Reading', mode: 'reading', activity: 'multiple-matching' },
  { partNumber: 9, section: 'Writing', mode: 'writing', activity: 'essay' },
  { partNumber: 10, section: 'Writing', mode: 'writing', activity: 'part-2' },
  { partNumber: 11, section: 'Listening', mode: 'listening', activity: 'short-extracts', needsAudio: true, audioClips: 3, questionCount: 3 },
  { partNumber: 12, section: 'Listening', mode: 'listening', activity: 'sentence-completion', needsAudio: true, audioClips: 1 },
  { partNumber: 13, section: 'Listening', mode: 'listening', activity: 'conversation', needsAudio: true, audioClips: 1, questionCount: 6 },
  { partNumber: 14, section: 'Listening', mode: 'listening', activity: 'multiple-matching', needsAudio: true, audioClips: 1, questionCount: 5 },
  { partNumber: 15, section: 'Speaking', mode: 'speaking', activity: 'interview' },
  { partNumber: 16, section: 'Speaking', mode: 'speaking', activity: 'long-turn' },
  { partNumber: 17, section: 'Speaking', mode: 'speaking', activity: 'collaborative' },
  { partNumber: 18, section: 'Speaking', mode: 'speaking', activity: 'discussion' },
];

/** @type {ExamPartDef[]} */
export const C2_EXAM_PARTS = [
  { partNumber: 1, section: 'Use of English', mode: 'use-of-english', activity: 'multiple-choice-cloze' },
  { partNumber: 2, section: 'Use of English', mode: 'use-of-english', activity: 'open-cloze' },
  { partNumber: 3, section: 'Use of English', mode: 'use-of-english', activity: 'word-formation' },
  { partNumber: 4, section: 'Use of English', mode: 'use-of-english', activity: 'key-word' },
  { partNumber: 5, section: 'Reading', mode: 'reading', activity: 'multiple-choice' },
  { partNumber: 6, section: 'Reading', mode: 'reading', activity: 'multiple-matching', questionCount: 4 },
  { partNumber: 7, section: 'Reading', mode: 'reading', activity: 'gapped-text' },
  { partNumber: 8, section: 'Writing', mode: 'writing', activity: 'essay' },
  { partNumber: 9, section: 'Writing', mode: 'writing', activity: 'part-2' },
  { partNumber: 10, section: 'Listening', mode: 'listening', activity: 'short-extracts', needsAudio: true, audioClips: 3, questionCount: 3 },
  { partNumber: 11, section: 'Listening', mode: 'listening', activity: 'sentence-completion', needsAudio: true, audioClips: 1 },
  { partNumber: 12, section: 'Listening', mode: 'listening', activity: 'conversation', needsAudio: true, audioClips: 1, questionCount: 6 },
  { partNumber: 13, section: 'Listening', mode: 'listening', activity: 'multiple-matching', needsAudio: true, audioClips: 1, questionCount: 5 },
  { partNumber: 14, section: 'Speaking', mode: 'speaking', activity: 'interview' },
  { partNumber: 15, section: 'Speaking', mode: 'speaking', activity: 'long-turn' },
  { partNumber: 16, section: 'Speaking', mode: 'speaking', activity: 'discussion' },
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
