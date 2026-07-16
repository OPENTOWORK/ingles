/**
 * Unit tests (sin IA, sin DB) del validador mecánico de B2 Part 6 (gapped text).
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/test-b2-part6-validator.mjs
 */
const { validateGeneratedExamPart } = await import('../src/lib/examPartValidation.js');
const { countWords, analyzePart6Quality } = await import('../src/lib/b2RuoeExamQuality.js');

const FILLER =
  ' Researchers note that everyday decisions about travel, food, housing and leisure gradually reshape neighbourhoods, while local councils weigh cost against long-term wellbeing and residents debate what kind of streets they want to share. ';

function makePassage() {
  let body = `Many towns are rediscovering the value of quieter streets after years of treating traffic as inevitable. Planners once assumed that faster car access would always improve daily life, yet congestion and poor air quality have forced a rethink. (37) ______. Shopkeepers sometimes fear that fewer cars will reduce trade, but early schemes often show the opposite pattern when people stay longer on foot.

Children notice the change first. Where continuous traffic once dominated the kerb, parents now find it easier to walk younger pupils to school without constant negotiation at crossings. (38) ______. The effect is not merely practical; several teachers report that pupils arrive calmer and more ready to concentrate.

Critics argue that such projects favour wealthier districts with spare road space. (39) ______. In denser areas, designers have experimented with timed access, shared surfaces and better bus priority instead of permanent closures.

Public consultation remains uneven. Leaflets and evening meetings can miss shift workers, while online surveys attract those already motivated to comment. (40) ______. Some councils now hire outreach workers to gather views in markets and community centres rather than relying only on formal hearings.

Funding is another constraint. Temporary paint and planters are cheap, yet durable materials and maintenance budgets decide whether a scheme survives beyond a pilot year. (41) ______. Without that follow-through, residents quickly conclude that the experiment was cosmetic.

Still, the most persuasive evidence is experiential. People who initially opposed a trial sometimes change their minds after a summer of outdoor seating and safer cycling. (42) ______. That slow shift in attitude may matter more than any single traffic count.`;

  while (countWords(body) < 500) body += FILLER;
  // Keep under 600 by trimming filler loops carefully
  while (countWords(body) > 600) {
    body = body.replace(FILLER, '');
    if (!body.includes(FILLER.trim()) && countWords(body) > 600) break;
  }
  return body;
}

function makeValidPart6() {
  const answers = ['C', 'F', 'A', 'E', 'B', 'G']; // unused D
  return {
    partTitle: 'Part 6: Gapped text',
    directions:
      'Six sentences have been removed from the article. Choose from the sentences A–G the one which fits each gap. There is one extra sentence which you do not need to use.',
    title: 'Quieter Streets and Everyday Life',
    passage: makePassage(),
    sentencePool: [
      'A) However, that concern is less convincing when similar benefits appear in mixed-income neighbourhoods that redesigned only a few junctions.',
      'B) As a result, projects that look finished on opening day can quietly fail once plants die and paint fades.',
      'C) This has led several municipalities to trial low-traffic neighbourhoods that redirect through-traffic away from residential roads.',
      'D) Meanwhile, international airports continue to expand despite rising ticket prices for weekend leisure travel.',
      'E) For this reason, consultation that never reaches quieter voices tends to produce designs that feel imposed rather than shared.',
      'F) In addition, shorter walking routes encourage neighbours to greet one another more often, strengthening informal social contact.',
      'G) Therefore, the lasting success of these schemes depends as much on lived experience as on technical modelling.',
    ],
    questions: [37, 38, 39, 40, 41, 42].map((n, i) => ({
      id: `q${i + 1}`,
      number: n,
      type: 'gapped-text',
    })),
    modelAnswers: answers.map((answer, i) => ({
      id: `q${i + 1}`,
      number: 37 + i,
      answer,
    })),
  };
}

const cases = [];
function addCase(name, mutate, expectError) {
  cases.push({ name, mutate, expectError });
}

addCase('valid part 6 passes', (g) => g, null);
addCase('5 gaps fails', (g) => {
  g.questions = g.questions.slice(0, 5);
  g.modelAnswers = g.modelAnswers.slice(0, 5);
  return g;
}, /exactly 6 questions\/gaps/);
addCase('question number outside 37–42 fails', (g) => {
  g.questions[0].number = 31;
  return g;
}, /must be 37–42/);
addCase('duplicate question number fails', (g) => {
  g.questions[5].number = 41;
  return g;
}, /duplicate question number/);
addCase('missing gap marker fails', (g) => {
  g.passage = g.passage.replace('(40)', '[40]');
  return g;
}, /missing gap marker \(40\)/);
addCase('6 pool options fails', (g) => {
  g.sentencePool = g.sentencePool.slice(0, 6);
  return g;
}, /exactly 7 sentencePool/);
addCase('duplicate answer letter fails', (g) => {
  g.modelAnswers[5].answer = 'C';
  return g;
}, /6 different letters|unused/);
addCase('passage under 500 fails', (g) => {
  g.passage = 'Too short. (37) ______. (38) ______. (39) ______. (40) ______. (41) ______. (42) ______.';
  return g;
}, /minimum is 500/);
addCase('passage over 600 fails', (g) => {
  while (countWords(g.passage) <= 600) g.passage += FILLER;
  return g;
}, /maximum is 600/);
addCase('placeholder option fails', (g) => {
  g.sentencePool[0] = 'A) TODO placeholder option text.';
  return g;
}, /placeholder/);
addCase('incomplete sentence fails', (g) => {
  g.sentencePool[1] = 'B) Not complete';
  return g;
}, /complete sentence/);
addCase('missing title fails', (g) => {
  g.title = '';
  return g;
}, /passage title/);

let failures = 0;
for (const { name, mutate, expectError } of cases) {
  const generated = mutate(structuredClone(makeValidPart6()));
  const result = validateGeneratedExamPart('b2', 6, generated);
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

const gen = makeValidPart6();
const wc = countWords(gen.passage);
console.log(`${wc >= 500 && wc <= 600 ? 'PASS' : 'FAIL'} — fixture word count in range (${wc})`);
if (wc < 500 || wc > 600) failures += 1;

const analysis = analyzePart6Quality(gen);
console.log(
  `${analysis.errors.length === 0 ? 'PASS' : 'FAIL'} — analyzePart6Quality has no hard errors`,
);
if (analysis.errors.length) {
  console.error(analysis.errors);
  failures += 1;
}

console.log(failures === 0 ? '\nAll Part 6 validator tests passed.' : `\n${failures} test(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
