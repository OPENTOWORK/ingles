import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getTrainingPathLevelCount } from '../../data/trainingPathCurriculum.js';
import {
  TRAINING_XP_PER_STAR,
  normalizeTrainingExperienceLevels,
  readStoredTrainingStars,
  trainingXpForStars,
} from '../trainingExperience.js';

function memoryStorage(entries) {
  const keys = Object.keys(entries);
  return {
    get length() {
      return keys.length;
    },
    key: (index) => keys[index] ?? null,
    getItem: (key) => (key in entries ? entries[key] : null),
  };
}

const level = (overrides = {}) => ({
  cefr: 'b2',
  skill: 'use-of-english',
  difficulty: 'basico',
  level: 1,
  stars: 2,
  ...overrides,
});

describe('training experience', () => {
  it('gives 10 XP per star', () => {
    assert.equal(TRAINING_XP_PER_STAR, 10);
    assert.equal(trainingXpForStars(0), 0);
    assert.equal(trainingXpForStars(3), 30);
    assert.equal(trainingXpForStars(47), 470);
    assert.equal(trainingXpForStars(-2), 0);
    assert.equal(trainingXpForStars('nope'), 0);
  });

  it('keeps only real path levels with 1 to 3 stars', () => {
    const count = getTrainingPathLevelCount('b2', 'basico', 'use-of-english');
    const kept = normalizeTrainingExperienceLevels([
      level(),
      level({ level: count, stars: 3 }),
      level({ level: count + 1 }),
      level({ level: 0 }),
      level({ level: 2.5 }),
      level({ stars: 0, level: 3 }),
      level({ stars: 4, level: 4 }),
      level({ stars: 1.5, level: 5 }),
      level({ cefr: 'a1', level: 6 }),
      level({ skill: 'cooking', level: 7 }),
      level({ difficulty: 'easy', level: 8 }),
      null,
      'level-1',
    ]);
    assert.deepEqual(kept, [level(), level({ level: count, stars: 3 })]);
  });

  it('keeps the best result when a level comes twice', () => {
    const kept = normalizeTrainingExperienceLevels([
      level({ stars: 1 }),
      level({ stars: 3 }),
      level({ stars: 2 }),
    ]);
    assert.deepEqual(kept, [level({ stars: 3 })]);
  });

  it('accepts upper-case CEFR keys and ignores anything that is not a list', () => {
    assert.deepEqual(normalizeTrainingExperienceLevels([level({ cefr: 'B2' })]), [level()]);
    assert.deepEqual(normalizeTrainingExperienceLevels(undefined), []);
    assert.deepEqual(normalizeTrainingExperienceLevels({ levels: [level()] }), []);
  });

  it('reads path-level stars from the browser and skips reviews and empty levels', () => {
    const storage = memoryStorage({
      'stars_b2_use-of-english_basico': JSON.stringify({
        'level-1': 3,
        'level-2': 1,
        'level-3': 0,
        'review-1': 3,
        'level-4': 7,
      }),
      'stars_a2_use-of-english_avanzado': JSON.stringify({ 'level-10': 2 }),
      'stars_b1_use-of-english_basico': '{broken',
      'dralo-training-weekly-challenge': JSON.stringify({ 'level-1': 3 }),
    });

    assert.deepEqual(readStoredTrainingStars(storage), [
      level({ level: 1, stars: 3 }),
      level({ level: 2, stars: 1 }),
      level({ level: 4, stars: 3 }),
      level({ cefr: 'a2', difficulty: 'avanzado', level: 10, stars: 2 }),
    ]);
    assert.deepEqual(readStoredTrainingStars(null), []);
  });
});
