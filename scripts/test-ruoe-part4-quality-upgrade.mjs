/**
 * Regression tests for Part 4 Blueprint Engine quality upgrade (v1.1).
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/test-ruoe-part4-quality-upgrade.mjs
 */
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';
import { validatePart4Quality } from '../src/lib/ruoePart4Quality.js';
import { gradeB2KeyWordTransformation } from '../src/lib/gradeB2KeyWordTransformation.js';

function meta(keyword, fullAnswers, mp1, mp2, labels = ['mp1', 'mp2']) {
  return {
    type: 'b2_key_word_transformation',
    version: 1,
    keyword,
    fullAnswers,
    markingPoints: [
      { id: 1, label: labels[0], accepted: mp1 },
      { id: 2, label: labels[1], accepted: mp2 },
    ],
  };
}

function makeValidPart4() {
  const items = [
    {
      number: 25,
      sentence1: 'It is not necessary for you to use a password every time.',
      keyword: 'NEED',
      sentence2Start: 'You __________________ a password every time.',
      answer: 'do not need to use',
      grading_metadata: meta(
        'NEED',
        ['do not need to use', "don't need to use"],
        ['do not need', "don't need"],
        ['to use'],
        ['negative need structure', 'infinitive complement'],
      ),
    },
    {
      number: 26,
      sentence1: 'I did not intend to delete the file.',
      keyword: 'MEAN',
      sentence2Start: 'I __________________ the file.',
      answer: "didn't mean to delete",
      grading_metadata: meta(
        'MEAN',
        ["didn't mean to delete", 'did not mean to delete'],
        ["didn't mean", 'did not mean'],
        ['to delete'],
        ['negative past with MEAN', 'infinitive pattern'],
      ),
    },
    {
      number: 27,
      sentence1: 'The exam was less difficult than I expected.',
      keyword: 'AS',
      sentence2Start: 'The exam __________________ I expected.',
      answer: 'was not as hard as',
      grading_metadata: meta(
        'AS',
        ['was not as hard as', "wasn't as hard as"],
        ['was not', "wasn't"],
        ['as hard as'],
        ['negative past be', 'comparative as ... as'],
      ),
    },
    {
      number: 28,
      sentence1: 'She has never visited Rome before.',
      keyword: 'HAD',
      sentence2Start: 'Never before __________________ Rome.',
      answer: 'had she visited',
      grading_metadata: meta(
        'HAD',
        ['had she visited'],
        ['had she'],
        ['visited'],
        ['inverted past perfect', 'main verb'],
      ),
    },
    {
      number: 29,
      sentence1: 'People say that the museum opens at nine.',
      keyword: 'THOUGHT',
      sentence2Start: 'The museum __________________ at nine.',
      answer: 'is thought to open',
      grading_metadata: meta(
        'THOUGHT',
        ['is thought to open'],
        ['is thought'],
        ['to open'],
        ['passive reporting', 'infinitive complement'],
      ),
    },
    {
      number: 30,
      sentence1: 'I am excited about hearing from you soon.',
      keyword: 'FORWARD',
      sentence2Start: 'I am __________________ from you soon.',
      answer: 'looking forward to hearing',
      grading_metadata: meta(
        'FORWARD',
        ['looking forward to hearing'],
        ['looking forward'],
        ['to hearing'],
        ['phrasal look forward', 'gerund complement'],
      ),
    },
  ];

  return {
    partTitle: 'Part 4: Key word transformations',
    directions:
      'For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between two and five words, including the word given. There is an example at the beginning (0).',
    example: {
      number: 0,
      sentence1: 'You must do the washing-up tonight.',
      keyword: 'HAVE',
      sentence2Start: 'You __________________ the washing-up tonight.',
      answer: 'have to do',
    },
    questions: items.map((item, i) => ({
      id: `q${i + 1}`,
      type: 'transformation',
      ...item,
    })),
    modelAnswers: items.map((item, i) => ({
      id: `q${i + 1}`,
      number: item.number,
      answer: item.answer,
    })),
  };
}

function makeTrivialPart4() {
  const base = makeValidPart4();
  const trivial = [
    { s1: 'The car is red.', kw: 'RED', s2: 'The car is __________________.', ans: 'very red' },
    { s1: 'She is happy today.', kw: 'HAPPY', s2: 'She is __________________ today.', ans: 'very happy' },
    { s1: 'The book is good.', kw: 'GOOD', s2: 'The book is __________________.', ans: 'very good' },
    { s1: 'He is tall.', kw: 'TALL', s2: 'He is __________________.', ans: 'quite tall' },
    { s1: 'It is cold.', kw: 'COLD', s2: 'It is __________________.', ans: 'very cold' },
    { s1: 'The soup is hot.', kw: 'HOT', s2: 'The soup is __________________.', ans: 'very hot' },
  ];
  base.questions.forEach((q, i) => {
    const t = trivial[i];
    q.sentence1 = t.s1;
    q.keyword = t.kw;
    q.sentence2Start = t.s2;
    q.answer = t.ans;
    q.grading_metadata = meta(t.kw, [t.ans], [t.ans.split(' ')[0]], [t.ans.split(' ').slice(1).join(' ')]);
    base.modelAnswers[i].answer = t.ans;
  });
  return base;
}

function makeShortAnswersPart4() {
  const base = makeValidPart4();
  const shorts = ['was late', 'is happy', 'got tired', 'felt ill', 'felt sad', 'was angry'];
  const keywords = ['LATE', 'HAPPY', 'TIRED', 'ILL', 'SAD', 'ANGRY'];
  base.questions.forEach((q, i) => {
    const ans = shorts[i];
    q.keyword = keywords[i];
    q.answer = ans;
    q.sentence1 = `After the long meeting everyone ${ans.replace('was ', '').replace('is ', '')}.`;
    q.sentence2Start = `Everyone __________________ after the meeting.`;
    q.grading_metadata = meta(keywords[i], [ans], [ans.split(' ')[0]], [ans.split(' ').slice(1).join(' ')]);
    base.modelAnswers[i].answer = ans;
  });
  return base;
}

function findingIds(result) {
  return (result.findings || []).map((f) => f.rule_id);
}

function assertFinding(name, fn, ruleId, { hard = false } = {}) {
  const result = fn();
  const ids = findingIds(result);
  const pass = ids.includes(ruleId);
  if (!pass) {
    console.error(`FAIL ${name}: expected finding ${ruleId}, got ${ids.join(', ') || 'none'}`);
    process.exitCode = 1;
    return;
  }
  if (hard && !result.hardFails?.length) {
    console.error(`FAIL ${name}: expected HARD_FAIL severity for ${ruleId}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS ${name}`);
}

function assertNoFinding(name, fn, ruleId) {
  const result = fn();
  const ids = findingIds(result);
  if (ids.includes(ruleId)) {
    console.error(`FAIL ${name}: unexpected finding ${ruleId}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS ${name}`);
}

function assertHardPass(name, fn) {
  const result = fn();
  if (!result.ok) {
    console.error(`FAIL ${name}: expected HARD pass\n${result.errors.join('\n')}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS ${name}`);
}

function assertHardFail(name, fn) {
  const result = fn();
  if (result.ok) {
    console.error(`FAIL ${name}: expected HARD validation failure`);
    process.exitCode = 1;
    return;
  }
  console.log(`PASS ${name}`);
}

// --- Positive baseline ---
assertHardPass('valid Part 4 passes mechanical validation', () =>
  validateGeneratedExamPart('b2', 4, makeValidPart4()),
);

const validQuality = validatePart4Quality(makeValidPart4());
if (validQuality.hardFails.length) {
  console.error('FAIL valid Part 4 has no HARD quality fails:', validQuality.hardFails);
  process.exitCode = 1;
} else {
  console.log('PASS valid Part 4 has no HARD quality fails');
}

// --- TEST-P4-TOO-EASY ---
assertFinding(
  'TEST-P4-TOO-EASY part-level',
  () => validatePart4Quality(makeTrivialPart4()),
  'TEST-P4-TOO-EASY',
);

// --- TEST-P4-LOW-TRANSFORMATION-DISTANCE ---
assertFinding(
  'TEST-P4-LOW-TRANSFORMATION-DISTANCE part-level',
  () => validatePart4Quality(makeTrivialPart4()),
  'TEST-P4-LOW-TRANSFORMATION-DISTANCE',
);

// --- TEST-P4-UNNATURAL-SENTENCE ---
const unnatural = makeValidPart4();
unnatural.questions[0].sentence1 = 'Please to send the form today.';
unnatural.questions[0].sentence2Start = 'Please __________________ the form today.';
unnatural.questions[0].answer = 'please to send';
unnatural.questions[0].grading_metadata = meta('PLEASE', ['please to send'], ['please'], ['to send']);
unnatural.modelAnswers[0].answer = 'please to send';
assertFinding('TEST-P4-UNNATURAL-SENTENCE', () => validatePart4Quality(unnatural), 'TEST-P4-UNNATURAL-SENTENCE');

// --- TEST-P4-INCOMPLETE-CONTEXT ---
const incomplete = makeValidPart4();
incomplete.questions[1].sentence1 = 'After considering all the options, Sarah finally decided.';
assertFinding(
  'TEST-P4-INCOMPLETE-CONTEXT',
  () => validatePart4Quality(incomplete),
  'TEST-P4-INCOMPLETE-CONTEXT',
);

// --- TEST-P4-METADATA-MISMATCH (HARD) ---
const metaMismatch = makeValidPart4();
metaMismatch.questions[2].target_structure = 'very few / hardly any equivalence';
metaMismatch.questions[2].answer = 'few students came';
metaMismatch.questions[2].sentence2Start = '__________________ students came.';
metaMismatch.questions[2].grading_metadata = meta(
  'FEW',
  ['few students came'],
  ['few students'],
  ['came'],
  ['quantifier few', 'main verb'],
);
metaMismatch.modelAnswers[2].answer = 'few students came';
metaMismatch.questions[2].keyword = 'FEW';
assertFinding(
  'TEST-P4-METADATA-MISMATCH HARD',
  () => validatePart4Quality(metaMismatch),
  'P4-METADATA-MISMATCH',
  { hard: true },
);
assertHardFail('TEST-P4-METADATA-MISMATCH blocks validation', () =>
  validateGeneratedExamPart('b2', 4, metaMismatch),
);

// --- TEST-P4-MARKING-POINT-MISMATCH (HARD) ---
const mpMismatch = makeValidPart4();
const mpQ30 = mpMismatch.questions.find((q) => q.number === 30);
mpQ30.keyword = 'FEW';
mpQ30.sentence1 = 'Only a small number of people attended.';
mpQ30.sentence2Start = '__________________ people attended.';
mpQ30.answer = 'very few';
mpQ30.grading_metadata = meta(
  'FEW',
  ['very few'],
  ['very'],
  ['few'],
  ['hardly any quantifier', 'plural noun'],
);
mpMismatch.modelAnswers[5].answer = 'very few';
assertFinding(
  'TEST-P4-MARKING-POINT-MISMATCH HARD',
  () => validatePart4Quality(mpMismatch),
  'P4-MARKING-POINT-MISMATCH',
  { hard: true },
);

// --- TEST-P4-VALID-CONTRACTION ---
const contraction = makeValidPart4();
contraction.questions[0].sentence1 = 'You need not have brought your passport.';
contraction.questions[0].keyword = 'NEED';
contraction.questions[0].sentence2Start = 'You __________________ your passport.';
contraction.questions[0].answer = 'need not have brought';
contraction.questions[0].grading_metadata = meta(
  'NEED',
  ['need not have brought', "needn't have brought"],
  ['need not', "needn't"],
  ['have brought'],
  ['negative need', 'perfect infinitive'],
);
contraction.modelAnswers[0].answer = 'need not have brought';
const contractionGrade = gradeB2KeyWordTransformation("needn't have brought", contraction.questions[0].grading_metadata);
if (contractionGrade.score !== 2) {
  console.error('FAIL contraction variant grades 2/2');
  process.exitCode = 1;
} else {
  console.log('PASS contraction variant grades 2/2');
}
assertNoFinding(
  'TEST-P4-VALID-CONTRACTION no missing-pair quality fail',
  () => validatePart4Quality(contraction),
  'TEST-P4-VALID-CONTRACTION',
);

// --- TEST-P4-INVALID-VARIANT ---
const invalidVariant = makeValidPart4();
invalidVariant.questions[0].grading_metadata.fullAnswers = ['do not need to use', 'must have used'];
assertFinding(
  'TEST-P4-INVALID-VARIANT HARD',
  () => validatePart4Quality(invalidVariant),
  'TEST-P4-INVALID-VARIANT',
  { hard: true },
);

// --- TEST-P4-ALTERNATIVE-ROUTE (HARD distinct routes in fullAnswers) ---
const altRoute = makeValidPart4();
altRoute.questions[4].grading_metadata.fullAnswers = ['is thought to open', 'opens at nine'];
assertFinding(
  'TEST-P4-ALTERNATIVE-ROUTE HARD',
  () => validatePart4Quality(altRoute),
  'TEST-P4-ALTERNATIVE-ROUTE',
  { hard: true },
);

// --- TEST-P4-ANSWER-LENGTH-DISTRIBUTION ---
assertFinding(
  'TEST-P4-ANSWER-LENGTH-DISTRIBUTION',
  () => validatePart4Quality(makeShortAnswersPart4()),
  'TEST-P4-ANSWER-LENGTH-DISTRIBUTION',
);

// --- Missing contraction pair quality hint ---
const missingContraction = makeValidPart4();
missingContraction.questions[0].sentence1 = 'You need not have brought your passport.';
missingContraction.questions[0].keyword = 'NEED';
missingContraction.questions[0].sentence2Start = 'You __________________ your passport.';
missingContraction.questions[0].answer = 'need not have brought';
missingContraction.questions[0].grading_metadata = meta(
  'NEED',
  ['need not have brought'],
  ['need not'],
  ['have brought'],
);
missingContraction.modelAnswers[0].answer = 'need not have brought';
assertFinding(
  'missing contraction pair QUALITY',
  () => validatePart4Quality(missingContraction),
  'TEST-P4-VALID-CONTRACTION',
);

console.log(
  process.exitCode ? '\nPart 4 quality upgrade tests FAILED.' : '\nAll Part 4 quality upgrade tests passed.',
);
