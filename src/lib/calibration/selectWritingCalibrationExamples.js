/**
 * Selector for the Writing Calibration Pack (Phase 1).
 *
 * SERVER-ONLY. Never import from client components.
 * Not yet wired into `buildB2FirstPrompt` — that happens in a later phase.
 */

import { WRITING_CALIBRATION_PACK } from './writingCalibrationPack.js';
import { CEFR_LEVELS } from './writingCalibrationSchema.js';

if (typeof window !== 'undefined') {
  throw new Error('selectWritingCalibrationExamples is server-only and must not be imported from client components.');
}

const HARD_MAX_EXAMPLES = 2;

/** Tipos "emparentados": comparten formato/registro a efectos de calibración. */
const RELATED_TASK_TYPES = {
  email: ['letter'],
  letter: ['email'],
  article: ['review'],
  review: ['article'],
};

function levelIndex(level) {
  const idx = CEFR_LEVELS.indexOf(String(level || '').trim());
  return idx === -1 ? null : idx;
}

function levelDistance(a, b) {
  const ia = levelIndex(a);
  const ib = levelIndex(b);
  if (ia == null || ib == null) return Number.MAX_SAFE_INTEGER;
  return Math.abs(ia - ib);
}

/**
 * Devuelve como máximo 1–2 ejemplos cercanos al writing del alumno.
 * Nunca devuelve el pack completo.
 *
 * Ranking: mismo taskType primero, después taskType relacionado,
 * y dentro de cada grupo el nivel estimado más cercano.
 *
 * @param {object} params
 * @param {string} params.taskType e.g. 'essay', 'email'
 * @param {string} params.estimatedLevel e.g. 'B1+', 'low B2'
 * @param {number} [params.maxExamples=2] capped at 2
 * @param {Array} [params.pack] override for tests
 * @returns {Array} selected examples (possibly empty)
 */
export function selectWritingCalibrationExamples({
  taskType,
  estimatedLevel,
  maxExamples = HARD_MAX_EXAMPLES,
  pack = WRITING_CALIBRATION_PACK,
} = {}) {
  const limit = Math.max(1, Math.min(HARD_MAX_EXAMPLES, Number(maxExamples) || HARD_MAX_EXAMPLES));
  const wantedType = String(taskType || '').trim().toLowerCase();
  const relatedTypes = RELATED_TASK_TYPES[wantedType] || [];

  const ranked = (Array.isArray(pack) ? pack : [])
    .map((example) => {
      const sameType = example.taskType === wantedType;
      const relatedType = relatedTypes.includes(example.taskType);
      // typeRank: 0 = mismo tipo, 1 = relacionado, 2 = distinto
      const typeRank = sameType ? 0 : relatedType ? 1 : 2;
      return {
        example,
        typeRank,
        levelDist: levelDistance(example.estimatedLevel, estimatedLevel),
      };
    })
    .sort((a, b) => a.typeRank - b.typeRank || a.levelDist - b.levelDist);

  // Si hay match de tipo (mismo o relacionado), no mezclar con otros tipos.
  // Si no hay ninguno, devolver solo 1 del nivel más cercano para no
  // contaminar el estilo de la tarea.
  const hasTypeMatch = ranked.some((r) => r.typeRank <= 1);
  const candidates = hasTypeMatch ? ranked.filter((r) => r.typeRank <= 1) : ranked;
  const effectiveLimit = hasTypeMatch ? limit : Math.min(limit, 1);

  return candidates.slice(0, effectiveLimit).map((r) => r.example);
}

export default selectWritingCalibrationExamples;
