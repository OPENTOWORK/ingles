/**
 * Exercise types aligned with Supabase `levels_teoria_tipos_preguntas` (Tipo 1–16).
 * Used only in the Theory tab “Practice Exercises” section.
 */

/** @typedef {'multipleChoice'|'trueFalse'|'fillBlanks'|'matching'|'findError'|'sentenceOrder'|'selectAll'} TheoryExercisePool */

/**
 * @type {{ id: number, labelEn: string, pool: TheoryExercisePool }[]}
 */
export const THEORY_EXERCISE_TYPES = [
  { id: 1, labelEn: 'Choose the correct word', pool: 'multipleChoice' },
  { id: 2, labelEn: 'True or false', pool: 'trueFalse' },
  { id: 3, labelEn: 'Find the odd word', pool: 'multipleChoice' },
  { id: 4, labelEn: 'Choose the correct synonym', pool: 'multipleChoice' },
  { id: 5, labelEn: 'Choose the correct antonym', pool: 'multipleChoice' },
  { id: 6, labelEn: 'Choose the best title', pool: 'multipleChoice' },
  { id: 7, labelEn: 'Choose the correct pronunciation', pool: 'multipleChoice' },
  { id: 8, labelEn: 'Complete gaps with options', pool: 'fillBlanks' },
  { id: 9, labelEn: 'Identify errors', pool: 'findError' },
  { id: 10, labelEn: 'Find the unnecessary word', pool: 'findError' },
  { id: 11, labelEn: 'Choose the correct sentence', pool: 'multipleChoice' },
  { id: 12, labelEn: 'Sentence transformation', pool: 'sentenceOrder' },
  { id: 13, labelEn: 'Match word with definition', pool: 'matching' },
  { id: 15, labelEn: 'Match question with answer', pool: 'matching' },
  { id: 16, labelEn: 'Match image with word', pool: 'matching' },
];

export const THEORY_EXERCISE_COUNT = 20;

const TYPE_BY_ID = new Map(THEORY_EXERCISE_TYPES.map((t) => [t.id, t]));

export function getTheoryExerciseType(tipoId) {
  return TYPE_BY_ID.get(tipoId) ?? THEORY_EXERCISE_TYPES[0];
}

/** Parse "Tipo 8" from DB Descripcion column. */
export function parseTipoNumber(descripcion) {
  const match = String(descripcion || '').match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashTheoryExerciseSeed(slug, level, salt = '') {
  const raw = `${slug}|${level}|${salt}`;
  let h = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shuffleInPlace(arr, rng) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Returns 20 tipo ids in random order (all 16 types appear at least once, then 4 more).
 */
export function buildRandomTipoSequence(seed) {
  const rng = mulberry32(seed);
  const baseIds = THEORY_EXERCISE_TYPES.map((t) => t.id);
  const deck = [];

  while (deck.length < THEORY_EXERCISE_COUNT) {
    const round = shuffleInPlace([...baseIds], rng);
    const need = THEORY_EXERCISE_COUNT - deck.length;
    deck.push(...round.slice(0, need));
  }

  return deck;
}
