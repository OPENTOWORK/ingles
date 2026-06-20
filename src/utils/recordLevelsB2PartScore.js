import { ensureAppUserProfile } from '@/utils/ensureAppUserProfile';
import { mergeLevelsEstadisticas } from '@/utils/levelsEstadisticas';
import { upsertLevelsPartPuntuacion } from '@/utils/levelsPuntuaciones';
import { computeLevelsStarsFromProgress, labelFromLevelsPuntuacionDescripcion, saveLevelStars } from '@/utils/levelsStars';
import { supabase } from '@/utils/supabaseClient';
import {
  getB2PartScoring,
  getB2PartScoringV2,
  getPassingForDynamicTotal,
  getB2PartPassingPoints,
  isB2PartPassed,
  isB2PartPassedByPoints,
} from '@/utils/levelsB2PartScoring';
import { isB2ScoringV2Enabled } from '@/lib/b2ScoringV2FeatureFlag';
import { LEVELS_SCORE_SOURCE } from '@/utils/levelsScoreSource';
import { buildPartScoreMetricsV2 } from '@/utils/b2ScoringV2Engine';
import { B2_PART_SCORING_V2 } from '@/utils/levelsB2PartScoring';
import { summarizePart4OpenGrades } from '@/lib/b2Part4Grading';
import { isMcqSelectionCorrect } from '@/utils/b2ExamTextBlocks';

/** MCQ example gap (0) is display-only — never counts toward part completion. */
export function isScorableMcqGroup(group) {
  return Boolean(group?.options?.length) && group.questionNumber != null && group.questionNumber !== 0;
}

export function countScorableMcqGroups(groupedAnswers = []) {
  return (groupedAnswers || []).filter(isScorableMcqGroup).length;
}

/**
 * Progreso de la parte según respuestas ya comprobadas (MCQ / huecos).
 */
export function computeB2PartProgressFromState({
  partNumber,
  useOpenInputUi,
  openQuestionNumbers,
  openChecks,
  openGrades,
  usePart4V2Grading = false,
  groupedAnswers,
  checkedQuestions,
  selectedOptions,
  getQuestionKey,
  partId,
  treatSelectedMcqAsEvaluated = false,
}) {
  const cfg = getB2PartScoring(partNumber);
  const v2Cfg = getB2PartScoringV2(partNumber);
  const v2Active = isB2ScoringV2Enabled() && v2Cfg && partNumber >= 1 && partNumber <= 7;

  let evaluated = 0;
  let correct = 0;
  /** @type {number | undefined} */
  let part4PointsEarned;

  if (useOpenInputUi) {
    if (usePart4V2Grading) {
      const summary = summarizePart4OpenGrades(openQuestionNumbers, openGrades || {}, getQuestionKey, partId);
      evaluated = summary.questionsAnswered;
      correct = summary.fullyCorrectItems;
      part4PointsEarned = summary.pointsEarned;
    } else {
      for (const qn of openQuestionNumbers) {
        const key = getQuestionKey(partId, qn, 'open');
        const result = openChecks[key];
        if (typeof result === 'boolean') {
          evaluated += 1;
          if (result) correct += 1;
        }
      }
    }
  } else {
    groupedAnswers.forEach((group, groupIndex) => {
      if (!isScorableMcqGroup(group)) return;
      const key = getQuestionKey(partId, group.questionNumber, `extra-${groupIndex}`);
      const hasSelection = Boolean(selectedOptions[key]);
      const isChecked = Boolean(checkedQuestions[key]);
      const isEvaluated =
        isChecked || (treatSelectedMcqAsEvaluated && hasSelection);
      if (!isEvaluated) return;
      evaluated += 1;
      if (isMcqSelectionCorrect(group, selectedOptions[key])) correct += 1;
    });
  }

  const dynamicQuestionCount = useOpenInputUi
    ? (openQuestionNumbers?.length || 0)
    : countScorableMcqGroups(groupedAnswers);

  const questionTotal =
    dynamicQuestionCount > 0
      ? dynamicQuestionCount
      : v2Active
        ? v2Cfg.questionCount
        : (cfg?.total ?? Math.max(evaluated, 1));
  const total = v2Active ? v2Cfg.maxPoints : questionTotal;
  const passing = cfg?.passing ?? getPassingForDynamicTotal(questionTotal);
  const complete =
    questionTotal > 0 ? evaluated >= questionTotal : evaluated > 0 && evaluated >= (cfg?.total ?? 1);

  const v2Metrics = v2Active
    ? buildPartScoreMetricsV2(
        partNumber,
        {
          correctItems: correct,
          questionsAnswered: evaluated,
          totalQuestions: questionTotal,
          pointsEarned: usePart4V2Grading ? part4PointsEarned : undefined,
        },
        B2_PART_SCORING_V2,
      )
    : null;

  const passed =
    complete &&
    (v2Active
      ? isB2PartPassedByPoints(v2Metrics?.pointsEarned ?? correct * (v2Cfg?.pointsPerCorrect || 1), partNumber)
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
    passing: v2Active ? getB2PartPassingPoints(partNumber) : passing,
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

export async function saveB2PartPuntuacionIfComplete({
  userId,
  preguntaId,
  parteId,
  examenId,
  partNumber,
  progress,
  scoreSource = LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
}) {
  if (!progress?.complete || !userId || !preguntaId || !examenId || !partNumber) {
    return { saved: false, error: null, progress };
  }

  const profile = await ensureAppUserProfile();
  if (!profile.ok) {
    if (profile.reason === 'no_session') {
      return { saved: false, error: null, progress };
    }
    const msg =
      'No se pudo sincronizar tu perfil de usuario.';
    return { saved: false, error: new Error(msg), progress };
  }

  const isV2 = Number(progress.scoringVersion) === 2;
  const [puntRes, estRes] = await Promise.all([
    upsertLevelsPartPuntuacion({
      userId,
      preguntaId,
      examenId,
      parteNumero: partNumber,
      correctas: progress.correct,
      totalPreguntas: progress.questionTotal ?? progress.total,
      scoreSource,
      scoringVersion: progress.scoringVersion ?? 1,
      puntosObtenidos: isV2 ? progress.puntosObtenidos ?? progress.pointsEarned : undefined,
      puntosMaximos: isV2 ? progress.puntosMaximos ?? progress.maxPoints : undefined,
    }),
    mergeLevelsEstadisticas({
      userId,
      preguntaId,
      parteId,
      deltaIntentos: 1,
    }),
  ]);

  if (puntRes.error) {
    return { saved: false, error: puntRes.error, progress };
  }

  let starsError = null;

  if (puntRes.id) {
    const starsRes = await saveLevelStars({
      puntuacionesId: puntRes.id,
      stars: computeLevelsStarsFromProgress(progress),
      scoreSource,
      descripcion: labelFromLevelsPuntuacionDescripcion(puntRes.descripcion),
    });
    if (starsRes.error) {
      starsError = starsRes.error;
      console.warn('[saveB2PartPuntuacionIfComplete] stars save failed:', starsRes.error.message);
    } else if (!starsRes.saved) {
      const { syncStarsForPuntuacionRow } = await import('@/utils/syncLevelsStars');
      await syncStarsForPuntuacionRow(supabase, {
        id: puntRes.id,
        descripcion: puntRes.descripcion,
        correctas: progress.correct,
        total_preguntas: progress.questionTotal ?? progress.total,
        score_source: scoreSource,
        scoring_version: progress.scoringVersion ?? 1,
        puntos_obtenidos: progress.puntosObtenidos ?? progress.pointsEarned,
        puntos_maximos: progress.puntosMaximos ?? progress.maxPoints,
      });
    }
  }

  return { saved: true, error: starsError, progress };
}
