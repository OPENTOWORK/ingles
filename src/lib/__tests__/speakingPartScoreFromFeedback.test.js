import test from 'node:test';
import assert from 'node:assert/strict';
import { speakingProgressFromFeedbackReport } from '../speakingPartScoreFromFeedback.js';

test('speakingProgressFromFeedbackReport uses B2 holistic score when present', () => {
  const progress = speakingProgressFromFeedbackReport(
    {
      b2Speaking: { total: 42, maxTotal: 60, criteria: [], estimatedLevel: 'B2' },
      criteria: [],
      correctedVersion: '',
      modelAnswer: '',
      shortExplanation: '',
    },
    { total: 5, passing: 3 },
  );
  assert.equal(progress?.correct, 42);
  assert.equal(progress?.total, 60);
  assert.equal(progress?.passed, true);
});

test('speakingProgressFromFeedbackReport falls back to legacy criteria average', () => {
  const progress = speakingProgressFromFeedbackReport(
    {
      criteria: [
        { criterion: 'Grammar', score: 3, errors: [] },
        { criterion: 'Vocabulary', score: 3, errors: [] },
        { criterion: 'Fluency', score: 3, errors: [] },
      ],
      correctedVersion: '',
      modelAnswer: '',
      shortExplanation: '',
    },
    { total: 5, passing: 3 },
  );
  assert.equal(progress?.correct, 3);
  assert.equal(progress?.total, 5);
  assert.equal(progress?.passed, true);
});
