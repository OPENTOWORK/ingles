import test from 'node:test';
import assert from 'node:assert/strict';
import { getTrainingPathCurriculum } from '../../data/trainingPathCurriculum.js';
import { buildReviewExercise, getPathReviews } from '../../data/trainingReviews.js';
import { isTrainingReviewLocked } from '../trainingPathUnlock.js';

const curriculum = getTrainingPathCurriculum('b2', 'basico', 'use-of-english');
const reviews = getPathReviews(curriculum.sections);

test('reviews use their own sequence and do not extend the 25 levels', () => {
  assert.equal(curriculum.totalLevels, 25);
  assert.deepEqual(reviews.map((review) => review.n), [1, 2, 3, 4, 5]);
  assert.deepEqual(reviews.map((review) => review.key), [
    'review-1',
    'review-2',
    'review-3',
    'review-4',
    'review-5',
  ]);
  assert.deepEqual(
    reviews.map((review) => [review.from, review.to]),
    [
      [1, 6],
      [7, 8],
      [9, 11],
      [12, 15],
      [16, 18],
    ],
  );
  assert.equal(reviews.some((review) => review.to > 25 || review.n > 5), false);
});

test('a review stays locked until that block is finished, except for an admin', () => {
  const review = reviews[0];
  assert.equal(isTrainingReviewLocked(review, {}, 'student'), true);
  assert.equal(isTrainingReviewLocked(review, { 'level-6': 1 }, 'student'), true);
  assert.equal(isTrainingReviewLocked(review, { 'level-6': 2 }, 'student'), false);
  assert.equal(isTrainingReviewLocked(review, {}, 'admin'), false);
  assert.equal(isTrainingReviewLocked(review, {}, 'administrador'), false);
});

test('a review mixes the earlier levels and keeps its own id', () => {
  const exercise = buildReviewExercise(reviews[1]);
  assert.equal(exercise.exerciseId, 'b2-review-02');
  assert.ok(exercise.items.length >= 12);
  assert.ok(exercise.items.every((item) => item.itemId.startsWith('review-2-')));
  assert.equal(exercise.items.some((item) => item.itemId.includes('b2-basic-07')), true);
  assert.equal(exercise.items.some((item) => item.itemId.includes('b2-basic-01')), false);
});
