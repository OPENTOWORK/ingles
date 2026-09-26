import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  TRAINING_LIFE_REGEN_MS,
  TRAINING_LIVES_MAX,
  applyTrainingLifeRegen,
  formatTrainingLifeWait,
  loseTrainingLife,
} from '@/lib/trainingLives.js';

const HOUR = 60 * 60 * 1000;
const NOW = Date.parse('2026-09-26T10:00:00.000Z');

describe('training lives', () => {
  it('starts a 10 hour timer when the first life is lost from a full set', () => {
    const next = loseTrainingLife({ lives: TRAINING_LIVES_MAX, nextLifeAt: null }, NOW);
    assert.equal(next.allowed, true);
    assert.equal(next.lives, 2);
    assert.equal(Date.parse(next.nextLifeAt) - NOW, TRAINING_LIFE_REGEN_MS);
  });

  it('keeps the existing timer when another life is lost', () => {
    const nextAt = new Date(NOW + 4 * HOUR).toISOString();
    const next = loseTrainingLife({ lives: 2, nextLifeAt: nextAt }, NOW);
    assert.equal(next.lives, 1);
    assert.equal(next.nextLifeAt, nextAt);
  });

  it('refuses to spend a life when none are left', () => {
    const nextAt = new Date(NOW + 5 * HOUR).toISOString();
    const next = loseTrainingLife({ lives: 0, nextLifeAt: nextAt }, NOW);
    assert.equal(next.allowed, false);
    assert.equal(next.lives, 0);
    assert.equal(next.nextLifeAt, nextAt);
  });

  it('gives back one life every 10 hours, including time spent away', () => {
    const started = new Date(NOW - 15 * HOUR).toISOString();
    const regenerated = applyTrainingLifeRegen({ lives: 0, nextLifeAt: started }, NOW);
    assert.equal(regenerated.lives, 2);
    assert.equal(Date.parse(regenerated.nextLifeAt), Date.parse(started) + 2 * TRAINING_LIFE_REGEN_MS);
  });

  it('fills the set and clears the timer once every life is back', () => {
    const started = new Date(NOW - 30 * HOUR).toISOString();
    const regenerated = applyTrainingLifeRegen({ lives: 0, nextLifeAt: started }, NOW);
    assert.equal(regenerated.lives, 3);
    assert.equal(regenerated.nextLifeAt, null);
  });

  it('applies a pending life before spending', () => {
    const started = new Date(NOW - HOUR).toISOString();
    const next = loseTrainingLife({ lives: 1, nextLifeAt: started }, NOW);
    assert.equal(next.allowed, true);
    assert.equal(next.lives, 1);
    assert.equal(Date.parse(next.nextLifeAt), Date.parse(started) + TRAINING_LIFE_REGEN_MS);
  });

  it('formats the wait until the next life', () => {
    assert.equal(formatTrainingLifeWait(new Date(NOW + 9 * HOUR + 5 * 60000).toISOString(), NOW), '9h 5m');
    assert.equal(formatTrainingLifeWait(new Date(NOW + 20 * 60000).toISOString(), NOW), '20m');
  });
});
