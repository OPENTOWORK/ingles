/**
 * Phase 2B — automated tests for B2 Part 4 candidate answer keys.
 *
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/test-b2-part4-live-answer-keys.mjs
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  B2_PART4_CANDIDATE_ANSWER_KEYS,
  E2Q26_PROPOSED_REWRITE,
  summarizeReviewCounts,
} from './b2-part4-candidate-answer-keys.mjs';
import { validateB2KeyWordAnswerKey } from '@/lib/validateB2KeyWordAnswerKey';
import { gradeB2KeyWordTransformation } from '@/lib/gradeB2KeyWordTransformation';
import { countCambridgeKeyWordWords } from '@/lib/countCambridgeKeyWordWords';

function gradeInProductionMode(answer, answerKey) {
  const prev = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    return gradeB2KeyWordTransformation(answer, answerKey);
  } finally {
    process.env.NODE_ENV = prev;
  }
}

describe('B2 Part 4 candidate answer keys — structure', () => {
  it('covers 18 live questions (Exams 1–3, Q25–30)', () => {
    assert.equal(B2_PART4_CANDIDATE_ANSWER_KEYS.length, 18);
    const ids = new Set(B2_PART4_CANDIDATE_ANSWER_KEYS.map((k) => `${k.examSlot}-Q${k.questionNumber}`));
    assert.equal(ids.size, 18);
  });

  it('has 17 APPROVED_KEY + 1 REWRITE_REQUIRED', () => {
    const counts = summarizeReviewCounts();
    assert.equal(counts.APPROVED_KEY, 17);
    assert.equal(counts.NEEDS_HUMAN_REVIEW, 0);
    assert.equal(counts.REWRITE_REQUIRED, 1);
  });
});

for (const candidate of B2_PART4_CANDIDATE_ANSWER_KEYS) {
  describe(`${candidate.id} — validate + grade`, () => {
    it('validateB2KeyWordAnswerKey passes', () => {
      const result = validateB2KeyWordAnswerKey(candidate.answerKey);
      assert.equal(result.valid, true, result.errors.join('; '));
    });

    for (const tc of candidate.testCases) {
      it(`${tc.label}: "${tc.answer}" → ${tc.expectedScore}/2 (${tc.note})`, () => {
        const result = gradeInProductionMode(tc.answer, candidate.answerKey);
        assert.equal(
          result.score,
          tc.expectedScore,
          `expected ${tc.expectedScore}, got ${result.score} (${result.reason})`,
        );
      });
    }

    it('full answer Cambridge word count is 2–5', () => {
      for (const fa of candidate.answerKey.fullAnswers) {
        const wc = countCambridgeKeyWordWords(fa);
        assert.ok(wc >= 2 && wc <= 5, `${fa} → ${wc} words`);
      }
    });
  });
}

describe('E2Q26 proposed rewrite (STRICTLY)', () => {
  const { answerKey, testCases } = E2Q26_PROPOSED_REWRITE;

  it('validateB2KeyWordAnswerKey passes', () => {
    const result = validateB2KeyWordAnswerKey(answerKey);
    assert.equal(result.valid, true, result.errors.join('; '));
  });

  it('full answer word count is 2–5', () => {
    assert.equal(countCambridgeKeyWordWords('is strictly forbidden'), 3);
  });

  for (const tc of testCases) {
    it(`${tc.label}: "${tc.answer}" → ${tc.expectedScore}/2 (${tc.note})`, () => {
      const result = gradeInProductionMode(tc.answer, answerKey);
      assert.equal(
        result.score,
        tc.expectedScore,
        `expected ${tc.expectedScore}, got ${result.score} (${result.reason})`,
      );
    });
  }
});
