import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';
import { loadEnvLocal } from '../../scripts/load-env-local.mjs';
import { judgePart1Substitutions } from '../../src/lib/ruoeNaturalnessFirstV2/judgements.js';
import { teacherPart1DistractorRepairPrompt, repairPrompt } from '../../src/lib/ruoeNaturalnessFirstV2/prompts.js';
import { buildPart1DistractorOnlyPatch } from '../../src/lib/ruoeNaturalnessFirstV2/teacherRepair.js';
import { nextPart1Repair } from '../../src/lib/ruoeNaturalnessFirstV2/repair.js';
import { createRepairBudget, spendRepair } from '../../src/lib/ruoeNaturalnessFirstV2/layers.js';

loadEnvLocal();
const root = process.cwd();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.DRALO_OPENAI_API_KEY });

const TARGETS = [
  [5, 2], [5, 5], [5, 7], [5, 8],
  [6, 2], [6, 4], [6, 6], [6, 7],
  [7, 1],
  [8, 7],
  [10, 7], [10, 8],
  [13, 1],
  [14, 4],
];

function examFile(exam, phase) {
  const id = String(exam).padStart(2, '0');
  return path.join(root, `local-teacher-repairs/ruoe-v2-${phase}/exams/exam-${id}/DRALO_RUOE_Exam_${id}_vNEXT_Teacher_Repair_v2.json`);
}

const exams = new Map();
function getExam(exam) {
  if (exams.has(exam)) return exams.get(exam);
  const phase11 = examFile(exam, 'phase11');
  const source = fs.existsSync(phase11) ? phase11 : examFile(exam, 'phase10');
  const loaded = { data: JSON.parse(fs.readFileSync(source, 'utf8')), dirty: false };
  exams.set(exam, loaded);
  return loaded;
}

async function completeJson(user) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    max_tokens: 1400,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Return JSON only. A sentence that is merely grammatical is not natural British English.' },
      { role: 'user', content: user },
    ],
  });
  return JSON.parse(response.choices?.[0]?.message?.content || '{}');
}

function sentenceOf(passage, number) {
  return String(passage).split(/(?<=[.!?])\s+/).find((chunk) => chunk.includes(`(${number})`)) || '';
}

function keyWordFor(part, number) {
  if (Number(number) === 0 && part.example) {
    const letter = String(part.example.answer || '').toUpperCase();
    return optionWord((part.example.options || []).find((option) => option.startsWith(`${letter})`)) || '');
  }
  const letter = String(part.modelAnswers.find((item) => item.number === Number(number))?.answer || '').toUpperCase();
  const question = part.questions.find((item) => item.number === Number(number));
  if (!question) return '';
  return optionWord(question.options.find((option) => option.startsWith(`${letter})`)) || '');
}

function focusSentence(part, number) {
  const sentence = sentenceOf(part.passage, number);
  const marked = sentence.replace(/\((\d+)\)\s*_{2,}/g, (full, gap) => (
    Number(gap) === Number(number) ? '[[GAP]]' : `[gap ${gap}]`
  ));
  const clause = marked.split(/,\s+|;\s+/).find((partText) => partText.includes('[[GAP]]')) || marked;
  return clause;
}

function optionWord(option) {
  return String(option).replace(/^[A-D](?:\)|[.:\s])\s*/i, '').trim();
}

function markers(text) {
  return String(text).match(/\(\d+\)/g) || [];
}

function gapNumbers(text) {
  return markers(text).map((marker) => Number(marker.slice(1, -1)));
}

function withLive(result) {
  result.live = result.rows.filter((row) => row.grammatical && row.naturalBritishEnglish && row.semanticallyDefensible && (row.collocationallyValid ?? row.collocationalFit) && (row.contextuallyDefensible ?? true)).map((row) => String(row.letter).toUpperCase());
  result.verdict = judgePart1Substitutions(result.rows);
  return result;
}

async function judgeOptions(part, number) {
  const question = part.questions.find((item) => item.number === number);
  const sentence = focusSentence(part, number);
  const judged = await completeJson([
    'Complete only [[GAP]]. Ignore any [gap N] marker.',
    'naturalBritishEnglish is true only if a competent British speaker would actually say the completed clause.',
    'collocationallyValid is true only if you can name a real collocation or idiom that this word forms with the words beside [[GAP]].',
    'If you cannot name that collocation, set naturalBritishEnglish and collocationallyValid to false.',
    'A completion that is only grammatically constructible, translated, or odd is not natural. Set both naturalBritishEnglish and collocationallyValid to false.',
    'Reject completions of this kind: "have long lasted hidden"; "in the long length"; "the rubbish we drop away".',
    'Do not choose a best answer. Judge every option on its own.',
    `PASSAGE:\n${part.passage}`,
    `SENTENCE:\n${sentence}`,
    `OPTIONS:\n${JSON.stringify(question.options)}`,
    'Return {"judgements":[{"letter":"A","completedSentence":"...","grammatical":true,"naturalBritishEnglish":false,"semanticallyDefensible":false,"collocationallyValid":false,"contextuallyDefensible":false,"reason":"one sentence about the completed sentence"}]} with exactly A, B, C and D.',
  ].join('\n\n'));
  const rows = Array.isArray(judged.judgements) ? judged.judgements : [];
  const marked = rows.filter((row) => row.grammatical && row.naturalBritishEnglish && row.semanticallyDefensible && (row.collocationallyValid ?? row.collocationalFit) && (row.contextuallyDefensible ?? true));
  if (marked.length) {
    const review = await completeJson([
      'Re-check only the completed sentences below. actuallySaid is true only if a competent British speaker would say that exact sentence in this context.',
      'If you can defend it only as grammatical, or it is not a real collocation, actuallySaid is false.',
      'False examples: "have long lasted hidden", "in the long length", "rubbish we drop away".',
      JSON.stringify(marked.map((row) => ({ letter: row.letter, completedSentence: row.completedSentence, reason: row.reason }))),
      'Return {"reviews":[{"letter":"A","actuallySaid":false,"why":"one sentence"}]}',
    ].join('\n\n'));
    const rejected = new Set((review.reviews || []).filter((row) => row.actuallySaid === false).map((row) => String(row.letter).toUpperCase()));
    for (const row of rows) {
      if (rejected.has(String(row.letter).toUpperCase())) {
        row.naturalBritishEnglish = false;
        row.collocationallyValid = false;
        row.critique = (review.reviews || []).find((item) => String(item.letter).toUpperCase() === String(row.letter).toUpperCase())?.why || 'Not actually said.';
      }
    }
  }
  const verdict = judgePart1Substitutions(rows);
  const live = rows.filter((row) => row.grammatical && row.naturalBritishEnglish && row.semanticallyDefensible && (row.collocationallyValid ?? row.collocationalFit) && (row.contextuallyDefensible ?? true)).map((row) => String(row.letter).toUpperCase());
  return { question, sentence, rows, verdict, live, complete: rows.length === 4 && verdict.verdict !== 'HARD_FAIL' };
}

async function judgeReady(part, number) {
  let judged = await judgeOptions(part, number);
  if (!judged.complete) judged = await judgeOptions(part, number);
  return judged;
}

function passes(result, key) {
  return result.verdict.verdict === 'PASS' && result.live.length === 1 && result.live[0] === key;
}

async function confirmKey(part, number, key, result) {
  if (result.live.includes(key)) return result;
  const question = part.questions.find((item) => item.number === number);
  const word = optionWord(question.options.find((option) => option.startsWith(`${key})`)) || '');
  const completed = focusSentence(part, number).replace('[[GAP]]', word);
  const check = await completeJson([
    'Would a competent British speaker actually say this exact sentence?',
    `SENTENCE: ${completed}`,
    'actuallySaid is true only for a real collocation or idiom, not for a merely grammatical string.',
    'Return {"actuallySaid":false,"collocation":"","why":"one sentence"}',
  ].join('\n'));
  console.log(`  key check ${key} ${word}: ${check.actuallySaid} ${check.why || ''}`);
  if (check.actuallySaid !== true) return result;
  const row = result.rows.find((item) => String(item.letter).toUpperCase() === key);
  if (!row) return result;
  row.grammatical = true;
  row.naturalBritishEnglish = true;
  row.semanticallyDefensible = true;
  row.collocationallyValid = true;
  row.contextuallyDefensible = true;
  return withLive(result);
}

async function replaceDistractors(part, number, result, key) {
  let current = result;
  for (let guard = 0; guard < 4; guard += 1) {
    const target = current.live.find((letter) => letter !== key);
    if (!target) break;
    let accepted = false;
    for (let attempt = 0; attempt < 2 && !accepted; attempt += 1) {
      const proposal = await completeJson(teacherPart1DistractorRepairPrompt({
        passage: part.passage,
        sentence: current.sentence,
        options: current.question.options,
        judgements: current.rows,
        keyLetter: key,
        targetLetter: target,
      }));
      const patch = buildPart1DistractorOnlyPatch({
        options: current.question.options,
        judgements: current.rows,
        keyLetter: key,
        replacementWord: proposal.word,
        targetLetter: target,
      });
      if (patch.status !== 'PASS') {
        console.log(`  patch rejected ${target}: ${patch.reason}`);
        continue;
      }
      const previous = current.question.options;
      current.question.options = patch.proposedQuestion.options;
      const again = await judgeReady(part, number);
      console.log(`  distractor ${target} -> ${proposal.word}: ${again.live.join(',') || 'none'}`);
      if (!again.live.includes(target) && again.live.includes(key)) {
        current = again;
        accepted = true;
      } else {
        current.question.options = previous;
      }
    }
    if (!accepted) break;
  }
  return current;
}

async function repairSentence(part, number, key) {
  const question = part.questions.find((item) => item.number === number);
  const original = sentenceOf(part.passage, number);
  const focused = focusSentence(part, number);
  const keyWord = optionWord(question.options.find((option) => option.startsWith(`${key})`)) || '');
  const step = nextPart1Repair({ distractorsRepaired: true, sentenceRepaired: false });
  const proposal = await completeJson([
    repairPrompt(step),
    `Intended key word: ${keyWord} (option ${key}). It must stay the option text and become the only natural completion.`,
    'Change only this sentence. Keep every (number) marker, in the same order. Do not change any other sentence or any option.',
    'If the sentence contains another gap, keep that gap solvable by its current key.',
    `FULL SENTENCE:\n${original}`,
    `FOCUS, WITH OTHER GAPS FILLED ONLY FOR YOU:\n${focused}`,
    `OPTIONS:\n${JSON.stringify(question.options)}`,
    `Return the full passage sentence. Keep every other gap written as (number) ___ . Keep this gap written as (${number}) ___ . Do not write any answer word into a gap.`,
    'Return {"originalSentence":"...","revisedSentence":"...","reason":"..."}',
  ].join('\n\n'));
  const revised = String(proposal.revisedSentence || '').trim();
  const occurrences = part.passage.split(original).length - 1;
  if (occurrences !== 1 || !revised || !new RegExp(`\\(${number}\\)\\s*_{2,}`).test(revised) || JSON.stringify(markers(original)) !== JSON.stringify(markers(revised))) {
    console.log(`  sentence unusable: ${revised}`);
    return { ok: false, reason: 'The revision did not keep this sentence and its gaps.' };
  }
  const before = part.passage;
  part.passage = part.passage.replace(original, revised);
  console.log(`  revised: ${revised}`);
  const checks = [];
  for (const gap of gapNumbers(revised)) {
    if (!part.questions.some((item) => item.number === gap)) continue;
    const gapKey = String(part.modelAnswers.find((item) => item.number === gap)?.answer || '').toUpperCase();
    const judged = await judgeReady(part, gap);
    checks.push({ gap, key: gapKey, live: judged.live, pass: passes(judged, gapKey) });
  }
  const targetOk = checks.find((row) => row.gap === number)?.pass;
  const neighboursOk = checks.filter((row) => row.gap !== number).every((row) => row.pass);
  console.log(`  sentence: ${checks.map((row) => `Q${row.gap}:${row.live.join('/') || 'none'}`).join(' ')}`);
  if (!targetOk || !neighboursOk) {
    part.passage = before;
    return { ok: false, reason: 'The revised sentence did not leave every gap in it uniquely keyed.', checks };
  }
  return { ok: true, revised, checks };
}

const results = [];
for (const [exam, number] of TARGETS) {
  const loaded = getExam(exam);
  const part = loaded.data.parts['1'];
  const key = String(part.modelAnswers.find((item) => item.number === number).answer).toUpperCase();
  const snapshot = JSON.stringify(part.questions.filter((item) => item.number !== number));
  const answerSnapshot = JSON.stringify(part.modelAnswers);
  const passageBefore = part.passage;
  const optionsBefore = structuredClone(part.questions.find((item) => item.number === number).options);
  const budget = createRepairBudget();
  let state = { distractorsRepaired: false, sentenceRepaired: false };
  let current = await judgeReady(part, number);
  if (!current.live.includes(key)) {
    console.log(`  rejected key detail ${JSON.stringify(current.rows.map((row) => ({ letter: row.letter, natural: row.naturalBritishEnglish, collocation: row.collocationallyValid, reason: row.reason, critique: row.critique })))}`);
    current = await confirmKey(part, number, key, current);
  }
  console.log(`exam ${exam} Q${number} key ${key} initial ${current.live.join(',') || 'none'}`);
  let action = 'none';
  if (!passes(current, key) && current.live.includes(key) && spendRepair(budget, 'linguistic')) {
    const step = nextPart1Repair(state);
    if (step.action !== 'repair-distractor') throw new Error(`Expected distractor repair, got ${step.action}`);
    current = await replaceDistractors(part, number, current, key);
    state = { distractorsRepaired: true, sentenceRepaired: false };
    action = 'distractor';
  }
  if (!passes(current, key) && spendRepair(budget, 'linguistic')) {
    const step = nextPart1Repair({ distractorsRepaired: true, sentenceRepaired: false });
    if (step.action !== 'repair-sentence') throw new Error(`Expected sentence repair, got ${step.action}`);
    const edited = await repairSentence(part, number, key);
    state = { distractorsRepaired: true, sentenceRepaired: true };
    action = edited.ok ? `${action}+sentence` : action;
    if (edited.ok) current = await judgeReady(part, number);
  }
  const ok = passes(current, key);
  if (!ok) {
    part.passage = passageBefore;
    current.question.options = optionsBefore;
  } else if (action !== 'none') {
    loaded.dirty = true;
  }
  if (JSON.stringify(part.questions.filter((item) => item.number !== number)) !== snapshot) {
    throw new Error(`Unrelated question changed in exam ${exam} while repairing Q${number}`);
  }
  if (JSON.stringify(part.modelAnswers) !== answerSnapshot) {
    throw new Error(`Answer key changed in exam ${exam} while repairing Q${number}`);
  }
  results.push({
    exam,
    question: number,
    status: ok ? 'PASS' : 'UNREPAIRED',
    action: ok ? action : 'reverted',
    key,
    options: current.question.options,
    sentence: sentenceOf(part.passage, number),
    survivors: current.live,
    reason: ok ? current.verdict.reason : `Still ${current.live.join(', ') || 'no survivor'} after the bounded distractor and sentence repairs. Key ${key}.`,
  });
  console.log(`${ok ? 'PASS' : 'FAIL'} exam ${exam} Q${number} ${action}`);
}

for (const [exam, loaded] of exams) {
  if (!loaded.dirty) continue;
  const id = String(exam).padStart(2, '0');
  const dir = path.join(root, `local-teacher-repairs/ruoe-v2-phase11/exams/exam-${id}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `DRALO_RUOE_Exam_${id}_vNEXT_Teacher_Repair_v2.json`), `${JSON.stringify(loaded.data, null, 2)}\n`);
  console.log('wrote exam', exam);
}

fs.writeFileSync(path.join(root, 'local-teacher-repairs/ruoe-v2-phase11/part1-pass2.json'), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results.map((row) => `${row.status} ${row.exam} Q${row.question} ${row.action} [${row.options.join(' / ')}]`), null, 2));
