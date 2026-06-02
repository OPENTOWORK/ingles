/** Niveles tipo escalera por tema de teoría (no CEFR). */
export const THEORY_TOPIC_LEVEL_COUNT = 12;

/** Ejercicios aleatorios por intento de nivel (sin repetir en la misma sesión). */
export const THEORY_EXERCISES_PER_TOPIC_LEVEL = 10;

/** Estrellas mínimas en el nivel anterior para desbloquear el siguiente. */
export const THEORY_STARS_TO_UNLOCK_NEXT = 2;

/**
 * Estrellas 0 · 0.5 · 1 · 1.5 · 2 · 2.5 · 3 según aciertos en la sesión.
 * @param {number} correctCount
 * @param {number} totalCount
 */
export function starsFromTheorySessionScore(correctCount, totalCount) {
  const total = Math.max(0, Number(totalCount) || 0);
  const correct = Math.max(0, Number(correctCount) || 0);
  if (total <= 0 || correct <= 0) return 0;
  if (correct >= total) return 3;

  const ratio = correct / total;
  if (ratio <= 0.2) return 0.5;
  if (ratio <= 0.4) return 1;
  if (ratio <= 0.55) return 1.5;
  if (ratio <= 0.7) return 2;
  if (ratio <= 0.85) return 2.5;
  return 2.5;
}

export function isTheoryTopicLevelUnlocked(levelNum, starsByLevel) {
  const n = Number(levelNum);
  if (n <= 1) return true;
  const prev = Number(starsByLevel[n - 1]);
  return Number.isFinite(prev) && prev >= THEORY_STARS_TO_UNLOCK_NEXT;
}

/** Primer nivel a jugar o reintentar para desbloquear el siguiente. */
export function getNextTheoryTopicPlayLevel(starsByLevel) {
  for (let i = 1; i <= THEORY_TOPIC_LEVEL_COUNT; i += 1) {
    if (!isTheoryTopicLevelUnlocked(i, starsByLevel)) {
      return Math.max(1, i - 1);
    }
    const stars = starsByLevel[i];
    if (stars == null || stars === undefined) return i;
  }
  return null;
}

export function topicProgressPercentFromStars(starsByLevel) {
  const values = [];
  for (let i = 1; i <= THEORY_TOPIC_LEVEL_COUNT; i += 1) {
    const s = starsByLevel[i];
    if (s != null && s !== undefined) values.push(Math.min(3, Math.max(0, Number(s))));
  }
  if (!values.length) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  const max = THEORY_TOPIC_LEVEL_COUNT * 3;
  return Math.min(100, Math.round((sum / max) * 100));
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

export function hashTheoryTopicLevelSeed(topicHref, topicLevel, salt = '') {
  const raw = `${topicHref}|L${topicLevel}|${salt}`;
  let h = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * @template T
 * @param {T[]} items
 * @param {number} count
 * @param {number} seed
 */
export function isPlayableTeoriaExercise(ex) {
  if (!ex) return false;
  if (String(ex.pregunta || '').trim() === '') return false;
  if (ex.answerMode === 'open') return true;
  return (ex.opciones || []).some((o) => String(o?.text || '').trim());
}

/**
 * @template {{ id?: string }} T
 * @param {T[]} items
 * @param {number} count
 * @param {number} seed
 */
export function pickRandomTheoryExercises(items, count, seed) {
  const seen = new Set();
  const pool = [];
  for (const item of items || []) {
    const id = item?.id;
    if (!id || seen.has(id)) continue;
    seen.add(id);
    pool.push(item);
  }
  if (!pool.length) return [];

  const rng = mulberry32(seed);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const take = Math.min(Math.max(0, count), pool.length);
  return pool.slice(0, take);
}
