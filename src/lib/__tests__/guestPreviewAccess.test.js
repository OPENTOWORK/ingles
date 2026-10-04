import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getGuestRegisterHref,
  isGuestBrowsablePath,
  isGuestExamPracticeLockedHref,
  isGuestExamSlotAllowed,
  isGuestExamStrategiesChapterAllowed,
  isGuestTrainingLevelAllowed,
  isGuestTrainingNodeAllowed,
} from '@/lib/guestPreviewAccess';

test('guest can open practice, strategies, training and pricing', () => {
  assert.equal(isGuestBrowsablePath('/exam-practice/b2/'), true);
  assert.equal(isGuestBrowsablePath('/exam-strategies/writing'), true);
  assert.equal(isGuestBrowsablePath('/training/level-1'), true);
  assert.equal(isGuestBrowsablePath('/precios'), true);
  assert.equal(isGuestBrowsablePath('/dralo-ai'), false);
});

test('exam strategies preview is overall + part 1 only', () => {
  assert.equal(isGuestExamStrategiesChapterAllowed('/exam-strategies'), true);
  assert.equal(
    isGuestExamStrategiesChapterAllowed('/exam-strategies/reading-and-use-of-english'),
    true,
  );
  assert.equal(
    isGuestExamStrategiesChapterAllowed(
      '/exam-strategies/reading-and-use-of-english/overall-strategy',
    ),
    true,
  );
  assert.equal(
    isGuestExamStrategiesChapterAllowed(
      '/exam-strategies/exam-part-tips/b2/reading-and-use-of-english/part-1',
    ),
    true,
  );
  assert.equal(
    isGuestExamStrategiesChapterAllowed(
      '/exam-strategies/exam-part-tips/b2/reading-and-use-of-english/part-2',
    ),
    false,
  );
  assert.equal(
    isGuestExamStrategiesChapterAllowed('/exam-strategies/writing/part-2-review'),
    false,
  );
});

test('exam practice locks exam mode, quiz game and slots after 1', () => {
  assert.equal(isGuestExamPracticeLockedHref('/exam-practice/b2/exam-mode'), true);
  assert.equal(isGuestExamPracticeLockedHref('/exam-practice/b2/quiz-game'), false);
  assert.equal(isGuestExamPracticeLockedHref('/exam-practice/b2/exam-writing'), false);
  assert.equal(isGuestExamPracticeLockedHref('/niveles/b2/exam-listening'), false);
  assert.equal(isGuestExamPracticeLockedHref('/niveles/b1/exam-listening'), true);
  assert.equal(isGuestExamPracticeLockedHref('/niveles/c1/exam-writing'), true);
  assert.equal(isGuestExamPracticeLockedHref('/exam-practice/b2/reading-and-use-of-english'), false);
  assert.equal(isGuestExamPracticeLockedHref('/exam-strategies/writing'), false);
  assert.equal(isGuestExamSlotAllowed(1), true);
  assert.equal(isGuestExamSlotAllowed(2), false);
});

test('training preview is only path level 1', () => {
  assert.equal(isGuestTrainingLevelAllowed(1), true);
  assert.equal(isGuestTrainingLevelAllowed(2), false);
  assert.equal(isGuestTrainingNodeAllowed('level-1'), true);
  assert.equal(isGuestTrainingNodeAllowed('level-2'), false);
  assert.equal(isGuestTrainingNodeAllowed('review-1'), false);
  assert.match(getGuestRegisterHref('/training/level-2'), /next=/);
});
