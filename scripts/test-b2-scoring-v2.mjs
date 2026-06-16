import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  B2_PART_SCORING,
  B2_PART_SCORING_V2,
  B2_PAPER_SCORING_V2,
} from '../src/utils/levelsB2PartScoring.js';
import {
  buildPartScoreMetricsV2,
  pointsForCorrectItem,
  sumB2MetricsForParts,
  maxPointsForPartRange,
} from '../src/utils/b2ScoringV2Engine.js';
import { computeB2PartScoreMetrics } from '../src/utils/levelsPaperScoreMetrics.js';
import { computeB2PartProgressFromState } from '../src/utils/recordLevelsB2PartScore.js';
import { aggregateExamModeSectionScores } from '../src/utils/examModeGradeAnswers.js';
import { isB2ScoringV2Enabled, isB2RuoeV2SessionPersistenceBlocked, shouldSyncExamModeSessionToServer, shouldClearExamSlotPuntuacionesOnRepeat, isExamModeSessionScoringCompatible } from '../src/lib/b2ScoringV2FeatureFlag.js';

describe('B2 Scoring V2 config', () => {
  it('parts max points: 8, 8, 8, 12, 12, 12, 10', () => {
    assert.equal(B2_PART_SCORING_V2[1].maxPoints, 8);
    assert.equal(B2_PART_SCORING_V2[2].maxPoints, 8);
    assert.equal(B2_PART_SCORING_V2[3].maxPoints, 8);
    assert.equal(B2_PART_SCORING_V2[4].maxPoints, 12);
    assert.equal(B2_PART_SCORING_V2[5].maxPoints, 12);
    assert.equal(B2_PART_SCORING_V2[6].maxPoints, 12);
    assert.equal(B2_PART_SCORING_V2[7].maxPoints, 10);
  });

  it('paper totals: 70, Reading 42, Use of English 28', () => {
    assert.equal(B2_PAPER_SCORING_V2.readingAndUseOfEnglish.maxPoints, 70);
    assert.equal(B2_PAPER_SCORING_V2.reading.maxPoints, 42);
    assert.equal(B2_PAPER_SCORING_V2.useOfEnglish.maxPoints, 28);
    assert.equal(
      maxPointsForPartRange(1, 7, B2_PART_SCORING_V2),
      70,
    );
  });
});

describe('B2 Scoring V2 points', () => {
  it('Part 1 correct item → +1 point', () => {
    assert.equal(pointsForCorrectItem(1, true, B2_PART_SCORING_V2), 1);
    assert.equal(pointsForCorrectItem(1, false, B2_PART_SCORING_V2), 0);
  });

  it('Part 4 legacy correct → +2, incorrect → +0', () => {
    assert.equal(pointsForCorrectItem(4, true, B2_PART_SCORING_V2), 2);
    assert.equal(pointsForCorrectItem(4, false, B2_PART_SCORING_V2), 0);
  });

  it('Part 5 and 6 correct → +2', () => {
    assert.equal(pointsForCorrectItem(5, true, B2_PART_SCORING_V2), 2);
    assert.equal(pointsForCorrectItem(6, true, B2_PART_SCORING_V2), 2);
  });

  it('Part 7 correct → +1', () => {
    assert.equal(pointsForCorrectItem(7, true, B2_PART_SCORING_V2), 1);
  });
});

describe('B2 Scoring V2 metrics', () => {
  const baseMcqState = {
    useOpenInputUi: false,
    openQuestionNumbers: [],
    openChecks: {},
    groupedAnswers: [
      {
        questionNumber: 1,
        options: [{ id: 'a', correcta: true }, { id: 'b', correcta: false }],
      },
      {
        questionNumber: 2,
        options: [{ id: 'c', correcta: true }, { id: 'd', correcta: false }],
      },
    ],
    checkedQuestions: { 'p::q::extra-0': true, 'p::q::extra-1': true },
    selectedOptions: { 'p::q::extra-0': 'a', 'p::q::extra-1': 'd' },
    getQuestionKey: (_pid, qn, fb) => `p::q::${fb}`,
    partId: 'p',
  };

  it('questionsAnswered is distinct from pointsEarned', () => {
    const m = computeB2PartScoreMetrics({
      partNumber: 4,
      scoringV2Enabled: true,
      ...baseMcqState,
      groupedAnswers: Array.from({ length: 6 }, (_, i) => ({
        questionNumber: i + 1,
        options: [{ id: `ok-${i}`, correcta: true }],
      })),
      checkedQuestions: Object.fromEntries(
        Array.from({ length: 6 }, (_, i) => [`p::q::extra-${i}`, true]),
      ),
      selectedOptions: Object.fromEntries(
        Array.from({ length: 6 }, (_, i) => [`p::q::extra-${i}`, i < 3 ? `ok-${i}` : 'wrong']),
      ),
    });
    assert.equal(m.questionsAnswered, 6);
    assert.equal(m.correctItems, 3);
    assert.equal(m.pointsEarned, 6);
    assert.equal(m.maxPoints, 12);
    assert.notEqual(m.correctItems, m.pointsEarned);
    assert.notEqual(m.correctItems, m.questionsAnswered);
  });

  it('Part 4 with 3 fully correct → 6/12', () => {
    const m = buildPartScoreMetricsV2(
      4,
      { correctItems: 3, questionsAnswered: 6, totalQuestions: 6 },
      B2_PART_SCORING_V2,
    );
    assert.equal(m.pointsEarned, 6);
    assert.equal(m.maxPoints, 12);
    assert.equal(Math.round(m.accuracyByPoints * 10) / 10, 50);
  });

  it('Part 5 with 4 correct → 8/12', () => {
    const m = buildPartScoreMetricsV2(
      5,
      { correctItems: 4, questionsAnswered: 6, totalQuestions: 6 },
      B2_PART_SCORING_V2,
    );
    assert.equal(m.pointsEarned, 8);
    assert.equal(m.maxPoints, 12);
  });
});

describe('B2 Scoring V2 feature flag', () => {
  it('flag OFF → V1 totals unchanged', () => {
    assert.equal(isB2ScoringV2Enabled({ NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED: 'false' }), false);
    assert.equal(B2_PART_SCORING[4].total, 6);
    const m = computeB2PartScoreMetrics({
      partNumber: 4,
      scoringV2Enabled: false,
      useOpenInputUi: false,
      openQuestionNumbers: [],
      openChecks: {},
      groupedAnswers: [],
      checkedQuestions: {},
      selectedOptions: {},
      getQuestionKey: () => 'k',
      partId: 'p',
    });
    assert.equal(m.scoringVersion, 1);
    assert.equal(m.pointsEarned, m.correctCount);
  });

  it('flag ON → V2 maxPoints for part 4', () => {
    const m = computeB2PartScoreMetrics({
      partNumber: 4,
      scoringV2Enabled: true,
      useOpenInputUi: false,
      openQuestionNumbers: [],
      openChecks: {},
      groupedAnswers: [
        { questionNumber: 25, options: [{ id: 'a', correcta: true }] },
      ],
      checkedQuestions: { 'k': true },
      selectedOptions: { k: 'a' },
      getQuestionKey: () => 'k',
      partId: 'p',
    });
    assert.equal(m.scoringVersion, 2);
    assert.equal(m.maxPoints, 12);
    assert.equal(m.pointsEarned, 2);
  });
});

describe('B2 Scoring V2 persistence guard', () => {
  it('isB2RuoeV2SessionPersistenceBlocked covers parts 1–7 only when flag ON', () => {
    const envOn = { NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED: 'true' };
    assert.equal(isB2RuoeV2SessionPersistenceBlocked(4, envOn), true);
    assert.equal(isB2RuoeV2SessionPersistenceBlocked(8, envOn), false);
    assert.equal(isB2RuoeV2SessionPersistenceBlocked(4, { NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED: 'false' }), false);
  });

  it('saveB2PartPuntuacionIfComplete skips when V2 enabled', async () => {
    const original = process.env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED;
    process.env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED = 'true';
    try {
      const { saveB2PartPuntuacionIfComplete } = await import('../src/utils/recordLevelsB2PartScore.js');
      const result = await saveB2PartPuntuacionIfComplete({
        userId: '00000000-0000-4000-8000-000000000001',
        preguntaId: '00000000-0000-4000-8000-000000000002',
        parteId: '00000000-0000-4000-8000-000000000003',
        examenId: '00000000-0000-4000-8000-000000000004',
        partNumber: 4,
        progress: { complete: true, correct: 4, total: 6 },
      });
      assert.equal(result.saved, false);
      assert.equal(result.v2PersistenceSkipped, true);
    } finally {
      if (original === undefined) delete process.env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED;
      else process.env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED = original;
    }
  });
});

describe('Exam Mode V2 aggregation', () => {
  it('Reading /42, Use of English /28, paper /70', () => {
    const makeSnap = (partNumber, correctItems, evaluated) => ({
      progress: {
        correct: correctItems,
        evaluated,
        complete: true,
        v2Metrics: buildPartScoreMetricsV2(
          partNumber,
          { correctItems, questionsAnswered: evaluated, totalQuestions: B2_PART_SCORING_V2[partNumber].questionCount },
          B2_PART_SCORING_V2,
        ),
      },
    });

    const partSnapshots = {
      1: makeSnap(1, 4, 8),
      2: makeSnap(2, 4, 8),
      3: makeSnap(3, 4, 8),
      4: makeSnap(4, 3, 6),
      5: makeSnap(5, 4, 6),
      6: makeSnap(6, 4, 6),
      7: makeSnap(7, 5, 10),
    };

    const scores = aggregateExamModeSectionScores({
      partMin: 1,
      partMax: 7,
      partSnapshots,
      scoringV2Enabled: true,
    });

    assert.equal(scores.scoringVersion, 2);
    assert.equal(scores.maxPoints, 70);
    assert.equal(scores.reading.maxPoints, 42);
    assert.equal(scores.useOfEnglish.maxPoints, 28);
    assert.equal(scores.pointsEarned, scores.correct);
  });

  it('manual example: P1 6/8 P2 5/8 P3 7/8 P4 8/12 P5 6/12 P6 10/12 P7 8/10 → 30/42 + 20/28 = 50/70', () => {
    const pointsByPart = { 1: 6, 2: 5, 3: 7, 4: 8, 5: 6, 6: 10, 7: 8 };
    const byPart = {};
    for (const [p, pts] of Object.entries(pointsByPart)) {
      const pn = Number(p);
      const cfg = B2_PART_SCORING_V2[pn];
      const correctItems = pts / cfg.pointsPerCorrect;
      byPart[pn] = buildPartScoreMetricsV2(
        pn,
        {
          correctItems,
          questionsAnswered: cfg.questionCount,
          totalQuestions: cfg.questionCount,
        },
        B2_PART_SCORING_V2,
      );
    }
    const scores = aggregateExamModeSectionScores({
      partMin: 1,
      partMax: 7,
      partSnapshots: Object.fromEntries(
        Object.keys(byPart).map((p) => [
          Number(p),
          { progress: { complete: true, correct: byPart[p].correctItems, evaluated: byPart[p].questionsAnswered, v2Metrics: byPart[p] } },
        ]),
      ),
      scoringV2Enabled: true,
    });
    assert.equal(scores.reading.pointsEarned, 30);
    assert.equal(scores.reading.maxPoints, 42);
    assert.equal(scores.useOfEnglish.pointsEarned, 20);
    assert.equal(scores.useOfEnglish.maxPoints, 28);
    assert.equal(scores.pointsEarned, 50);
    assert.equal(scores.maxPoints, 70);
    assert.equal(scores.correct, 50);
    assert.equal(scores.total, 70);
  });
});

describe('V2 progress does not set passed', () => {
  it('passed is false under V2 even with all correct', () => {
    const original = process.env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED;
    process.env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED = 'true';
    try {
      const progress = computeB2PartProgressFromState({
        partNumber: 1,
        useOpenInputUi: false,
        openQuestionNumbers: [],
        openChecks: {},
        groupedAnswers: Array.from({ length: 8 }, (_, i) => ({
          questionNumber: i + 1,
          options: [{ id: `a${i}`, correcta: true }],
        })),
        checkedQuestions: Object.fromEntries(
          Array.from({ length: 8 }, (_, i) => [`p::q::extra-${i}`, true]),
        ),
        selectedOptions: Object.fromEntries(
          Array.from({ length: 8 }, (_, i) => [`p::q::extra-${i}`, `a${i}`]),
        ),
        getQuestionKey: (_p, _qn, fb) => `p::q::${fb}`,
        partId: 'p',
      });
      assert.equal(progress.scoringVersion, 2);
      assert.equal(progress.passed, false);
      assert.equal(progress.pointsEarned, 8);
      assert.equal(progress.maxPoints, 8);
    } finally {
      if (original === undefined) delete process.env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED;
      else process.env.NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED = original;
    }
  });
});

describe('Exam mode sync and repeat guards', () => {
  const envOn = { NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED: 'true' };
  const envOff = { NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED: 'false' };
  const b2Session = { slug: 'b2', examSlot: 1, scoringVersion: 2 };
  const c1Session = { slug: 'c1', examSlot: 1, scoringVersion: 2 };

  it('V2 blocks syncExamModeToServer for B2', () => {
    assert.equal(shouldSyncExamModeSessionToServer(b2Session, envOn), false);
  });

  it('V2 does not block sync for non-B2 levels', () => {
    assert.equal(shouldSyncExamModeSessionToServer(c1Session, envOn), true);
  });

  it('flag OFF keeps B2 sync enabled', () => {
    assert.equal(shouldSyncExamModeSessionToServer(b2Session, envOff), true);
  });

  it('V2 blocks clearExamSlotPuntuaciones for B2', () => {
    assert.equal(shouldClearExamSlotPuntuacionesOnRepeat('b2', envOn), false);
  });

  it('V2 does not block clear for non-B2', () => {
    assert.equal(shouldClearExamSlotPuntuacionesOnRepeat('c1', envOn), true);
  });

  it('flag OFF keeps B2 clear enabled', () => {
    assert.equal(shouldClearExamSlotPuntuacionesOnRepeat('b2', envOff), true);
  });
});

describe('Local session scoringVersion compatibility', () => {
  it('V2 draft + flag OFF → incompatible', () => {
    assert.equal(
      isExamModeSessionScoringCompatible({ scoringVersion: 2 }, { NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED: 'false' }),
      false,
    );
  });

  it('V1 draft + flag ON → incompatible', () => {
    assert.equal(
      isExamModeSessionScoringCompatible({ scoringVersion: 1 }, { NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED: 'true' }),
      false,
    );
  });

  it('matching versions are compatible', () => {
    assert.equal(
      isExamModeSessionScoringCompatible({ scoringVersion: 2 }, { NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED: 'true' }),
      true,
    );
    assert.equal(
      isExamModeSessionScoringCompatible({ scoringVersion: 1 }, { NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED: 'false' }),
      true,
    );
  });
});

describe('Aggregation integrity and edge cases', () => {
  it('does not double-count correctItems and pointsEarned in section total', () => {
    const scores = aggregateExamModeSectionScores({
      partMin: 4,
      partMax: 4,
      partSnapshots: {
        4: {
          progress: {
            complete: true,
            correct: 3,
            evaluated: 6,
            v2Metrics: buildPartScoreMetricsV2(
              4,
              { correctItems: 3, questionsAnswered: 6, totalQuestions: 6 },
              B2_PART_SCORING_V2,
            ),
          },
        },
      },
      scoringV2Enabled: true,
    });
    assert.equal(scores.correct, 6);
    assert.equal(scores.correctItems, undefined);
    assert.notEqual(scores.correct, 3 + 6);
  });

  it('questionsAnswered never exceeds totalQuestions', () => {
    const m = computeB2PartScoreMetrics({
      partNumber: 4,
      scoringV2Enabled: true,
      useOpenInputUi: false,
      openQuestionNumbers: [],
      openChecks: {},
      groupedAnswers: Array.from({ length: 6 }, (_, i) => ({
        questionNumber: i + 1,
        options: [{ id: `ok-${i}`, correcta: true }],
      })),
      checkedQuestions: Object.fromEntries(
        Array.from({ length: 6 }, (_, i) => [`p::q::extra-${i}`, true]),
      ),
      selectedOptions: Object.fromEntries(
        Array.from({ length: 6 }, (_, i) => [`p::q::extra-${i}`, `ok-${i}`]),
      ),
      getQuestionKey: (_p, _qn, fb) => `p::q::${fb}`,
      partId: 'p',
    });
    assert.ok(m.questionsAnswered <= m.totalQuestions);
    assert.equal(m.questionsAnswered, 6);
    assert.equal(m.totalQuestions, 6);
  });

  it('no NaN with zero answered items', () => {
    const m = computeB2PartScoreMetrics({
      partNumber: 5,
      scoringV2Enabled: true,
      useOpenInputUi: false,
      openQuestionNumbers: [],
      openChecks: {},
      groupedAnswers: Array.from({ length: 6 }, (_, i) => ({
        questionNumber: i + 1,
        options: [{ id: `ok-${i}`, correcta: true }],
      })),
      checkedQuestions: {},
      selectedOptions: {},
      getQuestionKey: (_p, _qn, fb) => `p::q::${fb}`,
      partId: 'p',
    });
    assert.equal(m.pointsEarned, 0);
    assert.equal(m.questionsAnswered, 0);
    assert.ok(Number.isFinite(m.accuracyByPoints));
    assert.equal(m.accuracyByPoints, 0);
    assert.ok(Number.isFinite(m.completionPercentage));
  });

  it('Part 8+ persistence not blocked by V2 flag', () => {
    assert.equal(isB2RuoeV2SessionPersistenceBlocked(8, { NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED: 'true' }), false);
    assert.equal(isB2RuoeV2SessionPersistenceBlocked(10, { NEXT_PUBLIC_DRALO_B2_SCORING_V2_ENABLED: 'true' }), false);
  });
});
