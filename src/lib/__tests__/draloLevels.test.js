import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  FIRST_LEVEL_XP,
  LEVEL_XP_GROWTH,
  LEVEL_XP_THRESHOLDS,
  MAX_LEVEL,
  MAX_XP,
  getLevelInfo,
  getUserLevel,
  xpCostForLevel,
} from '../dralo-levels.ts';

describe('dralo level curve', () => {
  it('starts at 30 XP and grows by 7% per level', () => {
    assert.equal(xpCostForLevel(0), 30);
    assert.equal(xpCostForLevel(1), 32);
    assert.equal(xpCostForLevel(2), 34);
    assert.equal(xpCostForLevel(5), Math.round(FIRST_LEVEL_XP * LEVEL_XP_GROWTH ** 5));
    assert.equal(xpCostForLevel(98), Math.round(FIRST_LEVEL_XP * LEVEL_XP_GROWTH ** 98));
    assert.equal(xpCostForLevel(99), xpCostForLevel(98));
  });

  it('builds 100 rising thresholds and caps at level 99', () => {
    assert.equal(LEVEL_XP_THRESHOLDS.length, MAX_LEVEL + 1);
    assert.equal(LEVEL_XP_THRESHOLDS[0], 0);
    assert.equal(LEVEL_XP_THRESHOLDS[1], 30);
    assert.equal(MAX_XP, LEVEL_XP_THRESHOLDS[MAX_LEVEL]);
    for (let level = 0; level < MAX_LEVEL; level += 1) {
      assert.equal(
        LEVEL_XP_THRESHOLDS[level + 1] - LEVEL_XP_THRESHOLDS[level],
        xpCostForLevel(level),
      );
    }
  });

  it('places XP inside the current level', () => {
    const empty = getLevelInfo(0);
    assert.equal(empty.level, 0);
    assert.equal(empty.levelName, 'Rookie Silence');
    assert.equal(empty.levelXpSpan, 30);
    assert.equal(empty.xpNeededForNextLevel, 30);
    assert.equal(empty.progressPercent, 0);

    const halfway = getLevelInfo(15);
    assert.equal(halfway.level, 0);
    assert.equal(halfway.xpInsideCurrentLevel, 15);
    assert.equal(halfway.progressPercent, 50);
    assert.equal(getUserLevel(29), 0);

    const next = getLevelInfo(30);
    assert.equal(next.level, 1);
    assert.equal(next.levelName, 'First Word');
    assert.equal(next.xpInsideCurrentLevel, 0);
    assert.equal(next.levelXpSpan, 32);
    assert.equal(next.xpNeededForNextLevel, 32);
  });

  it('clamps anything past the last threshold to level 99', () => {
    const cap = getLevelInfo(MAX_XP);
    assert.equal(cap.level, 99);
    assert.equal(cap.levelName, 'English Legend');
    assert.equal(cap.isMaxLevel, true);
    assert.equal(cap.progressPercent, 100);
    assert.equal(cap.xpNeededForNextLevel, null);
    assert.equal(cap.xpInsideCurrentLevel, cap.levelXpSpan);

    const over = getLevelInfo(MAX_XP + 50_000);
    assert.equal(over.level, 99);
    assert.equal(over.currentXp, MAX_XP);
  });
});
