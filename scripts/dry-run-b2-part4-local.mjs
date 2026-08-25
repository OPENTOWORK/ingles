/**
 * Local Part 4 dry-run (no OpenAI, no Supabase): quality gate on fixtures + pilot blueprints.
 * Usage: node --loader ./scripts/alias-loader.mjs scripts/dry-run-b2-part4-local.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateGeneratedExamPart } from '../src/lib/examPartValidation.js';
import { validatePart4Quality } from '../src/lib/ruoePart4Quality.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'scripts', 'generated', 'reviews');
mkdirSync(outDir, { recursive: true });

function metaFromBlueprint(q) {
  const mp = (q.marking_points || []).map((label, i) => ({
    id: i + 1,
    label: String(label),
    accepted: [String(label)],
  }));
  const variants = Array.isArray(q.accepted_variants) ? q.accepted_variants : [q.answer];
  return {
    type: 'b2_key_word_transformation',
    version: 1,
    keyword: q.keyword,
    fullAnswers: variants,
    markingPoints: mp.length === 2 ? mp : [
      { id: 1, label: 'mp1', accepted: [q.answer?.split(' ').slice(0, 2).join(' ') || 'x'] },
      { id: 2, label: 'mp2', accepted: [q.answer?.split(' ').slice(2).join(' ') || 'y'] },
    ],
  };
}

function blueprintToGenerated(bp) {
  const ex = bp.exercise || bp;
  const example = ex.example || {};
  const questions = (ex.questions || []).map((q, i) => ({
    id: `q${i + 1}`,
    type: 'transformation',
    number: q.question_number ?? q.number,
    sentence1: q.sentence1,
    keyword: q.keyword,
    sentence2Start: String(q.sentence2 || q.sentence2Start || '').replace(
      /_{2,}/,
      '__________________',
    ),
    answer: q.answer,
    family_id: q.family_id,
    target_structure: q.target_structure,
    difficulty_band: q.difficulty_band,
    transformation_distance: q.transformation_distance,
    alternative_route_check: q.alternative_route_check,
    marking_point_plan: q.marking_point_plan,
    grading_metadata: q.grading_metadata || metaFromBlueprint(q),
  }));

  return {
    partTitle: ex.part_title || 'Part 4',
    directions: ex.instructions || ex.directions || '',
    example: {
      number: example.question_number ?? 0,
      sentence1: example.sentence1,
      keyword: example.keyword,
      sentence2Start: String(example.sentence2 || example.sentence2Start || '').replace(
        /_{2,}/,
        '__________________',
      ),
      answer: example.answer,
    },
    questions,
    modelAnswers: questions.map((q) => ({ id: q.id, number: q.number, answer: q.answer })),
  };
}

async function loadFixtureModule(rel) {
  const mod = await import(path.join(root, rel));
  return mod;
}

// Inline minimal valid fixture (same as test suite)
function makeValidPart4() {
  const items = [
    {
      number: 25,
      sentence1: 'It is not necessary for you to use a password every time.',
      keyword: 'NEED',
      sentence2Start: 'You __________________ a password every time.',
      answer: 'do not need to use',
      grading_metadata: {
        type: 'b2_key_word_transformation',
        version: 1,
        keyword: 'NEED',
        fullAnswers: ['do not need to use', "don't need to use"],
        markingPoints: [
          { id: 1, label: 'negative need', accepted: ['do not need', "don't need"] },
          { id: 2, label: 'to use', accepted: ['to use'] },
        ],
      },
    },
    {
      number: 26,
      sentence1: 'I did not intend to delete the file.',
      keyword: 'MEAN',
      sentence2Start: 'I __________________ the file.',
      answer: "didn't mean to delete",
      grading_metadata: {
        type: 'b2_key_word_transformation',
        version: 1,
        keyword: 'MEAN',
        fullAnswers: ["didn't mean to delete", 'did not mean to delete'],
        markingPoints: [
          { id: 1, label: "didn't mean", accepted: ["didn't mean", 'did not mean'] },
          { id: 2, label: 'to delete', accepted: ['to delete'] },
        ],
      },
    },
    {
      number: 27,
      sentence1: 'The exam was less difficult than I expected.',
      keyword: 'AS',
      sentence2Start: 'The exam __________________ I expected.',
      answer: 'was not as hard as',
      grading_metadata: {
        type: 'b2_key_word_transformation',
        version: 1,
        keyword: 'AS',
        fullAnswers: ['was not as hard as', "wasn't as hard as"],
        markingPoints: [
          { id: 1, label: 'was not', accepted: ['was not', "wasn't"] },
          { id: 2, label: 'as hard as', accepted: ['as hard as'] },
        ],
      },
    },
    {
      number: 28,
      sentence1: 'She has never visited Rome before.',
      keyword: 'HAD',
      sentence2Start: 'Never before __________________ Rome.',
      answer: 'had she visited',
      grading_metadata: {
        type: 'b2_key_word_transformation',
        version: 1,
        keyword: 'HAD',
        fullAnswers: ['had she visited'],
        markingPoints: [
          { id: 1, label: 'had she', accepted: ['had she'] },
          { id: 2, label: 'visited', accepted: ['visited'] },
        ],
      },
    },
    {
      number: 29,
      sentence1: 'People say that the museum opens at nine.',
      keyword: 'THOUGHT',
      sentence2Start: 'The museum __________________ at nine.',
      answer: 'is thought to open',
      grading_metadata: {
        type: 'b2_key_word_transformation',
        version: 1,
        keyword: 'THOUGHT',
        fullAnswers: ['is thought to open'],
        markingPoints: [
          { id: 1, label: 'is thought', accepted: ['is thought'] },
          { id: 2, label: 'to open', accepted: ['to open'] },
        ],
      },
    },
    {
      number: 30,
      sentence1: 'I am excited about hearing from you soon.',
      keyword: 'FORWARD',
      sentence2Start: 'I am __________________ from you soon.',
      answer: 'looking forward to hearing',
      grading_metadata: {
        type: 'b2_key_word_transformation',
        version: 1,
        keyword: 'FORWARD',
        fullAnswers: ['looking forward to hearing'],
        markingPoints: [
          { id: 1, label: 'looking forward', accepted: ['looking forward'] },
          { id: 2, label: 'to hearing', accepted: ['to hearing'] },
        ],
      },
    },
  ];

  return {
    partTitle: 'Part 4: Key word transformations',
    directions: 'Directions…',
    example: {
      number: 0,
      sentence1: 'You must do the washing-up tonight.',
      keyword: 'HAVE',
      sentence2Start: 'You __________________ the washing-up tonight.',
      answer: 'have to do',
    },
    questions: items.map((item, i) => ({ id: `q${i + 1}`, type: 'transformation', ...item })),
    modelAnswers: items.map((item, i) => ({ id: `q${i + 1}`, number: item.number, answer: item.answer })),
  };
}

function summarize(label, gen) {
  const validation = validateGeneratedExamPart('b2', 4, gen);
  const quality = validatePart4Quality(validation.normalized || gen);
  return {
    label,
    mechanicalOk: validation.ok,
    mechanicalErrors: validation.errors,
    qualityHard: quality.hardFails,
    qualityFails: quality.qualityFails,
    warnings: [...validation.warnings, ...quality.warnings],
    metrics: quality.metrics,
  };
}

const pilotPaths = [
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1/DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1/05_OUTPUTS/EXAM-01/TBP-PILOT-EX01_Part4.json',
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1/DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1/05_OUTPUTS/EXAM-02/TBP-PILOT-EX02_Part4.json',
];

const reports = [summarize('canonical-fixture', makeValidPart4())];

for (const rel of pilotPaths) {
  const full = path.join(root, rel);
  const bp = JSON.parse(readFileSync(full, 'utf8'));
  reports.push(summarize(rel.split('/').pop(), blueprintToGenerated(bp)));
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outPath = path.join(outDir, `b2-part4-local-dry-run-${stamp}.json`);
writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), reports, outPath }, null, 2));

console.log(JSON.stringify({ outPath, reports }, null, 2));
