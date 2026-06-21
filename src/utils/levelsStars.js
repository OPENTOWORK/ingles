import { supabase } from '@/utils/supabaseClient';
import { starsFromLevelsEarnedMax } from '@/lib/levelsStars';
import {
  LEVELS_SCORE_SOURCE,
  scoreSourceToExamOrSkill,
} from '@/utils/levelsScoreSource';

/** Supabase table name (mixed case in Postgres). */
export const LEVELS_STARS_TABLE = 'Levels_stars';

function isSchemaCacheColumnError(error) {
  const msg = String(error?.message || error || '').toLowerCase();
  const code = String(error?.code || '').toUpperCase();
  return (
    msg.includes('schema cache') ||
    msg.includes('could not find') ||
    msg.includes('does not exist') ||
    msg.includes('levels_stars') ||
    code === 'PGRST204' ||
    code === 'PGRST205' ||
    code === '42703'
  );
}

async function saveLevelStarsViaApi({ puntuacionesId, stars, scoreSource, descripcion }) {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    return { error: new Error('Inicia sesión para guardar estrellas.'), saved: false };
  }

  try {
    const res = await fetch('/api/levels/save-star', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ puntuacionesId, stars, scoreSource, descripcion }),
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { error: new Error(payload?.error || `Error al guardar estrellas (${res.status})`), saved: false };
    }
    return { error: null, saved: true, updated: Boolean(payload?.updated), created: Boolean(payload?.created) };
  } catch (e) {
    return { error: e, saved: false };
  }
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

/** Etiqueta legible desde descripcion de levels_puntuaciones (`uoe_meta:…|label`). */
export function labelFromLevelsPuntuacionDescripcion(descripcion) {
  const raw = String(descripcion || '').trim();
  if (!raw) return '';
  const parts = raw.split('|');
  if (parts.length > 1) return parts[parts.length - 1].trim();
  return raw.slice(0, 500);
}

/**
 * Guarda o actualiza estrellas en public."Levels_stars" vinculadas a una puntuación.
 *
 * @param {{
 *   puntuacionesId: string,
 *   stars: number,
 *   scoreSource?: string,
 *   descripcion?: string,
 *   supabaseClient?: import('@supabase/supabase-js').SupabaseClient,
 * }} params
 */
export async function saveLevelStars({
  puntuacionesId,
  stars,
  scoreSource = LEVELS_SCORE_SOURCE.SKILL_PRACTICE,
  descripcion = '',
  supabaseClient = supabase,
}) {
  if (!puntuacionesId) {
    return { error: new Error('Faltan datos para guardar estrellas (puntuaciones_id).'), saved: false };
  }

  const value = Math.min(3, Math.max(0, Number(stars) || 0));
  const examOrSkill = scoreSourceToExamOrSkill(scoreSource);
  const desc = String(descripcion || '').trim().slice(0, 2000) || null;

  const client = supabaseClient || supabase;

  const tryFindExisting = async (withExamOrSkill) => {
    let query = client.from(LEVELS_STARS_TABLE).select('id').eq('puntuaciones_id', puntuacionesId);
    if (withExamOrSkill) {
      query = query.eq('exam_or_skill', examOrSkill);
    }
    return query.maybeSingle();
  };

  const tryWrite = async (payload, existingId) => {
    if (existingId) {
      return client.from(LEVELS_STARS_TABLE).update(payload).eq('id', existingId);
    }
    return client.from(LEVELS_STARS_TABLE).insert(payload);
  };

  let existing = null;
  let findErr = null;

  ({ data: existing, error: findErr } = await tryFindExisting(true));

  if (findErr && isSchemaCacheColumnError(findErr)) {
    const apiRes = await saveLevelStarsViaApi({
      puntuacionesId,
      stars: value,
      scoreSource,
      descripcion: desc,
    });
    if (apiRes.saved) return apiRes;

    ({ data: existing, error: findErr } = await tryFindExisting(false));
  }

  if (findErr && !isSchemaCacheColumnError(findErr)) {
    console.warn('[saveLevelStars] lookup failed:', findErr.message);
    return { error: findErr, saved: false };
  }

  const payloadWithMode = {
    puntuaciones_id: puntuacionesId,
    stars: value,
    exam_or_skill: examOrSkill,
    descripcion: desc,
  };

  const payloadLegacy = {
    puntuaciones_id: puntuacionesId,
    stars: value,
    descripcion: desc,
  };

  let writeRes = await tryWrite(payloadWithMode, existing?.id);

  if (writeRes.error && isSchemaCacheColumnError(writeRes.error)) {
    writeRes = await tryWrite(payloadLegacy, existing?.id);
  }

  if (writeRes.error) {
    if (isSchemaCacheColumnError(writeRes.error)) {
      const apiRes = await saveLevelStarsViaApi({
        puntuacionesId,
        stars: value,
        scoreSource,
        descripcion: desc,
      });
      if (apiRes.saved) return apiRes;
    }
    console.warn('[saveLevelStars] write failed:', writeRes.error.message);
    return { error: writeRes.error, saved: false };
  }

  console.info('[saveLevelStars] saved', {
    puntuacionesId,
    examOrSkill,
    stars: value,
    updated: Boolean(existing?.id),
  });

  return { error: null, saved: true, updated: Boolean(existing?.id), created: !existing?.id };
}

/** @deprecated Use saveLevelStars with puntuacionesId. */
export async function upsertLevelsStars(params) {
  if (params?.puntuacionesId) {
    return saveLevelStars(params);
  }
  console.warn('[upsertLevelsStars] legacy call without puntuacionesId, skipped');
  return { error: null, saved: false, skipped: true };
}

/**
 * Mapa `${slot}:${partNumber}` → stars desde Levels_stars (vía levels_puntuaciones).
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

  const examOrSkill = scoreSourceToExamOrSkill(scoreSource);

  let puntQuery = await supabaseClient
    .from('levels_puntuaciones')
    .select('id, examen_id, parte_numero, score_source')
    .eq('uuid_usuario', userId)
    .in('examen_id', examenIds)
    .not('parte_numero', 'is', null);

  if (puntQuery.error && isSchemaCacheColumnError(puntQuery.error)) {
    puntQuery = await supabaseClient
      .from('levels_puntuaciones')
      .select('id, examen_id, parte_numero')
      .eq('uuid_usuario', userId)
      .in('examen_id', examenIds)
      .not('parte_numero', 'is', null);
  }

  const puntRows = puntQuery.data || [];
  if (!puntRows.length) return map;

  const puntById = new Map();
  for (const row of puntRows) {
    const rowSource = row.score_source || LEVELS_SCORE_SOURCE.SKILL_PRACTICE;
    if (rowSource !== scoreSource) continue;
    if (row.id) puntById.set(row.id, row);
  }

  const puntIds = [...puntById.keys()];
  if (!puntIds.length) return map;

  const { data: starRows, error: starErr } = await supabaseClient
    .from(LEVELS_STARS_TABLE)
    .select('puntuaciones_id, stars, exam_or_skill')
    .in('puntuaciones_id', puntIds)
    .eq('exam_or_skill', examOrSkill);

  if (starErr || !starRows?.length) return map;

  for (const starRow of starRows) {
    const punt = puntById.get(starRow.puntuaciones_id);
    if (!punt) continue;
    const slot = examenIdToSlot[punt.examen_id];
    const partNumber = Number(punt.parte_numero);
    if (!slot || !partNumber) continue;
    map.set(`${slot}:${partNumber}`, Math.min(3, Math.max(0, Number(starRow.stars) || 0)));
  }

  return map;
}
