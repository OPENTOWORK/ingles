import { normalizeTopicHref } from '@/lib/normalizeTopicHref';

export const THEORY_EXERCISE_META_PREFIX = 'theory_exercise_meta:';

/** @param {{ topicHref: string, exerciseKey: string, cefrLevel: string }} meta */
export function buildTheoryExerciseDescripcion({ topicHref, exerciseKey, cefrLevel }) {
  const href = normalizeTopicHref(topicHref);
  const label = `${href} · ${cefrLevel} · ${exerciseKey}`;
  return `${THEORY_EXERCISE_META_PREFIX}${JSON.stringify({
    v: 1,
    topic_href: href,
    exercise_key: exerciseKey,
    cefr_level: cefrLevel,
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

export const THEORY_EXERCISE_PASS_SCORE = 100;

export function isTheoryExercisePassed(score) {
  return Number(score) >= THEORY_EXERCISE_PASS_SCORE;
}
