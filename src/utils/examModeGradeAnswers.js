import { computeB2PartProgressFromState } from '@/utils/recordLevelsB2PartScore';
import { getB2PartScoring, B2_PART_SCORING_V2, B2_PAPER_SCORING_V2 } from '@/utils/levelsB2PartScoring';
import { isB2ScoringV2Enabled } from '@/lib/b2ScoringV2FeatureFlag';
import {
  buildPartScoreMetricsV2,
  maxPointsForPartRange,
  sumB2MetricsForParts,
} from '@/utils/b2ScoringV2Engine';
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

function buildByPartEntryV1(prog, partNumber) {
  const cfg = getB2PartScoring(partNumber);
  return {
    correct: prog.correct,
    total: prog.total,
    passing: cfg?.passing ?? prog.passing,
    complete: prog.complete,
    scoringVersion: 1,
  };
}

function buildByPartEntryV2(prog, partNumber) {
  const v2 =
    prog.v2Metrics ||
    buildPartScoreMetricsV2(
      partNumber,
      {
        correctItems: prog.correct,
        questionsAnswered: prog.evaluated,
        totalQuestions: getB2PartScoring(partNumber)?.total,
      },
      B2_PART_SCORING_V2,
    );
  return {
    ...v2,
    complete: prog.complete,
    passing: getB2PartScoring(partNumber)?.passing,
  };
}

/**
 * Aggregate scores for a section snapshot saved at finish time.
 * @param {object} params
 * @param {number} params.partMin
 * @param {number} params.partMax
 * @param {Record<number, object>} params.partSnapshots - keyed by part number
 * @param {boolean} [params.scoringV2Enabled]
 */
export function aggregateExamModeSectionScores({ partMin, partMax, partSnapshots, scoringV2Enabled }) {
  const v2 = scoringV2Enabled ?? isB2ScoringV2Enabled();
  /** @type {Record<number, object>} */
  const byPart = {};
  let correct = 0;
  let total = 0;

  for (let p = partMin; p <= partMax; p += 1) {
    const snap = partSnapshots[p];
    const prog = snap?.progress;
    const cfg = getB2PartScoring(p);
    const v2Part = v2 && p >= 1 && p <= 7;
    const emptyPartMax = v2Part
      ? (B2_PART_SCORING_V2[p]?.maxPoints ?? cfg?.total ?? 0)
      : (cfg?.total ?? 0);

    if (prog) {
      if (v2Part) {
        byPart[p] = buildByPartEntryV2(prog, p);
        correct += Number(byPart[p].pointsEarned) || 0;
        total += Number(byPart[p].maxPoints) || emptyPartMax;
      } else {
        byPart[p] = buildByPartEntryV1(prog, p);
        correct += Number(prog.correct) || 0;
        total += Number(prog.total) || emptyPartMax;
      }
      continue;
    }

    if (v2Part) {
      byPart[p] = {
        scoringVersion: 2,
        pointsEarned: 0,
        maxPoints: emptyPartMax,
        correct: 0,
        total: emptyPartMax,
        correctItems: 0,
        passing: cfg?.passing,
      };
    } else {
      byPart[p] = {
        correct: 0,
        total: emptyPartMax,
        passing: cfg?.passing,
        scoringVersion: 1,
      };
    }
    total += emptyPartMax;
  }

  const result = {
    correct,
    total,
    byPart,
    scoringVersion: v2 ? 2 : 1,
  };

  if (v2) {
    const reading = sumB2MetricsForParts(byPart, B2_PAPER_SCORING_V2.reading.parts);
    const useOfEnglish = sumB2MetricsForParts(byPart, B2_PAPER_SCORING_V2.useOfEnglish.parts);
    const paper = sumB2MetricsForParts(byPart, B2_PAPER_SCORING_V2.readingAndUseOfEnglish.parts);
    result.pointsEarned = correct;
    result.maxPoints = total;
    result.reading = reading;
    result.useOfEnglish = useOfEnglish;
    result.paper = {
      ...paper,
      maxPoints: maxPointsForPartRange(
        Math.min(...B2_PAPER_SCORING_V2.readingAndUseOfEnglish.parts),
        Math.max(...B2_PAPER_SCORING_V2.readingAndUseOfEnglish.parts),
        B2_PART_SCORING_V2,
      ),
    };
  }

  return result;
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
 * @param {boolean} [params.scoringV2Enabled]
 */
export function scoreExamModeDrafts({ partMin, partMax, partsData, draftByPart, scoringV2Enabled }) {
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

    partSnapshots[p] = { draft: { ...draft, parteId: part.id }, progress };
  }

  return {
    partSnapshots,
    scores: aggregateExamModeSectionScores({
      partMin,
      partMax,
      partSnapshots,
      scoringV2Enabled,
    }),
  };
}
