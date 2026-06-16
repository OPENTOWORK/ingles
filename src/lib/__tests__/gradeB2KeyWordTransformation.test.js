import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { countCambridgeKeyWordWords } from '@/lib/countCambridgeKeyWordWords';
import { normalizeB2KeyWordAnswer, tokenizeB2KeyWordAnswer } from '@/lib/normalizeB2KeyWordAnswer';
import {
  evaluateB2KeyWordKeywordStatus,
  gradeB2KeyWordTransformation,
  gradeLegacyB2KeyWordTransformation,
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
    assert.equal(evaluateB2KeyWordKeywordStatus('NEED', tokens), 'modified');
    const r = gradeB2KeyWordTransformation('needless to use', needKey());
    assert.equal(r.score, 0);
    assert.equal(r.reason, 'keyword_modified');
  });

  it('keyword case-insensitive → valid', () => {
    const r = gradeB2KeyWordTransformation('DO NOT NEED TO USE', needKey());
    assert.equal(r.keywordStatus, 'correct');
    assert.equal(r.score, 2);
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
