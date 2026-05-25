import { computeB2PartProgressFromState } from '@/utils/recordLevelsB2PartScore';
import { getB2PartScoring } from '@/utils/levelsB2PartScoring';
import {
  getGroupedAnswers,
  getOpenAnswerMap,
  inferOpenQuestionNumbersFromPrompt,
  normalizeText,
} from '@/utils/b2ExamPaperShared';

/**
 * Grade open inputs silently (exam mode — no UI feedback until results).
 * @param {Record<string, string>} openInputs
 * @param {Map<number, Set<string>>} openAnswerMap
 * @param {(partId: string, qn: number, suffix?: string) => string} getQuestionKey
 * @param {string} partId
 * @param {number[]} openQuestionNumbers
 */
export function computeSilentOpenChecks(openInputs, openAnswerMap, getQuestionKey, partId, openQuestionNumbers) {
  /** @type {Record<string, boolean>} */
  const checks = {};
  for (const qn of openQuestionNumbers) {
    const key = getQuestionKey(partId, qn, 'open');
    const value = openInputs[key] || '';
    const expected = openAnswerMap.get(qn) || new Set();
    if (!value.trim()) continue;
    checks[key] = expected.has(normalizeText(value));
  }
  return checks;
}

/**
 * Aggregate scores for a section snapshot saved at finish time.
 * @param {object} params
 * @param {number} params.partMin
 * @param {number} params.partMax
 * @param {Record<number, object>} params.partSnapshots - keyed by part number
 */
export function aggregateExamModeSectionScores({ partMin, partMax, partSnapshots }) {
  let correct = 0;
  let total = 0;
  /** @type {Record<number, { correct: number, total: number, passing: number, complete: boolean }>} */
  const byPart = {};

  for (let p = partMin; p <= partMax; p += 1) {
    const snap = partSnapshots[p];
    if (!snap?.progress) continue;
    const prog = snap.progress;
    const cfg = getB2PartScoring(p);
    byPart[p] = {
      correct: prog.correct,
      total: prog.total,
      passing: cfg?.passing ?? prog.passing,
      complete: prog.complete,
    };
    correct += prog.correct;
    total += prog.total;
  }

  return { correct, total, byPart };
}

/**
 * @param {object} opts - same shape as computeB2PartProgressFromState
 */
export function gradePartFromAnswerState(opts) {
  return computeB2PartProgressFromState(opts);
}

/**
 * Score all part drafts saved during an exam-mode section.
 * @param {object} params
 * @param {number} params.partMin
 * @param {number} params.partMax
 * @param {Array<{ id: string, nombre: string, questions: Array<{ preguntaId: string, enunciado?: string, respuestas?: unknown[], respuestasAbiertas?: unknown[] }> }>} params.partsData
 * @param {Record<number, { preguntaId?: string, selectedOptions?: Record<string, string>, openInputs?: Record<string, string>, checkedQuestions?: Record<string, boolean> }>} params.draftByPart
 */
export function scoreExamModeDrafts({ partMin, partMax, partsData, draftByPart }) {
  /** @type {Record<number, { draft: object, progress: ReturnType<typeof computeB2PartProgressFromState> }>} */
  const partSnapshots = {};

  for (let p = partMin; p <= partMax; p += 1) {
    const draft = draftByPart[p];
    if (!draft) continue;
    const part = partsData.find((pt) => Number(pt.nombre?.match(/\d+/)?.[0] || 0) === p);
    if (!part) continue;
    const question =
      part.questions?.find((q) => q.preguntaId === draft.preguntaId) || part.questions?.[0];
    if (!question) continue;

    const partId = part.id;
    const getKey = (pid, qn, fb) =>
      `${pid}::${question.preguntaId || 'sin-pregunta'}::${qn ?? fb}`;

    const promptBlob = question.enunciado || '';
    const openNums = inferOpenQuestionNumbersFromPrompt(promptBlob, p);
    const openMap = getOpenAnswerMap(
      question.respuestasAbiertas || [],
      question.respuestas || [],
      openNums,
    );
    const useOpen = openNums.length > 0;
    const groupedAnswers = useOpen ? [] : getGroupedAnswers(question.respuestas || []);

    const openChecks = useOpen
      ? computeSilentOpenChecks(draft.openInputs || {}, openMap, getKey, partId, openNums)
      : {};

    const progress = gradePartFromAnswerState({
      partNumber: p,
      useOpenInputUi: useOpen,
      openQuestionNumbers: openNums,
      openChecks,
      groupedAnswers,
      checkedQuestions: draft.checkedQuestions || {},
      selectedOptions: draft.selectedOptions || {},
      getQuestionKey: getKey,
      partId,
    });

    partSnapshots[p] = { draft, progress };
  }

  return {
    partSnapshots,
    scores: aggregateExamModeSectionScores({ partMin, partMax, partSnapshots }),
  };
}
