import assert from 'node:assert/strict';
import test from 'node:test';
import {
  QUICK_TEST_QUESTION_COUNT,
  QUICK_TEST_SECONDS,
  countQuickTestCorrect,
  pickQuickTestQuestions,
  quickTestLevelFromScore,
} from '../quickPlacementTest.js';

function item(id, extra = {}) {
  return {
    id,
    part: 1,
    type: 'mcq',
    text: `Question ${id}`,
    options: ['a', 'b'],
    answer: 'a',
    ...extra,
  };
}

test('quick test is ten questions and five minutes', () => {
  assert.equal(QUICK_TEST_QUESTION_COUNT, 10);
  assert.equal(QUICK_TEST_SECONDS, 300);
});

test('quick test keeps only grammar multiple choice', () => {
  const pool = [
    item(1),
    item(2, { part: 2 }),
    item(3, { type: 'writing', options: [], answer: '' }),
    item(4, { type: 'cloze' }),
    item(5, { text: '   ' }),
    item(6, { options: ['only'] }),
    ...Array.from({ length: 12 }, (_, i) => item(10 + i)),
  ];
  const picked = pickQuickTestQuestions(pool);
  assert.equal(picked.length, 10);
  assert.ok(picked.every((q) => q.part === 1 && q.type === 'mcq' && q.options.length >= 2));
});

test('score maps onto the Outcomes grammar bands', () => {
  assert.equal(countQuickTestCorrect([item(1), item(2)], { 1: 'a', 2: 'b' }), 1);
  assert.equal(quickTestLevelFromScore(0, 10).cefr, 'A1');
  assert.equal(quickTestLevelFromScore(10, 10).cefr, 'C2');
  assert.equal(quickTestLevelFromScore(7, 10).cefr, 'B2');
});
