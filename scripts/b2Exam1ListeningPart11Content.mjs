/**
 * B2 Exam 1 — Listening Part 2 (Dralo part 11).
 * Source: scripts/generated/preview-exam1-part11-b2.json
 */
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const preview = JSON.parse(
  readFileSync(path.join(root, 'scripts', 'generated', 'preview-exam1-part11-b2.json'), 'utf8'),
);
const { generated } = preview;

export const B2_EXAM1_PART11_DIRECTIONS = `Part:11\r\n\r\n${generated.directions}`;

export const B2_EXAM1_PART11 = {
  partTitle: generated.partTitle,
  title: generated.title,
  setting: generated.setting,
  directions: generated.directions,
  answerKey: Object.fromEntries(generated.modelAnswers.map((m) => [m.number, m.answer])),
  questions: generated.questions,
  script: generated.script,
  alternateAnswers: generated.alternateAnswers || [],
};

export function buildPart11GeneratedPayload({ script = generated.script, storagePath } = {}) {
  const modelAnswers = generated.modelAnswers;
  return {
    partTitle: generated.partTitle,
    title: generated.title,
    directions: generated.directions,
    setting: generated.setting,
    script,
    questions: generated.questions.map((q) => ({
      number: q.number,
      lead: q.lead,
      prompt: q.lead,
      type: 'short',
    })),
    modelAnswers,
    audioClips: [
      {
        orden: 1,
        titulo: generated.audioClips?.[0]?.titulo || 'Listening Part 2 interview',
        text: script,
        storagePath:
          storagePath ||
          generated.audioAssembly?.combinedStoragePath ||
          'b2/exam-1/part-11/full-v2.mp3',
      },
    ],
  };
}
