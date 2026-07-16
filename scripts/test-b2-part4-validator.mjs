/**
 * Unit tests (sin IA, sin DB) del validador mecánico estricto de B2 Part 4
 * (key word transformations + grading_metadata).
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/test-b2-part4-validator.mjs
 */
const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');
const { buildB2EnunciadoFromGenerated } = await import('../src/lib/formatB2Enunciado.js');
const { gradeB2KeyWordTransformation } = await import('../src/lib/gradeB2KeyWordTransformation.js');

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

const cases = [];
function addCase(name, mutate, expectError) {
  cases.push({ name, mutate, expectError });
}

addCase('valid part 4 passes', (g) => g, null);
addCase('5 questions fails', (g) => {
  g.questions = g.questions.slice(0, 5);
  g.modelAnswers = g.modelAnswers.slice(0, 5);
  return g;
}, /exactly 6 questions/);
addCase('question number outside 25–30 fails', (g) => {
  g.questions[0].number = 17;
  return g;
}, /must be 25–30/);
addCase('duplicate question number fails', (g) => {
  g.questions[5].number = 29;
  return g;
}, /duplicate question number/);
addCase('missing example fails', (g) => {
  delete g.example;
  return g;
}, /must include example item 0/);
addCase('lowercase keyword fails', (g) => {
  g.questions[0].keyword = 'need';
  return g;
}, /must be CAPITAL LETTERS/);
addCase('repeated keyword fails', (g) => {
  g.questions[1].keyword = 'NEED';
  g.questions[1].grading_metadata.keyword = 'NEED';
  g.questions[1].answer = 'do not need to delete';
  g.questions[1].grading_metadata.fullAnswers = ['do not need to delete'];
  g.modelAnswers[1].answer = 'do not need to delete';
  return g;
}, /repeated keyword/);
addCase('answer over 5 Cambridge words fails', (g) => {
  g.questions[0].answer = 'do not really need to use it';
  g.modelAnswers[0].answer = 'do not really need to use it';
  g.questions[0].grading_metadata.fullAnswers = ['do not really need to use it'];
  return g;
}, /2–5 Cambridge words/);
addCase('answer missing keyword fails', (g) => {
  g.questions[0].answer = 'do not have to use';
  g.modelAnswers[0].answer = 'do not have to use';
  g.questions[0].grading_metadata.fullAnswers = ['do not have to use'];
  return g;
}, /must contain keyword/);
addCase('missing grading_metadata fails', (g) => {
  delete g.questions[2].grading_metadata;
  return g;
}, /missing grading_metadata/);
addCase('one marking point fails', (g) => {
  g.questions[0].grading_metadata.markingPoints = [
    { id: 1, label: 'only one', accepted: ['do not need'] },
  ];
  return g;
}, /markingPoints must contain exactly 2/);
addCase('fullAnswer not scoring 2/2 fails', (g) => {
  g.questions[0].grading_metadata.markingPoints[1].accepted = ['to eat'];
  return g;
}, /does not score 2\/2/);
addCase('missing sentence1 fails', (g) => {
  g.questions[3].sentence1 = '';
  return g;
}, /missing sentence1/);
addCase('missing gap in sentence2 fails', (g) => {
  g.questions[4].sentence2Start = 'The museum opens at nine.';
  return g;
}, /must contain a gap/);
addCase('A/B/C/D options fail', (g) => {
  g.questions[0].options = ['A) a', 'B) b', 'C) c', 'D) d'];
  return g;
}, /must NOT have A\/B\/C\/D options/);

let failures = 0;
for (const { name, mutate, expectError } of cases) {
  const generated = mutate(structuredClone(makeValidPart4()));
  const result = validateGeneratedExamPart('b2', 4, generated);
  let pass;
  if (expectError === null) {
    pass = result.ok;
    if (!pass) console.error(`  errors: ${JSON.stringify(result.errors, null, 2)}`);
  } else {
    pass = !result.ok && result.errors.some((e) => expectError.test(e));
    if (!pass) console.error(`  expected /${expectError.source}/ in: ${JSON.stringify(result.errors)}`);
  }
  console.log(`${pass ? 'PASS' : 'FAIL'} — ${name}`);
  if (!pass) failures += 1;
}

const gen = makeValidPart4();
const enunciado = buildB2EnunciadoFromGenerated(gen, 4);

function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${ok || !detail ? '' : ` (${detail})`}`);
  if (!ok) failures += 1;
}

check('enunciado includes Example block', enunciado.includes('Example:'));
check('enunciado includes example answer', enunciado.includes('Answer: 0 → have to do'));
check('enunciado includes Questions', enunciado.includes('Questions'));
check('enunciado includes Q25–30 numbers', [25, 26, 27, 28, 29, 30].every((n) => enunciado.includes(`${n}.`)));

const sampleMeta = gen.questions[0].grading_metadata;
const grade = gradeB2KeyWordTransformation(gen.questions[0].answer, sampleMeta);
check('sample metadata grades primary answer as 2/2', grade.score === 2, String(grade.score));

console.log(failures === 0 ? '\nAll Part 4 validator tests passed.' : `\n${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
