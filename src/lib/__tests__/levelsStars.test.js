import test from 'node:test';
import assert from 'node:assert/strict';
import {
  starsFromLevelsEarnedMax,
  starsFromLevelsScorePercent,
} from '../levelsStars.js';

test('starsFromLevelsScorePercent: 0 and 100 boundaries', () => {
  assert.equal(starsFromLevelsScorePercent(0), 0);
  assert.equal(starsFromLevelsScorePercent(100), 3);
});

test('starsFromLevelsScorePercent: proportional rule of three', () => {
  assert.equal(starsFromLevelsScorePercent(50), 2);
  assert.equal(starsFromLevelsScorePercent(33), 1);
  assert.equal(starsFromLevelsScorePercent(67), 2);
  assert.equal(starsFromLevelsScorePercent(89), 3);
});

test('starsFromLevelsEarnedMax: from earned and max counts', () => {
  assert.equal(starsFromLevelsEarnedMax(0, 9), 0);
  assert.equal(starsFromLevelsEarnedMax(9, 9), 3);
  assert.equal(starsFromLevelsEarnedMax(5, 9), 2);
  assert.equal(starsFromLevelsEarnedMax(3, 9), 1);
});
