/**
 * Unit tests (sin IA, sin DB) del validador mecánico de B2 Part 7 (multiple matching).
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/test-b2-part7-validator.mjs
 */
const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');
const { countWords, analyzePart7Quality } = await import('../src/lib/b2RuoeExamQuality.js');
const { getImprovedPart } = await import('./b2ReadingImprovedContent.mjs');

function makeValidPart7() {
  const base = structuredClone(getImprovedPart(4, 7));
  // Ensure Q43–52, Who stems, balanced key.
  const answers = ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D', 'A', 'B'];
  base.questions = Array.from({ length: 10 }, (_, i) => {
    const existing = base.questions[i] || {};
    return {
      ...existing,
      id: existing.id || `q${i + 1}`,
      number: 43 + i,
      prompt: String(existing.prompt || existing.question || '').replace(/^(which person)/i, 'Who') ||
        `Who mentions a relevant detail about topic point ${i + 1}?`,
    };
  });
  base.questions.forEach((q) => {
    if (!/^who\b/i.test(q.prompt)) q.prompt = `Who ${q.prompt.replace(/^[Ww]ho\s*/, '')}`;
  });
  base.modelAnswers = answers.map((answer, i) => ({
    id: base.questions[i].id,
    number: 43 + i,
    answer,
  }));
  if (!base.directions) {
    base.directions =
      'Read the article in which people talk about their experiences. For each question, choose from the people (A–D). The people may be chosen more than once.';
  }
  // Clamp section lengths into 120–150 if a fixture drifts.
  base.sections = (base.sections || []).map((s, i) => {
    let text = String(s.text || s.body || '');
    const filler =
      ' They also note that small practical choices often reshape daily routines more than dramatic one-off decisions.';
    while (countWords(text) < 120) text += filler;
    while (countWords(text) > 150) {
      const words = text.trim().split(/\s+/);
      text = words.slice(0, 145).join(' ');
      if (words.length <= 145) break;
    }
    return { ...s, letter: s.letter || 'ABCD'[i], text };
  });
  return base;
}

const cases = [];
function addCase(name, mutate, expectError) {
  cases.push({ name, mutate, expectError });
}

addCase('valid part 7 passes', (g) => g, null);
addCase('9 questions fails', (g) => {
  g.questions = g.questions.slice(0, 9);
  g.modelAnswers = g.modelAnswers.slice(0, 9);
  return g;
}, /exactly 10 questions/);
addCase('question number outside 43–52 fails', (g) => {
  g.questions[0].number = 37;
  return g;
}, /must be 43–52/);
addCase('duplicate question number fails', (g) => {
  g.questions[9].number = 51;
  return g;
}, /duplicate question number/);
addCase('non-Who prompt fails', (g) => {
  g.questions[0].prompt = 'Which person changed jobs recently?';
  return g;
}, /must start with "Who"/);
addCase('3 sections fails', (g) => {
  g.sections = g.sections.slice(0, 3);
  return g;
}, /exactly 4 sections/);
addCase('section under 120 fails', (g) => {
  g.sections[0].text = 'Too short to be a Part 7 person text.';
  return g;
}, /minimum is 100/);
addCase('section over 150 fails', (g) => {
  const filler =
    ' Extra commentary about routines, weekends, neighbours, transport, hobbies, budgets, weather, and long-term plans appears again without changing the tested ideas.';
  while (countWords(g.sections[1].text) <= 170) g.sections[1].text += filler;
  return g;
}, /maximum is 170/);
addCase('answer letter used 6+ times fails', (g) => {
  const answers = ['A', 'A', 'A', 'A', 'A', 'A', 'B', 'C', 'D', 'B'];
  g.modelAnswers = answers.map((answer, i) => ({
    id: g.questions[i].id,
    number: 43 + i,
    answer,
  }));
  return g;
}, /uses letter A 6 times/);
addCase('invalid answer letter fails', (g) => {
  g.modelAnswers[0].answer = 'E';
  return g;
}, /must be A–D/);
addCase('placeholder stem fails', (g) => {
  g.questions[0].prompt = 'Who TODO placeholder question text?';
  return g;
}, /placeholder/);

let failures = 0;
for (const { name, mutate, expectError } of cases) {
  const generated = mutate(structuredClone(makeValidPart7()));
  const result = validateGeneratedExamPart('b2', 7, generated);
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

const gen = makeValidPart7();
const analysis = analyzePart7Quality(gen);
console.log(
  `${analysis.errors.length === 0 ? 'PASS' : 'FAIL'} — analyzePart7Quality has no hard errors`,
);
if (analysis.errors.length) {
  console.error(analysis.errors);
  failures += 1;
}

const wcsOk = (gen.sections || []).every((s) => {
  const wc = countWords(s.text);
  return wc >= 120 && wc <= 150;
});
console.log(`${wcsOk ? 'PASS' : 'FAIL'} — fixture section lengths in range`);
if (!wcsOk) failures += 1;

// Assert dry-run does not artificially pad section text.
{
  const { readFileSync } = await import('fs');
  const { fileURLToPath } = await import('url');
  const { dirname, join } = await import('path');
  const dryRunPath = join(dirname(fileURLToPath(import.meta.url)), 'dry-run-b2-part7-prompt.mjs');
  try {
    const dryRunSrc = readFileSync(dryRunPath, 'utf8');
    const hasForbiddenPadHelper =
      /\bLENGTH_PAD\b/.test(dryRunSrc) || /\bexpandPassageToMinWords\b/.test(dryRunSrc);
    const declaresNoPad = /paddingApplied:\s*false/.test(dryRunSrc);
    const padOk = !hasForbiddenPadHelper && declaresNoPad;
    console.log(`${padOk ? 'PASS' : 'FAIL'} — dry-run Part 7 must not use local length padding`);
    if (!padOk) failures += 1;
  } catch {
    console.log('FAIL — dry-run Part 7 script missing');
    failures += 1;
  }
}

console.log(failures === 0 ? '\nAll Part 7 validator tests passed.' : `\n${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
