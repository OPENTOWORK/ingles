import { starsFromLevelsEarnedMax } from '@/lib/levelsStars';
import { parseUoePartDescripcion } from '@/utils/levelsPuntuaciones';
import { resolveLevelsScoreSource } from '@/utils/levelsScoreSource';

/**
 * @param {object} row — levels_puntuaciones row (full or partial)
 * @returns {0|1|2|3}
 */
export function computeStarsFromPuntuacionRow(row) {
  if (!row) return 0;

  const meta = parseUoePartDescripcion(row.descripcion);
  const scoringVersion = Number(row.scoring_version ?? meta?.scoringVersion) || 1;
  const isV2 = scoringVersion === 2;

  const earned = isV2
    ? Number(row.puntos_obtenidos ?? meta?.puntosObtenidos) || 0
    : Number(row.correctas ?? meta?.correctas) || 0;
  const max = isV2
    ? Number(row.puntos_maximos ?? meta?.puntosMaximos) || 0
    : Number(row.total_preguntas ?? meta?.total) || 0;

  if (max <= 0) return 0;
  return starsFromLevelsEarnedMax(earned, max);
}

/** @param {object} row */
export function resolveScoreSourceFromPuntuacionRow(row) {
  const meta = parseUoePartDescripcion(row.descripcion);
  return resolveLevelsScoreSource(row.score_source || meta);
}

/** @param {object} row */
export function labelFromPuntuacionRow(row) {
  const raw = String(row?.descripcion || '').trim();
  if (!raw) return '';
  const pipe = raw.indexOf('|');
  if (pipe >= 0) return raw.slice(pipe + 1).trim();
  return raw.slice(0, 500);
}
