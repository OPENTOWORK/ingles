/**
 * Unit tests (sin IA, sin DB) del validador mecánico estricto de B2 Part 1.
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/test-b2-part1-validator.mjs
 */
const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');

function makeValidPart1() {
  const words = [
    ['strike', 'reach', 'make', 'do'],
    ['interested', 'keen', 'fond', 'enthusiastic'],
    ['raise', 'rise', 'increase', 'grow'],
    ['valuable', 'valued', 'valid', 'worth'],
    ['decision', 'conclusion', 'choice', 'option'],
    ['take', 'make', 'have', 'do'],
    ['highly', 'deeply', 'strongly', 'fully'],
    ['benefit', 'profit', 'advantage', 'gain'],
  ];
  const passage = `Finding the right routine\nMany people find it hard to (0) ___ time for exercise. Experts say we must (1) ___ a balance between work and rest. Those (2) ___ in sports tend to (3) ___ their fitness gradually, which is a (4) ___ habit. Making a good (5) ___ early helps you (6) ___ a decision that is (7) ___ recommended and brings a clear (8) ___ over time.`;
  return {
    partTitle: 'Reading and Use of English Part 1',
    directions: 'For questions 1–8, read the text and decide which answer (A, B, C or D) best fits each gap.',
    title: 'Finding the right routine',
    passage,
    questions: words.map((opts, i) => ({
      id: `q${i + 1}`,
      number: i + 1,
      type: 'mcq',
      options: opts.map((w, oi) => `${'ABCD'[oi]}) ${w}`),
    })),
    modelAnswers: words.map((_, i) => ({ id: `q${i + 1}`, answer: 'ABCD'[i % 4] })),
  };
}

const cases = [];

function addCase(name, mutate, expectError) {
  cases.push({ name, mutate, expectError });
}

addCase('valid part 1 passes', (g) => g, null);
addCase('7 questions fails', (g) => {
  g.questions = g.questions.slice(0, 7);
  g.modelAnswers = g.modelAnswers.slice(0, 7);
  g.passage = g.passage.replace('(8) ___', 'gain');
  return g;
}, /exactly 8 questions/);
addCase('two-word option fails', (g) => {
  g.questions[0].options[1] = 'B) reach out';
  return g;
}, /one word only/);
addCase('duplicate option words fail', (g) => {
  g.questions[2].options[1] = 'B) raise';
  return g;
}, /duplicate option words/i);
addCase('missing answer key entry fails', (g) => {
  g.modelAnswers = g.modelAnswers.slice(0, 7);
  return g;
}, /missing answer key/);
addCase('answer key not A–D fails', (g) => {
  g.modelAnswers[3] = { id: 'q4', answer: 'E' };
  return g;
}, /single letter A–D/);
addCase('passage missing gap (8) fails', (g) => {
  g.passage = g.passage.replace('(8) ___', 'gain');
  return g;
}, /missing gap \(8\)/);
addCase('duplicate question number fails', (g) => {
  g.questions[7].number = 7;
  return g;
}, /duplicate question number/);
addCase('options out of A–D order are reordered', (g) => {
  g.questions[5].options = ['A) take', 'C) make', 'B) have', 'D) do'];
  return g;
}, null);
addCase('empty option fails', (g) => {
  g.questions[1].options[2] = 'C) ';
  return g;
}, /must use the format|is empty/);
addCase('degenerate answer key (6+ same letter) is rebalanced', (g) => {
  g.modelAnswers = g.modelAnswers.map((m) => ({ ...m, answer: 'B' }));
  return g;
}, null);

let failures = 0;
for (const { name, mutate, expectError } of cases) {
  const generated = mutate(structuredClone(makeValidPart1()));
  const result = validateGeneratedExamPart('b2', 1, generated);
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

console.log(failures === 0 ? '\nAll validator tests passed.' : `\n${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
