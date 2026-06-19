import {
  computeStarsFromPuntuacionRow,
  labelFromPuntuacionRow,
  resolveScoreSourceFromPuntuacionRow,
} from '@/utils/computeStarsFromPuntuacionRow';
import { parseUoePartDescripcion } from '@/utils/levelsPuntuaciones';
import { saveLevelStars, LEVELS_STARS_TABLE } from '@/utils/levelsStars';
import { scoreSourceToExamOrSkill } from '@/utils/levelsScoreSource';

function isSchemaCacheColumnError(error) {
  const msg = String(error?.message || error || '').toLowerCase();
  const code = String(error?.code || '').toUpperCase();
  return (
    msg.includes('schema cache') ||
    msg.includes('could not find') ||
    msg.includes('does not exist') ||
    code === 'PGRST204' ||
    code === '42703'
  );
}

const PUNTUACIONES_SELECT =
  'id, descripcion, score_source, scoring_version, correctas, total_preguntas, puntos_obtenidos, puntos_maximos, examen_id, parte_numero';

/**
 * Upsert one Levels_stars row for a puntuaciones row (service or user client).
 */
export async function syncStarsForPuntuacionRow(supabaseClient, row) {
  if (!supabaseClient || !row?.id) {
    return { saved: false, skipped: true, error: null };
  }

  const stars = computeStarsFromPuntuacionRow(row);
  if (stars <= 0) {
    return { saved: false, skipped: true, error: null };
  }

  const scoreSource = resolveScoreSourceFromPuntuacionRow(row);
  return saveLevelStars({
    puntuacionesId: row.id,
    stars,
    scoreSource,
    descripcion: labelFromPuntuacionRow(row),
    supabaseClient,
  });
}

/**
 * Backfill Levels_stars for all of a user's levels_puntuaciones that lack a stars row.
 */
export async function backfillLevelsStarsForUser(supabaseClient, userId) {
  if (!supabaseClient || !userId) {
    return { backfilled: 0, skipped: 0, errors: 0 };
  }

  let puntRows = [];
  const fullQuery = await supabaseClient
    .from('levels_puntuaciones')
    .select(PUNTUACIONES_SELECT)
    .eq('uuid_usuario', userId);

  if (!fullQuery.error && fullQuery.data?.length) {
    puntRows = fullQuery.data;
  } else if (fullQuery.error && isSchemaCacheColumnError(fullQuery.error)) {
    const fallback = await supabaseClient
      .from('levels_puntuaciones')
      .select('id, descripcion, created_at')
      .eq('uuid_usuario', userId);
    if (!fallback.error) {
      puntRows = (fallback.data || [])
        .map((row) => {
          const meta = parseUoePartDescripcion(row.descripcion);
          if (!meta) return null;
          return {
            id: row.id,
            descripcion: row.descripcion,
            correctas: meta.correctas,
            total_preguntas: meta.total,
            score_source: meta.scoreSource,
            scoring_version: meta.scoringVersion,
            puntos_obtenidos: meta.puntosObtenidos,
            puntos_maximos: meta.puntosMaximos,
          };
        })
        .filter(Boolean);
    }
  } else if (!fullQuery.error) {
    puntRows = fullQuery.data || [];
  }

  if (!puntRows.length) {
    return { backfilled: 0, skipped: 0, errors: 0 };
  }

  const puntIds = puntRows.map((r) => r.id).filter(Boolean);
  const existingKeys = new Set();

  const starQuery = await supabaseClient
    .from(LEVELS_STARS_TABLE)
    .select('puntuaciones_id, exam_or_skill')
    .in('puntuaciones_id', puntIds);

  if (starQuery.error && isSchemaCacheColumnError(starQuery.error)) {
    return { backfilled: 0, skipped: puntRows.length, errors: 0, tableMissing: true };
  }

  if (!starQuery.error && starQuery.data?.length) {
    for (const starRow of starQuery.data) {
      existingKeys.add(`${starRow.puntuaciones_id}:${starRow.exam_or_skill ?? ''}`);
    }
  }

  let backfilled = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of puntRows) {
    const scoreSource = resolveScoreSourceFromPuntuacionRow(row);
    const examOrSkill = scoreSourceToExamOrSkill(scoreSource);
    const key = `${row.id}:${examOrSkill}`;
    if (existingKeys.has(key)) {
      skipped += 1;
      continue;
    }

    const result = await syncStarsForPuntuacionRow(supabaseClient, row);
    if (result.saved) {
      backfilled += 1;
      existingKeys.add(key);
    } else if (result.error) {
      errors += 1;
    } else {
      skipped += 1;
    }
  }

  return { backfilled, skipped, errors };
}
