import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { confirmedPart5DoubleKeys } from '@/lib/b1Part5DoubleKey.js';

describe('B1 Part 5 double-key adjudication', () => {
  const disputes = [
    { number: 21, letters: ['A', 'B'] },
    { number: 26, letters: ['A', 'C'] },
  ];

  it('drops a second letter when the adjudicator accepts only the key', () => {
    const confirmed = confirmedPart5DoubleKeys(disputes, [
      { number: 21, letters: ['B'] },
      { number: 26, letters: ['C'] },
    ]);
    assert.deepEqual(confirmed, []);
  });

  it('keeps a gap when the adjudicator still accepts two official answers', () => {
    const confirmed = confirmedPart5DoubleKeys(disputes, [
      { number: 21, letters: ['A', 'B'] },
      { number: 26, letters: ['C'] },
    ]);
    assert.equal(confirmed.length, 1);
    assert.equal(confirmed[0].number, 21);
    assert.deepEqual(confirmed[0].letters, ['A', 'B']);
  });

  it('keeps the original dispute when the adjudicator skips a gap', () => {
    const confirmed = confirmedPart5DoubleKeys(disputes, [
      { number: 26, letters: ['A'] },
    ]);
    assert.equal(confirmed.length, 1);
    assert.equal(confirmed[0].number, 21);
    assert.deepEqual(confirmed[0].letters, ['A', 'B']);
  });
});
