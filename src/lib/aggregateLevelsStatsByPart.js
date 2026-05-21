import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';

export const LEVELS_ORDER = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

function parsePartSortKey(label) {
  const match = String(label || '').match(/parte\s*(\d+)/i);
  return match ? Number(match[1]) : 999;
}

function levelSortIndex(name) {
  const key = String(name || '').trim().toLowerCase();
  const idx = LEVELS_ORDER.indexOf(key);
  return idx === -1 ? 99 : idx;
}

/**
 * Agrupa filas de levels_estadisticas por nivel CEFR y parte (barra del gráfico).
 */
export function aggregateLevelsStatsByPart(rows, { partNames = {}, preguntaMeta = {} } = {}) {
  const buckets = new Map();

  for (const row of rows || []) {
    const meta = preguntaMeta[row.pregunta_id] || {};
    const levelId = meta.level_id;
    const parteId = row.parte_id || meta.parte_id;
    if (!levelId || !parteId) continue;

    const levelKey = levelId;
    if (!buckets.has(levelKey)) {
      buckets.set(levelKey, {
        levelId: levelKey,
        levelName: meta.level_name || levelKey,
        parts: new Map(),
      });
    }

    const levelBucket = buckets.get(levelKey);
    if (!levelBucket.parts.has(parteId)) {
      const partLabel = partNames[parteId] || `Parte ${parteId.slice(0, 4)}`;
      levelBucket.parts.set(parteId, {
        parteId,
        partLabel,
        partSort: parsePartSortKey(partLabel),
        accesos: 0,
        evaluadas: 0,
        correctas: 0,
        incorrectas: 0,
        mejorValues: [],
      });
    }

    const part = levelBucket.parts.get(parteId);
    part.accesos += row.accesos || 0;
    part.evaluadas += row.respuestas_evaluadas || 0;
    part.correctas += row.respuestas_correctas || 0;
    part.incorrectas += row.respuestas_incorrectas || 0;
    if (row.mejor_porcentaje != null && !Number.isNaN(Number(row.mejor_porcentaje))) {
      part.mejorValues.push(Number(row.mejor_porcentaje));
    }
  }

  const charts = [];

  for (const levelBucket of buckets.values()) {
    const bars = [];

    for (const part of levelBucket.parts.values()) {
      let scorePct = null;
      if (part.mejorValues.length > 0) {
        const sum = part.mejorValues.reduce((a, b) => a + b, 0);
        scorePct = Math.round(sum / part.mejorValues.length);
      } else if (part.evaluadas > 0) {
        scorePct = Math.round((100 * part.correctas) / part.evaluadas);
      }

      bars.push({
        parteId: part.parteId,
        name: part.partLabel,
        partSort: part.partSort,
        scorePct,
        accesos: part.accesos,
        evaluadas: part.evaluadas,
        correctas: part.correctas,
        incorrectas: part.incorrectas,
      });
    }

    bars.sort((a, b) => a.partSort - b.partSort);

    charts.push({
      levelId: levelBucket.levelId,
      levelName: String(levelBucket.levelName || '').toUpperCase(),
      bars,
    });
  }

  charts.sort((a, b) => levelSortIndex(a.levelName) - levelSortIndex(b.levelName));

  return charts;
}

/** Mapa pregunta_id → { level_id, parte_id, level_name } */
export function buildPreguntaMetaMap(preguntasRows, levelsRows) {
  const levelNameById = new Map();
  for (const l of levelsRows || []) {
    if (l?.id) levelNameById.set(l.id, l.nombre);
  }

  const map = {};
  for (const p of preguntasRows || []) {
    if (!p?.id) continue;
    map[p.id] = {
      level_id: p.level_id,
      parte_id: p.parte_id,
      level_name: levelNameById.get(p.level_id) || null,
    };
  }
  return map;
}

export function formatPartLabel(raw) {
  return formatLevelsPartDisplayName(raw);
}
