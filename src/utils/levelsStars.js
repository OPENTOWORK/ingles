import { supabase } from '@/utils/supabaseClient';
import { starsFromLevelsEarnedMax } from '@/lib/levelsStars';
import { LEVELS_SCORE_SOURCE } from '@/utils/levelsScoreSource';

function isSchemaCacheColumnError(error) {
  const msg = String(error?.message || error || '').toLowerCase();
  return msg.includes('schema cache') || msg.includes('could not find');
}

/**
 * Calcula estrellas a partir del progreso de una parte (V1 o V2).
 * @param {object} progress
 */
export function computeLevelsStarsFromProgress(progress = {}) {
  const scoringVersion = Number(progress.scoringVersion) || 1;
  const isV2 = scoringVersion === 2;
  const earned = Math.max(
    0,
    Number(
      isV2
        ? progress.puntosObtenidos ?? progress.pointsEarned ?? progress.correct
        : progress.pointsEarned ?? progress.correct,
    ) || 0,
  );
  const max = Math.max(
    1,
    Number(
      isV2
        ? progress.puntosMaximos ?? progress.maxPoints ?? progress.total
        : progress.maxPoints ?? progress.total ?? progress.questionTotal,
    ) || 1,
  );
  return starsFromLevelsEarnedMax(earned, max);
}

/**
 * Guarda o actualiza estrellas para una parte de examen (skill practice / exam mode).
 */
export async function upsertLevelsStars({
  userId,
  examenId,
  parteNumero,
  stars,
  scoreSource = LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
}) {
  if (!userId || !examenId || !parteNumero) {
    return { error: new Error('Faltan datos para guardar estrellas.') };
  }

  const value = Math.min(3, Math.max(0, Number(stars) || 0));
  const row = {
    uuid_usuario: userId,
    examen_id: examenId,
    parte_numero: parteNumero,
    stars: value,
    score_source: scoreSource,
    updated_at: new Date().toISOString(),
  };

  const { data: existing, error: findErr } = await supabase
    .from('levels_stars')
    .select('id')
    .eq('uuid_usuario', userId)
    .eq('examen_id', examenId)
    .eq('parte_numero', parteNumero)
    .eq('score_source', scoreSource)
    .maybeSingle();

  if (findErr) {
    if (isSchemaCacheColumnError(findErr)) return { error: null, skipped: true };
    return { error: findErr };
  }

  if (existing?.id) {
    const { error } = await supabase.from('levels_stars').update(row).eq('id', existing.id);
    return { error: error && !isSchemaCacheColumnError(error) ? error : null };
  }

  const { error } = await supabase.from('levels_stars').insert(row);
  if (error && isSchemaCacheColumnError(error)) return { error: null, skipped: true };
  return { error: error ?? null };
}

/**
 * Mapa `${slot}:${partNumber}` → stars desde levels_stars.
 */
export async function fetchLevelsStarsBySlotPart(
  supabaseClient,
  { userId, examenIdBySlot, scoreSource = LEVELS_SCORE_SOURCE.SKILL_PRACTICE },
) {
  const map = new Map();
  if (!userId) return map;

  const examenIdToSlot = Object.entries(examenIdBySlot || {}).reduce((acc, [slot, id]) => {
    if (id) acc[id] = Number(slot);
    return acc;
  }, {});
  const examenIds = Object.values(examenIdBySlot || {}).filter(Boolean);
  if (!examenIds.length) return map;

  const { data, error } = await supabaseClient
    .from('levels_stars')
    .select('examen_id, parte_numero, stars, score_source')
    .eq('uuid_usuario', userId)
    .in('examen_id', examenIds);

  if (error || !data?.length) return map;

  for (const row of data) {
    const rowSource = row.score_source || LEVELS_SCORE_SOURCE.SKILL_PRACTICE;
    if (rowSource !== scoreSource) continue;
    const slot = examenIdToSlot[row.examen_id];
    const partNumber = Number(row.parte_numero);
    if (!slot || !partNumber) continue;
    map.set(`${slot}:${partNumber}`, Math.min(3, Math.max(0, Number(row.stars) || 0)));
  }

  return map;
}
