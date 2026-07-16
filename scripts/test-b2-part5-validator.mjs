/**
 * Unit tests (sin IA, sin DB) del validador mecánico de B2 Part 5 (multiple choice reading).
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/test-b2-part5-validator.mjs
 */
const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');
const { countWords, analyzePart5Quality } = await import('../src/lib/b2RuoeExamQuality.js');
const { getImprovedPart } = await import('./b2ReadingImprovedContent.mjs');

function makeValidPart5() {
  const base = structuredClone(getImprovedPart(1, 5));
  // Ensure questionType mix + stable A–D key with no 3 consecutive same letter.
  const types = ['inference', 'detail', 'attitude', 'purpose', 'reference', 'global'];
  const answers = ['A', 'B', 'C', 'A', 'D', 'B'];
  base.questions = base.questions.map((q, i) => ({
    ...q,
    number: 31 + i,
    id: q.id || `q${i + 1}`,
    questionType: types[i],
    prompt: q.prompt || q.question || `Question stem ${31 + i}?`,
    evidence: q.evidence || 'Supported by the relevant paragraph.',
    rationale: q.rationale || 'Correct option matches the writer’s meaning; distractors distort it.',
    options: (q.options || []).map((opt, oi) => {
      if (typeof opt === 'string' && /^[A-D]\)/i.test(opt)) return opt;
      const letter = 'ABCD'[oi];
      const text = typeof opt === 'string' ? opt : opt?.text || `Option ${letter}`;
      return `${letter}) ${text.replace(/^[A-D]\)\s*/i, '')}`;
    }),
  }));
  while (base.questions.length < 6) {
    const i = base.questions.length;
    base.questions.push({
      id: `q${i + 1}`,
      number: 31 + i,
      questionType: types[i],
      prompt: `What does the writer suggest in paragraph ${i + 1}?`,
      options: ['A) One idea', 'B) Another idea', 'C) A third idea', 'D) A fourth idea'],
      evidence: 'Paragraph support.',
      rationale: 'B is supported; others overgeneralise.',
    });
  }
  base.questions = base.questions.slice(0, 6);
  base.modelAnswers = answers.map((answer, i) => ({
    id: base.questions[i].id,
    number: 31 + i,
    answer,
  }));
  if (!base.title) base.title = 'Sample Part 5 Title';
  if (!base.directions) {
    base.directions =
      'Read the text and choose the answer (A, B, C or D) which you think fits best according to the text.';
  }
  // Pad/trim passage to stay within 550–650 if needed.
  let wc = countWords(base.passage);
  if (wc < 550) {
    const filler =
      ' Local communities continue to discuss practical solutions, balancing convenience with long-term wellbeing, while researchers note that small everyday choices often matter more than dramatic one-off campaigns.';
    while (countWords(base.passage) < 550) base.passage += filler;
  }
  return base;
}

const cases = [];
function addCase(name, mutate, expectError) {
  cases.push({ name, mutate, expectError });
}

addCase('valid part 5 passes', (g) => g, null);
addCase('5 questions fails', (g) => {
  g.questions = g.questions.slice(0, 5);
  g.modelAnswers = g.modelAnswers.slice(0, 5);
  return g;
}, /exactly 6 questions/);
addCase('question number outside 31–36 fails', (g) => {
  g.questions[0].number = 25;
  return g;
}, /must be 31–36/);
addCase('duplicate question number fails', (g) => {
  g.questions[5].number = 35;
  return g;
}, /duplicate question number/);
addCase('3 options fails', (g) => {
  g.questions[1].options = g.questions[1].options.slice(0, 3);
  return g;
}, /exactly 4 options/);
addCase('missing answer key fails', (g) => {
  g.modelAnswers[2].answer = '';
  return g;
}, /missing valid A–D answer key/);
addCase('passage under 550 fails', (g) => {
  g.passage = 'Too short to be a Part 5 reading text.';
  return g;
}, /minimum is 550/);
addCase('passage over 650 fails', (g) => {
  const filler =
    ' Extra commentary about transport, housing, digital habits, community projects, workplace culture, outdoor spaces, schools, markets, festivals, and long-term planning appears again without changing the tested ideas.';
  while (countWords(g.passage) <= 650) g.passage += filler;
  return g;
}, /maximum is 650/);
addCase('three consecutive same letters fails', (g) => {
  g.modelAnswers = ['A', 'A', 'A', 'B', 'C', 'D'].map((answer, i) => ({
    id: g.questions[i].id,
    number: 31 + i,
    answer,
  }));
  return g;
}, /consecutive/);
addCase('missing title fails', (g) => {
  g.title = '';
  return g;
}, /passage title/);
addCase('placeholder stem fails', (g) => {
  g.questions[0].prompt = 'TODO placeholder question text';
  return g;
}, /placeholder text/);

let failures = 0;
for (const { name, mutate, expectError } of cases) {
  const generated = mutate(structuredClone(makeValidPart5()));
  const result = validateGeneratedExamPart('b2', 5, generated);
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

const gen = makeValidPart5();
const wc = countWords(gen.passage);
console.log(`${wc >= 550 && wc <= 650 ? 'PASS' : 'FAIL'} — fixture word count in range (${wc})`);
if (wc < 550 || wc > 650) failures += 1;

const analysis = analyzePart5Quality(gen);
console.log(
  `${analysis.errors.length === 0 ? 'PASS' : 'FAIL'} — analyzePart5Quality has no hard errors`,
);
if (analysis.errors.length) {
  console.error(analysis.errors);
  failures += 1;
}

console.log(failures === 0 ? '\nAll Part 5 validator tests passed.' : `\n${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
