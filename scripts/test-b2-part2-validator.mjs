/**
 * Unit tests (sin IA, sin DB) del validador mecánico estricto de B2 Part 2 (open cloze)
 * y del builder de enunciado (ejemplo separado del texto).
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/test-b2-part2-validator.mjs
 */
const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');
const { buildB2EnunciadoFromGenerated } = await import('../src/lib/formatB2Enunciado.js');
const {
  composeOpenClozeDirections,
  extractOpenClozeExampleBlock,
  extractLegacyPart2InlineExample,
} = await import('../src/utils/b2ExamPaperShared.js');

function makeValidPart2() {
  const answers = ['from', 'to', 'on', 'with', 'to', 'out', 'on', 'to'];
  const passage = `Teamwork matters in modern workplaces and classrooms alike. When projects grow complex, groups can benefit (9) ___ sharing skills that no individual possesses alone. Collaborative tasks often lead (10) ___ stronger results when members listen carefully and respect different viewpoints. Disagreements may arise, so teams must work (11) ___ them constructively rather than avoiding difficult conversations. Clear communication is vital (12) ___ success, especially when deadlines approach quickly. Each person should carry (13) ___ their responsibilities reliably, even when tasks seem routine. Colleagues need to depend (14) ___ one another during busy periods and share feedback honestly. Trust grows when people support (15) ___ each other openly instead of competing for recognition. In the long term, cooperation can lead (16) ___ better outcomes for everyone involved.`;
  return {
    partTitle: 'Reading and Use of English Part 2',
    directions:
      'For questions 9–16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap. There is an example at the beginning (0).',
    example: {
      number: 0,
      sentence: 'She is fond (0) ___ travelling by train.',
      answer: 'of',
      explanation: 'the adjective "fond" takes the dependent preposition "of"',
    },
    title: 'The Value of Teamwork',
    passage,
    questions: answers.map((_, i) => ({ id: `q${i + 1}`, number: 9 + i, type: 'short' })),
    modelAnswers: answers.map((w, i) => ({ id: `q${i + 1}`, answer: w })),
  };
}

const cases = [];

function addCase(name, mutate, expectError) {
  cases.push({ name, mutate, expectError });
}

addCase('valid part 2 passes', (g) => g, null);
addCase('7 questions fails', (g) => {
  g.questions = g.questions.slice(0, 7);
  g.modelAnswers = g.modelAnswers.slice(0, 7);
  g.passage = g.passage.replace('(16) ___', 'to');
  return g;
}, /exactly 8 questions/);
addCase('question number outside 9–16 fails', (g) => {
  g.questions[0].number = 1;
  return g;
}, /must be 9–16/);
addCase('duplicate question number fails', (g) => {
  g.questions[7].number = 15;
  return g;
}, /duplicate question number/);
addCase('A/B/C/D options fail (not Part 1)', (g) => {
  g.questions[2].options = ['A) on', 'B) in', 'C) at', 'D) for'];
  return g;
}, /must NOT have A\/B\/C\/D options/);
addCase('missing example fails', (g) => {
  delete g.example;
  return g;
}, /separate example sentence/);
addCase('example without (0) gap fails', (g) => {
  g.example.sentence = 'She lives in Madrid.';
  return g;
}, /must contain a real gap/);
addCase('example with multi-word answer fails', (g) => {
  g.example.answer = 'of the';
  return g;
}, /example answer must be one word/);
addCase('gap (0) inside passage fails', (g) => {
  g.passage = `Many people now prefer to explore a region (0) ___ bicycle. ${g.passage}`;
  return g;
}, /must NOT contain the example gap \(0\)/);
addCase('letter "(o)" typo inside passage fails', (g) => {
  g.passage = g.passage.replace('(9) ___', '(o) ___ (9) ___');
  return g;
}, /contains "\(o\)" with the letter o/);
addCase('missing gap (16) fails', (g) => {
  g.passage = g.passage.replace('(16) ___', 'to');
  return g;
}, /missing gap \(16\)/);
addCase('unexpected gap number fails', (g) => {
  g.passage = g.passage.replace('In the long term,', 'Before that (17) ___. In the long term,');
  return g;
}, /unexpected gap numbers: 17/);
addCase('missing answer key entry fails', (g) => {
  g.modelAnswers = g.modelAnswers.slice(0, 7);
  return g;
}, /missing answer key/);
addCase('multi-word answer fails', (g) => {
  g.modelAnswers[3] = { id: 'q4', answer: 'in spite' };
  return g;
}, /ONE word with no spaces/);
addCase('empty answer fails', (g) => {
  g.modelAnswers[5] = { id: 'q6', answer: '   ' };
  return g;
}, /missing answer key/);
addCase('missing title fails', (g) => {
  g.title = '';
  return g;
}, /short text title/);
addCase('missing passage fails', (g) => {
  g.passage = '';
  return g;
}, /must include a passage/);

let failures = 0;
for (const { name, mutate, expectError } of cases) {
  const generated = mutate(structuredClone(makeValidPart2()));
  const result = validateGeneratedExamPart('b2', 2, generated);
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

/* ---------- enunciado builder: Example separado antes de "Text" ---------- */

const gen = makeValidPart2();
const enunciado = buildB2EnunciadoFromGenerated(gen, 2);
const lines = enunciado.split('\n');

function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${ok || !detail ? '' : ` (${detail})`}`);
  if (!ok) failures += 1;
}

check('enunciado starts with Example: block', lines[0] === 'Example:');
check(
  'example sentence with (0) gap present',
  lines[1].includes('(0) ___') && lines[1].includes('fond'),
);
check('example answer line uses "Answer: 0 → of"', lines[2] === 'Answer: 0 → of');
check('Text line separates example from passage', lines[3] === 'Text');
check('title after Text', lines[4] === 'The Value of Teamwork');
const textoPart = lines.slice(4).join('\n');
check('no (0) gap inside the main text', !/\(0\)\s*_+/.test(textoPart));

/* ---------- composeOpenClozeDirections (UI) ---------- */

const legacyDesc = `Part 2: Open Cloze
For questions 9–16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap. There is an example at the beginning (0).

Example:
She lives in Madrid.
0 → of`;

const composedLegacy = composeOpenClozeDirections(legacyDesc, 'Text\nOld Title\nOld passage (9) ___ here.');
check(
  'legacy broken example (no gap) is stripped from directions',
  !composedLegacy.includes('She lives in Madrid'),
  composedLegacy,
);
check('legacy directions keep the Part 2 instructions', composedLegacy.includes('For questions 9–16'));

const composedNew = composeOpenClozeDirections(legacyDesc, enunciado);
check(
  'new question example replaces the broken one',
  composedNew.includes('She is fond (0) ___ travelling by train.') &&
    !composedNew.includes('She lives in Madrid'),
  composedNew,
);
check('extractOpenClozeExampleBlock requires a real (0) gap', extractOpenClozeExampleBlock(legacyDesc) === '');

/* ---------- extractLegacyPart2InlineExample (limpieza UI de pasajes antiguos) ---------- */

const legacyTexto = `The Benefits of Spending Time Outdoors
In today's modern world, many people spend most (0) ___ their time indoors, often in front of screens. However, research shows that spending time outside can be beneficial. People who go (9) ___ walks often feel better.`;

const legacy = extractLegacyPart2InlineExample(legacyTexto);
check('legacy: detects inline (0) example', legacy != null);
check(
  'legacy: extracts the full example sentence',
  legacy?.exampleSentence === "In today's modern world, many people spend most (0) ___ their time indoors, often in front of screens.",
  legacy?.exampleSentence,
);
check(
  'legacy: cleaned text keeps the rest of the paragraph',
  legacy?.cleanedTexto.includes('However, research shows') && !/\(0\)/.test(legacy?.cleanedTexto || ''),
  legacy?.cleanedTexto,
);
check('legacy: title line preserved', legacy?.cleanedTexto.startsWith('The Benefits of Spending Time Outdoors'));

const letterO = extractLegacyPart2InlineExample('Title\nPeople travel (o) ___ bicycle. They like (9) ___ explore.');
check(
  'legacy: letter "(o)" typo also extracted',
  letterO != null && !/\(\s*[oO]\s*\)/.test(letterO?.cleanedTexto || ''),
  letterO?.cleanedTexto,
);
check('legacy: returns null when no (0) marker', extractLegacyPart2InlineExample('Title\nClean text (9) ___ here.') === null);

console.log(failures === 0 ? '\nAll Part 2 validator tests passed.' : `\n${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
