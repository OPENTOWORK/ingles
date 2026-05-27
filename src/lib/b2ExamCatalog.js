/**
 * B2 First — 17 partes globales (misma numeración que levels_partes "Parte N B2").
 */

export const B2_EXAM_SLOT_MAX = 6;

export const B2_EXAM_PARTS = [
  { partNumber: 1, section: 'Reading and Use of English', mode: 'use-of-english', activity: 'multiple-choice-cloze', needsAudio: false },
  { partNumber: 2, section: 'Reading and Use of English', mode: 'use-of-english', activity: 'open-cloze', needsAudio: false },
  { partNumber: 3, section: 'Reading and Use of English', mode: 'use-of-english', activity: 'word-formation', needsAudio: false },
  { partNumber: 4, section: 'Reading and Use of English', mode: 'use-of-english', activity: 'key-word', needsAudio: false },
  { partNumber: 5, section: 'Reading and Use of English', mode: 'reading', activity: 'multiple-choice', needsAudio: false },
  { partNumber: 6, section: 'Reading and Use of English', mode: 'reading', activity: 'gapped-text', needsAudio: false },
  { partNumber: 7, section: 'Reading and Use of English', mode: 'reading', activity: 'multiple-matching', needsAudio: false },
  { partNumber: 8, section: 'Writing', mode: 'writing', activity: 'essay', needsAudio: false },
  { partNumber: 9, section: 'Writing', mode: 'writing', activity: 'part-2', needsAudio: false },
  { partNumber: 10, section: 'Listening', mode: 'listening', activity: 'short-extracts', needsAudio: true, audioClips: 8 },
  { partNumber: 11, section: 'Listening', mode: 'listening', activity: 'sentence-completion', needsAudio: true, audioClips: 1 },
  { partNumber: 12, section: 'Listening', mode: 'listening', activity: 'conversation', needsAudio: true, audioClips: 1 },
  { partNumber: 13, section: 'Listening', mode: 'listening', activity: 'multiple-matching', needsAudio: true, audioClips: 1 },
  { partNumber: 14, section: 'Speaking', mode: 'speaking', activity: 'interview', needsAudio: false },
  { partNumber: 15, section: 'Speaking', mode: 'speaking', activity: 'long-turn', needsAudio: false },
  { partNumber: 16, section: 'Speaking', mode: 'speaking', activity: 'collaborative', needsAudio: false },
  { partNumber: 17, section: 'Speaking', mode: 'speaking', activity: 'discussion', needsAudio: false },
];

export function parteNameB2(partNumber) {
  return `Parte ${partNumber} B2`;
}

export function examenNameB2(slot) {
  return `Examen ${slot} B2`;
}

export function getB2PartDef(partNumber) {
  return B2_EXAM_PARTS.find((p) => p.partNumber === Number(partNumber));
}
