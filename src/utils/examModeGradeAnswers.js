import { computeB2PartProgressFromState } from '@/utils/recordLevelsB2PartScore';
import {
  getB2PartScoring,
  getB2PartScoringV2,
  getPassingForDynamicTotal,
  getB2PartPassingPoints,
  isB2PartPassed,
  isB2PartPassedByPoints,
  B2_PART_SCORING_V2,
  B2_PAPER_SCORING_V2,
} from '@/utils/levelsB2PartScoring';
import { isB2ScoringV2Enabled } from '@/lib/b2ScoringV2FeatureFlag';
import {
  buildPartScoreMetricsV2,
  maxPointsForPartRange,
  sumB2MetricsForParts,
} from '@/utils/b2ScoringV2Engine';
import {
  getOpenAnswerMap,
  normalizeText,
  resolveExamModePartScoringMode,
} from '@/utils/b2ExamPaperShared';
import { isMcqSelectionCorrect } from '@/utils/b2ExamTextBlocks';
import { parseB2KeyWordAnswerKeyRows } from '@/lib/parseB2KeyWordAnswerKey';
import { computeSilentPart4OpenGrades } from '@/lib/b2Part4Grading';

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
    evaluated: prog.evaluated,
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
    evaluated: prog.evaluated,
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
    if (!snap?.progress) continue;
    const prog = snap.progress;
    if (v2 && p >= 1 && p <= 7) {
      byPart[p] = buildByPartEntryV2(prog, p);
    } else {
      byPart[p] = buildByPartEntryV1(prog, p);
    }
    correct += v2 && p >= 1 && p <= 7 ? byPart[p].pointsEarned : prog.correct;
    total += v2 && p >= 1 && p <= 7 ? byPart[p].maxPoints : prog.total;
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
function synthesizeExamModeCheckedQuestions({
  useOpenInputUi,
  groupedAnswers,
  selectedOptions = {},
  checkedQuestions = {},
  getQuestionKey,
  partId,
}) {
  if (useOpenInputUi) return checkedQuestions;

  const next = { ...checkedQuestions };
  (groupedAnswers || []).forEach((group, groupIndex) => {
    if (!group.options?.length) return;
    const key = getQuestionKey(partId, group.questionNumber, `extra-${groupIndex}`);
    if (selectedOptions[key] && !next[key]) {
      next[key] = true;
    }
  });
  return next;
}

/** Whether a saved exam-mode part draft contains any student answer. */
export function isExamModePartDraftAttempted(draft) {
  if (!draft || typeof draft !== 'object') return false;
  const { selectedOptions = {}, openInputs = {}, checkedQuestions = {} } = draft;
  if (Object.values(checkedQuestions).some(Boolean)) return true;
  if (Object.values(selectedOptions).some((v) => v != null && String(v) !== '')) return true;
  if (Object.values(openInputs).some((v) => String(v || '').trim() !== '')) return true;
  return false;
}

/** Align saved option keys with the keys used during silent rescoring. */
function remapSelectedOptionsForExamModeScoring(
  selectedOptions,
  partId,
  preguntaId,
  groupedAnswers,
  getQuestionKey,
) {
  const remapped = { ...(selectedOptions || {}) };

  groupedAnswers.forEach((group, groupIndex) => {
    const targetKey = getQuestionKey(partId, group.questionNumber, `extra-${groupIndex}`);
    if (remapped[targetKey]) return;

    const suffixCandidates = new Set([
      String(group.questionNumber ?? ''),
      `extra-${groupIndex}`,
    ]);
    if (group.questionNumber == null) suffixCandidates.add(`extra-${groupIndex}`);

    for (const [savedKey, value] of Object.entries(selectedOptions || {})) {
      if (!value) continue;
      const segments = savedKey.split('::');
      if (segments.length < 3) continue;
      const savedSuffix = segments.slice(2).join('::');
      const normalizedKey = `${partId}::${preguntaId}::${savedSuffix}`;
      if (suffixCandidates.has(savedSuffix)) {
        remapped[targetKey] = value;
        remapped[normalizedKey] = value;
      }
    }
  });

  return remapped;
}

/** Match selections by question key, option id, or letter (Listening matching). */
function countExamModeMcqProgress(selectedOptions, groupedAnswers, getQuestionKey, partId) {
  let evaluated = 0;
  let correct = 0;

  (groupedAnswers || []).forEach((group, groupIndex) => {
    if (!group.options?.length) return;

    let selectedValue = null;
    if (typeof getQuestionKey === 'function' && partId != null) {
      const key = getQuestionKey(partId, group.questionNumber, `extra-${groupIndex}`);
      const direct = selectedOptions?.[key];
      if (direct != null && direct !== '') selectedValue = direct;
    }

    if (selectedValue == null) {
      const optionIds = new Set(group.options.map((o) => o.id).filter(Boolean));
      for (const value of Object.values(selectedOptions || {})) {
        if (value != null && value !== '' && optionIds.has(value)) {
          selectedValue = value;
          break;
        }
      }
    }

    if (selectedValue == null || selectedValue === '') return;
    evaluated += 1;
    if (isMcqSelectionCorrect(group, selectedValue)) correct += 1;
  });

  return { evaluated, correct };
}

function gradeExamModeMcqPartProgress({
  partNumber,
  groupedAnswers,
  selectedOptions,
  getQuestionKey,
  partId,
}) {
  const { evaluated, correct } = countExamModeMcqProgress(
    selectedOptions,
    groupedAnswers,
    getQuestionKey,
    partId,
  );
  const cfg = getB2PartScoring(partNumber);
  const v2Cfg = getB2PartScoringV2(partNumber);
  const v2Active = isB2ScoringV2Enabled() && v2Cfg && partNumber >= 1 && partNumber <= 7;
  const dynamicQuestionCount = (groupedAnswers || []).filter((group) => group.options?.length).length;
  const questionTotal =
    dynamicQuestionCount > 0
      ? dynamicQuestionCount
      : v2Active
        ? v2Cfg.questionCount
        : (cfg?.total ?? Math.max(evaluated, 1));
  const total = v2Active ? v2Cfg.maxPoints : questionTotal;
  const passing = v2Active ? getB2PartPassingPoints(partNumber) : (cfg?.passing ?? getPassingForDynamicTotal(questionTotal));
  const complete =
    questionTotal > 0 ? evaluated >= questionTotal : evaluated > 0 && evaluated >= (cfg?.total ?? 1);

  const v2Metrics = v2Active
    ? buildPartScoreMetricsV2(
        partNumber,
        {
          correctItems: correct,
          questionsAnswered: evaluated,
          totalQuestions: questionTotal,
        },
        B2_PART_SCORING_V2,
      )
    : null;

  const passed =
    complete &&
    (v2Active
      ? isB2PartPassedByPoints(v2Metrics?.pointsEarned ?? correct, partNumber)
      : cfg
        ? isB2PartPassed(correct, partNumber)
        : correct >= passing);

  return {
    evaluated,
    correct,
    total,
    questionTotal,
    correctItems: correct,
    itemCorrect: correct,
    itemTotal: questionTotal,
    passing,
    complete,
    passed,
    scoringVersion: v2Active ? 2 : 1,
    v2Metrics,
    pointsEarned: v2Metrics?.pointsEarned ?? correct,
    maxPoints: v2Metrics?.maxPoints ?? total,
    puntosObtenidos: v2Metrics?.pointsEarned ?? correct,
    puntosMaximos: v2Metrics?.maxPoints ?? total,
  };
}

/**
 * @param {object} opts - same shape as computeB2PartProgressFromState
 */
export function gradePartFromAnswerState(opts) {
  if (!opts.useOpenInputUi && opts.groupedAnswers?.length) {
    const mcq = countExamModeMcqProgress(
      opts.selectedOptions,
      opts.groupedAnswers,
      opts.getQuestionKey,
      opts.partId,
    );
    if (mcq.evaluated > 0) {
      return gradeExamModeMcqPartProgress(opts);
    }
  }

  const checkedQuestions = synthesizeExamModeCheckedQuestions(opts);
  return computeB2PartProgressFromState({ ...opts, checkedQuestions });
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

    const {
      useOpenInputUi: useOpen,
      openQuestionNumbers: openNums,
      groupedAnswers,
    } = resolveExamModePartScoringMode(p, question, part.descripcion || '');

    const openMap = getOpenAnswerMap(
      question.respuestasAbiertas || [],
      question.respuestas || [],
      openNums,
    );

    const v2Enabled = scoringV2Enabled ?? isB2ScoringV2Enabled();
    const usePart4V2Grading = v2Enabled && p === 4;

    let openChecks = {};
    /** @type {Record<string, import('@/lib/b2Part4Grading').B2Part4OpenGrade>} */
    let openGrades = {};

    if (useOpen) {
      if (usePart4V2Grading) {
        const openRows = (question.respuestasAbiertas || []).map((row) => ({
          respuesta_texto: row.respuesta_texto ?? row.respuestaTexto,
          grading_metadata: row.grading_metadata ?? row.gradingMetadata,
        }));
        const parsedKeys = parseB2KeyWordAnswerKeyRows(openRows);
        openGrades = computeSilentPart4OpenGrades(
          draft.openInputs || {},
          parsedKeys,
          getKey,
          partId,
          openNums,
        );
      } else {
        openChecks = computeSilentOpenChecks(draft.openInputs || {}, openMap, getKey, partId, openNums);
      }
    }

    const remappedSelectedOptions = remapSelectedOptionsForExamModeScoring(
      draft.selectedOptions || {},
      partId,
      question.preguntaId,
      groupedAnswers,
      getKey,
    );

    const progress = gradePartFromAnswerState({
      partNumber: p,
      useOpenInputUi: useOpen,
      openQuestionNumbers: openNums,
      openChecks,
      openGrades,
      usePart4V2Grading,
      groupedAnswers,
      checkedQuestions: draft.checkedQuestions || {},
      selectedOptions: remappedSelectedOptions,
      getQuestionKey: getKey,
      partId,
    });

    partSnapshots[p] = { draft: { ...draft, parteId: draft.parteId || partId }, progress };
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
