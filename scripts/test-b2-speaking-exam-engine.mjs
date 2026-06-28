import test from 'node:test';
import assert from 'node:assert/strict';
import { getB2SpeakingExamBySlot } from '../src/data/b2-speaking-exams/index.ts';
import {
  createB2ExamEngineState,
  advanceEngineAfterCandidate,
  formatB2ExamTranscript,
  getExamScript,
  isExamFullyComplete,
} from '../src/features/speaking/domain/b2-speaking-exam-engine.ts';

test('B2 exam bank has 4-part script without GPT', () => {
  const exam = getB2SpeakingExamBySlot(1);
  const script = getExamScript(exam);
  assert.ok(script.length >= 10);
  assert.ok(exam.part1_questions.length >= 4);
  assert.ok(exam.part3.partnerLines.length >= 2);
});

test('formatB2ExamTranscript labels parts and roles', () => {
  const exam = getB2SpeakingExamBySlot(1);
  const text = formatB2ExamTranscript(
    [
      { partNumber: 1, turnIndex: 0, speakerRole: 'examiner', text: 'Hello?' },
      { partNumber: 1, turnIndex: 1, speakerRole: 'candidate', text: 'Hi, I am Ana.' },
    ],
    exam,
    [1],
  );
  assert.match(text, /Part 1 - Interview/);
  assert.match(text, /Examiner: Hello/);
  assert.match(text, /Candidate: Hi/);
});

test('engine completes after all candidate turns', () => {
  const exam = getB2SpeakingExamBySlot(1);
  let state = createB2ExamEngineState(exam.id);
  let guard = 0;
  while (!isExamFullyComplete(state) && guard < 30) {
    state = advanceEngineAfterCandidate(exam, {
      ...state,
      candidateTurnCount: state.candidateTurnCount + 1,
    });
    guard += 1;
  }
  assert.equal(isExamFullyComplete(state), true);
});
