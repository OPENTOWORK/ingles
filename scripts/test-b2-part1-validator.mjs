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
  const passage = `Finding the right routine
Many people find it hard to (0) ___ time for exercise when work and family fill every hour of the day. Experts say we must (1) ___ a balance between effort and rest if we want habits that last for years. Those who are (2) ___ in sports tend to (3) ___ their fitness gradually, which is a (4) ___ habit rather than a sudden change. Making a good (5) ___ early helps you (6) ___ a decision that is (7) ___ recommended by coaches and brings a clear (8) ___ over time. In practice, short sessions several times a week usually beat rare long workouts that leave people exhausted. Friends can help keep you accountable, but the key is choosing activities you enjoy enough to repeat without constant pressure. With patience and a realistic plan, most adults can build routines that support both energy and calm in everyday life. Small improvements each month matter more than dramatic starts that disappear after two weeks of busy schedules and travel.`;
  return {
    partTitle: 'Part 1: Multiple-choice cloze',
    directions:
      'For questions 1–8, read the text below and choose the best word (A, B, C or D) for each gap. There is an example at the beginning (0).',
    title: 'Finding the right routine',
    passage,
    example: {
      number: 0,
      options: ['A) find', 'B) spend', 'C) make', 'D) take'],
      answer: 'A',
    },
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
addCase('9 questions fails', (g) => {
  g.questions.push({
    id: 'q9',
    number: 9,
    type: 'mcq',
    options: ['A) one', 'B) two', 'C) three', 'D) four'],
  });
  g.modelAnswers.push({ id: 'q9', answer: 'A' });
  g.passage = `${g.passage} Extra (9) ___ word.`;
  return g;
}, /question number must be 1–8|unexpected gap numbers|gap \(9\)/);
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
addCase('passage missing example gap (0) fails', (g) => {
  g.passage = g.passage.replace('(0) ___', 'find');
  return g;
}, /missing example gap \(0\)/);
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
addCase('degenerate answer key is rebalanced to max 3 per letter', (g) => {
  g.modelAnswers = g.modelAnswers.map((m) => ({ ...m, answer: 'B' }));
  return g;
}, null);
addCase('example in questions[] fails', (g) => {
  g.questions.unshift({
    id: 'q0',
    number: 0,
    type: 'mcq',
    options: ['A) find', 'B) spend', 'C) make', 'D) take'],
  });
  return g;
}, /scored questions must be 1–8|exactly 8 questions/);
addCase('example answer letter required', (g) => {
  g.example.answer = '';
  return g;
}, /example must include answer letter/);
addCase('example multi-word option fails', (g) => {
  g.example.options[1] = 'B) spend time';
  return g;
}, /example option .* must be one word only/);
addCase('passage over 180 words fails', (g) => {
  const filler =
    ' Extra detail about schedules, commuting, family duties and weekend plans appears again and again in surveys of busy adults who want healthier lifestyles yet struggle to protect free time.';
  // Pad until clearly above 180 words while keeping gaps intact.
  while (
    g.passage.replace(/\(\d+\)\s*_+/g, ' ').split(/\s+/).filter(Boolean).length < 194
  ) {
    g.passage += filler;
  }
  return g;
}, /maximum is 180/);
addCase('passage under 150 words fails', (g) => {
  g.passage = `Short text (0) ___ (1) ___ (2) ___ (3) ___ (4) ___ (5) ___ (6) ___ (7) ___ (8) ___ end.`;
  return g;
}, /minimum is 150/);

let failures = 0;
for (const { name, mutate, expectError } of cases) {
  const generated = mutate(structuredClone(makeValidPart1()));
  const result = validateGeneratedExamPart('b2', 1, generated);
  let pass;
  if (expectError === null) {
    pass = result.ok;
    if (name.includes('rebalanced')) {
      const letters = (result.normalized?.modelAnswers || []).map((m) =>
        String(m.answer || '')
          .match(/^[A-D]/i)?.[0]
          ?.toUpperCase(),
      );
      const counts = {};
      letters.forEach((l) => {
        if (l) counts[l] = (counts[l] || 0) + 1;
      });
      const max = Math.max(0, ...Object.values(counts));
      if (max > 3) {
        pass = false;
        console.error(`  rebalance left a letter with ${max} answers: ${JSON.stringify(counts)}`);
      }
    }
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
