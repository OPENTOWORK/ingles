import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';
import { LEVEL_EXAM_SECTION_RANGES } from '@/data/levelExamPartMap';
import { buildSkillChartZone } from '@/data/levelSkillThemeColors';

export const LEVELS_ORDER = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

/** Niveles Cambridge mostrados en el perfil (siempre visibles). */
export const PROFILE_CEFR_LEVELS = ['a2', 'b1', 'b2', 'c1', 'c2'];

function normalizeLevelSlug(name) {
  const m = String(name || '')
    .trim()
    .toLowerCase()
    .match(/\b(a2|b1|b2|c1|c2)\b/);
  return m ? m[1] : '';
}

function emptyChartForLevel(slug, levelId = null) {
  const levelName = slug.toUpperCase();
  const fullBars = padBarsToFullPaper(levelName, []);
  const practiced = fullBars.some((b) => b.scorePct != null || b.evaluadas > 0);
  return {
    levelId: levelId || slug,
    levelSlug: slug,
    levelName,
    partMax: fullBars.length,
    skillZones: getSkillZonesForLevel(levelName),
    bars: fullBars,
    hasData: practiced,
  };
}

/**
 * Asegura un slide por nivel CEFR (A2–C2), con gráfico vacío si aún no hay datos.
 * @param {Array} charts — salida de aggregateLevelsStatsByPart
 * @param {Array<{ id: string, nombre: string }>} [levelCatalog] — filas de public.levels
 */
export function ensureAllCefrLevelCharts(charts = [], levelCatalog = []) {
  const bySlug = new Map();
  for (const chart of charts) {
    const slug = normalizeLevelSlug(chart.levelName);
    if (slug) {
      bySlug.set(slug, {
        ...chart,
        levelSlug: slug,
        hasData: chart.bars?.some((b) => b.scorePct != null || b.evaluadas > 0) ?? false,
      });
    }
  }

  const catalogBySlug = new Map();
  for (const row of levelCatalog || []) {
    const slug = normalizeLevelSlug(row.nombre);
    if (PROFILE_CEFR_LEVELS.includes(slug)) {
      catalogBySlug.set(slug, row);
    }
  }

  return PROFILE_CEFR_LEVELS.map((slug) => {
    const existing = bySlug.get(slug);
    if (existing) return existing;
    const catalogRow = catalogBySlug.get(slug);
    return emptyChartForLevel(slug, catalogRow?.id || null);
  });
}

/** Etiquetas de bloque del paper por nivel (para el gráfico). */
const LEVEL_SKILL_ZONES = {
  b2: [
    buildSkillChartZone(1, 7, 'Reading & UoE', 'reading'),
    buildSkillChartZone(8, 9, 'Writing', 'writing'),
    buildSkillChartZone(10, 13, 'Listening', 'listening'),
    buildSkillChartZone(14, 17, 'Speaking', 'speaking'),
  ],
  b1: [
    buildSkillChartZone(1, 6, 'Reading', 'reading'),
    buildSkillChartZone(7, 8, 'Writing', 'writing'),
    buildSkillChartZone(9, 12, 'Listening', 'listening'),
    buildSkillChartZone(13, 16, 'Speaking', 'speaking'),
  ],
  a2: [
    buildSkillChartZone(1, 7, 'Reading & Writing', 'reading'),
    buildSkillChartZone(8, 11, 'Listening', 'listening'),
    buildSkillChartZone(12, 13, 'Speaking', 'speaking'),
  ],
  c1: [
    buildSkillChartZone(1, 4, 'Use of English', 'reading'),
    buildSkillChartZone(5, 8, 'Reading', 'reading'),
    buildSkillChartZone(9, 10, 'Writing', 'writing'),
    buildSkillChartZone(11, 14, 'Listening', 'listening'),
    buildSkillChartZone(15, 18, 'Speaking', 'speaking'),
  ],
  c2: [
    buildSkillChartZone(1, 4, 'Use of English', 'reading'),
    buildSkillChartZone(5, 7, 'Reading', 'reading'),
    buildSkillChartZone(8, 9, 'Writing', 'writing'),
    buildSkillChartZone(10, 13, 'Listening', 'listening'),
    buildSkillChartZone(14, 16, 'Speaking', 'speaking'),
  ],
};

function parsePartSortKey(label) {
  const match = String(label || '').match(/parte\s*(\d+)/i);
  return match ? Number(match[1]) : 999;
}

function levelSortIndex(name) {
  const key = String(name || '').trim().toLowerCase();
  const idx = LEVELS_ORDER.indexOf(key);
  return idx === -1 ? 99 : idx;
}

export function getPartMaxForLevel(levelName) {
  const key = String(levelName || '').trim().toLowerCase();
  const sections = LEVEL_EXAM_SECTION_RANGES[key];
  if (!sections) return 17;
  return Math.max(...Object.values(sections).map((r) => r.partMax), 1);
}

export function getSkillZonesForLevel(levelName) {
  const key = String(levelName || '').trim().toLowerCase();
  return LEVEL_SKILL_ZONES[key] || [];
}

export function skillZoneForPart(levelName, partNumber) {
  const zones = getSkillZonesForLevel(levelName);
  return zones.find((z) => partNumber >= z.from && partNumber <= z.to) || null;
}

export function padBarsToFullPaper(levelName, bars) {
  const partMax = getPartMaxForLevel(levelName);
  const byPartNum = new Map();

  for (const bar of bars) {
    const n = bar.partSort;
    if (n === 999 || n < 1 || n > partMax) continue;
    const existing = byPartNum.get(n);
    if (!existing) {
      byPartNum.set(n, { ...bar });
      continue;
    }
    existing.accesos += bar.accesos || 0;
    existing.evaluadas += bar.evaluadas || 0;
    existing.correctas += bar.correctas || 0;
    existing.incorrectas += bar.incorrectas || 0;
    if (bar.scorePct != null) {
      if (existing.scorePct == null) existing.scorePct = bar.scorePct;
      else existing.scorePct = Math.round((existing.scorePct + bar.scorePct) / 2);
    }
  }

  const fullBars = [];
  for (let p = 1; p <= partMax; p += 1) {
    const zone = skillZoneForPart(levelName, p);
    const hit = byPartNum.get(p);
    if (hit) {
      fullBars.push({
        ...hit,
        partSort: p,
        name: `Part ${p}`,
        shortName: String(p),
        skillZone: zone?.label || '',
        zoneBarColor: zone?.barColor || '#64748b',
        zoneEmptyColor: zone?.emptyColor || '#e2e8f0',
      });
    } else {
      fullBars.push({
        parteId: `empty-${levelName}-${p}`,
        partSort: p,
        name: `Part ${p}`,
        shortName: String(p),
        scorePct: null,
        accesos: 0,
        evaluadas: 0,
        correctas: 0,
        incorrectas: 0,
        skillZone: zone?.label || '',
        zoneBarColor: zone?.barColor || '#64748b',
        zoneEmptyColor: zone?.emptyColor || '#e2e8f0',
      });
    }
  }
  return fullBars;
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

    const fullBars = padBarsToFullPaper(levelBucket.levelName, bars);

    charts.push({
      levelId: levelBucket.levelId,
      levelSlug: normalizeLevelSlug(levelBucket.levelName),
      levelName: String(levelBucket.levelName || '').toUpperCase(),
      partMax: fullBars.length,
      skillZones: getSkillZonesForLevel(levelBucket.levelName),
      bars: fullBars,
      hasData: fullBars.some((b) => b.scorePct != null || b.evaluadas > 0),
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
