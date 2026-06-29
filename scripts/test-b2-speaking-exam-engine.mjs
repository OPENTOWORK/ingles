import test from 'node:test';
import assert from 'node:assert/strict';
import { getB2SpeakingExamBySlot, B2_SPEAKING_EXAM_BANK } from '../src/data/b2-speaking-exams/index.ts';
import {
  createB2ExamEngineState,
  advanceEngineAfterCandidate,
  formatB2ExamTranscript,
  getExamScript,
  getPart1QuestionNumberForStep,
  isExamFullyComplete,
  isPart1ToPart2Transition,
  ensurePastPart1IfComplete,
  B2_PART1_QUESTION_COUNT,
} from '../src/features/speaking/domain/b2-speaking-exam-engine.ts';

test('B2 exam bank has 4-part script without GPT', () => {
  const exam = getB2SpeakingExamBySlot(1);
  const script = getExamScript(exam);
  assert.ok(script.length >= 10);
  assert.equal(exam.part1_questions.length, B2_PART1_QUESTION_COUNT);
  assert.ok(exam.part3.partnerLines.length >= 2);
});

test('each exam slot has exactly five varied Part 1 questions', () => {
  for (const exam of B2_SPEAKING_EXAM_BANK) {
    assert.equal(exam.part1_questions.length, 5, `${exam.id} Part 1 count`);
    const unique = new Set(exam.part1_questions.map((q) => q.trim().toLowerCase()));
    assert.equal(unique.size, 5, `${exam.id} Part 1 duplicates`);
  }
});

test('Part 1 question counter tracks candidate turns not total script lines', () => {
  const exam = getB2SpeakingExamBySlot(1);
  let state = createB2ExamEngineState(exam.id);
  assert.equal(getPart1QuestionNumberForStep(exam, state.stepIndex), 1);

  state = advanceEngineAfterCandidate(exam, { ...state, candidateTurnCount: state.candidateTurnCount + 1 });
  assert.equal(state.stepIndex, 1);
  assert.equal(getPart1QuestionNumberForStep(exam, state.stepIndex), 2);
});

test('Part 1 ends after exactly five candidate answers and transitions to Part 2', () => {
  const exam = getB2SpeakingExamBySlot(1);
  let state = createB2ExamEngineState(exam.id);
  let prev = state;
  let part1Answers = 0;

  while (state.partNumber === 1 && part1Answers < 10) {
    const line = getExamScript(exam)[state.stepIndex];
    if (line?.partNumber === 1 && line.awaitCandidate) {
      part1Answers += 1;
      prev = state;
      state = advanceEngineAfterCandidate(exam, {
        ...state,
        candidateTurnCount: state.candidateTurnCount + 1,
      });
      if (part1Answers === B2_PART1_QUESTION_COUNT) {
        assert.equal(isPart1ToPart2Transition(prev, state), true);
        assert.equal(state.partsCompleted.includes(1), true);
        assert.equal(state.partNumber, 2);
        break;
      }
      assert.equal(state.partNumber, 1, `still in Part 1 after answer ${part1Answers}`);
    } else {
      break;
    }
  }

  assert.equal(part1Answers, B2_PART1_QUESTION_COUNT);
});

test('ensurePastPart1IfComplete skips any remaining Part 1 script steps', () => {
  const exam = getB2SpeakingExamBySlot(1);
  let state = createB2ExamEngineState(exam.id);
  state = { ...state, stepIndex: 0, partsCompleted: [1], partNumber: 1 };
  const fixed = ensurePastPart1IfComplete(exam, state);
  assert.equal(fixed.partNumber, 2);
  assert.ok(fixed.stepIndex > 0);
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
