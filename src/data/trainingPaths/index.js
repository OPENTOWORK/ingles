import { trainingPathLevelInfo, trainingPathSlug } from './curricula.js';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/** `a2-basic-03`: the exercise id, and the start of its item ids (`a2-basic-03-t01`…). */
export function trainingPathLevelId(slug, levelNumber) {
  return `${slug}-${String(levelNumber).padStart(2, '0')}`;
}

/** Only Use of English has level files. */
export function trainingPathSlugFor(cefrLevel, skill, difficulty) {
  const skillKey = String(skill || 'use-of-english').toLowerCase().replace(/_/g, '-');
  if (skillKey !== 'use-of-english') return null;
  return trainingPathSlug(cefrLevel, difficulty);
}

/** Each level is its own chunk, so the map and the other levels never download it. */
async function importLevelItems(slug, levelNumber) {
  const file = String(levelNumber).padStart(2, '0');
  try {
    const level = await import(`./${slug}/level${file}.js`);
    return level.default || [];
  } catch {
    return [];
  }
}

export function buildTrainingPathExercise(cefrLevel, difficulty, levelNumber, items) {
  const slug = trainingPathSlug(cefrLevel, difficulty);
  const info = trainingPathLevelInfo(cefrLevel, difficulty, levelNumber);
  if (!slug || !info) return null;
  return {
    exerciseId: trainingPathLevelId(slug, levelNumber),
    cefr: String(cefrLevel).toUpperCase(),
    category: slugify(info.section),
    grammarFocus: slugify(info.topic),
    title: info.topic,
    instruction: `Each question tells you what to do. The topic is ${info.topic}.`,
    items,
  };
}

/**
 * The exercise for one level of a path with level files, with no items while that level is not
 * written yet. Null for every other path, which keeps its own content.
 */
export async function loadTrainingPathExercise(cefrLevel, skill, difficulty, levelNumber) {
  const slug = trainingPathSlugFor(cefrLevel, skill, difficulty);
  const num = parseInt(String(levelNumber).replace(/\D/g, ''), 10);
  if (!slug || !num) return null;
  if (!trainingPathLevelInfo(cefrLevel, difficulty, num)) return null;
  return buildTrainingPathExercise(cefrLevel, difficulty, num, await importLevelItems(slug, num));
}
