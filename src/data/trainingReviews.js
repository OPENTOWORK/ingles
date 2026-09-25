import { getGapFillExercise } from './trainingGapFillContent.js';

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

/** Mixed items from the levels that review covers. A session still picks 10. */
export function buildReviewExercise(review, cefrLevel = 'b2', skill = 'use-of-english', difficulty = 'basico') {
  if (!review) return null;
  const items = [];
  for (let level = review.from; level <= review.to; level += 1) {
    const exercise = getGapFillExercise(cefrLevel, skill, difficulty, level);
    if (!exercise?.items?.length) continue;
    exercise.items.forEach((item) => {
      items.push({
        ...item,
        type: 'gap_fill',
        exerciseId: `b2-review-${String(review.n).padStart(2, '0')}`,
        instruction: `Review what you have already practised in ${review.sectionTitle}.`,
        itemId: `${review.key}-${item.itemId}`,
      });
    });
  }
  if (!items.length) return null;
  return {
    exerciseId: items[0].exerciseId,
    instruction: items[0].instruction,
    items,
  };
}
