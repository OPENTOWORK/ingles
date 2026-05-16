import { ensureAppUserProfile } from '@/utils/ensureAppUserProfile';
import { mergeLevelsEstadisticas } from '@/utils/levelsEstadisticas';
import { upsertLevelsPartPuntuacion } from '@/utils/levelsPuntuaciones';
import { getUoePartScoring, isUoePartPassed } from '@/utils/levelsUoePartScoring';

/**
 * Progreso de la parte según respuestas ya comprobadas.
 */
export function computeUoePartProgressFromState({
  partNumber,
  useOpenInputUi,
  openQuestionNumbers,
  openChecks,
  groupedAnswers,
  checkedQuestions,
  selectedOptions,
  getQuestionKey,
  partId,
}) {
  const cfg = getUoePartScoring(partNumber);
  if (!cfg) {
    return { evaluated: 0, correct: 0, total: 0, passing: 0, complete: false, passed: false };
  }

  let evaluated = 0;
  let correct = 0;

  if (useOpenInputUi) {
    for (const qn of openQuestionNumbers) {
      const key = getQuestionKey(partId, qn, 'open');
      const result = openChecks[key];
      if (typeof result === 'boolean') {
        evaluated += 1;
        if (result) correct += 1;
      }
    }
  } else {
    groupedAnswers.forEach((group, groupIndex) => {
      if (!group.options?.length) return;
      const key = getQuestionKey(partId, group.questionNumber, `extra-${groupIndex}`);
      if (!checkedQuestions[key]) return;
      evaluated += 1;
      const correctOpt = group.options.find((o) => o.correcta);
      if (correctOpt && selectedOptions[key] === correctOpt.id) correct += 1;
    });
  }

  const complete = evaluated >= cfg.total;
  const passed = complete && isUoePartPassed(correct, partNumber);

  return {
    evaluated,
    correct,
    total: cfg.total,
    passing: cfg.passing,
    complete,
    passed,
  };
}

/**
 * Guarda la fila de levels_puntuaciones cuando la parte está completa.
 */
export async function saveUoePartPuntuacionIfComplete({
  userId,
  preguntaId,
  parteId,
  examenId,
  partNumber,
  progress,
}) {
  if (!progress?.complete || !userId || !preguntaId || !examenId || !partNumber) {
    return { saved: false, error: null, progress };
  }

  const profile = await ensureAppUserProfile();
  if (!profile.ok) {
    const msg =
      profile.reason === 'no_session'
        ? 'Inicia sesión para guardar tu puntuación.'
        : 'No se pudo sincronizar tu perfil de usuario. Comprueba que SUPABASE_SERVICE_ROLE_KEY esté en .env.local.';
    return {
      saved: false,
      error: new Error(msg),
      progress,
    };
  }

  const [puntRes] = await Promise.all([
    upsertLevelsPartPuntuacion({
      userId,
      preguntaId,
      examenId,
      parteNumero: partNumber,
      correctas: progress.correct,
      totalPreguntas: progress.total,
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

  return { saved: true, error: null, progress };
}

/** @deprecated Usar computeUoePartProgressFromState + saveUoePartPuntuacionIfComplete */
export async function recordLevelsUoePartScore({
  userId,
  preguntaId,
  parteId,
  examenId,
  partNumber,
  correctCount,
}) {
  const cfg = getUoePartScoring(partNumber);
  const progress = {
    complete: true,
    correct: Math.min(cfg?.total || 0, Math.max(0, Number(correctCount) || 0)),
    total: cfg?.total || 0,
    passing: cfg?.passing || 0,
    passed: cfg ? isUoePartPassed(correctCount, partNumber) : false,
  };
  return saveUoePartPuntuacionIfComplete({
    userId,
    preguntaId,
    parteId,
    examenId,
    partNumber,
    progress,
  });
}

/** @deprecated Usar computeUoePartProgressFromState */
export function isUoePartFullyEvaluated(args) {
  return computeUoePartProgressFromState(args).complete;
}
