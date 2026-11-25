import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { confirmedPart5DoubleKeys, part5RejectionIsSubstantive } from '@/lib/b1Part5DoubleKey.js';

describe('B1 Part 5 double-key adjudication', () => {
  const disputes = [
    { number: 21, letters: ['A', 'B'] },
    { number: 26, letters: ['A', 'C'] },
  ];

  it('keeps a reported alternative when the adjudicator names only the key', () => {
    const confirmed = confirmedPart5DoubleKeys(disputes, [
      { number: 21, letters: ['B'] },
      { number: 26, letters: ['C'] },
    ]);
    assert.equal(confirmed.length, 2);
  });

  it('drops a second letter only when defect is grammar, meaning or context', () => {
    const confirmed = confirmedPart5DoubleKeys(disputes, [
      { number: 21, letters: ['B'], rejected: [{ letter: 'A', defect: 'context', reason: 'incorrect preposition' }] },
      { number: 26, letters: ['C'], rejected: [{ letter: 'A', defect: 'preference', reason: 'less common collocation' }] },
    ]);
    assert.equal(confirmed.length, 1);
    assert.equal(confirmed[0].number, 26);
    assert.equal(part5RejectionIsSubstantive({ defect: 'preference', reason: 'less common collocation' }), false);
    assert.equal(part5RejectionIsSubstantive({ defect: 'meaning', reason: 'different meaning' }), true);
    assert.equal(part5RejectionIsSubstantive({ defect: 'context', reason: '' }), false);
    assert.equal(part5RejectionIsSubstantive('collocation'), false);
  });

  it('keeps a gap when the adjudicator still accepts two official answers', () => {
    const confirmed = confirmedPart5DoubleKeys(disputes, [
      { number: 21, letters: ['A', 'B'] },
      { number: 26, letters: ['C'], rejected: [{ letter: 'A', defect: 'meaning', reason: 'different meaning' }] },
    ]);
    assert.equal(confirmed.length, 1);
    assert.equal(confirmed[0].number, 21);
    assert.deepEqual(confirmed[0].letters, ['A', 'B']);
  });

  it('keeps the original dispute when the adjudicator skips a gap', () => {
    const confirmed = confirmedPart5DoubleKeys(disputes, [
      { number: 26, letters: ['A'], rejected: [{ letter: 'C', defect: 'meaning', reason: 'different meaning' }] },
    ]);
    assert.equal(confirmed.length, 1);
    assert.equal(confirmed[0].number, 21);
    assert.deepEqual(confirmed[0].letters, ['A', 'B']);
  });
});
