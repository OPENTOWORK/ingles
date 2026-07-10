/**
 * B2 Exam 1 — Listening Part 3 (Dralo part 12).
 * Source: scripts/generated/preview-exam1-part12-b2.json
 * Deploy: node --loader ./scripts/alias-loader.mjs scripts/deploy-part12-exam.mjs 1
 */
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const preview = JSON.parse(
  readFileSync(path.join(root, 'scripts', 'generated', 'preview-exam1-part12-b2.json'), 'utf8'),
);
const { generated } = preview;

export const B2_EXAM1_PART12_DIRECTIONS = `Part:12\r\n\r\n${generated.directions}`;

export const B2_EXAM1_PART12 = {
  partTitle: generated.partTitle,
  title: generated.title,
  setting: generated.setting,
  directions: generated.directions,
  optionPool: generated.optionPool,
  matchingAnswers: generated.matchingAnswers,
  questions: generated.questions,
  speakers: generated.audioClips.map((c) => ({
    number: c.orden,
    text: c.text,
  })),
};

export function buildPart12GeneratedPayload({ revision = 'v4' } = {}) {
  const script = B2_EXAM1_PART12.speakers
    .map((s) => `Speaker ${s.number}:\n${s.text}`)
    .join('\n\n');

  return {
    partTitle: generated.partTitle,
    title: generated.title,
    directions: generated.directions,
    setting: generated.setting,
    script,
    optionPool: generated.optionPool,
    matchingAnswers: generated.matchingAnswers,
    questions: generated.questions,
    modelAnswers: generated.modelAnswers,
    audioClips: generated.audioClips.map((c) => ({
      orden: c.orden,
      titulo: c.titulo,
      text: c.text,
    })),
    combinedStoragePath:
      generated.combinedStoragePath ||
      generated.audioAssembly?.combinedStoragePath ||
      `b2/exam-1/part-12/full-${revision}.mp3`,
  };
}
