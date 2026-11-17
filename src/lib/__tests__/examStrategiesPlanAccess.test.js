import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isExamStrategiesFirstPartOnlyPlan,
  isFreeExamStrategiesPathAllowed,
} from '@/lib/examStrategiesPlanAccess.js';

describe('exam strategies free plan', () => {
  it('limits free and starter to the first part', () => {
    assert.equal(isExamStrategiesFirstPartOnlyPlan('free'), true);
    assert.equal(isExamStrategiesFirstPartOnlyPlan('starter'), true);
    assert.equal(isExamStrategiesFirstPartOnlyPlan('premium'), false);
    assert.equal(isExamStrategiesFirstPartOnlyPlan('friendly_plus'), false);
    assert.equal(isExamStrategiesFirstPartOnlyPlan('pro'), false);
    assert.equal(isExamStrategiesFirstPartOnlyPlan('friendly_premium'), false);
  });

  it('allows part 1 of every level and skill', () => {
    assert.equal(
      isFreeExamStrategiesPathAllowed('/exam-strategies/exam-part-tips/b2/reading-and-use-of-english/part-1'),
      true,
    );
    assert.equal(
      isFreeExamStrategiesPathAllowed('/exam-strategies/exam-part-tips/a2/listening/1/'),
      true,
    );
    assert.equal(
      isFreeExamStrategiesPathAllowed('/exam-strategies/exam-part-tips/c1/writing/part-1'),
      true,
    );
    assert.equal(
      isFreeExamStrategiesPathAllowed('/exam-strategies/exam-part-tips/b1/speaking/part-1'),
      true,
    );
    assert.equal(
      isFreeExamStrategiesPathAllowed('/exam-practice/b2/reading-and-use-of-english/part-1'),
      true,
    );
    assert.equal(isFreeExamStrategiesPathAllowed('/exam-practice/a2/listening/1'), true);
  });

  it('blocks later parts, overall strategy and writing task types', () => {
    assert.equal(
      isFreeExamStrategiesPathAllowed('/exam-strategies/exam-part-tips/b2/reading-and-use-of-english/part-2'),
      false,
    );
    assert.equal(
      isFreeExamStrategiesPathAllowed('/exam-strategies/reading-and-use-of-english/overall-strategy'),
      false,
    );
    assert.equal(
      isFreeExamStrategiesPathAllowed('/exam-strategies/writing/part-2-email'),
      false,
    );
    assert.equal(
      isFreeExamStrategiesPathAllowed('/exam-practice/b2/writing/part-2'),
      false,
    );
  });

  it('keeps the hub and each skill index open', () => {
    assert.equal(isFreeExamStrategiesPathAllowed('/exam-strategies'), true);
    assert.equal(isFreeExamStrategiesPathAllowed('/exam-strategies/listening/'), true);
  });
});
