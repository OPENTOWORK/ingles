import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TEACHER_REPAIR_SCOPES,
  applyTeacherRepairPlan,
  buildPart1DistractorOnlyPatch,
  classifyTeacherRepairScope,
  createTeacherRepairPlan,
} from '../ruoeNaturalnessFirstV2/teacherRepair.js';
import {
  judgePart1Substitutions,
  judgePart3Derivation,
} from '../ruoeNaturalnessFirstV2/judgements.js';

function examFixture(partNumber = 1) {
  return {
    id: 'exam-101',
    version: 'v1',
    partNumber,
    passage: 'Original passage.',
    questions: [
      {
        id: 'q1',
        number: 1,
        sentence: 'The change had an effect on staff.',
        options: ['effect', 'impact', 'result', 'outcome'],
        answer: 'effect',
      },
      {
        id: 'q2',
        number: 2,
        sentence: 'This question must not change.',
        options: ['one', 'two', 'three', 'four'],
        answer: 'one',
      },
    ],
  };
}

const passValidator = async () => ({ verdict: 'PASS', reason: 'Revalidated.' });

test('teacher comments select the smallest repair scope', () => {
  assert.equal(
    classifyTeacherRepairScope({ partNumber: 1, teacherComment: 'Impact is another valid option; this is ambiguous.' }).scope,
    TEACHER_REPAIR_SCOPES.DISTRACTOR_ONLY,
  );
  assert.equal(
    classifyTeacherRepairScope({ partNumber: 2, teacherComment: 'The answer key is wrong.' }).scope,
    TEACHER_REPAIR_SCOPES.KEY_METADATA,
  );
  assert.equal(
    classifyTeacherRepairScope({ partNumber: 3, teacherComment: 'This base word is not in the same word family.' }).scope,
    TEACHER_REPAIR_SCOPES.TARGET_REPLACEMENT,
  );
  assert.equal(
    classifyTeacherRepairScope({ partNumber: 4, teacherComment: 'The completed transformation loses meaning.' }).scope,
    TEACHER_REPAIR_SCOPES.TRANSFORMATION_REBUILD,
  );
  assert.equal(
    classifyTeacherRepairScope({ partNumber: 2, teacherComment: 'The sentence around this gap is unnatural.' }).scope,
    TEACHER_REPAIR_SCOPES.LOCAL_CONTEXT,
  );
});

test('key-only correction creates a new version and preserves every unrelated question', async () => {
  const exam = examFixture(2);
  const original = structuredClone(exam);
  const plan = createTeacherRepairPlan({
    exam,
    examId: exam.id,
    sourceVersion: exam.version,
    partNumber: 2,
    questionNumber: 1,
    teacherComment: 'The answer key is wrong.',
    currentAnswer: 'effect',
  });
  const result = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: { answer: 'impact' },
    newVersion: 'v2-teacher-1',
    validatorsByPart: { 2: passValidator },
  });
  assert.equal(result.status, 'PASS');
  assert.equal(result.acceptedExam.version, 'v2-teacher-1');
  assert.equal(result.acceptedExam.derivedFromVersion, 'v1');
  assert.equal(result.acceptedExam.questions[0].answer, 'impact');
  assert.deepEqual(result.acceptedExam.questions[1], original.questions[1]);
  assert.deepEqual(exam, original);
  assert.equal(result.changeRecord.repairClassification, TEACHER_REPAIR_SCOPES.KEY_METADATA);
});

test('key repair synchronises a separate modelAnswers record used by real exam payloads', async () => {
  const exam = examFixture(3);
  exam.questions[0] = {
    id: 'q22',
    number: 22,
    stem: 'EQUAL',
    transformationFamily: 'prefix',
  };
  exam.modelAnswers = [
    { id: 'q22', number: 22, answer: 'unequal', transformationFamily: 'prefix' },
    { id: 'q23', number: 23, answer: 'unfair', transformationFamily: 'prefix' },
  ];
  const untouchedAnswer = structuredClone(exam.modelAnswers[1]);
  const plan = createTeacherRepairPlan({
    exam,
    partNumber: 3,
    questionNumber: 22,
    teacherComment: 'The answer key is wrong.',
    currentAnswer: 'unequal',
  });
  const result = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: { answer: 'equal' },
    validatorsByPart: { 3: passValidator },
  });

  assert.equal(result.status, 'PASS');
  assert.equal(result.candidateExam.modelAnswers[0].answer, 'equal');
  assert.deepEqual(result.candidateExam.modelAnswers[1], untouchedAnswer);
});

test('distractor-only repair cannot rewrite the sentence', async () => {
  const exam = examFixture(1);
  const plan = createTeacherRepairPlan({
    exam,
    partNumber: 1,
    questionNumber: 1,
    teacherComment: 'Effect and impact are both valid options.',
  });
  const rejected = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: {
      sentence: 'A different sentence.',
      options: ['effect', 'influence', 'result', 'outcome'],
    },
    validatorsByPart: { 1: passValidator },
  });
  assert.equal(rejected.status, 'PIPELINE_FAIL');

  let validated = false;
  const repaired = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: { options: ['effect', 'influence', 'result', 'outcome'] },
    validatorsByPart: {
      1: async ({ question }) => {
        validated = true;
        assert.equal(question.sentence, exam.questions[0].sentence);
        return { verdict: 'PASS', reason: 'All four substitutions checked.' };
      },
    },
  });
  assert.equal(repaired.status, 'PASS');
  assert.equal(validated, true);
  assert.deepEqual(repaired.candidateExam.questions[1], exam.questions[1]);
});

test('Part 1 replaces only the known surviving distractor and leaves one survivor', () => {
  const options = ['A) strong', 'B) powerful', 'C) certain', 'D) positive'];
  const before = [
    { letter: 'A', grammatical: true, naturalBritishEnglish: true, semanticallyDefensible: true, collocationallyValid: true, contextuallyDefensible: true },
    { letter: 'B', grammatical: true, naturalBritishEnglish: false, semanticallyDefensible: false, collocationallyValid: false, contextuallyDefensible: false },
    { letter: 'C', grammatical: true, naturalBritishEnglish: false, semanticallyDefensible: false, collocationallyValid: false, contextuallyDefensible: false },
    { letter: 'D', grammatical: true, naturalBritishEnglish: true, semanticallyDefensible: true, collocationallyValid: true, contextuallyDefensible: true },
  ];
  const patch = buildPart1DistractorOnlyPatch({
    options,
    judgements: before,
    keyLetter: 'D',
    replacementWord: 'limited',
  });
  assert.equal(patch.status, 'PASS');
  assert.equal(patch.targetLetter, 'A');
  assert.deepEqual(patch.proposedQuestion.options, ['A) limited', 'B) powerful', 'C) certain', 'D) positive']);
  assert.equal(buildPart1DistractorOnlyPatch({
    options,
    judgements: before,
    keyLetter: 'D',
    replacementWord: 'powerful',
  }).status, 'HARD_FAIL');

  const after = before.map((row) => row.letter === 'A'
    ? { ...row, semanticallyDefensible: false, contextuallyDefensible: false }
    : row);
  assert.equal(judgePart1Substitutions(after).verdict, 'PASS');
});

test('Part 3 target replacement changes only the targeted question', async () => {
  const exam = examFixture(3);
  exam.questions[0] = {
    id: 'q17',
    number: 17,
    sentence: 'The committee reached a ________.',
    stem: 'DECIDE',
    answer: 'decision-making',
  };
  exam.questions[1].number = 18;
  const untouched = structuredClone(exam.questions[1]);
  const plan = createTeacherRepairPlan({
    exam,
    partNumber: 3,
    questionNumber: 17,
    teacherComment: 'The derivation adds another lexical root and the target must change.',
  });
  const result = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: {
      id: 'q17',
      number: 17,
      sentence: 'The committee reached a ________.',
      stem: 'DECIDE',
      answer: 'decision',
    },
    validatorsByPart: { 3: passValidator },
  });
  assert.equal(result.status, 'PASS');
  assert.equal(result.candidateExam.questions[0].answer, 'decision');
  assert.deepEqual(result.candidateExam.questions[1], untouched);
});

test('Part 3 target replacement may change one local sentence and base without touching neighbours', async () => {
  const exam = {
    id: 'exam-16',
    version: 'pre-patch',
    passage: 'Sleep supports better (17) ___ (DECIDE) during the day. It also has serious (18) ___ (CONSEQUENT).',
    questions: [
      { id: 'q17', number: 17, type: 'word-formation', stem: 'DECIDE', transformationFamily: 'adjective' },
      { id: 'q18', number: 18, type: 'word-formation', stem: 'CONSEQUENT', transformationFamily: 'noun' },
    ],
    modelAnswers: [
      { id: 'q17', number: 17, answer: 'decision-making', transformationFamily: 'adjective' },
      { id: 'q18', number: 18, answer: 'consequences', transformationFamily: 'noun' },
    ],
  };
  const neighbour = structuredClone(exam.questions[1]);
  const neighbourAnswer = structuredClone(exam.modelAnswers[1]);
  const plan = createTeacherRepairPlan({
    exam,
    partNumber: 3,
    questionNumber: 17,
    teacherComment: 'The target and base word force an invalid compound derivation.',
    currentAnswer: 'decision-making',
  });
  const result = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: {
      ...exam.questions[0],
      stem: 'PERFORM',
      answer: 'performance',
      transformationFamily: 'noun',
    },
    localPassageEdit: {
      original: 'Sleep supports better (17) ___ (DECIDE) during the day.',
      revised: 'Sleep supports better daytime (17) ___ (PERFORM).',
    },
    validatorsByPart: {
      3: async ({ question }) => judgePart3Derivation({
        stem: question.stem,
        answer: question.answer,
        lexicalFamilyValidation: {
          sameLexicalFamily: true,
          extraLexicalRootIntroduced: false,
          directDerivation: true,
          legitimateBase: true,
          reason: 'PERFORM and performance are direct members of one lexical family.',
        },
      }),
    },
  });

  assert.equal(result.status, 'PASS');
  assert.match(result.acceptedExam.passage, /daytime \(17\) ___ \(PERFORM\)/);
  assert.match(result.acceptedExam.passage, /serious \(18\) ___ \(CONSEQUENT\)/);
  assert.deepEqual(result.acceptedExam.questions[1], neighbour);
  assert.deepEqual(result.acceptedExam.modelAnswers[1], neighbourAnswer);
  assert.equal(result.acceptedExam.modelAnswers[0].answer, 'performance');
});

test('Part 3 local-context repair preserves EQUAL to unequal while removing contradictory framing', async () => {
  const originalSentence = 'However, experts warn that progress is not always (22) ___ (EQUAL) across a city.';
  const revisedSentence = 'However, experts warn that progress can be (22) ___ (EQUAL) across a city.';
  const exam = {
    id: 'exam-11',
    version: 'pre-patch',
    passage: `This kind of participation often leads to stronger communities. ${originalSentence} Poorer areas may receive less investment.`,
    questions: [
      { id: 'q21', number: 21, stem: 'PARTICIPATE', transformationFamily: 'noun' },
      { id: 'q22', number: 22, stem: 'EQUAL', transformationFamily: 'prefix' },
      { id: 'q23', number: 23, stem: 'FAIR', transformationFamily: 'prefix' },
    ],
    modelAnswers: [
      { id: 'q21', number: 21, answer: 'participation' },
      { id: 'q22', number: 22, answer: 'unequal' },
      { id: 'q23', number: 23, answer: 'unfair' },
    ],
  };
  const neighbours = structuredClone([exam.questions[0], exam.questions[2]]);
  const plan = createTeacherRepairPlan({
    exam,
    partNumber: 3,
    questionNumber: 22,
    teacherComment: 'The local negative framing makes the stored answer contradict the intended meaning.',
    currentAnswer: 'unequal',
  });
  assert.equal(plan.classification.scope, TEACHER_REPAIR_SCOPES.LOCAL_CONTEXT);

  const result = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: { answer: 'unequal' },
    localPassageEdit: { original: originalSentence, revised: revisedSentence },
    validatorsByPart: {
      3: async () => judgePart3Derivation({
        stem: 'EQUAL',
        answer: 'unequal',
        lexicalFamilyValidation: {
          sameLexicalFamily: true,
          extraLexicalRootIntroduced: false,
          directDerivation: true,
          legitimateBase: true,
          reason: 'UNEQUAL is the direct negative-prefix derivative of EQUAL.',
        },
      }),
    },
  });

  assert.equal(result.status, 'PASS');
  assert.match(result.acceptedExam.passage, /progress can be \(22\) ___ \(EQUAL\)/);
  assert.equal(result.acceptedExam.modelAnswers[1].answer, 'unequal');
  assert.deepEqual([result.acceptedExam.questions[0], result.acceptedExam.questions[2]], neighbours);
});

test('Part 4 route replacement preserves identity and is revalidated', async () => {
  const exam = examFixture(4);
  exam.questions[0] = {
    id: 'q25',
    number: 25,
    sentence1: 'The bus arrived late because of traffic.',
    keyword: 'DUE',
    sentence2Start: 'The bus arrived late ________ traffic.',
    answer: 'due to',
  };
  exam.questions[1].number = 26;
  let validatorInput;
  const plan = createTeacherRepairPlan({
    exam,
    partNumber: 4,
    questionNumber: 25,
    teacherComment: 'The transformation route loses part of the meaning.',
  });
  const result = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: {
      id: 'q25',
      number: 25,
      sentence1: 'Traffic caused the bus to arrive late.',
      keyword: 'DUE',
      sentence2Start: 'The bus arrived late ________ traffic.',
      answer: 'due to',
      transformationFamily: 'TF-CAUSE',
    },
    validatorsByPart: {
      4: async (input) => {
        validatorInput = input;
        return { verdict: 'PASS', reason: 'Mechanics and exact equivalence pass.' };
      },
    },
  });
  assert.equal(result.status, 'PASS');
  assert.equal(result.candidateExam.questions[0].number, 25);
  assert.equal(validatorInput.question.answer, 'due to');
  assert.equal(result.changeRecord.repairClassification, TEACHER_REPAIR_SCOPES.TRANSFORMATION_REBUILD);
});

test('failed revalidation keeps the repaired candidate unaccepted', async () => {
  const exam = examFixture(1);
  const plan = createTeacherRepairPlan({
    exam,
    partNumber: 1,
    questionNumber: 1,
    teacherComment: 'Two options are valid.',
  });
  const result = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: { options: ['effect', 'impact', 'result', 'outcome'] },
    validatorsByPart: {
      1: async () => ({ verdict: 'QUALITY_FAIL', reason: 'Effect and impact still survive.' }),
    },
  });
  assert.equal(result.status, 'QUALITY_FAIL');
  assert.equal(result.acceptedExam, null);
  assert.ok(result.candidateExam);
  assert.equal(result.changeRecord.finalStatus, 'QUALITY_FAIL');
});

test('repair cannot be accepted without the Part validator', async () => {
  const exam = examFixture(2);
  const plan = createTeacherRepairPlan({
    exam,
    partNumber: 2,
    questionNumber: 1,
    teacherComment: 'The answer key is wrong.',
  });
  const result = await applyTeacherRepairPlan({
    plan,
    proposedQuestion: { answer: 'impact' },
    validatorsByPart: {},
  });
  assert.equal(result.status, 'PIPELINE_FAIL');
  assert.equal(result.acceptedExam, undefined);
});
