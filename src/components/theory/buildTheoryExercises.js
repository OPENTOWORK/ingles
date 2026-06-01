import { resolveExerciseConfig } from '@/lib/theoryExerciseLevelConfig';
import {
  THEORY_EXERCISE_COUNT,
  buildRandomTipoSequence,
  hashTheoryExerciseSeed,
} from '@/lib/theoryExerciseTypeCatalog';
import { buildTheoryExerciseElement } from '@/components/theory/buildTheoryExerciseElement';

/**
 * Builds 20 theory exercises with types from `levels_teoria_tipos_preguntas`
 * (Tipo 1–16) in a random order per topic and level.
 */
export function buildTheoryExercises(slug, config, level = 'B2', primaryLevel = 'B2') {
  const resolved = resolveExerciseConfig(config, level, slug, primaryLevel);
  const levelSlug = String(level || 'B2').toLowerCase();
  const key = (n) => `${slug}-${levelSlug}-${n}`;

  const pools = {
    multipleChoice: resolved?.multipleChoice ?? [],
    fillBlanks: resolved?.fillBlanks ?? [],
    trueFalse: resolved?.trueFalse ?? [],
    matching: resolved?.matching ?? [],
    findError: resolved?.findError ?? [],
    sentenceOrder: resolved?.sentenceOrder ?? [],
    selectAll: resolved?.selectAll ?? [],
  };

  const seed = hashTheoryExerciseSeed(slug, level);
  const tipoSequence = buildRandomTipoSequence(seed);
  const counters = {
    multipleChoice: 0,
    fillBlanks: 0,
    trueFalse: 0,
    matching: 0,
    findError: 0,
    sentenceOrder: 0,
    selectAll: 0,
  };

  const exercises = [];
  let n = 1;

  for (const tipoId of tipoSequence) {
    if (exercises.length >= THEORY_EXERCISE_COUNT) break;
    const el = buildTheoryExerciseElement(tipoId, pools, counters, key(n), null);
    if (el) {
      exercises.push(el);
      n += 1;
    }
  }

  return exercises;
}
