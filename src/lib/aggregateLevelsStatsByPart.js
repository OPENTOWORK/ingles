import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';
import { LEVEL_EXAM_SECTION_RANGES } from '@/data/levelExamPartMap';

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
    { from: 1, to: 7, label: 'Reading & UoE', color: '#dbeafe' },
    { from: 8, to: 9, label: 'Writing', color: '#ede9fe' },
    { from: 10, to: 13, label: 'Listening', color: '#cffafe' },
    { from: 14, to: 17, label: 'Speaking', color: '#ffedd5' },
  ],
  b1: [
    { from: 1, to: 6, label: 'Reading', color: '#dbeafe' },
    { from: 7, to: 8, label: 'Writing', color: '#ede9fe' },
    { from: 9, to: 12, label: 'Listening', color: '#cffafe' },
    { from: 13, to: 16, label: 'Speaking', color: '#ffedd5' },
  ],
  a2: [
    { from: 1, to: 7, label: 'Reading & Writing', color: '#dbeafe' },
    { from: 8, to: 11, label: 'Listening', color: '#cffafe' },
    { from: 12, to: 13, label: 'Speaking', color: '#ffedd5' },
  ],
  c1: [
    { from: 1, to: 4, label: 'Use of English', color: '#dbeafe' },
    { from: 5, to: 8, label: 'Reading', color: '#e0e7ff' },
    { from: 9, to: 10, label: 'Writing', color: '#ede9fe' },
    { from: 11, to: 14, label: 'Listening', color: '#cffafe' },
    { from: 15, to: 18, label: 'Speaking', color: '#ffedd5' },
  ],
  c2: [
    { from: 1, to: 4, label: 'Use of English', color: '#dbeafe' },
    { from: 5, to: 7, label: 'Reading', color: '#e0e7ff' },
    { from: 8, to: 9, label: 'Writing', color: '#ede9fe' },
    { from: 10, to: 13, label: 'Listening', color: '#cffafe' },
    { from: 14, to: 16, label: 'Speaking', color: '#ffedd5' },
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

function getPartMaxForLevel(levelName) {
  const key = String(levelName || '').trim().toLowerCase();
  const sections = LEVEL_EXAM_SECTION_RANGES[key];
  if (!sections) return 17;
  return Math.max(...Object.values(sections).map((r) => r.partMax), 1);
}

export function getSkillZonesForLevel(levelName) {
  const key = String(levelName || '').trim().toLowerCase();
  return LEVEL_SKILL_ZONES[key] || [];
}

function skillZoneForPart(levelName, partNumber) {
  const zones = getSkillZonesForLevel(levelName);
  return zones.find((z) => partNumber >= z.from && partNumber <= z.to) || null;
}

function padBarsToFullPaper(levelName, bars) {
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
        name: `Parte ${p}`,
        shortName: String(p),
        skillZone: zone?.label || '',
      });
    } else {
      fullBars.push({
        parteId: `empty-${levelName}-${p}`,
        partSort: p,
        name: `Parte ${p}`,
        shortName: String(p),
        scorePct: null,
        accesos: 0,
        evaluadas: 0,
        correctas: 0,
        incorrectas: 0,
        skillZone: zone?.label || '',
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
