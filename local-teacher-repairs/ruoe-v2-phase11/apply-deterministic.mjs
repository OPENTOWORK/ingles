import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'local-teacher-repairs/ruoe-v2-phase11/exams');
const changed = new Map();

function phase10(exam) {
  const id = String(exam).padStart(2, '0');
  const file = path.join(root, `local-teacher-repairs/ruoe-v2-phase10/exams/exam-${id}/DRALO_RUOE_Exam_${id}_vNEXT_Teacher_Repair_v2.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sourcePart(exam, part) {
  const file = path.join(root, `scripts/generated/b2-exams/exam-${String(exam).padStart(2, '0')}/part-${String(part).padStart(2, '0')}.json`);
  return JSON.parse(fs.readFileSync(file, 'utf8')).generated;
}

function examOf(exam) {
  if (!changed.has(exam)) changed.set(exam, phase10(exam));
  return changed.get(exam);
}

function setKey(part, number, letter) {
  const row = (part.modelAnswers || []).find((item) => Number(item.number) === number);
  if (!row) throw new Error(`Missing model answer ${number}`);
  row.answer = letter;
}

function pool(lines) {
  return lines.map((line) => {
    const match = line.match(/^([A-G])\s+(.+)$/);
    if (!match) throw new Error(`Bad pool line: ${line}`);
    return `${match[1]}) ${match[2].trim()}`;
  });
}

const resolutions = [];

function note(row) {
  resolutions.push(row);
  console.log(row.status, `exam ${row.exam} P${row.part} Q${row.question || '-'}: ${row.reason}`);
}

// Exam 6 Part 6: only option B, keys unchanged.
{
  const part = examOf(6).parts['6'];
  const current = part.sentencePool.find((line) => line.startsWith('B)'));
  const next = 'B) For that reason, some employers deliberately keep junior staff involved in first drafts and routine problem-solving, even when AI could do the work faster.';
  if (current === 'B) Even so, many companies have discovered that using AI effectively still depends on human oversight.') {
    part.sentencePool = part.sentencePool.map((line) => (line.startsWith('B)') ? next : line));
    note({ exam: 6, part: 6, question: 42, status: 'RESOLVED', reason: 'Replaced only option B. Keys 37–42 unchanged.' });
  } else note({ exam: 6, part: 6, question: 42, status: 'UNRESOLVED', reason: `Option B did not match the expected source: ${current}` });
}

// Exam 8 Part 6: only option D, key D unchanged.
{
  const part = examOf(8).parts['6'];
  const current = part.sentencePool.find((line) => line.startsWith('D)'));
  const next = 'D) Together, these improvements reduce the effort required to follow speech in busy surroundings.';
  if (current === 'D) Together, these features mean that following a single voice no longer demands constant effort.') {
    part.sentencePool = part.sentencePool.map((line) => (line.startsWith('D)') ? next : line));
    note({ exam: 8, part: 6, question: 39, status: 'RESOLVED', reason: 'Replaced only option D. Key D and the other options unchanged.' });
  } else note({ exam: 8, part: 6, question: 39, status: 'UNRESOLVED', reason: `Option D did not match the expected source: ${current}` });
}

// Exam 9 Part 6: one sentence after gap 37.
{
  const part = examOf(9).parts['6'];
  const from = 'For some, this can be especially valuable after moving to a new area or changing schools.';
  const to = 'That ability to share everyday worries can be especially valuable after moving to a new area or changing schools.';
  const count = part.passage.split(from).length - 1;
  if (count === 1) {
    part.passage = part.passage.replace(from, to);
    note({ exam: 9, part: 6, question: 37, status: 'RESOLVED', reason: 'Replaced the sentence after gap 37. Pool and keys unchanged.' });
  } else note({ exam: 9, part: 6, question: 37, status: 'UNRESOLVED', reason: `Gap 37 sentence occurred ${count} times.` });
}

// Exam 10 Part 6: options B and D only.
{
  const part = examOf(10).parts['6'];
  const expected = {
    B: 'B) Such objects are often surprisingly ordinary: bowls, ropes and even the grain a ship was carrying.',
    D: 'D) Every new descent has brought back images and samples that nobody had predicted.',
  };
  const next = {
    B: 'B) Among the items recovered are ordinary objects such as bowls, ropes and seeds, which can reveal far more about daily life than treasure can.',
    D: 'D) These tools have revealed mountains, trenches and living communities in places that earlier maps showed only as blank space.',
  };
  const ok = ['B', 'D'].every((letter) => part.sentencePool.includes(expected[letter]));
  if (ok) {
    part.sentencePool = part.sentencePool.map((line) => next[line[0]] || line);
    note({ exam: 10, part: 6, question: '37/40', status: 'RESOLVED', reason: 'Replaced options B and D. Other options and keys unchanged.' });
  } else note({ exam: 10, part: 6, question: '37/40', status: 'UNRESOLVED', reason: 'Options B and D did not match the source pool.' });
}

// Exam 7 Part 6: printed pool and key.
{
  const part = examOf(7).parts['6'];
  part.sentencePool = pool([
    'A The same tool that keeps everyone informed, however, can make it almost impossible to escape constant updates.',
    'B For that reason, a handwritten note or a carefully timed phone call can still feel more meaningful than a stream of short messages.',
    'C In many cases, that can strengthen family life and make international friendships feel surprisingly ordinary.',
    'D Some experts believe that voice technology will soon replace keyboards for most online conversations.',
    'E Even punctuation has taken on new roles, with emojis and gifs helping to show feelings that plain text may hide.',
    'F This is why a quick text can sometimes create more anxiety than comfort, despite its convenience.',
    'G This has completely altered who gets heard and how quickly ideas move from private conversation into public debate.',
  ]);
  const keys = { 37: 'C', 38: 'F', 39: 'E', 40: 'A', 41: 'G', 42: 'B' };
  for (const [number, letter] of Object.entries(keys)) setKey(part, Number(number), letter);
  note({ exam: 7, part: 6, question: '37-42', status: 'RESOLVED', reason: 'Applied the printed sentence pool and key 37 C, 38 F, 39 E, 40 A, 41 G, 42 B. Passage unchanged.' });
}

// Exam 13 Part 6: same sentences, new letters.
{
  const part = examOf(13).parts['6'];
  part.sentencePool = pool([
    'A They also last for a long time, so there is less pressure to use them immediately.',
    'B In fact, meals based on ordinary ingredients are often cheaper than heavily processed convenience food.',
    'C With a little imagination, those leftovers can be turned into something that feels like a new meal.',
    'D It is often smarter to think about how a week of meals will fit together before entering the shop.',
    'E Some shoppers save money by visiting several different supermarkets in a single afternoon.',
    'F A large pot of soup or curry, for example, can provide several portions at a reasonable cost.',
    'G For example, a small amount added to a vegetable stir-fry or pasta dish can go much further.',
  ]);
  const keys = { 37: 'B', 38: 'F', 39: 'D', 40: 'A', 41: 'G', 42: 'C' };
  for (const [number, letter] of Object.entries(keys)) setKey(part, Number(number), letter);
  note({ exam: 13, part: 6, question: '37-42', status: 'RESOLVED', reason: 'Relabelled the existing sentences. Key 37 B, 38 F, 39 D, 40 A, 41 G, 42 C. Passage unchanged.' });
}

// Exam 11 Part 5 Q31: teacher stem is already applied; options were not.
{
  const part = examOf(11).parts['5'];
  const question = part.questions.find((item) => item.number === 31);
  question.options = [
    'A) Employers are beginning to value general flexibility more than specialist knowledge.',
    'B) Employers increasingly value people who can keep adapting while still using job-specific expertise.',
    'C) Technical expertise now matters mainly in professions such as medicine and design.',
    'D) Frequent software changes have made formal training less useful than workplace experience.',
  ];
  setKey(part, 31, 'B');
  note({ exam: 11, part: 5, question: 31, status: 'RESOLVED', reason: 'Applied the review options. Key remains B.' });
}

// Exam 11 Q25: the review item is a different proposition from the source item.
{
  const part = examOf(11).parts['4'];
  const source = sourcePart(11, 4);
  const index = part.questions.findIndex((item) => item.number === 25);
  part.questions[index] = structuredClone(source.questions.find((item) => item.number === 25));
  const sourceAnswer = source.modelAnswers.find((item) => Number(item.number) === 25);
  const answer = part.modelAnswers.find((item) => Number(item.number) === 25);
  answer.answer = sourceAnswer.answer;
  note({ exam: 11, part: 4, question: 25, status: 'UNRESOLVED', reason: 'Review Q25 is a different sentence from the source morale item. Restored the source item; the replacement needs a teacher decision.' });
}

// Exam 11 Q22 stays: the following sentence still describes unequal investment.
{
  const passage = examOf(11).parts['3'].passage;
  const kept = passage.includes('progress can be (22) ___ (EQUAL)') && passage.includes('Poorer areas may receive less investment');
  note({ exam: 11, part: 3, question: 22, status: kept ? 'RESOLVED' : 'UNRESOLVED', reason: kept ? 'Local sentence still supports unequal. Key unequal kept.' : 'Q22 context no longer supports the local repair.' });
}

// Exam 13 Q35: phase 10 prompt is the hobby question from another paper.
{
  const part = examOf(13).parts['5'];
  const source = sourcePart(13, 5).questions.find((item) => item.number === 35);
  const question = part.questions.find((item) => item.number === 35);
  question.prompt = source.prompt;
  question.options = structuredClone(source.options);
  note({ exam: 13, part: 5, question: 35, status: 'UNRESOLVED', reason: 'The printed replacement asks about turning a hobby into a career, which is not this impulse-buying article. Source question restored.' });
}

// Close the Part 5/6 blocks whose reviews request no content change, or whose named edit is already in the source.
const closed = [
  [5, 5, 'Q32 options already match the review. The rest of Part 5 was left unchanged.'],
  [5, 6, 'Review requested no Part 6 content change.'],
  [6, 5, 'Review requested no Part 5 content change.'],
  [7, 5, 'Review requested no Part 5 content change.'],
  [8, 5, 'Review requested no Part 5 rewrite.'],
  [9, 5, 'No astronaut paragraph is in the source. The Q35 prompt already matches the review.'],
  [10, 5, 'Review left Part 5 unchanged.'],
  [11, 6, 'Review left Part 6 unchanged.'],
  [12, 5, 'Q35 already cites the sentence that is in the passage. Key A unchanged.'],
  [12, 6, 'Review requested no Part 6 content change.'],
  [14, 5, 'Review applied no Part 5 content change.'],
  [14, 6, 'Review applied no Part 6 content change.'],
  [15, 5, 'Review applied no Part 5 content change.'],
  [15, 6, 'Review applied no Part 6 content change.'],
  [16, 5, 'Review requested no Part 5 content change.'],
  [16, 6, 'Review requested no Part 6 content change.'],
];
for (const [exam, part, reason] of closed) {
  note({ exam, part, question: 0, status: 'RESOLVED', reason });
}

for (const [exam, data] of changed) {
  const id = String(exam).padStart(2, '0');
  const dir = path.join(outDir, `exam-${id}`);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `DRALO_RUOE_Exam_${id}_vNEXT_Teacher_Repair_v2.json`);
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
  console.log('wrote', file);
}

fs.writeFileSync(path.join(root, 'local-teacher-repairs/ruoe-v2-phase11/deterministic.json'), `${JSON.stringify(resolutions, null, 2)}\n`);
