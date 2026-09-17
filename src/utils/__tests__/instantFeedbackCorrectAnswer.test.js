import test from 'node:test';
import assert from 'node:assert/strict';
import { formatEnglishAnswerForDisplay } from '@/utils/b2ExamPaperShared';
import { resolveInstantFeedbackCorrectAnswer } from '@/utils/buildOpenGapExplanationEntries';
import { getOpenAnswerMap } from '@/utils/b2ExamPaperShared';

test('formatEnglishAnswerForDisplay capitalizes standalone pronoun i', () => {
  assert.equal(formatEnglishAnswerForDisplay('wish i had told him'), 'wish I had told him');
  assert.equal(formatEnglishAnswerForDisplay('I had told him'), 'I had told him');
  assert.equal(formatEnglishAnswerForDisplay('in time'), 'in time');
});

test('resolveInstantFeedbackCorrectAnswer prefers raw DB casing over normalized map', () => {
  const openAnswerMap = getOpenAnswerMap([{ respuesta_texto: '25 wish I had told him' }]);
  const display = resolveInstantFeedbackCorrectAnswer(25, openAnswerMap, {
    openAnswerRows: [{ respuesta_texto: '25 wish I had told him' }],
  });
  assert.equal(display, 'wish I had told him');
  assert.ok(openAnswerMap.get(25)?.has('wish i had told him'));
});

test('resolveInstantFeedbackCorrectAnswer falls back to formatted normalized map', () => {
  const openAnswerMap = getOpenAnswerMap([{ respuesta_texto: '25 wish I had told him' }]);
  const display = resolveInstantFeedbackCorrectAnswer(25, openAnswerMap);
  assert.equal(display, 'wish I had told him');
});
