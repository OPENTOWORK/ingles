import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { B1_READING_RULES_VERSION } from '@/lib/b1ReadingRules';
import {
  B1_READING_MOTOR_VERSION,
  createFileB1MotorStore,
  createMemoryB1MotorStore,
  runB1ReadingMotor,
} from '@/lib/b1ReadingMotorRun';
import { assessB1PartReview, classifyB1ReviewMessage } from '@/lib/b1ReadingReviewWorkflow';
import {
  loadB1TeacherReviewPackage,
  renderB1TeacherReviewXml,
  writeB1TeacherReviewDocx,
} from '@/lib/b1TeacherReviewDocument';

const quiet = { log() {}, error() {} };

function completion(value) {
  return {
    text: JSON.stringify(value),
    model: 'gpt-4o',
    usage: { input_tokens: 24, output_tokens: 16, total_tokens: 40 },
  };
}

function isReviewCall(options) {
  const blob = `${options?.system || ''}\n${(options?.messages || []).map((message) => message?.content || '').join('\n')}`;
  return /WITHOUT trusting/i.test(blob);
}

function validPart1() {
  return {
    directions: 'For each question, choose the correct answer.',
    questions: Array.from({ length: 5 }, (_, index) => ({
      id: `q${index + 1}`,
      number: index + 1,
      text: `Message ${index + 1}: Please check the details before Friday.`,
      prompt: 'What should the reader do?',
      options: ['A) Check the information.', 'B) Ignore the message.', 'C) Wait until next month.'],
    })),
    modelAnswers: Array.from({ length: 5 }, (_, index) => ({ id: `q${index + 1}`, number: index + 1, answer: 'A' })),
  };
}

function passReview() {
  return {
    answers: [1, 2, 3, 4, 5].map((number) => ({ number, letter: 'A' })),
    ambiguousItems: [],
    weakDistractors: [],
    literalSolveItems: [],
    itemEvidence: [1, 2, 3, 4, 5].map((number) => ({
      number,
      paraphrased: true,
      grounded: true,
      options: ['A', 'B', 'C'].map((letter) => ({
        letter,
        plausible: true,
        reason: letter === 'A' ? 'paraphrases the main message' : 'misreads one detail that the text does contain',
      })),
    })),
    issues: [],
    verdict: 'pass',
  };
}

async function runMotor(extra = {}) {
  const store = extra.store || createMemoryB1MotorStore();
  const result = await runB1ReadingMotor({
    examSlot: 4,
    store,
    reportDir: fs.mkdtempSync(path.join(os.tmpdir(), 'b1-review-')),
    partNumbers: extra.partNumbers || [1],
    dryRun: false,
    spendCapUsd: 50,
    maxElapsedMs: 60_000,
    maxAttemptsPerPart: extra.maxAttemptsPerPart || 4,
    sameCategoryLimit: 2,
    maxConsecutiveNoProgress: 3,
    sleep: async () => {},
    logger: quiet,
    chooseVariety: async () => ({ topic: 'a library visit', context: 'notice', grammarFocus: null }),
    mockModel: extra.mockModel,
  });
  return { result, store };
}

test('critical findings and pedagogical warnings stay separate', () => {
  assert.equal(classifyB1ReviewMessage('B1 weak distractor Q1 C: the text never mentions payment.'), 'warning');
  assert.equal(classifyB1ReviewMessage('B1 Q2 is solvable by copying wording: the correct option is not a paraphrase.'), 'warning');
  assert.equal(classifyB1ReviewMessage('B1 Q3 is an explicit statement of the writer\'s feeling.'), 'warning');
  assert.equal(classifyB1ReviewMessage('B1 Part 4 gap 18 has weak cohesion but only one sentence fits.'), 'warning');
  assert.equal(classifyB1ReviewMessage('B1 ambiguity Q1: two options express the text equally well'), 'critical');
  assert.equal(classifyB1ReviewMessage('B1 Part 2 unsupported requirement Q7: weekend.'), 'critical');
  assert.equal(classifyB1ReviewMessage('B1 Part 4 gap 16 fits more than one sentence.'), 'critical');
  assert.equal(classifyB1ReviewMessage('B1 review evidence is missing for Q21.'), 'critical');
  assert.equal(classifyB1ReviewMessage('B1 Q12 review is inconclusive.'), 'critical');
  assert.equal(classifyB1ReviewMessage('B1 Reading Part 1 must have exactly 5 questions (got 0).'), 'invalid');

  const warningOnly = assessB1PartReview({
    partNumber: 1,
    generated: validPart1(),
    errors: ['B1 weak distractor Q1 C: the text never mentions payment.'],
  });
  assert.equal(warningOnly.reviewStatus, 'teacher_review_draft');
  assert.equal(warningOnly.automatedValidation, 'not_approved');
  assert.equal(warningOnly.humanTeacherApproved, false);
  assert.equal(warningOnly.critical.length, 0);
  assert.equal(warningOnly.pedagogicalWarnings.length, 1);

  const ambiguous = assessB1PartReview({
    partNumber: 1,
    generated: validPart1(),
    errors: ['B1 ambiguity Q1: more than one answer is defensible'],
  });
  assert.equal(ambiguous.reviewStatus, 'teacher_review_draft');
  assert.equal(ambiguous.reviewStatus === 'validated_candidate', false);
  assert.equal(ambiguous.automatedValidation, 'not_approved');
  assert.equal(ambiguous.teacherApproval, 'pending');
  assert.equal(ambiguous.humanTeacherApproved, false);
  assert.match(ambiguous.critical.join(' '), /defensible/);

  const broken = assessB1PartReview({
    partNumber: 1,
    generated: { questions: [], modelAnswers: [] },
    errors: ['B1 Reading Part 1 must have exactly 5 questions (got 0).'],
  });
  assert.equal(broken.reviewStatus, 'invalid');
});

test('a teacher-review draft is stored apart from the validated cache', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b1-draft-store-'));
  const store = createFileB1MotorStore(dir);
  const payload = {
    partNumber: 1,
    rulesVersion: B1_READING_RULES_VERSION,
    reviewStatus: 'teacher_review_draft',
    automatedValidation: 'not_approved',
    teacherApproval: 'pending',
    humanTeacherApproved: false,
    generated: validPart1(),
    critical: [],
    pedagogicalWarnings: ['B1 weak distractor Q1 C: the text never mentions payment.'],
    validation: {
      ok: false,
      reviewStatus: 'teacher_review_draft',
      automatedValidation: 'not_approved',
      teacherApproval: 'pending',
      errors: [],
      warnings: ['B1 weak distractor Q1 C: the text never mentions payment.'],
    },
  };
  await store.saveTeacherReviewDraft(4, B1_READING_MOTOR_VERSION, 1, payload);
  const saved = await store.getTeacherReviewDraft(4, B1_READING_MOTOR_VERSION, 1);
  assert.equal(saved.payload.generated.questions.length, 5);
  assert.equal(saved.payload.generated.modelAnswers[0].answer, 'A');
  assert.equal(saved.payload.reviewStatus, 'teacher_review_draft');
  assert.equal(await store.getCachedPart(4, B1_READING_MOTOR_VERSION, 1), null);
  assert.equal((await store.listCachedParts()).length, 0);
  assert.equal(fs.existsSync(path.join(dir, 'part-1.json')), false);
  assert.equal(fs.existsSync(path.join(dir, 'part-1.draft.json')), true);
  await assert.rejects(() => store.saveValidatedPart(4, B1_READING_MOTOR_VERSION, 1, payload));

  await store.saveRejectedPart(4, B1_READING_MOTOR_VERSION, 2, {
    partNumber: 2,
    reviewStatus: 'invalid',
    generated: { questions: [] },
    validation: { ok: false, reviewStatus: 'invalid' },
  });
  assert.equal(fs.existsSync(path.join(dir, 'part-2.rejected.json')), true);
  assert.equal(fs.existsSync(path.join(dir, 'part-2.json')), false);
  assert.equal((await store.listCachedParts()).length, 0);
  const loaded = loadB1TeacherReviewPackage(dir, 4);
  assert.equal(loaded.parts.length, 1);
  assert.equal(loaded.parts[0].reviewStatus, 'teacher_review_draft');
  assert.equal(loaded.parts[0].automatedValidation, 'not_approved');
  assert.equal(loaded.teacherApproval, 'pending');
  assert.deepEqual(loaded.missingPartNumbers, [2, 3, 4, 5, 6]);
});

test('a non-critical distractor warning is kept and generation continues', async () => {
  let calls = 0;
  const { result, store } = await runMotor({
    partNumbers: [1, 2],
    mockModel: (options) => {
      calls += 1;
      if (isReviewCall(options)) {
        const review = passReview();
        review.itemEvidence[0].options[2].plausible = false;
        review.itemEvidence[0].options[2].reason = 'the text never mentions next month';
        return completion(review);
      }
      if (calls === 1) return completion(validPart1());
      return completion({ questions: [], modelAnswers: [] });
    },
  });
  assert.equal(result.stopped, true);
  assert.equal(result.report.partNumber, 2);
  assert.deepEqual(result.report.teacherDraftPartNumbers, [1]);
  assert.equal(result.report.preservedPartNumbers.includes(1), false);
  assert.equal(store.parts.size, 0);
  const draft = [...store.drafts.values()][0].payload;
  assert.equal(draft.reviewStatus, 'teacher_review_draft');
  assert.equal(draft.validation.ok, false);
  assert.equal(draft.automatedValidation, 'not_approved');
  assert.equal(draft.teacherApproval, 'pending');
  assert.match(draft.pedagogicalWarnings.join(' '), /weak distractor/);
  assert.equal(draft.critical.length, 0);
  assert.equal(draft.generated.questions.length, 5);
  assert.equal(calls > 2, true);
});

test('a structurally complete but linguistically unresolved draft does not stop the exam', async () => {
  let calls = 0;
  const { result, store } = await runMotor({
    partNumbers: [1, 2],
    mockModel: (options) => {
      calls += 1;
      if (isReviewCall(options)) {
        const review = passReview();
        review.itemEvidence = [];
        return completion(review);
      }
      if (calls === 1) return completion(validPart1());
      return completion({ questions: [], modelAnswers: [] });
    },
  });
  assert.equal(result.stopped, true);
  assert.equal(result.report.partNumber, 2);
  assert.deepEqual(result.report.teacherDraftPartNumbers, [1]);
  assert.equal(store.parts.size, 0);
  const draft = [...store.drafts.values()][0].payload;
  assert.equal(draft.reviewStatus, 'teacher_review_draft');
  assert.equal(draft.validation.ok, false);
  assert.equal(draft.humanTeacherApproved, false);
  assert.match(draft.critical.join(' '), /review evidence is missing/);
  assert.equal(draft.generated.modelAnswers.length, 5);
  assert.equal(calls > 2, true);
});

test('a complete teacher-review document exports every part without claiming approval', () => {
  const parts = [1, 2, 3, 4, 5, 6].map((partNumber) => ({
    partNumber,
    rulesVersion: B1_READING_RULES_VERSION,
    reviewStatus: partNumber === 2 ? 'teacher_review_draft' : 'validated_candidate',
    automatedValidation: partNumber === 2 ? 'not_approved' : 'passed',
    teacherApproval: 'pending',
    humanTeacherApproved: false,
    allocation: { topic: `Topic ${partNumber}` },
    generated: {
      title: `Part ${partNumber} title`,
      passage: `Passage text for part ${partNumber}.`,
      questions: [{ number: partNumber, prompt: `Question prompt ${partNumber}`, text: `Source text ${partNumber}`, options: ['A) First choice', 'B) Second choice'] }],
      modelAnswers: [{ number: partNumber, answer: 'A' }],
    },
    critical: partNumber === 2 ? ['B1 ambiguity Q7: two options are defensible'] : [],
    pedagogicalWarnings: partNumber === 1 ? ['B1 weak distractor Q1 C: too easy'] : [],
  }));
  parts[1].reviewStatus = 'teacher_review_draft';
  const xml = renderB1TeacherReviewXml({
    examSlot: 11,
    rulesVersion: B1_READING_RULES_VERSION,
    parts,
  });
  assert.match(xml, /Rules version: b1-reading-rules-v3/);
  assert.match(xml, /Automated validation: not_approved/);
  assert.match(xml, /Teacher approval: pending/);
  assert.match(xml, /not for publication/);
  assert.match(xml, /A teacher has not approved this exam/);
  for (const partNumber of [1, 2, 3, 4, 5, 6]) {
    assert.match(xml, new RegExp(`Part ${partNumber}`));
    assert.match(xml, new RegExp(`Passage text for part ${partNumber}`));
    assert.match(xml, new RegExp(`Question prompt ${partNumber}`));
    assert.match(xml, new RegExp(`Proposed answer ${partNumber}: A`));
  }
  assert.match(xml, /B1 weak distractor Q1 C: too easy/);
  assert.match(xml, /B1 ambiguity Q7: two options are defensible/);
  assert.equal(xml.includes('Teacher approval: approved'), false);

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'b1-review-docx-'));
  const filePath = writeB1TeacherReviewDocx({ examSlot: 11, rulesVersion: B1_READING_RULES_VERSION, parts }, path.join(dir, 'review.docx'));
  const bytes = fs.readFileSync(filePath);
  assert.equal(bytes.subarray(0, 2).toString(), 'PK');
  const packed = bytes.toString('utf8');
  assert.match(packed, /\[Content_Types\]\.xml/);
  assert.match(packed, /word\/document\.xml/);
  assert.match(packed, /Passage text for part 6/);
  assert.match(packed, /Teacher approval: pending/);
  assert.match(packed, /two options are defensible/);
});
