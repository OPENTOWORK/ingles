import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';
import { loadEnvLocal } from '../../scripts/load-env-local.mjs';
import { judgePart1Substitutions } from '../../src/lib/ruoeNaturalnessFirstV2/judgements.js';
import { teacherPart1DistractorRepairPrompt } from '../../src/lib/ruoeNaturalnessFirstV2/prompts.js';
import { buildPart1DistractorOnlyPatch } from '../../src/lib/ruoeNaturalnessFirstV2/teacherRepair.js';

loadEnvLocal();
const root = process.cwd();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || process.env.DRALO_OPENAI_API_KEY });

function examPath(exam, phase) {
  const id = String(exam).padStart(2, '0');
  return path.join(root, `local-teacher-repairs/ruoe-v2-${phase}/exams/exam-${id}/DRALO_RUOE_Exam_${id}_vNEXT_Teacher_Repair_v2.json`);
}

function loadExam(exam) {
  const phase11 = examPath(exam, 'phase11');
  const file = fs.existsSync(phase11) ? phase11 : examPath(exam, 'phase10');
  return { file, phase11, data: JSON.parse(fs.readFileSync(file, 'utf8')), fromPhase11: fs.existsSync(phase11) };
}

const cache = new Map();
function getExam(exam) {
  if (!cache.has(exam)) cache.set(exam, loadExam(exam));
  return cache.get(exam);
}

async function completeJson(user) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    max_tokens: 1200,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Return JSON only. Judge the supplied English exactly. Do not call an option defensible when your reason says it contradicts the passage.' },
      { role: 'user', content: user },
    ],
  });
  return JSON.parse(response.choices?.[0]?.message?.content || '{}');
}

function gapSentence(passage, number) {
  const chunks = String(passage).split(/(?<=[.!?])\s+/);
  return chunks.find((chunk) => chunk.includes(`(${number})`)) || '';
}

async function judge(part, number) {
  const question = part.questions.find((item) => item.number === number);
  const sentence = gapSentence(part.passage, number);
  const judged = await completeJson([
    'Substitute A, B, C and D independently into the sentence. Booleans are authoritative.',
    'Contextually defensible means compatible with this passage.',
    `PASSAGE:\n${part.passage}`,
    `SENTENCE:\n${sentence}`,
    `OPTIONS:\n${JSON.stringify(question.options)}`,
    'Return {"judgements":[{"letter":"A","grammatical":true,"naturalBritishEnglish":true,"semanticallyDefensible":true,"collocationallyValid":true,"contextuallyDefensible":true,"reason":"..."}]} with exactly A-D.',
  ].join('\n\n'));
  return { question, sentence, judged, verdict: judgePart1Substitutions(judged.judgements) };
}

function survivors(judgements) {
  return (judgements || []).filter((row) => (
    row.grammatical && row.naturalBritishEnglish && row.semanticallyDefensible
    && (row.collocationallyValid ?? row.collocationalFit)
    && (row.contextuallyDefensible ?? true)
  )).map((row) => String(row.letter || row.option).toUpperCase());
}

const exceptions = JSON.parse(fs.readFileSync(path.join(root, 'local-teacher-repairs/ruoe-v2-phase11/exceptions-raw.json'), 'utf8'));
const items = exceptions.filter((row) => row.status === 'QUALITY_FAIL').map((row) => ({ exam: row.exam, question: row.question }));
items.push({ exam: 16, question: 6 });

const results = [];
for (const item of items) {
  const loaded = getExam(item.exam);
  const part = loaded.data.parts['1'];
  const key = String(part.modelAnswers.find((row) => row.number === item.question).answer).toUpperCase();
  let current = await judge(part, item.question);
  let live = survivors(current.judged.judgements);
  console.log(`exam ${item.exam} Q${item.question} key ${key} survivors ${live.join(',') || 'none'} ${current.verdict.verdict}`);
  let repaired = false;
  if (!(live.length === 1 && live[0] === key)) {
    const distractors = live.filter((letter) => letter !== key);
    for (const target of distractors.slice(0, 2)) {
      const proposal = await completeJson(teacherPart1DistractorRepairPrompt({
        passage: part.passage,
        sentence: current.sentence,
        options: current.question.options,
        judgements: current.judged.judgements,
        keyLetter: key,
        targetLetter: target,
      }));
      const patch = buildPart1DistractorOnlyPatch({
        options: current.question.options,
        judgements: current.judged.judgements,
        keyLetter: key,
        replacementWord: proposal.word,
        targetLetter: target,
      });
      if (patch.status !== 'PASS') continue;
      current.question.options = patch.proposedQuestion.options;
      current = await judge(part, item.question);
      live = survivors(current.judged.judgements);
      console.log(`  tried ${target}->${proposal.word}: ${live.join(',') || 'none'}`);
      if (live.length === 1 && live[0] === key) {
        repaired = true;
        break;
      }
    }
  }
  const ok = live.length === 1 && live[0] === key;
  if (!ok && repaired) {
    // unreachable
  }
  if (!ok) {
    const source = JSON.parse(fs.readFileSync(examPath(item.exam, 'phase10'), 'utf8'));
    const original = source.parts['1'].questions.find((row) => row.number === item.question);
    current.question.options = structuredClone(original.options);
  }
  results.push({
    exam: item.exam,
    part: 1,
    question: item.question,
    status: ok ? 'RESOLVED' : 'UNRESOLVED',
    repaired,
    key,
    survivors: live,
    options: current.question.options,
    reason: ok
      ? (repaired ? `Replaced a surviving distractor. Only ${key} survives.` : `Original options already leave only ${key}.`)
      : `Independent substitution still leaves ${live.join(', ') || 'no'} survivor(s). Key is ${key}.`,
  });
}

for (const [exam, loaded] of cache) {
  const touched = results.some((row) => row.exam === exam && row.repaired && row.status === 'RESOLVED');
  if (!touched) continue;
  const id = String(exam).padStart(2, '0');
  const dir = path.join(root, `local-teacher-repairs/ruoe-v2-phase11/exams/exam-${id}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `DRALO_RUOE_Exam_${id}_vNEXT_Teacher_Repair_v2.json`), `${JSON.stringify(loaded.data, null, 2)}\n`);
  console.log('wrote exam', exam);
}

fs.writeFileSync(path.join(root, 'local-teacher-repairs/ruoe-v2-phase11/part1-results.json'), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results.map((row) => `${row.status} ${row.exam} Q${row.question} ${row.reason}`), null, 2));
