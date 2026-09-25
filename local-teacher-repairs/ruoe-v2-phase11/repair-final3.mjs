import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';
import { loadEnvLocal } from '../../scripts/load-env-local.mjs';
import { judgePart1Substitutions } from '../../src/lib/ruoeNaturalnessFirstV2/judgements.js';
import { teacherPart1DistractorRepairPrompt } from '../../src/lib/ruoeNaturalnessFirstV2/prompts.js';
import { buildPart1DistractorOnlyPatch } from '../../src/lib/ruoeNaturalnessFirstV2/teacherRepair.js';
import { nextPart1Repair } from '../../src/lib/ruoeNaturalnessFirstV2/repair.js';
import { repairPrompt } from '../../src/lib/ruoeNaturalnessFirstV2/prompts.js';
import { createRepairBudget, spendRepair } from '../../src/lib/ruoeNaturalnessFirstV2/layers.js';

loadEnvLocal();
const root = process.cwd();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.DRALO_OPENAI_API_KEY });

function examPath(exam, phase) {
  const id = String(exam).padStart(2, '0');
  return path.join(root, `local-teacher-repairs/ruoe-v2-${phase}/exams/exam-${id}/DRALO_RUOE_Exam_${id}_vNEXT_Teacher_Repair_v2.json`);
}

function load(exam) {
  const phase11 = examPath(exam, 'phase11');
  const file = fs.existsSync(phase11) ? phase11 : examPath(exam, 'phase10');
  return { data: JSON.parse(fs.readFileSync(file, 'utf8')), dirty: false };
}

async function completeJson(user) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    max_tokens: 1200,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Return JSON only. A definition that does not match the clause means the option is not defensible.' },
      { role: 'user', content: user },
    ],
  });
  return JSON.parse(response.choices?.[0]?.message?.content || '{}');
}

function liveOf(rows) {
  return rows.filter((row) => row.grammatical && row.naturalBritishEnglish && row.semanticallyDefensible && (row.collocationallyValid ?? true) && (row.contextuallyDefensible ?? true)).map((row) => String(row.letter).toUpperCase());
}

async function judgeClause(clause, purpose, options) {
  const judged = await completeJson([
    'First define the completed expression. Then decide whether that meaning is what the clause is doing.',
    'If the definition is a different meaning, contextuallyDefensible and semanticallyDefensible must be false.',
    `PURPOSE: ${purpose}`,
    `CLAUSE: ${clause}`,
    `OPTIONS: ${JSON.stringify(options)}`,
    'The blank is [[GAP]].',
    'Return {"judgements":[{"letter":"A","definition":"...","completed":"...","grammatical":true,"naturalBritishEnglish":false,"semanticallyDefensible":false,"collocationallyValid":false,"contextuallyDefensible":false,"reason":"..."}]} with A-D.',
  ].join('\n\n'));
  const rows = Array.isArray(judged.judgements) ? judged.judgements : [];
  const review = await completeJson([
    'For each definition, matchesPurpose is true only if that meaning is exactly what the clause is saying.',
    `PURPOSE: ${purpose}`,
    JSON.stringify(rows.map((row) => ({ letter: row.letter, definition: row.definition, completed: row.completed }))),
    'Return {"reviews":[{"letter":"A","matchesPurpose":false,"why":"..."}]}',
  ].join('\n\n'));
  for (const row of rows) {
    const match = (review.reviews || []).find((item) => String(item.letter).toUpperCase() === String(row.letter).toUpperCase());
    if (match && match.matchesPurpose === false) {
      row.semanticallyDefensible = false;
      row.contextuallyDefensible = false;
      row.critique = match.why;
    }
  }
  const verdict = judgePart1Substitutions(rows);
  const live = liveOf(rows);
  console.log(clause, '->', live.join(',') || 'none');
  for (const row of rows) console.log(`  ${row.letter} ${row.definition || ''} | ${row.critique || row.reason}`);
  return { rows, verdict, live };
}

function passes(result, key) {
  return result.live.length === 1 && result.live[0] === key && result.verdict.verdict === 'PASS';
}

async function replaceDistractors(part, number, clause, purpose, key) {
  const question = part.questions.find((item) => item.number === number);
  let result = await judgeClause(clause, purpose, question.options);
  for (let guard = 0; guard < 4 && !passes(result, key); guard += 1) {
    const target = result.live.find((letter) => letter !== key);
    if (!target || !result.live.includes(key)) break;
    let accepted = false;
    const rejected = new Set();
    for (let attempt = 0; attempt < 3 && !accepted; attempt += 1) {
      const proposal = await completeJson(`${teacherPart1DistractorRepairPrompt({
        passage: part.passage,
        sentence: clause,
        options: question.options,
        judgements: result.rows,
        keyLetter: key,
        targetLetter: target,
      })}\n\nDo not return any of these words: ${[...question.options.map((option) => option.replace(/^[A-D]\)\s*/, '')), ...rejected].join(', ')}.`);
      const word = String(proposal.word || '').trim();
      rejected.add(word);
      const patch = buildPart1DistractorOnlyPatch({
        options: question.options,
        judgements: result.rows,
        keyLetter: key,
        replacementWord: word,
        targetLetter: target,
      });
      if (patch.status !== 'PASS') {
        console.log(`  rejected ${target} ${word}: ${patch.reason}`);
        continue;
      }
      const previous = question.options;
      question.options = patch.proposedQuestion.options;
      const again = await judgeClause(clause, purpose, question.options);
      if (!again.live.includes(target) && again.live.includes(key)) {
        result = again;
        accepted = true;
      } else {
        question.options = previous;
      }
    }
    if (!accepted) break;
  }
  return result;
}

const exams = new Map([[6, load(6)], [13, load(13)], [14, load(14)]]);
const results = [];

{
  const part = exams.get(6).data.parts['1'];
  const budget = createRepairBudget();
  const before = JSON.stringify(part.questions.filter((item) => item.number !== 4));
  let result = await replaceDistractors(
    part,
    4,
    'there is less stuff to put [[GAP]]',
    'storing possessions so that the home is tidy',
    'C',
  );
  if (!passes(result, 'C') && spendRepair(budget, 'linguistic')) {
    const step = nextPart1Repair({ distractorsRepaired: true });
    console.log('Q4 sentence step', step.action);
  }
  const ok = passes(result, 'C');
  if (!ok) {
    part.questions.find((item) => item.number === 4).options = JSON.parse(beforeOptions(exams.get(6), 4));
  } else if (JSON.stringify(part.questions.find((item) => item.number === 4).options) !== beforeOptions(exams.get(6), 4)) {
    exams.get(6).dirty = true;
  }
  if (JSON.stringify(part.questions.filter((item) => item.number !== 4)) !== before) throw new Error('Exam 6 neighbour changed');
  results.push({ exam: 6, question: 4, status: ok ? 'PASS' : 'UNREPAIRED', options: part.questions.find((item) => item.number === 4).options, live: result.live });
}

function beforeOptions(loaded, number) {
  const id = loaded === exams.get(6) ? 6 : loaded === exams.get(13) ? 13 : 14;
  const fresh = load(id);
  return JSON.stringify(fresh.data.parts['1'].questions.find((item) => item.number === number).options);
}

{
  const part = exams.get(13).data.parts['1'];
  const original = JSON.stringify(part.questions.find((item) => item.number === 1).options);
  const neighbours = JSON.stringify(part.questions.filter((item) => item.number !== 1));
  const result = await replaceDistractors(
    part,
    1,
    'a few simple habits can make a real [[GAP]] to your health',
    'a real positive effect on health, using the expression make a ___ to',
    'A',
  );
  const ok = passes(result, 'A');
  if (!ok) part.questions.find((item) => item.number === 1).options = JSON.parse(original);
  else if (JSON.stringify(part.questions.find((item) => item.number === 1).options) !== original) exams.get(13).dirty = true;
  if (JSON.stringify(part.questions.filter((item) => item.number !== 1)) !== neighbours) throw new Error('Exam 13 neighbour changed');
  results.push({ exam: 13, question: 1, status: ok ? 'PASS' : 'UNREPAIRED', options: part.questions.find((item) => item.number === 1).options, live: result.live });
}

{
  const loaded = exams.get(14);
  const part = loaded.data.parts['1'];
  const originalSentence = 'Since supplies cannot easily be replaced, meals must stay fresh for long periods and be easy to (4) ___ out.';
  const neighbours = JSON.stringify(part.questions);
  const answers = JSON.stringify(part.modelAnswers);
  const step = nextPart1Repair({ distractorsRepaired: true, sentenceRepaired: false });
  const proposal = await completeJson([
    repairPrompt(step),
    'The key word is carry, option C. "carry out" must mean perform a plan. It does not collocate with meals.',
    'Change only the words needed so the gap still ends in "out" and only "carry" is natural there.',
    'bring out, take out and hand out must not be natural in the revised clause.',
    `SENTENCE: ${originalSentence}`,
    'Keep the blank as (4) ___ . Do not write carry into the gap.',
    'Return {"revisedSentence":"...","reason":"..."}',
  ].join('\n\n'));
  let revised = String(proposal.revisedSentence || '').trim();
  console.log('Q14 proposal', revised);
  if (!part.passage.includes(originalSentence) || !/\(4\)\s*_{2,}/.test(revised) || (revised.match(/\(\d+\)/g) || []).join() !== '(4)') {
    revised = 'Since supplies cannot easily be replaced, meals must stay fresh for long periods, and the feeding plan must be easy to (4) ___ out.';
    console.log('Q14 using minimal local sentence');
  }
  part.passage = part.passage.replace(originalSentence, revised);
  const clause = revised.replace('(4) ___', '[[GAP]]');
  const result = await judgeClause(clause, 'performing or executing a plan, procedure or set of checks', part.questions.find((item) => item.number === 4).options);
  const ok = passes(result, 'C');
  if (!ok) part.passage = part.passage.replace(revised, originalSentence);
  else loaded.dirty = true;
  if (JSON.stringify(part.questions) !== neighbours || JSON.stringify(part.modelAnswers) !== answers) throw new Error('Exam 14 questions changed');
  results.push({ exam: 14, question: 4, status: ok ? 'PASS' : 'UNREPAIRED', sentence: ok ? revised : originalSentence, live: result.live });
}

for (const [exam, loaded] of exams) {
  if (!loaded.dirty) continue;
  const id = String(exam).padStart(2, '0');
  const dir = path.join(root, `local-teacher-repairs/ruoe-v2-phase11/exams/exam-${id}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `DRALO_RUOE_Exam_${id}_vNEXT_Teacher_Repair_v2.json`), `${JSON.stringify(loaded.data, null, 2)}\n`);
  console.log('wrote', exam);
}
console.log(JSON.stringify(results, null, 2));
