import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { normalizeB2KeyWordAnswer, tokenizeB2KeyWordAnswer } from '@/lib/normalizeB2KeyWordAnswer';
import {
  CAMBRIDGE_CONTRACTION_WORD_COUNTS,
  countCambridgeKeyWordWords,
  isPossessiveApostropheToken,
} from '@/lib/countCambridgeKeyWordWords';
import {
  B2KeyWordAnswerKeyValidationError,
  validateB2KeyWordAnswerKey,
} from '@/lib/validateB2KeyWordAnswerKey';
import {
  evaluateB2KeyWordKeywordStatus,
  gradeB2KeyWordTransformation,
  gradeLegacyB2KeyWordTransformation,
  markingPointsCoverAnswerExactly,
} from '@/lib/gradeB2KeyWordTransformation';

/** @returns {import('@/lib/gradeB2KeyWordTransformation').B2KeyWordAnswerKey} */
function meanDeleteKey() {
  return {
    type: 'b2_key_word_transformation',
    version: 1,
    keyword: 'MEAN',
    fullAnswers: ["didn't mean to delete", 'did not mean to delete'],
    markingPoints: [
      {
        id: 1,
        label: 'negative past form with MEAN',
        accepted: ["didn't mean", 'did not mean'],
      },
      {
        id: 2,
        label: 'infinitive pattern',
        accepted: ['to delete'],
      },
    ],
  };
}

/** @returns {import('@/lib/gradeB2KeyWordTransformation').B2KeyWordAnswerKey} */
function needKey() {
  return {
    type: 'b2_key_word_transformation',
    version: 1,
    keyword: 'NEED',
    fullAnswers: ['do not need to use', "don't need to use"],
    markingPoints: [
      { id: 1, accepted: ['do not need', "don't need"] },
      { id: 2, accepted: ['to use'] },
    ],
  };
}

describe('normalizeB2KeyWordAnswer', () => {
  it('folds case and spaces', () => {
    assert.equal(normalizeB2KeyWordAnswer('  Did NOT mean   to DELETE.  '), "did not mean to delete");
  });
});

describe('countCambridgeKeyWordWords', () => {
  it("didn't have to → 4 words", () => {
    assert.equal(countCambridgeKeyWordWords("didn't have to"), 4);
  });

  it("haven't been to → 4 words", () => {
    assert.equal(countCambridgeKeyWordWords("haven't been to"), 4);
  });

  it("he'll have finished → 4 words", () => {
    assert.equal(countCambridgeKeyWordWords("he'll have finished"), 4);
  });

  it("can't have gone → 3 words", () => {
    assert.equal(countCambridgeKeyWordWords("can't have gone"), 3);
  });

  it('cannot have gone → 3 words', () => {
    assert.equal(countCambridgeKeyWordWords('cannot have gone'), 3);
  });

  it("she's been working → 4 words (she is/has = 2)", () => {
    assert.equal(countCambridgeKeyWordWords("she's been working"), 4);
  });

  it("she's very helpful → 4 words", () => {
    assert.equal(countCambridgeKeyWordWords("she's very helpful"), 4);
  });

  it("John's car → 2 words (possessive, not she is)", () => {
    assert.equal(countCambridgeKeyWordWords("John's car"), 2);
    assert.equal(isPossessiveApostropheToken("john's"), true);
  });

  it("the student's book → possessive counts as 1 word per token", () => {
    assert.equal(countCambridgeKeyWordWords("the student's book"), 3);
    assert.equal(isPossessiveApostropheToken("student's"), true);
  });

  it("students' work → possessive plural", () => {
    assert.equal(countCambridgeKeyWordWords("students' work"), 2);
    assert.equal(isPossessiveApostropheToken("students'"), true);
  });

  it('typographic and straight apostrophes produce the same count', () => {
    const straight = countCambridgeKeyWordWords("didn't mean to delete");
    const typographic = countCambridgeKeyWordWords('didn\u2019t mean to delete');
    assert.equal(straight, typographic);
    assert.equal(straight, 5);
  });

  it('unlisted apostrophe token defaults to 1 word (conservative)', () => {
    assert.equal(countCambridgeKeyWordWords("o'clock today"), 2);
  });

  it('lists all required Cambridge contractions explicitly', () => {
    const required = [
      "don't", "doesn't", "didn't",
      "isn't", "aren't", "wasn't", "weren't",
      "haven't", "hasn't", "hadn't",
      "won't", "wouldn't",
      "can't", "couldn't",
      "shouldn't", "mustn't",
      "i'll", "you'll", "he'll", "she'll", "we'll", "they'll",
      "i've", "you've", "we've", "they've",
      "i'd", "you'd", "he'd", "she'd", "we'd", "they'd",
      "i'm", "you're", "we're", "they're",
    ];
    for (const form of required) {
      assert.ok(
        Object.prototype.hasOwnProperty.call(CAMBRIDGE_CONTRACTION_WORD_COUNTS, form),
        `missing contraction: ${form}`,
      );
    }
    assert.equal(CAMBRIDGE_CONTRACTION_WORD_COUNTS["can't"], 1);
    assert.equal(CAMBRIDGE_CONTRACTION_WORD_COUNTS["won't"], 2);
    assert.equal(CAMBRIDGE_CONTRACTION_WORD_COUNTS["he's"], 2);
    assert.equal(CAMBRIDGE_CONTRACTION_WORD_COUNTS["she's"], 2);
    assert.equal(CAMBRIDGE_CONTRACTION_WORD_COUNTS["he'd"], 2);
  });

  it('1 word → invalid band', () => {
    assert.equal(countCambridgeKeyWordWords('delete'), 1);
  });

  it('6 words → invalid band', () => {
    assert.equal(countCambridgeKeyWordWords('one two three four five six'), 6);
  });
});

describe('gradeB2KeyWordTransformation — full answers', () => {
  const key = meanDeleteKey();

  it('canonical answer → 2/2 full_match', () => {
    const r = gradeB2KeyWordTransformation("didn't mean to delete", key);
    assert.equal(r.score, 2);
    assert.equal(r.reason, 'full_match');
    assert.equal(r.matchedFullAnswer, "didn't mean to delete");
  });

  it('variant full answer → 2/2', () => {
    const r = gradeB2KeyWordTransformation('did not mean to delete', key);
    assert.equal(r.score, 2);
    assert.equal(r.reason, 'full_match');
  });

  it('case and spaces → 2/2', () => {
    const r = gradeB2KeyWordTransformation('  DID NOT MEAN   TO DELETE ', key);
    assert.equal(r.score, 2);
  });

  it('spelling incorrect → not full match', () => {
    const r = gradeB2KeyWordTransformation("didn't meen to delete", key);
    assert.notEqual(r.reason, 'full_match');
    assert.notEqual(r.matchedFullAnswer, "didn't meen to delete");
  });
});

describe('gradeB2KeyWordTransformation — marking points', () => {
  const key = meanDeleteKey();

  it('MP1 + MP2 contiguous → 2/2', () => {
    const r = gradeB2KeyWordTransformation("didn't mean to delete", key);
    assert.equal(r.score, 2);
  });

  it('only MP1 → 1/2', () => {
    const r = gradeB2KeyWordTransformation("didn't mean", key);
    assert.equal(r.score, 1);
    assert.equal(r.reason, 'partial_match');
    assert.equal(r.markingPoints.find((m) => m.id === 1)?.correct, true);
    assert.equal(r.markingPoints.find((m) => m.id === 2)?.correct, false);
  });

  it('only MP2 → 1/2', () => {
    const r = gradeB2KeyWordTransformation('mean to delete', key);
    assert.equal(r.score, 1);
    assert.equal(r.markingPoints.find((m) => m.id === 2)?.correct, true);
  });

  it('neither MP → 0/2', () => {
    const r = gradeB2KeyWordTransformation('wanted to remove', key);
    assert.equal(r.score, 0);
  });

  it('reverse order → not 2/2', () => {
    const r = gradeB2KeyWordTransformation("to delete didn't mean", key);
    assert.notEqual(r.score, 2);
  });

  it('accidental substring without token sequence → no point', () => {
    const r = gradeB2KeyWordTransformation('mean answer to delete', key);
    assert.equal(r.markingPoints.find((m) => m.id === 1)?.correct, false);
    assert.equal(r.markingPoints.find((m) => m.id === 2)?.correct, true);
    assert.equal(r.score, 1);
  });

  it('overlapping blocks cannot double-score', () => {
    const overlapKey = {
      ...meanDeleteKey(),
      fullAnswers: ["didn't mean to delete"],
      markingPoints: [
        { id: 1, accepted: ["didn't mean to"] },
        { id: 2, accepted: ['mean to delete'] },
      ],
    };
    const r = gradeB2KeyWordTransformation("didn't mean to remove", overlapKey);
    assert.ok(r.score <= 1);
  });

  it('extra incompatible word between MPs → not 2/2', () => {
    const r = gradeB2KeyWordTransformation("didn't mean really to delete", key);
    assert.notEqual(r.score, 2);
    assert.ok(r.reason === 'invalid_word_count' || r.score === 1);
  });
});

describe('gradeB2KeyWordTransformation — keyword', () => {
  it('keyword correct → normal grading', () => {
    const r = gradeB2KeyWordTransformation("didn't mean to delete", meanDeleteKey());
    assert.equal(r.keywordStatus, 'correct');
    assert.equal(r.score, 2);
  });

  it('keyword missing → 0/2', () => {
    const r = gradeB2KeyWordTransformation('did not intend to delete', meanDeleteKey());
    assert.equal(r.keywordStatus, 'missing');
    assert.equal(r.score, 0);
    assert.equal(r.reason, 'keyword_missing');
  });

  it('keyword modified → 0/2', () => {
    const r = gradeB2KeyWordTransformation('do not needed to use', needKey());
    assert.equal(r.keywordStatus, 'modified');
    assert.equal(r.score, 0);
    assert.equal(r.reason, 'keyword_modified');
  });

  it('keyword inside another word → not valid', () => {
    const tokens = tokenizeB2KeyWordAnswer('needless to use');
    assert.equal(evaluateB2KeyWordKeywordStatus('NEED', tokens).status, 'modified');
    const r = gradeB2KeyWordTransformation('needless to use', needKey());
    assert.equal(r.score, 0);
    assert.equal(r.reason, 'keyword_modified');
  });

  it('keyword case-insensitive → valid', () => {
    const r = gradeB2KeyWordTransformation('DO NOT NEED TO USE', needKey());
    assert.equal(r.keywordStatus, 'correct');
    assert.equal(r.score, 2);
  });

  it('requiredOccurrences ×2 — AS appears twice → valid', () => {
    const asKey = {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: { text: 'AS', requiredOccurrences: 2 },
      fullAnswers: ['was not as hard as'],
      markingPoints: [
        { id: 1, accepted: ['was not'] },
        { id: 2, accepted: ['as hard as'] },
      ],
    };
    const r = gradeB2KeyWordTransformation('was not as hard as', asKey);
    assert.equal(r.keywordStatus, 'correct');
    assert.deepEqual(r.keywordOccurrences, { required: 2, found: 2 });
    assert.equal(r.score, 2);
  });

  it('requiredOccurrences ×2 — only one AS → keyword missing 0/2', () => {
    const asKey = {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: { text: 'AS', requiredOccurrences: 2 },
      fullAnswers: ['was not as hard as'],
      markingPoints: [
        { id: 1, accepted: ['was not'] },
        { id: 2, accepted: ['as hard as'] },
      ],
    };
    const r = gradeB2KeyWordTransformation('was as difficult', asKey);
    assert.equal(r.keywordStatus, 'missing');
    assert.deepEqual(r.keywordOccurrences, { required: 2, found: 1 });
    assert.equal(r.score, 0);
    assert.equal(r.reason, 'keyword_missing');
  });

  it('requiredOccurrences ×2 — incomplete answer → keyword missing', () => {
    const asKey = {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: { text: 'AS', requiredOccurrences: 2 },
      fullAnswers: ['was not as hard as'],
      markingPoints: [
        { id: 1, accepted: ['was not'] },
        { id: 2, accepted: ['as hard as'] },
      ],
    };
    const r = gradeB2KeyWordTransformation('was not as hard', asKey);
    assert.equal(r.keywordStatus, 'missing');
    assert.deepEqual(r.keywordOccurrences, { required: 2, found: 1 });
    assert.equal(r.score, 0);
  });

  it('NEED ×1 — do not need to use → valid', () => {
    const r = gradeB2KeyWordTransformation('do not need to use', needKey());
    assert.equal(r.keywordStatus, 'correct');
    assert.deepEqual(r.keywordOccurrences, { required: 1, found: 1 });
    assert.equal(r.score, 2);
  });

  it('NEED ×1 — needed → modified 0/2', () => {
    const r = gradeB2KeyWordTransformation('needed to use', needKey());
    assert.equal(r.keywordStatus, 'modified');
    assert.equal(r.score, 0);
    assert.equal(r.reason, 'keyword_modified');
  });
});

describe('gradeB2KeyWordTransformation — word count gates', () => {
  const key = meanDeleteKey();

  it('1 word → 0/2 invalid_word_count', () => {
    const r = gradeB2KeyWordTransformation('delete', key);
    assert.equal(r.reason, 'invalid_word_count');
    assert.equal(r.score, 0);
  });

  it('2 words → allowed', () => {
    const r = gradeB2KeyWordTransformation('mean delete', key);
    assert.notEqual(r.reason, 'invalid_word_count');
  });

  it('5 words → allowed', () => {
    const r = gradeB2KeyWordTransformation('did not mean to delete', key);
    assert.notEqual(r.reason, 'invalid_word_count');
    assert.equal(r.wordCount, 5);
  });

  it('6 words → 0/2 invalid_word_count', () => {
    const r = gradeB2KeyWordTransformation('did not really mean to delete', key);
    assert.equal(r.reason, 'invalid_word_count');
    assert.equal(r.score, 0);
  });
});

describe('pedagogical fixtures', () => {
  it("was not | as expensive — both MPs → 2/2", () => {
    const key = {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'WAS',
      fullAnswers: ['was not as expensive', "wasn't as expensive"],
      markingPoints: [
        { id: 1, accepted: ['was not', "wasn't"] },
        { id: 2, accepted: ['as expensive'] },
      ],
    };
    const r = gradeB2KeyWordTransformation('was not as expensive', key);
    assert.equal(r.score, 2);
  });

  it('wish | I could come — partial MP1 only → 1/2', () => {
    const key = {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'WISH',
      fullAnswers: ['wish I could come'],
      markingPoints: [
        { id: 1, accepted: ['wish'] },
        { id: 2, accepted: ['I could come'] },
      ],
    };
    const r = gradeB2KeyWordTransformation('wish I', key);
    assert.equal(r.score, 1);
  });

  it('looking forward | to hearing — full match', () => {
    const key = {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'FORWARD',
      fullAnswers: ['looking forward to hearing'],
      markingPoints: [
        { id: 1, accepted: ['looking forward'] },
        { id: 2, accepted: ['to hearing'] },
      ],
    };
    const r = gradeB2KeyWordTransformation('looking forward to hearing', key);
    assert.equal(r.score, 2);
    assert.equal(r.reason, 'full_match');
  });

  it("didn't mean | to delete — canonical fixture", () => {
    const r = gradeB2KeyWordTransformation("didn't mean to delete", meanDeleteKey());
    assert.equal(r.score, 2);
  });

  it('had never | visited — both MPs contiguous → 2/2', () => {
    const key = {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'NEVER',
      fullAnswers: ['had never visited'],
      markingPoints: [
        { id: 1, accepted: ['had never'] },
        { id: 2, accepted: ['visited'] },
      ],
    };
    const r = gradeB2KeyWordTransformation('had never visited', key);
    assert.equal(r.score, 2);
  });

  it('are thought | to — both MPs → 2/2', () => {
    const key = {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'THOUGHT',
      fullAnswers: ['are thought to'],
      markingPoints: [
        { id: 1, accepted: ['are thought'] },
        { id: 2, accepted: ['to'] },
      ],
    };
    const r = gradeB2KeyWordTransformation('are thought to', key);
    assert.equal(r.score, 2);
  });
});

describe('validateB2KeyWordAnswerKey', () => {
  it('valid key passes', () => {
    const result = validateB2KeyWordAnswerKey(meanDeleteKey());
    assert.equal(result.valid, true);
    assert.deepEqual(result.errors, []);
  });

  it('detects missing keyword', () => {
    const key = { ...meanDeleteKey(), keyword: '' };
    const result = validateB2KeyWordAnswerKey(key);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('keyword')));
  });

  it('detects requiredOccurrences < 1', () => {
    const key = {
      ...meanDeleteKey(),
      keyword: { text: 'AS', requiredOccurrences: 0 },
    };
    const result = validateB2KeyWordAnswerKey(key);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('requiredOccurrences')));
  });

  it('detects wrong marking point count', () => {
    const key = { ...meanDeleteKey(), markingPoints: [{ id: 1, accepted: ['x'] }] };
    const result = validateB2KeyWordAnswerKey(key);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('exactly 2')));
  });

  it('detects empty fullAnswers and variants', () => {
    const key = {
      ...meanDeleteKey(),
      fullAnswers: [''],
      markingPoints: [
        { id: 1, accepted: [''] },
        { id: 2, accepted: ['to delete'] },
      ],
    };
    const result = validateB2KeyWordAnswerKey(key);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('fullAnswers')));
    assert.ok(result.errors.some((e) => e.includes('accepted')));
  });

  it('detects duplicate marking point ids', () => {
    const key = {
      ...meanDeleteKey(),
      markingPoints: [
        { id: 1, accepted: ['a'] },
        { id: 1, accepted: ['b'] },
      ],
    };
    const result = validateB2KeyWordAnswerKey(key);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('duplicate marking point id')));
  });

  it('detects identical variants across MPs', () => {
    const key = {
      ...meanDeleteKey(),
      markingPoints: [
        { id: 1, accepted: ['to delete'] },
        { id: 2, accepted: ['to delete'] },
      ],
    };
    const result = validateB2KeyWordAnswerKey(key);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('identical accepted variant')));
  });

  it('detects unsupported type and version', () => {
    const key = { ...meanDeleteKey(), type: 'legacy', version: 99 };
    const result = validateB2KeyWordAnswerKey(key);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes('unsupported type')));
    assert.ok(result.errors.some((e) => e.includes('unsupported version')));
  });

  it('grader returns safe result for invalid metadata (production path)', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const r = gradeB2KeyWordTransformation('answer', { type: 'bad' });
      assert.equal(r.score, 0);
      assert.equal(r.reason, 'invalid_answer_key');
      assert.ok(Array.isArray(r.validationErrors));
      assert.ok(r.validationErrors.length > 0);
    } finally {
      process.env.NODE_ENV = prev;
    }
  });

  it('grader throws typed error in development', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    try {
      assert.throws(
        () => gradeB2KeyWordTransformation('answer', { type: 'bad' }),
        B2KeyWordAnswerKeyValidationError,
      );
    } finally {
      process.env.NODE_ENV = prev;
    }
  });
});

describe('marking point exact coverage', () => {
  const key = meanDeleteKey();

  it('2/2 via MPs requires MP1 before MP2 without gaps or overlap', () => {
    const tokens = tokenizeB2KeyWordAnswer("didn't mean to delete");
    const mpResults = [
      { id: 1, correct: true, matchedVariant: "didn't mean" },
      { id: 2, correct: true, matchedVariant: 'to delete' },
    ];
    assert.equal(
      markingPointsCoverAnswerExactly(tokens, mpResults, key.markingPoints),
      true,
    );
  });

  it('isolated MP word does not grant 2/2', () => {
    const r = gradeB2KeyWordTransformation('mean', key);
    assert.equal(r.score, 0);
  });

  it('substring without full token sequence does not grant MP1', () => {
    const r = gradeB2KeyWordTransformation('mean answer to delete', key);
    assert.equal(r.markingPoints.find((m) => m.id === 1)?.correct, false);
    assert.equal(r.score, 1);
  });

  it('reverse MP order does not grant 2/2', () => {
    const r = gradeB2KeyWordTransformation("to delete didn't mean", key);
    assert.notEqual(r.score, 2);
  });

  it('both MPs correct but gap between them → 1/2 not 2/2', () => {
    const gapKey = {
      type: 'b2_key_word_transformation',
      version: 1,
      keyword: 'WAS',
      fullAnswers: ['was not as expensive'],
      markingPoints: [
        { id: 1, accepted: ['was not'] },
        { id: 2, accepted: ['as expensive'] },
      ],
    };
    const r = gradeB2KeyWordTransformation('was not really as expensive', gapKey);
    assert.equal(r.markingPoints.filter((m) => m.correct).length, 2);
    assert.equal(r.score, 1);
  });

  it('reused tokens across MPs cannot yield 2/2', () => {
    const overlapKey = {
      ...meanDeleteKey(),
      fullAnswers: ["didn't mean to delete"],
      markingPoints: [
        { id: 1, accepted: ["didn't mean to"] },
        { id: 2, accepted: ['mean to delete'] },
      ],
    };
    const tokens = tokenizeB2KeyWordAnswer("didn't mean to delete");
    const mpResults = gradeB2KeyWordTransformation("didn't mean to delete", overlapKey).markingPoints;
    assert.equal(
      markingPointsCoverAnswerExactly(tokens, mpResults, overlapKey.markingPoints),
      false,
    );
  });
});

describe('gradeLegacyB2KeyWordTransformation', () => {
  const accepted = ["didn't mean to delete", 'did not mean to delete'];

  it('exact full answer → 2/2', () => {
    const r = gradeLegacyB2KeyWordTransformation({
      studentAnswer: "didn't mean to delete",
      acceptedFullAnswers: accepted,
    });
    assert.equal(r.score, 2);
    assert.equal(r.reason, 'full_match');
  });

  it('partial → 0/2 never 1/2', () => {
    const r = gradeLegacyB2KeyWordTransformation({
      studentAnswer: "didn't mean",
      acceptedFullAnswers: accepted,
    });
    assert.equal(r.score, 0);
    assert.notEqual(r.score, 1);
  });

  it('no metadata path never returns 1/2', () => {
    const r = gradeLegacyB2KeyWordTransformation({
      studentAnswer: 'to delete',
      acceptedFullAnswers: accepted,
    });
    assert.equal(r.score, 0);
  });
});
