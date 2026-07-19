/**
 * Unit tests (sin IA, sin DB) del validador mecánico estricto de B2 Part 3 (word formation).
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/test-b2-part3-validator.mjs
 */
const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');
const { buildB2EnunciadoFromGenerated } = await import('../src/lib/formatB2Enunciado.js');

function countPart3Words(passage) {
  return String(passage || '')
    .replace(/\(\d+\)\s*(?:_+|\.{2,}|…+)/g, ' ')
    .replace(/\(([A-Z][A-Z-]*)\)/g, ' $1 ')
    .replace(/\([^)]*\)/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function makeValidPart3() {
  const stems = ['FIT', 'STRONG', 'CONFIDENT', 'RELAX', 'RESPONSIBLE', 'COMPETE', 'HEALTH', 'ACTIVE'];
  const answers = [
    'fitness',
    'stronger',
    'confidence',
    'relaxation',
    'responsibility',
    'compete',
    'healthier',
    'active',
  ];
  const passage = `Finding balance outdoors
Many people today are rediscovering the (0) ___ (NATURE) benefits of regular outdoor activity after long hours indoors at desks and screens. Doctors argue that consistent movement improves overall (17) ___ (FIT) and helps maintain (18) ___ (STRONG) muscles throughout adulthood without extreme training plans. Team sports also build (19) ___ (CONFIDENT), while gentle stretching encourages (20) ___ (RELAX) after stressful days at work or college. Coaches insist that (21) ___ (RESPONSIBLE) behaviour matters as much as talent, especially when athletes (22) ___ (COMPETE) in regional events at weekends. Nutrition plays a role too: balanced meals support long-term (23) ___ (HEALTH) and keep teenagers (24) ___ (ACTIVE) without extreme diets or risky supplements. Schools that promote these habits report fewer absences and better concentration in class, although changing routines requires patience from families as well as teachers over several months of practice. Local parks and quiet riverside paths make it easier for busy adults to start small and keep going. Even twenty minutes outdoors most days can improve mood, focus and long-term wellbeing for people of all ages.`;
  return {
    partTitle: 'Part 3: Word formation',
    directions:
      'For questions 17–24, read the text below. Use the word given in capitals at the end of each line to form a word that fits in the gap. There is an example at the beginning (0).',
    example: { number: 0, stem: 'NATURE', answer: 'natural' },
    title: 'Finding balance outdoors',
    passage,
    questions: stems.map((stem, i) => ({
      id: `q${i + 1}`,
      number: 17 + i,
      type: 'word-formation',
      stem,
    })),
    modelAnswers: answers.map((answer, i) => ({
      id: `q${i + 1}`,
      number: 17 + i,
      answer,
    })),
  };
}

const cases = [];

function addCase(name, mutate, expectError) {
  cases.push({ name, mutate, expectError });
}

addCase('valid part 3 passes', (g) => g, null);
addCase('7 questions fails', (g) => {
  g.questions = g.questions.slice(0, 7);
  g.modelAnswers = g.modelAnswers.slice(0, 7);
  g.passage = g.passage.replace('(24) ___ (ACTIVE)', 'active');
  return g;
}, /exactly 8 questions/);
addCase('question number outside 17–24 fails', (g) => {
  g.questions[0].number = 9;
  return g;
}, /must be 17–24/);
addCase('duplicate question number fails', (g) => {
  g.questions[7].number = 23;
  return g;
}, /duplicate question number/);
addCase('A/B/C/D options fail', (g) => {
  g.questions[2].options = ['A) confidence', 'B) confident', 'C) confidently', 'D) confide'];
  return g;
}, /must NOT have A\/B\/C\/D options/);
addCase('missing stem fails', (g) => {
  delete g.questions[1].stem;
  return g;
}, /missing word-formation stem/);
addCase('lowercase stem fails', (g) => {
  g.questions[1].stem = 'strong';
  return g;
}, /must be CAPITAL LETTERS/);
addCase('missing example fails', (g) => {
  delete g.example;
  return g;
}, /must include example/);
addCase('example without stem fails', (g) => {
  delete g.example.stem;
  return g;
}, /example must include stem/);
addCase('example multi-word answer fails', (g) => {
  g.example.answer = 'natural world';
  return g;
}, /example answer must be one derived word/);
addCase('missing gap (0) in passage fails', (g) => {
  g.passage = g.passage.replace('(0) ___ (NATURE)', 'natural');
  return g;
}, /missing example gap \(0\)/);
addCase('missing gap (24) fails', (g) => {
  g.passage = g.passage.replace('(24) ___ (ACTIVE)', 'active');
  return g;
}, /missing gap \(24\)/);
addCase('unexpected gap (25) fails', (g) => {
  g.passage = `${g.passage} Extra (25) ___ (TEST) word.`;
  return g;
}, /unexpected gap numbers: 25|gap \(25\)/);
addCase('multi-word answer fails', (g) => {
  g.modelAnswers[0] = { id: 'q1', answer: 'fit and well' };
  return g;
}, /single derived word/);
addCase('missing title fails', (g) => {
  g.title = '';
  return g;
}, /short text title/);
addCase('passage under 150 words fails', (g) => {
  g.passage = `Short
The (0) ___ (NATURE) park helps (17) ___ (FIT) and (18) ___ (STRONG) work. It builds (19) ___ (CONFIDENT) and (20) ___ (RELAX). Then (21) ___ (RESPONSIBLE) teens (22) ___ (COMPETE) for (23) ___ (HEALTH) and stay (24) ___ (ACTIVE).`;
  return g;
}, /minimum is 150/);
addCase('passage over 200 words fails', (g) => {
  const filler =
    ' Extra commentary about parks, trails, weekend clubs, workplace walking groups, school gardens, outdoor festivals, community sports, cycling routes, weekend markets, and riverside benches appears again without adding new formation gaps.';
  g.passage = `${g.passage}${filler}${filler}${filler}${filler}`;
  return g;
}, /maximum is 200/);
addCase('baseWord alias accepted on question', (g) => {
  g.questions[0] = { ...g.questions[0], baseWord: 'FIT' };
  delete g.questions[0].stem;
  return g;
}, null);

let failures = 0;
for (const { name, mutate, expectError } of cases) {
  const generated = mutate(structuredClone(makeValidPart3()));
  const result = validateGeneratedExamPart('b2', 3, generated);
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

const gen = makeValidPart3();
const wc = countPart3Words(gen.passage);
console.log(`${wc >= 150 && wc <= 180 ? 'PASS' : 'FAIL'} — fixture word count in range (${wc})`);
if (wc < 150 || wc > 180) failures += 1;

const enunciado = buildB2EnunciadoFromGenerated(gen, 3);
const lines = enunciado.split('\n');

function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${ok || !detail ? '' : ` (${detail})`}`);
  if (!ok) failures += 1;
}

check('enunciado starts with Example:', lines[0] === 'Example:');
check('enunciado shows (0) stem line', lines[1] === '(0) ___ (NATURE)');
check('enunciado answer line', lines[2] === 'Answer: 0 → natural');
check('Text line present', lines[3] === 'Text');
check('gap (0) in passage body', /\(0\)\s*_+\s*\(NATURE\)/.test(enunciado));
check(
  'gaps 17–24 in passage body',
  [17, 18, 19, 20, 21, 22, 23, 24].every((n) => enunciado.includes(`(${n}) ___`)),
);

console.log(failures === 0 ? '\nAll Part 3 validator tests passed.' : `\n${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
