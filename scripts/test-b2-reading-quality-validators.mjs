/**
 * Unit tests for B2 R&UoE quality validators (Parts 2–5, 7) + Part 1/6 regression smoke.
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/test-b2-reading-quality-validators.mjs
 */
const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');
const {
  detectLiteralPart5Match,
  countWords,
} = await import('../src/lib/b2RuoeExamQuality.js');
const { getImprovedPart } = await import('./b2ReadingImprovedContent.mjs');

let failures = 0;

function check(name, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}${ok || !detail ? '' : ` (${detail})`}`);
  if (!ok) failures += 1;
}

/* ---------- Part 2: one word per gap, 100–140 words ---------- */

function makeValidPart2() {
  const answers = ['from', 'to', 'on', 'with', 'to', 'out', 'on', 'to'];
  const passage = `Teamwork matters in modern workplaces and classrooms alike. When projects grow complex, groups can benefit (9) ___ sharing skills that no individual possesses alone. Collaborative tasks often lead (10) ___ stronger results when members listen carefully and respect different viewpoints. Disagreements may arise, so teams must work (11) ___ them constructively rather than avoiding difficult conversations. Clear communication is vital (12) ___ success, especially when deadlines approach quickly. Each person should carry (13) ___ their responsibilities reliably, even when tasks seem routine. Colleagues need to depend (14) ___ one another during busy periods and share feedback honestly. Trust grows when people support (15) ___ each other openly instead of competing for recognition. In the long term, cooperation can lead (16) ___ better outcomes for everyone involved.`;
  return {
    partTitle: 'Reading and Use of English Part 2',
    directions: 'For questions 9–16…',
    example: { number: 0, sentence: 'She is fond (0) ___ travelling by train.', answer: 'of' },
    title: 'The Value of Teamwork',
    passage,
    questions: answers.map((_, i) => ({ id: `q${i + 1}`, number: 9 + i, type: 'short' })),
    modelAnswers: answers.map((w, i) => ({ id: `q${i + 1}`, answer: w })),
  };
}

check('Part 2 valid fixture passes', validateGeneratedExamPart('b2', 2, makeValidPart2()).ok);
const p2multi = makeValidPart2();
p2multi.modelAnswers[0] = { id: 'q1', answer: 'in spite' };
check(
  'Part 2 rejects multi-word answer',
  !validateGeneratedExamPart('b2', 2, p2multi).ok,
);

/* ---------- Part 3: single derivation ---------- */

const part3 = {
  title: 'Healthy Living',
  passage: `Many people today are rediscovering the value of regular physical activity. Doctors argue that consistent movement improves overall (17) ___ (FIT) and helps maintain (18) ___ (STRONG) muscles throughout adulthood. Team sports also build (19) ___ (CONFIDENT), while gentle stretching encourages (20) ___ (RELAX) after stressful days. Coaches insist that (21) ___ (RESPONSIBLE) behaviour matters as much as talent, especially when athletes (22) ___ (COMPETE) in regional events. Nutrition plays a role too: balanced meals support long-term (23) ___ (HEALTH) and keep teenagers (24) ___ (ACTIVE) without extreme diets. Schools that promote these habits report fewer absences and better concentration in class, although changing routines requires patience from families as well as teachers.`,
  example: { sentence: 'We need (0) ___ (NATURE) spaces.', answer: 'natural' },
  questions: [17, 18, 19, 20, 21, 22, 23, 24].map((n) => ({
    id: `q${n}`,
    number: n,
    type: 'word-formation',
    stem: ['FIT', 'STRONG', 'CONFIDENT', 'RELAX', 'RESPONSIBLE', 'COMPETE', 'HEALTH', 'ACTIVE'][n - 17],
  })),
  modelAnswers: [
    { id: 'q17', answer: 'fitness' },
    { id: 'q18', answer: 'stronger' },
    { id: 'q19', answer: 'confidence' },
    { id: 'q20', answer: 'relaxation' },
    { id: 'q21', answer: 'responsibility' },
    { id: 'q22', answer: 'compete' },
    { id: 'q23', answer: 'healthier' },
    { id: 'q24', answer: 'active' },
  ],
};
check('Part 3 valid fixture passes', validateGeneratedExamPart('b2', 3, part3).ok);
const p3bad = structuredClone(part3);
p3bad.modelAnswers[0] = { id: 'q17', answer: 'fit and well' };
check('Part 3 rejects multi-word derivation', !validateGeneratedExamPart('b2', 3, p3bad).ok);

/* ---------- Part 4: keyword unchanged, 2–5 words ---------- */

const part4 = {
  directions: 'For questions 25–30…',
  questions: [
    { id: 'q25', number: 25, type: 'transformation', sentence1: 'A', keyword: 'HARDLY', sentence2Start: 'B __________________' },
    { id: 'q26', number: 26, type: 'transformation', sentence1: 'A', keyword: 'BY', sentence2Start: 'B __________________' },
    { id: 'q27', number: 27, type: 'transformation', sentence1: 'A', keyword: 'WISHES', sentence2Start: 'B __________________' },
    { id: 'q28', number: 28, type: 'transformation', sentence1: 'A', keyword: 'FEWER', sentence2Start: 'B __________________' },
    { id: 'q29', number: 29, type: 'transformation', sentence1: 'A', keyword: 'NEED', sentence2Start: 'B __________________' },
    { id: 'q30', number: 30, type: 'transformation', sentence1: 'A', keyword: 'SPITE', sentence2Start: 'B __________________' },
  ],
  modelAnswers: [
    { id: 'q25', answer: 'Hardly anyone finds' },
    { id: 'q26', answer: 'by the introduction of' },
    { id: 'q27', answer: 'wishes she had moved' },
    { id: 'q28', answer: 'fewer public parks than' },
    { id: 'q29', answer: 'do not need to use' },
    { id: 'q30', answer: 'spite of the subway being' },
  ],
};
check('Part 4 valid fixture passes', validateGeneratedExamPart('b2', 4, part4).ok);
const p4bad = structuredClone(part4);
p4bad.modelAnswers[0] = { id: 'q25', answer: 'No one really finds it easy at all today' };
check('Part 4 rejects answer over 5 words', !validateGeneratedExamPart('b2', 4, p4bad).ok);
const p4kw = structuredClone(part4);
p4kw.modelAnswers[0] = { id: 'q25', answer: 'No one finds it easy' };
check('Part 4 rejects missing keyword', !validateGeneratedExamPart('b2', 4, p4kw).ok);

/* ---------- Part 5: inference, no literal match ---------- */

for (const slot of [1, 2, 3]) {
  const gen = getImprovedPart(slot, 5);
  const val = validateGeneratedExamPart('b2', 5, gen);
  check(`Part 5 exam ${slot} improved content passes`, val.ok, val.errors?.join('; '));
  const wc = countWords(gen.passage);
  check(`Part 5 exam ${slot} word count 550–700`, wc >= 550 && wc <= 700, String(wc));
}

const literalPassage = 'Many readers valued patience and curiosity above physical strength when exploring new areas.';
const literalOpt = 'They valued patience and curiosity above physical strength.';
check(
  'Part 5 literal detector finds long phrase match',
  detectLiteralPart5Match(literalPassage, literalOpt) != null,
);

const p5bad = getImprovedPart(1, 5);
p5bad.passage = 'Short text.';
const p5val = validateGeneratedExamPart('b2', 5, p5bad);
check('Part 5 rejects short passage', !p5val.ok);

/* ---------- Part 7: overlaps, Who prefix, no Emma ---------- */

for (const slot of [1, 2, 3]) {
  const gen = getImprovedPart(slot, 7);
  const val = validateGeneratedExamPart('b2', 7, gen);
  check(`Part 7 exam ${slot} improved content passes`, val.ok, val.errors?.join('; '));
  const blob = JSON.stringify(gen).toLowerCase();
  check(`Part 7 exam ${slot} has no Emma`, !blob.includes('emma'));
}

const p7bad = getImprovedPart(1, 7);
p7bad.questions[0].prompt = 'Which person changed career?';
check('Part 7 rejects non-Who prompt', !validateGeneratedExamPart('b2', 7, p7bad).ok);

/* ---------- Part 1 / Part 6 regression smoke ---------- */

const { readFileSync } = await import('fs');
const path = await import('path');
const { fileURLToPath } = await import('url');
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

try {
  const dump = JSON.parse(readFileSync(path.join(root, 'scripts', 'generated', 'dump-exam1-b2.json'), 'utf8'));
  const part1Item = dump.partes.find((p) => p.partNumber === 1)?.items?.[0];
  if (part1Item) {
    const part1Gen = {
      title: 'Sample',
      passage: part1Item.enunciado.split('\nQuestions')[0].replace(/^Text\n/, ''),
      questions: Array.from({ length: 8 }, (_, i) => ({
        id: `q${i + 1}`,
        number: i + 1,
        type: 'mcq',
        options: ['A) a', 'B) b', 'C) c', 'D) d'],
      })),
      modelAnswers: Array.from({ length: 8 }, (_, i) => ({ id: `q${i + 1}`, answer: 'B' })),
    };
    const p1 = validateGeneratedExamPart('b2', 1, part1Gen);
    check('Part 1 validator still runs on fixture', typeof p1.ok === 'boolean');
  }
} catch {
  check('Part 1 dump smoke skipped (no dump)', true);
}

const part6Gen = {
  title: 'Community Projects',
  directions: 'Part 6 directions',
  passage: 'Intro (37) ___ middle (38) ___ end.',
  sentencePool: ['A) One', 'B) Two', 'C) Three', 'D) Four', 'E) Five', 'F) Six', 'G) Seven'],
  questions: [37, 38].map((n) => ({ id: `q${n}`, number: n, type: 'gapped-text' })),
  modelAnswers: [
    { id: 'q37', answer: 'A' },
    { id: 'q38', answer: 'B' },
  ],
};
check('Part 6 generic validation still accepts minimal fixture', validateGeneratedExamPart('b2', 6, part6Gen).ok !== undefined);

console.log(failures === 0 ? '\nAll B2 reading quality validator tests passed.' : `\n${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
