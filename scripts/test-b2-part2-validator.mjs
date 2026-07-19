/**
 * Unit tests (sin IA, sin DB) del validador mecánico estricto de B2 Part 2 (open cloze)
 * y del builder de enunciado (ejemplo 0 + pasaje con (0)).
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
  const answers = ['who', 'have', 'to', 'although', 'their', 'on', 'enough', 'for'];
  // ~160 words excluding gap markers (validated by b2CountWords).
  const passage = `Finding time outdoors
Many people spend most (0) ___ their free hours indoors, often looking at screens after a long day at work. Research shows that even short walks can improve mood, especially among adults (9) ___ live in busy cities with little green space. Doctors often say that people who (10) ___ already adopted outdoor habits sleep better and feel calmer during the week. Families may decide (11) ___ visit a park together on Sundays rather than stay at home. (12) ___ the weather is cold, warm clothes make the outing pleasant for children and adults alike. Neighbours sometimes organise shared activities so that (13) ___ local streets feel safer and more welcoming. Local councils also put pressure (14) ___ businesses to create outdoor seating and plant trees. With (15) ___ planning and a little motivation, most residents can build routines that support both energy and calm. Small improvements each month matter more than dramatic starts that disappear after two weeks of travel or heavy schedules (16) ___ people at the office.`;
  return {
    partTitle: 'Part 2: Open cloze',
    directions:
      'For questions 9–16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap. There is an example at the beginning (0).',
    example: {
      number: 0,
      answer: 'of',
    },
    title: 'Finding time outdoors',
    passage,
    questions: answers.map((_, i) => ({ id: `q${i + 1}`, number: 9 + i, type: 'short' })),
    modelAnswers: answers.map((w, i) => ({ id: `q${i + 1}`, number: 9 + i, answer: w })),
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
  g.passage = g.passage.replace('(16) ___', 'enough');
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
}, /must include example/);
addCase('example with multi-word answer fails', (g) => {
  g.example.answer = 'of the';
  return g;
}, /example answer must be one word/);
addCase('missing gap (0) in passage fails', (g) => {
  g.passage = g.passage.replace('(0) ___', 'of');
  return g;
}, /missing example gap \(0\)/);
addCase('letter "(o)" typo inside passage fails', (g) => {
  g.passage = g.passage.replace('(9) ___', '(o) ___ (9) ___');
  return g;
}, /contains "\(o\)" with the letter o/);
addCase('missing gap (16) fails', (g) => {
  g.passage = g.passage.replace('(16) ___', 'enough');
  return g;
}, /missing gap \(16\)/);
addCase('unexpected gap number fails', (g) => {
  g.passage = g.passage.replace('Small improvements', 'Before that (17) ___. Small improvements');
  return g;
}, /unexpected gap numbers: 17|gap \(17\)/);
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
addCase('passage under 150 words fails', (g) => {
  g.passage = `Short title
People spend most (0) ___ their free hours indoors. Adults (9) ___ live in cities can (10) ___ already noticed benefits. They decide (11) ___ walk more. (12) ___ it rains, they still go out. Neighbours share (13) ___ ideas and put pressure (14) ___ councils. With (15) ___ effort, habits last (16) ___ for years.`;
  return g;
}, /minimum is 150/);
addCase('passage over 200 words fails', (g) => {
  const filler =
    ' Extra detail about parks, trees, benches, cycling routes, weekend markets, outdoor cafes, community gardens, school trips, workplace walking clubs, and seasonal festivals appears again and again in every paragraph without adding new grammar gaps.';
  g.passage = `${g.passage}${filler}${filler}${filler}`;
  return g;
}, /maximum is 200/);

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

/* ---------- enunciado builder: Example answer + Text with (0) ---------- */

const gen = makeValidPart2();
const enunciado = buildB2EnunciadoFromGenerated(gen, 2);
const lines = enunciado.split('\n');

function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${ok || !detail ? '' : ` (${detail})`}`);
  if (!ok) failures += 1;
}

check('enunciado starts with Example: block', lines[0] === 'Example:');
check('example answer line uses "Answer: 0 → of"', lines[1] === 'Answer: 0 → of');
check('Text line separates example from passage', lines[2] === 'Text');
check('title after Text', lines[3] === 'Finding time outdoors');
const textoPart = lines.slice(3).join('\n');
check('gap (0) present inside the main text', /\(0\)\s*_+/.test(textoPart));
check('scored gaps 9–16 present in text', [9, 10, 11, 12, 13, 14, 15, 16].every((n) => textoPart.includes(`(${n}) ___`)));

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
  'answer-only example block does not reintroduce broken legacy sentence',
  !composedNew.includes('She lives in Madrid') && composedNew.includes('For questions 9–16'),
  composedNew,
);
check(
  'enunciado itself keeps Answer: 0 → of',
  enunciado.includes('Answer: 0 → of'),
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
