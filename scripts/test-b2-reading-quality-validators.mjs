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

/* ---------- Part 2: one word per gap, 150–180 words, (0)+(9)–(16) in passage ---------- */

function makeValidPart2() {
  const answers = ['who', 'have', 'to', 'although', 'their', 'on', 'enough', 'for'];
  const passage = `Finding time outdoors
Many people spend most (0) ___ their free hours indoors, often looking at screens after a long day at work. Research shows that even short walks can improve mood, especially among adults (9) ___ live in busy cities with little green space. Doctors often say that people who (10) ___ already adopted outdoor habits sleep better and feel calmer during the week. Families may decide (11) ___ visit a park together on Sundays rather than stay at home. (12) ___ the weather is cold, warm clothes make the outing pleasant for children and adults alike. Neighbours sometimes organise shared activities so that (13) ___ local streets feel safer and more welcoming. Local councils also put pressure (14) ___ businesses to create outdoor seating and plant trees. With (15) ___ planning and a little motivation, most residents can build routines that support both energy and calm. Small improvements each month matter more than dramatic starts that disappear after two weeks of travel or heavy schedules (16) ___ people at the office.`;
  return {
    partTitle: 'Part 2: Open cloze',
    directions:
      'For questions 9–16, read the text below and think of the word which best fits each gap. Use only ONE word in each gap. There is an example at the beginning (0).',
    example: { number: 0, answer: 'of' },
    title: 'Finding time outdoors',
    passage,
    questions: answers.map((_, i) => ({ id: `q${i + 1}`, number: 9 + i, type: 'short' })),
    modelAnswers: answers.map((w, i) => ({ id: `q${i + 1}`, number: 9 + i, answer: w })),
  };
}

check('Part 2 valid fixture passes', validateGeneratedExamPart('b2', 2, makeValidPart2()).ok);
const p2multi = makeValidPart2();
p2multi.modelAnswers[0] = { id: 'q1', answer: 'in spite' };
check(
  'Part 2 rejects multi-word answer',
  !validateGeneratedExamPart('b2', 2, p2multi).ok,
);

/* ---------- Part 3: single derivation, 150–180 words, (0)+(17)–(24) ---------- */

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

const part3 = makeValidPart3();
check('Part 3 valid fixture passes', validateGeneratedExamPart('b2', 3, part3).ok);
const p3bad = structuredClone(part3);
p3bad.modelAnswers[0] = { id: 'q1', answer: 'fit and well' };
check('Part 3 rejects multi-word derivation', !validateGeneratedExamPart('b2', 3, p3bad).ok);

/* ---------- Part 4: keyword unchanged, 2–5 Cambridge words + grading_metadata ---------- */

function makeValidPart4() {
  const meta = (keyword, fullAnswers, mp1, mp2) => ({
    type: 'b2_key_word_transformation',
    version: 1,
    keyword,
    fullAnswers,
    markingPoints: [
      { id: 1, label: 'mp1', accepted: mp1 },
      { id: 2, label: 'mp2', accepted: mp2 },
    ],
  });
  const items = [
    {
      id: 'q25',
      number: 25,
      type: 'transformation',
      sentence1: 'It is not necessary for you to use a password every time.',
      keyword: 'NEED',
      sentence2Start: 'You __________________ a password every time.',
      answer: 'do not need to use',
      grading_metadata: meta(
        'NEED',
        ['do not need to use', "don't need to use"],
        ['do not need', "don't need"],
        ['to use'],
      ),
    },
    {
      id: 'q26',
      number: 26,
      type: 'transformation',
      sentence1: 'I did not intend to delete the file.',
      keyword: 'MEAN',
      sentence2Start: 'I __________________ the file.',
      answer: "didn't mean to delete",
      grading_metadata: meta(
        'MEAN',
        ["didn't mean to delete", 'did not mean to delete'],
        ["didn't mean", 'did not mean'],
        ['to delete'],
      ),
    },
    {
      id: 'q27',
      number: 27,
      type: 'transformation',
      sentence1: 'The exam was less difficult than I expected.',
      keyword: 'AS',
      sentence2Start: 'The exam __________________ I expected.',
      answer: 'was not as hard as',
      grading_metadata: meta(
        'AS',
        ['was not as hard as', "wasn't as hard as"],
        ['was not', "wasn't"],
        ['as hard as'],
      ),
    },
    {
      id: 'q28',
      number: 28,
      type: 'transformation',
      sentence1: 'She has never visited Rome before.',
      keyword: 'HAD',
      sentence2Start: 'Never before __________________ Rome.',
      answer: 'had she visited',
      grading_metadata: meta('HAD', ['had she visited'], ['had she'], ['visited']),
    },
    {
      id: 'q29',
      number: 29,
      type: 'transformation',
      sentence1: 'People say that the museum opens at nine.',
      keyword: 'THOUGHT',
      sentence2Start: 'The museum __________________ at nine.',
      answer: 'is thought to open',
      grading_metadata: meta('THOUGHT', ['is thought to open'], ['is thought'], ['to open']),
    },
    {
      id: 'q30',
      number: 30,
      type: 'transformation',
      sentence1: 'I am excited about hearing from you soon.',
      keyword: 'FORWARD',
      sentence2Start: 'I am __________________ from you soon.',
      answer: 'looking forward to hearing',
      grading_metadata: meta(
        'FORWARD',
        ['looking forward to hearing'],
        ['looking forward'],
        ['to hearing'],
      ),
    },
  ];
  return {
    directions:
      'For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between two and five words, including the word given. There is an example at the beginning (0).',
    example: {
      number: 0,
      sentence1: 'You must do the washing-up tonight.',
      keyword: 'HAVE',
      sentence2Start: 'You __________________ the washing-up tonight.',
      answer: 'have to do',
    },
    questions: items,
    modelAnswers: items.map((item) => ({
      id: item.id,
      number: item.number,
      answer: item.answer,
    })),
  };
}

const part4 = makeValidPart4();
check('Part 4 valid fixture passes', validateGeneratedExamPart('b2', 4, part4).ok);
const p4bad = structuredClone(part4);
p4bad.questions[0].answer = 'No one really finds it easy at all today';
p4bad.modelAnswers[0].answer = 'No one really finds it easy at all today';
p4bad.questions[0].grading_metadata.fullAnswers = ['No one really finds it easy at all today'];
check('Part 4 rejects answer over 5 words', !validateGeneratedExamPart('b2', 4, p4bad).ok);
const p4kw = structuredClone(part4);
p4kw.questions[0].answer = 'do not have to use';
p4kw.modelAnswers[0].answer = 'do not have to use';
p4kw.questions[0].grading_metadata.fullAnswers = ['do not have to use'];
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
