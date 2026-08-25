/**
 * Local item-level repair for Phase B Part 4 failures / clear mechanical defects.
 * Regenerates only listed slots; does not rewrite blueprints.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACK_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PACK_ROOT, '..', '..');
const { loadEnvLocal } = await import(
  pathToFileURL(path.join(REPO_ROOT, 'scripts', 'load-env-local.mjs')).href
);
loadEnvLocal();

const MODEL = process.env.DRALO_RUOE_PILOT_MODEL || 'gpt-4o-2024-08-06';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const JOBS = [
  {
    file: '05_OUTPUTS/EXAM-01/TBP-PILOT-EX01_Part4.json',
    blueprint_id: 'TBP-PILOT-EX01',
    questions: [26, 27, 28],
  },
  {
    file: '05_OUTPUTS/EXAM-02/TBP-PILOT-EX02_Part4.json',
    blueprint_id: 'TBP-PILOT-EX02',
    questions: [28],
  },
];

function normalizeSpaces(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}
function wordCount(answer) {
  return normalizeSpaces(answer).split(/\s+/).filter(Boolean).length;
}
function keywordOk(answer, keyword) {
  const target = String(keyword || '').toUpperCase();
  return normalizeSpaces(answer)
    .split(/\s+/)
    .some((w) => w.replace(/[^\p{L}]/gu, '').toUpperCase() === target);
}
function mpCover(answer, mp1, mp2) {
  const a = normalizeSpaces(answer).toLowerCase();
  const j = normalizeSpaces(`${mp1} ${mp2}`).toLowerCase();
  return a === j;
}
function fillGap(sentence2, answer) {
  return normalizeSpaces(
    String(sentence2).replace(/_{3,}|\.{4,}/, ` ${answer} `).replace(/\s+/g, ' '),
  );
}

function validate(item, slot) {
  const errors = [];
  const warnings = [];
  const keyword = slot.keyword_constraint.keyword;
  const wc = wordCount(item.answer);
  if (wc < 2 || wc > 5) errors.push(`word_count ${wc}`);
  if (!keywordOk(item.answer, keyword)) errors.push('keyword missing/changed');
  if (!Array.isArray(item.marking_points) || item.marking_points.length !== 2) {
    errors.push('need 2 marking points');
  } else if (!mpCover(item.answer, item.marking_points[0], item.marking_points[1])) {
    errors.push('marking points mismatch answer');
  }
  if (!String(item.sentence2).includes('____')) errors.push('sentence2 must use ____ gap');
  const filled = fillGap(item.sentence2, item.answer).toLowerCase();
  // crude duplication check: no immediate repeated 2-gram from answer beyond gap
  const ans = normalizeSpaces(item.answer).toLowerCase();
  if (filled.includes(`${ans} ${ans}`)) errors.push('answer appears duplicated after fill');
  // tense/consistency soft checks via slot avoid notes already in prompt
  if (!item.semantic_equivalence_rationale) warnings.push('missing rationale');
  return {
    status: errors.length ? 'fail' : warnings.length ? 'pass_with_warnings' : 'pass',
    errors,
    warnings,
    word_count: wc,
  };
}

const schema = {
  name: 'ruoe_part4_item_repair',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      question_number: { type: 'integer' },
      sentence1: { type: 'string' },
      keyword: { type: 'string' },
      sentence2: { type: 'string' },
      answer: { type: 'string' },
      accepted_variants: { type: 'array', items: { type: 'string' } },
      marking_points: {
        type: 'array',
        minItems: 2,
        maxItems: 2,
        items: { type: 'string' },
      },
      family_id: { type: 'string' },
      family_name: { type: 'string' },
      target_structure: { type: 'string' },
      difficulty_band: { type: 'string' },
      semantic_equivalence_rationale: { type: 'string' },
      alternative_route_check: { type: 'string' },
      naturalness_notes: { type: 'string' },
    },
    required: [
      'question_number',
      'sentence1',
      'keyword',
      'sentence2',
      'answer',
      'accepted_variants',
      'marking_points',
      'family_id',
      'family_name',
      'target_structure',
      'difficulty_band',
      'semantic_equivalence_rationale',
      'alternative_route_check',
      'naturalness_notes',
    ],
  },
};

async function gen(slot, previous) {
  const tips = {
    26: 'If using GET causative, keep tense consistent between sentence1 and sentence2 (e.g. both past or both future). Example shape: get my car fixed.',
    27: 'Keyword THAN must appear in the 2–5 word answer. Good pattern: sentence2 ends before the comparative, answer = "taller than" / "more expensive than". Never produce nonsense like "tall as than". sentence2 should become natural when answer is inserted.',
    28: 'For ASKED: sentence2 should already contain the lexical verb if needed, e.g. "Tom ____ help him." → "asked Anna to". Marking points must exactly split the answer words with no extra words.',
  };
  const sinceTip =
    'For SINCE duration: put the gap where more than the single word since is required, e.g. sentence2 "It ____ I last saw Emily." answer "has been two weeks since". Do NOT duplicate the past-event clause already present after the gap.';

  const user = [
    'Repair/generate ONE B2 Part 4 item from this exact Blueprint slot.',
    'British English. Answer 2–5 words including unchanged keyword.',
    'Exactly two marking points that concatenate with a space to the exact answer.',
    'sentence2 must contain one ____ gap. Filling the gap with the answer must yield one natural sentence with NO duplicated clause.',
    'Do not change family_id, target_structure, keyword, difficulty.',
    '',
    JSON.stringify(slot, null, 2),
    '',
    'Guidance:',
    tips[slot.question_number] || sinceTip,
    slot.keyword_constraint.keyword === 'SINCE' ? sinceTip : '',
    previous
      ? `\nPrevious failed item:\n${JSON.stringify(previous, null, 2)}`
      : '',
  ].join('\n');

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_tokens: 1200,
    response_format: { type: 'json_schema', json_schema: schema },
    messages: [
      {
        role: 'system',
        content:
          'You create a single defendable B2 First key-word transformation item. Return JSON only.',
      },
      { role: 'user', content: user },
    ],
  });
  const item = JSON.parse(completion.choices[0].message.content);
  item.question_number = slot.question_number;
  item.keyword = slot.keyword_constraint.keyword;
  item.family_id = slot.family_id;
  item.family_name = slot.family_name;
  item.target_structure = slot.target_structure;
  item.difficulty_band = slot.difficulty_band;
  item.slot_id = slot.slot_id;
  item.answer_shape = slot.answer_shape;
  item.marking_point_plan = slot.marking_point_plan;
  item.semantic_equivalence_goal = slot.semantic_equivalence_goal;
  return item;
}

const blueprints = JSON.parse(
  fs.readFileSync(
    path.join(
      PACK_ROOT,
      '02_APPROVED_INPUTS',
      'DRALO_RUOE_Transformation_Blueprints_Pilot_v1_0_APPROVED.json',
    ),
    'utf8',
  ),
).blueprints;

for (const job of JOBS) {
  const full = path.join(PACK_ROOT, job.file);
  const doc = JSON.parse(fs.readFileSync(full, 'utf8'));
  const bp = blueprints.find((b) => b.blueprint_id === job.blueprint_id);
  for (const qn of job.questions) {
    const slot = bp.slots.find((s) => s.question_number === qn);
    console.log(`Repair ${job.blueprint_id} Q${qn}`);
    let previous = doc.exercise.questions.find((q) => q.question_number === qn);
    let best = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      const item = await gen(slot, previous);
      const check = validate(item, slot);
      console.log(`  attempt ${attempt}: ${check.status}`, check.errors.join('; '));
      best = { item, check, attempt };
      if (check.status !== 'fail') break;
      previous = item;
    }
    const idx = doc.exercise.questions.findIndex((q) => q.question_number === qn);
    doc.exercise.questions[idx] = best.item;
    doc.item_checks[`Q${qn}`] = best.check;
    doc.item_attempts[`Q${qn}`] = (doc.item_attempts[`Q${qn}`] || 0) + best.attempt;
    if (!doc.repaired_items.includes(`Q${qn}`)) doc.repaired_items.push(`Q${qn}`);
  }

  // recompute task status
  const checks = [
    doc.item_checks.example,
    ...doc.exercise.questions.map((q) => doc.item_checks[`Q${q.question_number}`]),
  ];
  const fail_count = checks.filter((c) => c.status === 'fail').length;
  const warning_count = checks.filter((c) => c.status === 'pass_with_warnings').length;
  doc.self_check = {
    status: fail_count ? 'fail' : warning_count ? 'pass_with_warnings' : 'pass',
    fail_count,
    warning_count,
    scored_items: 6,
  };
  doc.generated_at = new Date().toISOString();
  doc.repair_pass = { at: new Date().toISOString(), kind: 'slot_local_regeneration' };
  fs.writeFileSync(full, JSON.stringify(doc, null, 2));
  console.log('Saved', job.file, doc.self_check.status);
}

console.log('done');
