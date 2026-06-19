import { callExamWritingCorrection } from '@/lib/ai/draloAiClient';
import { getB2PartScoring } from '@/utils/levelsB2PartScoring';
import {
  parseB2WritingPart1Task,
  parseB2WritingPart2Task,
  buildB2WritingPart1ExamContext,
  buildB2WritingPart2ExamContext,
  B2_WRITING_WORD_MIN,
  B2_WRITING_WORD_MAX,
} from '@/data/b2WritingTasks';

/** Mark parts that have a saved essay but no AI score yet. */
export function mergeWritingPartScoresWithSubmittedEssays(partScores, parts = []) {
  const merged = { ...(partScores || {}) };
  for (const part of parts) {
    const { partNumber, preguntaId, partId } = part;
    if (!partNumber || merged[partNumber]) continue;
    const storageKey = getWritingEssayStorageKey(preguntaId, partId);
    const essay = readWritingEssayFromStorage(storageKey);
    if (!String(essay).trim()) continue;
    const cfg = getB2PartScoring(partNumber);
    merged[partNumber] = {
      correct: 0,
      total: cfg?.total ?? 20,
      preguntaId: preguntaId || partId,
      essaySubmitted: true,
      pendingCorrection: true,
    };
  }
  return merged;
}

export function getWritingEssayStorageKey(preguntaId, partId) {
  if (preguntaId) return `b2-exam-writing-${preguntaId}`;
  if (partId) return `b2-exam-writing-${partId}`;
  return null;
}

export function readWritingEssayFromStorage(storageKey) {
  if (typeof window === 'undefined' || !storageKey) return '';
  try {
    return localStorage.getItem(storageKey) || '';
  } catch {
    return '';
  }
}

export function readWritingPart2ChoiceFromStorage(preguntaId, partId) {
  if (typeof window === 'undefined') return null;
  const key = `b2-writing-p2-choice-${preguntaId || partId}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

export function isExamModeWritingPartAttempted(preguntaId, partId) {
  const key = getWritingEssayStorageKey(preguntaId, partId);
  return Boolean(String(readWritingEssayFromStorage(key)).trim());
}

/**
 * @param {object} params
 * @param {string} params.essay
 * @param {number} params.partNumber
 * @param {string} [params.enunciado]
 * @param {number|null} [params.part2OptionId]
 */
export async function evaluateExamModeWritingEssay({ essay, partNumber, enunciado, part2OptionId }) {
  const text = String(essay || '').trim();
  if (!text) return null;

  let structuredExamContext = '';

  if (partNumber === 8) {
    const task = parseB2WritingPart1Task(enunciado || '');
    structuredExamContext = buildB2WritingPart1ExamContext(task, text);
  } else if (partNumber === 9) {
    const task = parseB2WritingPart2Task(enunciado || '');
    const option =
      task.options.find((o) => o.id === part2OptionId) || task.options[0] || null;
    if (!option) return null;
    structuredExamContext = buildB2WritingPart2ExamContext(option, task, text);
  } else {
    return null;
  }

  const result = await callExamWritingCorrection({
    essay: text,
    level: 'b2',
    wordMin: B2_WRITING_WORD_MIN,
    wordMax: B2_WRITING_WORD_MAX,
    structuredExamContext,
    deferredExamMode: true,
  });

  const total = result?.scores?.total;
  return typeof total === 'number' ? Math.max(0, total) : null;
}

/**
 * Score every writing part that has a saved essay in localStorage.
 * @param {Array<{ partNumber: number, preguntaId?: string, partId?: string, enunciado?: string }>} parts
 */
export async function scoreExamModeWritingParts(parts = []) {
  /** @type {Record<number, { correct: number, total: number, preguntaId?: string }>} */
  const partScores = {};

  for (const part of parts) {
    const { partNumber, preguntaId, partId, enunciado } = part;
    if (!partNumber) continue;

    const storageKey = getWritingEssayStorageKey(preguntaId, partId);
    const essay = readWritingEssayFromStorage(storageKey);
    if (!String(essay).trim()) continue;

    const part2OptionId =
      partNumber === 9 ? readWritingPart2ChoiceFromStorage(preguntaId, partId) : null;

    try {
      const correct = await evaluateExamModeWritingEssay({
        essay,
        partNumber,
        enunciado,
        part2OptionId,
      });
      if (correct == null) continue;

      const cfg = getB2PartScoring(partNumber);
      partScores[partNumber] = {
        correct,
        total: cfg?.total ?? 20,
        preguntaId: preguntaId || partId,
      };
    } catch (err) {
      console.warn(`exam mode writing score part ${partNumber}:`, err);
    }
  }

  return partScores;
}
