import { ensureAppUserProfile } from '@/utils/ensureAppUserProfile';
import { mergeLevelsEstadisticas } from '@/utils/levelsEstadisticas';
import { upsertLevelsPartPuntuacion } from '@/utils/levelsPuntuaciones';
import {
  getB2PartScoring,
  getPassingForDynamicTotal,
  isB2PartPassed,
} from '@/utils/levelsB2PartScoring';

/**
 * Progreso de la parte según respuestas ya comprobadas (MCQ / huecos).
 */
export function computeB2PartProgressFromState({
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
  const cfg = getB2PartScoring(partNumber);

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

  const total = cfg?.total ?? Math.max(evaluated, 1);
  const passing = cfg?.passing ?? getPassingForDynamicTotal(total);
  const complete = cfg ? evaluated >= cfg.total : evaluated > 0 && evaluated >= total;
  const passed = complete && (cfg ? isB2PartPassed(correct, partNumber) : correct >= passing);

  return {
    evaluated,
    correct,
    total,
    passing,
    complete,
    passed,
  };
}

export async function saveB2PartPuntuacionIfComplete({
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
    if (profile.reason === 'no_session') {
      return { saved: false, error: null, progress };
    }
    const msg =
      'No se pudo sincronizar tu perfil de usuario.';
    return { saved: false, error: new Error(msg), progress };
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
