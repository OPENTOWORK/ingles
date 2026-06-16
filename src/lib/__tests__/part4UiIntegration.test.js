import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { parseB2KeyWordAnswerKeyRows } from '@/lib/parseB2KeyWordAnswerKey';
import {
  gradeB2Part4Gap,
  gradeB2Part4StudentAnswer,
  getB2Part4V2FeedbackCopy,
  summarizePart4OpenGrades,
} from '@/lib/b2Part4Grading';
import { gradeLegacyB2KeyWordTransformation } from '@/lib/gradeB2KeyWordTransformation';
import { computeB2PartScoreMetrics } from '@/utils/levelsPaperScoreMetrics';
import { computeB2PartProgressFromState } from '@/utils/recordLevelsB2PartScore';
import { buildBulkAnswerCheckUpdate } from '@/utils/practiceCheckAnswers';
import { SUPPORTED_B2_KEY_WORD_ANSWER_KEY_TYPE, SUPPORTED_B2_KEY_WORD_ANSWER_KEY_VERSION } from '@/lib/validateB2KeyWordAnswerKey';

const PART_ID = 'part-1';
const OPEN_NUMBERS = [25, 26, 27, 28, 29, 30];
const getQuestionKey = (partId, qn, suffix = 'open') => `${partId}::q::${suffix === 'open' ? qn : suffix}`;

/** @returns {import('@/lib/gradeB2KeyWordTransformation').B2KeyWordAnswerKey} */
function meanMetadataKey() {
  return {
    type: SUPPORTED_B2_KEY_WORD_ANSWER_KEY_TYPE,
    version: SUPPORTED_B2_KEY_WORD_ANSWER_KEY_VERSION,
    keyword: 'MEAN',
    fullAnswers: ["didn't mean to delete", 'did not mean to delete'],
    markingPoints: [
      { id: 1, accepted: ["didn't mean", 'did not mean'] },
      { id: 2, accepted: ['to delete'] },
    ],
  };
}

function buildMeanParsedMap() {
  return parseB2KeyWordAnswerKeyRows([
    {
      respuesta_texto: '26 did not mean to delete',
      grading_metadata: meanMetadataKey(),
    },
  ]);
}

function buildLegacyNeedParsedMap() {
  return parseB2KeyWordAnswerKeyRows([{ respuesta_texto: '25 do not need to use' }]);
}

describe('Part 4 legacy grading (no metadata)', () => {
  it('exact full answer → 2/2', () => {
    const parsed = buildLegacyNeedParsedMap();
    const grade = gradeB2Part4Gap('do not need to use', parsed, 25);
    assert.equal(grade.score, 2);
    assert.equal(grade.maxScore, 2);
  });

  it('partial answer → 0/2 (never 1/2 without metadata)', () => {
    const parsed = buildLegacyNeedParsedMap();
    const grade = gradeB2Part4Gap('do not need', parsed, 25);
    assert.equal(grade.score, 0);
  });

  it('legacy grader never returns 1/2', () => {
    const result = gradeLegacyB2KeyWordTransformation({
      studentAnswer: 'do not need',
      acceptedFullAnswers: ['do not need to use'],
    });
    assert.notEqual(result.score, 1);
  });
});

describe('Part 4 metadata grading (simulated MEAN fixture)', () => {
  const parsed = buildMeanParsedMap();

  it('full answer → 2/2', () => {
    const grade = gradeB2Part4Gap("didn't mean to delete", parsed, 26);
    assert.equal(grade.score, 2);
    assert.equal(getB2Part4V2FeedbackCopy(grade).headline, 'Correct.');
  });

  it('only MP1 → 1/2', () => {
    const grade = gradeB2Part4Gap("didn't mean", parsed, 26);
    assert.equal(grade.score, 1);
    assert.equal(getB2Part4V2FeedbackCopy(grade).headline, 'Partly correct.');
  });

  it('only MP2 with keyword and valid word count → 1/2', () => {
    const grade = gradeB2Part4Gap('MEAN to delete', parsed, 26);
    assert.equal(grade.score, 1);
  });

  it('keyword missing → 0/2', () => {
    const grade = gradeB2Part4Gap('did not to delete', parsed, 26);
    assert.equal(grade.score, 0);
  });

  it('more than 5 words → 0/2', () => {
    const grade = gradeB2Part4Gap('did not mean to delete files now', parsed, 26);
    assert.equal(grade.score, 0);
    assert.match(getB2Part4V2FeedbackCopy(grade).detail, /2–5 words/);
  });
});

describe('Part 4 V2 state and metrics', () => {
  it('V2 sums points, not booleans', () => {
    /** @type {Record<string, import('@/lib/b2Part4Grading').B2Part4OpenGrade>} */
    const openGrades = {
      [getQuestionKey(PART_ID, 25, 'open')]: { score: 2, maxScore: 2, reason: 'full_match' },
      [getQuestionKey(PART_ID, 26, 'open')]: { score: 1, maxScore: 2, reason: 'partial' },
      [getQuestionKey(PART_ID, 27, 'open')]: { score: 0, maxScore: 2, reason: 'no_match' },
      [getQuestionKey(PART_ID, 28, 'open')]: { score: 2, maxScore: 2, reason: 'full_match' },
      [getQuestionKey(PART_ID, 29, 'open')]: { score: 1, maxScore: 2, reason: 'partial' },
      [getQuestionKey(PART_ID, 30, 'open')]: { score: 2, maxScore: 2, reason: 'full_match' },
    };

    const summary = summarizePart4OpenGrades(OPEN_NUMBERS, openGrades, getQuestionKey, PART_ID);
    assert.equal(summary.pointsEarned, 8);
    assert.equal(summary.fullyCorrectItems, 3);
    assert.equal(summary.questionsAnswered, 6);

    const metrics = computeB2PartScoreMetrics({
      partNumber: 4,
      scoringV2Enabled: true,
      useOpenInputUi: true,
      usePart4V2Grading: true,
      openQuestionNumbers: OPEN_NUMBERS,
      openChecks: {},
      openGrades,
      groupedAnswers: [],
      checkedQuestions: {},
      selectedOptions: {},
      getQuestionKey,
      partId: PART_ID,
    });

    assert.equal(metrics.pointsEarned, 8);
    assert.equal(metrics.maxPoints, 12);
    assert.equal(metrics.correctItems, 3);
    assert.equal(metrics.questionsAnswered, 6);
    assert.notEqual(metrics.correctItems, metrics.pointsEarned);
  });

  it('V1 keeps boolean openChecks model', () => {
    const openChecks = {
      [getQuestionKey(PART_ID, 25, 'open')]: true,
      [getQuestionKey(PART_ID, 26, 'open')]: false,
    };

    const metrics = computeB2PartScoreMetrics({
      partNumber: 4,
      scoringV2Enabled: false,
      useOpenInputUi: true,
      openQuestionNumbers: [25, 26],
      openChecks,
      groupedAnswers: [],
      checkedQuestions: {},
      selectedOptions: {},
      getQuestionKey,
      partId: PART_ID,
    });

    assert.equal(metrics.scoringVersion, 1);
    assert.equal(metrics.correctCount, 1);
    assert.equal(metrics.pointsEarned, 1);
  });

  it('progress from state uses openGrades when Part 4 V2 is active', () => {
    const prev = process.env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED;
    process.env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED = 'true';

    const openGrades = {
      [getQuestionKey(PART_ID, 25, 'open')]: { score: 2, maxScore: 2, reason: 'full_match' },
      [getQuestionKey(PART_ID, 26, 'open')]: { score: 1, maxScore: 2, reason: 'partial' },
    };

    try {
      const progress = computeB2PartProgressFromState({
        partNumber: 4,
        useOpenInputUi: true,
        usePart4V2Grading: true,
        openQuestionNumbers: [25, 26],
        openChecks: {},
        openGrades,
        groupedAnswers: [],
        checkedQuestions: {},
        selectedOptions: {},
        getQuestionKey,
        partId: PART_ID,
      });

      assert.equal(progress.evaluated, 2);
      assert.equal(progress.correct, 1);
      assert.equal(progress.v2Metrics?.pointsEarned, 3);
    } finally {
      if (prev === undefined) delete process.env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED;
      else process.env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED = prev;
    }
  });
});

describe('buildBulkAnswerCheckUpdate Part 4 V2', () => {
  it('grades all answered gaps with openGrades', () => {
    const parsed = buildMeanParsedMap();
    const { nextOpenGrades } = buildBulkAnswerCheckUpdate({
      openQuestionNumbers: [26],
      openInputs: { [getQuestionKey(PART_ID, 26, 'open')]: "didn't mean" },
      openChecks: {},
      openGrades: {},
      usePart4V2Grading: true,
      part4ParsedKeys: parsed,
      openAnswerMap: new Map(),
      normalizeText: (v) => String(v || '').trim().toLowerCase(),
      getOpenQuestionKey: (qn) => getQuestionKey(PART_ID, qn),
      mcqGroups: [],
      getMcqQuestionKey: () => 'mcq',
      selectedOptions: {},
      checkedQuestions: {},
    });

    assert.equal(nextOpenGrades[getQuestionKey(PART_ID, 26, 'open')].score, 1);
  });
});

describe('gradeB2Part4StudentAnswer', () => {
  it('uses metadata path when parsed key is metadata mode', () => {
    const parsed = buildMeanParsedMap().get(26);
    const grade = gradeB2Part4StudentAnswer("didn't mean to delete", parsed);
    assert.equal(grade.score, 2);
  });
});
