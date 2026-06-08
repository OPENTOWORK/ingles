import { ensureAppUserProfile } from '@/utils/ensureAppUserProfile';
import { mergeLevelsEstadisticas } from '@/utils/levelsEstadisticas';
import { upsertLevelsPartPuntuacion } from '@/utils/levelsPuntuaciones';

/**
 * Guarda en Supabase (levels_puntuaciones + levels_estadisticas) las partes terminadas en exam mode.
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.examenId
 * @param {Record<number, { draft?: { preguntaId?: string }, progress: { correct: number, total: number, complete?: boolean } }>} params.partSnapshots
 */
export async function persistExamModeSectionScores({ userId, examenId, partSnapshots = {} }) {
  if (!userId || !examenId) return { saved: 0, error: null };

  const profile = await ensureAppUserProfile();
  if (!profile.ok && profile.reason !== 'no_session') {
    return { saved: 0, error: new Error('Could not sync user profile.') };
  }
  if (!profile.ok) return { saved: 0, error: null };

  let saved = 0;
  let lastError = null;

  const entries = Object.entries(partSnapshots);
  await Promise.all(
    entries.map(async ([partKey, snap]) => {
      const partNumber = Number(partKey);
      const progress = snap?.progress;
      const preguntaId = snap?.draft?.preguntaId;
      if (!preguntaId || !partNumber || !progress) return;
      const hasAnswers = progress.complete || (Number(progress.evaluated) || 0) > 0;
      if (!hasAnswers) return;

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
          deltaIntentos: 1,
          deltaEvaluadas: progress.total,
          deltaCorrectas: progress.correct,
          deltaIncorrectas: Math.max(0, progress.total - progress.correct),
        }),
      ]);

      if (puntRes.error) {
        lastError = puntRes.error;
        return;
      }
      saved += 1;
    }),
  );

  return { saved, error: lastError };
}
