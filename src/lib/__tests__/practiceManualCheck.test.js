import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  resolvePracticeHideFeedback,
  shouldShowCheckAnswersButton,
  buildBulkAnswerCheckUpdate,
  practiceHasCheckableAnswers,
} from '@/utils/practiceCheckAnswers';

describe('manual checking in paper practice', () => {
  it('shows corrections immediately when instant feedback is on', () => {
    assert.equal(resolvePracticeHideFeedback({ skillPracticeMode: true, instantFeedback: true }), false);
    assert.equal(shouldShowCheckAnswersButton({ skillPracticeMode: true, instantFeedback: true }), false);
  });

  it('waits for Check when instant feedback is off', () => {
    assert.equal(resolvePracticeHideFeedback({ skillPracticeMode: true, instantFeedback: false }), true);
    assert.equal(shouldShowCheckAnswersButton({ skillPracticeMode: true, instantFeedback: false }), true);
    assert.equal(
      resolvePracticeHideFeedback({ skillPracticeMode: true, instantFeedback: false, answersRevealed: true }),
      false,
    );
    assert.equal(
      shouldShowCheckAnswersButton({ skillPracticeMode: true, instantFeedback: false, answersRevealed: true }),
      false,
    );
  });

  it('keeps corrections hidden in a timed exam even if answersRevealed is true', () => {
    assert.equal(resolvePracticeHideFeedback({ hideFeedback: true, answersRevealed: true }), true);
    assert.equal(shouldShowCheckAnswersButton({ skillPracticeMode: true, hideFeedback: true }), false);
  });

  it('preserves corrections in review outside the practice session', () => {
    assert.equal(resolvePracticeHideFeedback({ skillPracticeMode: false }), false);
    assert.equal(shouldShowCheckAnswersButton({ skillPracticeMode: false }), false);
  });

  it('checks the whole attempt, including omitted answers, without changing what the student typed', () => {
    const inputs = { open1: 'right', open2: 'wrong' };
    const options = { mcq4: 'choice-b' };
    const result = buildBulkAnswerCheckUpdate({
      openQuestionNumbers: [1, 2, 3],
      openInputs: inputs,
      openAnswerMap: new Map([[1, new Set(['right'])], [2, new Set(['correct'])], [3, new Set(['missing'])]]),
      getOpenQuestionKey: n => `open${n}`,
      mcqGroups: [{ questionNumber: 0 }, { questionNumber: 4 }, { questionNumber: 5 }],
      getMcqQuestionKey: group => `mcq${group.questionNumber}`,
      selectedOptions: options,
      includeUnanswered: true,
    });
    assert.deepEqual(result.nextOpenChecks, { open1: true, open2: false, open3: false });
    assert.deepEqual(result.nextChecked, { mcq4: true, mcq5: true });
    assert.equal(result.hasAnyAnswer, true);
    assert.deepEqual(inputs, { open1: 'right', open2: 'wrong' });
    assert.deepEqual(options, { mcq4: 'choice-b' });
  });

  it('does not mark empty questions when called without whole-attempt checking', () => {
    const result = buildBulkAnswerCheckUpdate({
      openQuestionNumbers: [1],
      getOpenQuestionKey: n => `open${n}`,
      mcqGroups: [{ questionNumber: 2 }],
      getMcqQuestionKey: () => 'mcq2',
    });
    assert.deepEqual(result.nextOpenChecks, {});
    assert.deepEqual(result.nextChecked, {});
    assert.equal(result.hasAnyAnswer, false);
  });

  it('has no checkable attempt until at least one answer is entered', () => {
    const questions = { openQuestionNumbers: [1], getOpenQuestionKey: n => `open${n}` };
    assert.equal(practiceHasCheckableAnswers(questions), false);
    assert.equal(practiceHasCheckableAnswers({ ...questions, openInputs: { open1: '  ' } }), false);
    assert.equal(practiceHasCheckableAnswers({ ...questions, openInputs: { open1: 'answer' } }), true);
  });
});
