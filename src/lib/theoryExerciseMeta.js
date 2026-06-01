import { normalizeTopicHref } from '@/lib/normalizeTopicHref';

export const THEORY_EXERCISE_META_PREFIX = 'theory_exercise_meta:';
export const THEORY_EXERCISE_PASS_SCORE = 100;

/** @param {{ topicHref: string, exerciseKey: string, cefrLevel: string, score?: number }} meta */
export function buildTheoryExerciseDescripcion({ topicHref, exerciseKey, cefrLevel, score }) {
  const href = normalizeTopicHref(topicHref);
  const pts = Math.min(100, Math.max(0, Math.round(Number(score) || 0)));
  const outcome = pts >= THEORY_EXERCISE_PASS_SCORE ? 'correct' : 'incorrect';
  const label = `${href} · ${cefrLevel} · ${exerciseKey} · ${outcome}`;
  return `${THEORY_EXERCISE_META_PREFIX}${JSON.stringify({
    v: 2,
    topic_href: href,
    exercise_key: exerciseKey,
    cefr_level: cefrLevel,
    score: pts,
    outcome,
  })}|${label}`;
}

/** @param {string | null | undefined} descripcion */
export function parseTheoryExerciseDescripcion(descripcion) {
  const raw = String(descripcion || '');
  if (!raw.startsWith(THEORY_EXERCISE_META_PREFIX)) return null;
  const jsonPart = raw.slice(THEORY_EXERCISE_META_PREFIX.length).split('|')[0];
  try {
    const data = JSON.parse(jsonPart);
    if (!data?.topic_href || !data?.exercise_key) return null;
    return {
      topicHref: normalizeTopicHref(data.topic_href),
      exerciseKey: data.exercise_key,
      cefrLevel: data.cefr_level || 'B2',
    };
  } catch {
    return null;
  }
}

export function theoryExerciseStorageKey(topicHref, cefrLevel, exerciseKey) {
  return `${normalizeTopicHref(topicHref)}|${cefrLevel}|${exerciseKey}`;
}

/** Número de parte 1–20 a partir de la key del ejercicio (p. ej. slug-b2-7 → 7). */
export function theoryExerciseParteNumero(exerciseKey) {
  const match = String(exerciseKey || '').match(/-(\d+)$/);
  const n = match ? Number.parseInt(match[1], 10) : 1;
  if (!Number.isFinite(n)) return 1;
  return Math.min(20, Math.max(1, n));
}

export function isTheoryExercisePassed(score) {
  return Number(score) >= THEORY_EXERCISE_PASS_SCORE;
}
