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

function load(exam) {
  const id = String(exam).padStart(2, '0');
  const phase11 = path.join(root, `local-teacher-repairs/ruoe-v2-phase11/exams/exam-${id}/DRALO_RUOE_Exam_${id}_vNEXT_Teacher_Repair_v2.json`);
  const phase10 = path.join(root, `local-teacher-repairs/ruoe-v2-phase10/exams/exam-${id}/DRALO_RUOE_Exam_${id}_vNEXT_Teacher_Repair_v2.json`);
  return JSON.parse(fs.readFileSync(fs.existsSync(phase11) ? phase11 : phase10, 'utf8'));
}

async function completeJson(user) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    max_tokens: 1200,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Return JSON only. Define the expression before you judge it. Do not invent a meaning the expression does not have.' },
      { role: 'user', content: user },
    ],
  });
  return JSON.parse(response.choices?.[0]?.message?.content || '{}');
}

function sentenceOf(passage, number) {
  return passage.split(/(?<=[.!?])\s+/).find((chunk) => chunk.includes(`(${number})`)) || '';
}

async function judgeClause(clause, options) {
  const judged = await completeJson([
    'Define each completed expression before deciding.',
    'naturalBritishEnglish and collocationallyValid are true only if that definition is a real British English use and it is what this clause means.',
    'A merely grammatical string is not enough.',
    `CLAUSE: ${clause}`,
    `OPTIONS: ${JSON.stringify(options)}`,
    'The blank is [[GAP]].',
    'Return {"judgements":[{"letter":"A","definition":"...","completed":"...","grammatical":true,"naturalBritishEnglish":false,"semanticallyDefensible":false,"collocationallyValid":false,"contextuallyDefensible":false,"reason":"..."}]} with A-D.',
  ].join('\n\n'));
  const rows = judged.judgements || [];
  const verdict = judgePart1Substitutions(rows);
  const live = rows.filter((row) => row.grammatical && row.naturalBritishEnglish && row.semanticallyDefensible && row.collocationallyValid && (row.contextuallyDefensible ?? true)).map((row) => row.letter);
  console.log(clause);
  for (const row of rows) console.log(`  ${row.letter} ${row.definition} | ${row.reason}`);
  console.log('  live', live.join(',') || 'none', verdict.verdict);
  return { rows, verdict, live };
}

const exam6 = load(6);
const part6 = exam6.parts['1'];
const q4 = part6.questions.find((item) => item.number === 4);
await judgeClause('there is less stuff to put [[GAP]]', q4.options);

const exam13 = load(13);
const q1 = exam13.parts['1'].questions.find((item) => item.number === 1);
await judgeClause('a few simple habits can make a real [[GAP]] to your health', q1.options);

const exam14 = load(14);
const q14 = exam14.parts['1'].questions.find((item) => item.number === 4);
await judgeClause('meals must stay fresh for long periods and be easy to [[GAP]] out', q14.options);
console.log('E14 sentence', sentenceOf(exam14.parts['1'].passage, 4));
