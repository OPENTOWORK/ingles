import { trainingPathSlug } from './trainingPaths/curricula.js';

/**
 * One review after each path section except the last.
 * Numbers are R1, R2, R3… and are not part of the 1–25 level sequence.
 *
 * @param {Array<{ title: string, from: number, to: number }>} sections
 */
export function getPathReviews(sections = []) {
  return sections.slice(0, -1).map((section, index) => ({
    n: index + 1,
    key: `review-${index + 1}`,
    from: section.from,
    to: section.to,
    sectionTitle: section.title,
    topic: section.title,
  }));
}

export function getPathReview(sections, reviewNumber) {
  const n = Number(reviewNumber);
  if (!n) return null;
  return getPathReviews(sections).find((review) => review.n === n) || null;
}

/**
 * Mixed items from the levels that review covers; a session picks 20 of them.
 * Content is imported here, not at the top, so the map that lists the reviews stays light.
 */
export async function buildReviewExercise(
  review,
  cefrLevel = 'b2',
  skill = 'use-of-english',
  difficulty = 'basico',
) {
  if (!review) return null;
  const [{ getGapFillExercise }, { loadTrainingPathExercise }] = await Promise.all([
    import('./trainingGapFillContent.js'),
    import('./trainingPaths/index.js'),
  ]);
  const slug = trainingPathSlug(cefrLevel, difficulty);
  const exerciseId = `${slug || String(cefrLevel).toLowerCase()}-review-${String(review.n).padStart(2, '0')}`;
  const levels = [];
  for (let level = review.from; level <= review.to; level += 1) levels.push(level);
  const exercises = await Promise.all(
    levels.map(
      async (level) =>
        (await loadTrainingPathExercise(cefrLevel, skill, difficulty, level)) ||
        getGapFillExercise(cefrLevel, skill, difficulty, level),
    ),
  );

  const items = [];
  exercises.forEach((exercise) => {
    (exercise?.items || []).forEach((item) => {
      items.push({
        ...item,
        type: 'gap_fill',
        exerciseId,
        itemId: `${review.key}-${item.itemId}`,
      });
    });
  });
  if (!items.length) return null;
  return {
    exerciseId: items[0].exerciseId,
    instruction: `Review what you have already practised in ${review.sectionTitle}.`,
    items,
  };
}
