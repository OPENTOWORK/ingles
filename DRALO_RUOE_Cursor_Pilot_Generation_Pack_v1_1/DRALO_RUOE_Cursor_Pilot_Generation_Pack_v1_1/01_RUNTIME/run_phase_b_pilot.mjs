/**
 * DRALO RUOE PHASE B — Part 4 from approved Transformation Blueprints.
 * Pack-local only. Regenerates failed items individually.
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
const GENERATION_VERSION = 'phase-b-v1.1-2026-08-13';
const MAX_ITEM_ATTEMPTS = Number(process.env.RUOE_PILOT_P4_MAX_ATTEMPTS || 4);

const EXAM_FOLDER = {
  'TBP-PILOT-EX01': 'EXAM-01',
  'TBP-PILOT-EX02': 'EXAM-02',
};
const RUOE_EXAM_ID = {
  'TBP-PILOT-EX01': 'RUOE-PILOT-E01',
  'TBP-PILOT-EX02': 'RUOE-PILOT-E02',
};

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function loadPart4Prompt() {
  const md = read(path.join(__dirname, 'DRALO_RUOE_Pilot_Runtime_Prompts_v1_1.md'));
  const m = md.match(/## Part 4 —([\s\S]*?)(?=\n## Part 5 —)/);
  return m ? `## Part 4 —${m[1]}`.trim() : md;
}

function wordCount(answer) {
  return String(answer || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function normalizeSpaces(s) {
  return String(s || '').replace(/\s+/g, ' ').trim();
}

function keywordAppearsUnchanged(answer, keyword) {
  const words = normalizeSpaces(answer).split(/\s+/);
  const target = String(keyword || '').toUpperCase();
  return words.some((w) => w.replace(/[^\p{L}]/gu, '').toUpperCase() === target);
}

function markingPointsCoverAnswer(answer, mp1, mp2) {
  const a = normalizeSpaces(answer).toLowerCase();
  const joined = normalizeSpaces(`${mp1} ${mp2}`).toLowerCase();
  const joinedTight = normalizeSpaces(`${mp1}${mp2}`).toLowerCase();
  return a === joined || a === joinedTight;
}

function validateItem(item, slot, { isExample = false } = {}) {
  const errors = [];
  const warnings = [];
  const keyword = slot?.keyword_constraint?.keyword || item.keyword;

  if (!item.sentence1?.trim()) errors.push('missing sentence1');
  if (!item.sentence2?.trim()) errors.push('missing sentence2');
  if (!item.answer?.trim()) errors.push('missing answer');
  if (!keyword) errors.push('missing keyword');

  const gapCount = (String(item.sentence2).match(/_{2,}|\(\s*\)|\[\s*\]/g) || []).length;
  if (!String(item.sentence2).includes('____') && !String(item.sentence2).includes('....') && gapCount < 1) {
    // allow a single blank represented as ____ or ..... or ()
    if (!/_{3,}|\.{3,}/.test(item.sentence2)) {
      warnings.push('sentence2 gap marker not clearly ____ / ....');
    }
  }

  const wc = wordCount(item.answer);
  if (wc < 2 || wc > 5) errors.push(`answer word_count ${wc} outside 2–5`);

  if (keyword && !keywordAppearsUnchanged(item.answer, keyword)) {
    errors.push(`keyword ${keyword} not present unchanged in answer`);
  }

  if (String(item.keyword || '').toUpperCase() !== String(keyword || '').toUpperCase()) {
    errors.push('item.keyword differs from blueprint keyword');
  }

  if (!Array.isArray(item.marking_points) || item.marking_points.length !== 2) {
    errors.push('exactly two marking_points required');
  } else {
    const [mp1, mp2] = item.marking_points;
    if (!mp1?.trim() || !mp2?.trim()) errors.push('empty marking point');
    else if (!markingPointsCoverAnswer(item.answer, mp1, mp2)) {
      errors.push('marking points do not cover full answer without leftovers');
    }
    const mpWords = wordCount(`${mp1} ${mp2}`);
    if (mpWords !== wc) {
      warnings.push(`marking-point word total ${mpWords} vs answer ${wc}`);
    }
  }

  if (slot) {
    if (item.family_id && item.family_id !== slot.family_id) {
      errors.push('family_id changed from blueprint');
    }
    if (item.target_structure && item.target_structure !== slot.target_structure) {
      errors.push('target_structure changed from blueprint');
    }
    if (item.difficulty_band && item.difficulty_band !== slot.difficulty_band) {
      warnings.push('difficulty_band label differs from blueprint (kept blueprint as authority)');
    }
  }

  if (!item.semantic_equivalence_rationale?.trim()) {
    warnings.push('missing semantic_equivalence_rationale');
  }

  if (!isExample && item.question_number !== slot.question_number) {
    errors.push('question_number mismatch');
  }

  return {
    status: errors.length ? 'fail' : warnings.length ? 'pass_with_warnings' : 'pass',
    errors,
    warnings,
    word_count: wc,
  };
}

const itemSchema = {
  name: 'ruoe_part4_item',
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
      accepted_variants: {
        type: 'array',
        items: { type: 'string' },
      },
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

async function generateItem(client, { part4Prompt, blueprint, slot, isExample, scoredKeywords, previousFail }) {
  const system = [
    'You generate one B2 First Reading and Use of English Part 4 Key Word Transformation item for DRALO.',
    'British English. CEFR B2.',
    'Use ONLY the Transformation Blueprint constraints provided.',
    'Do not change family, target structure, keyword, difficulty or marking-point architecture.',
    'Answer must be 2–5 words including the keyword unchanged.',
    'Exactly two marking points that together equal the full answer with no leftover words.',
    'sentence2 must contain exactly one gap shown as ____ .',
    'One clear defendable transformation route; avoid uncontrolled alternatives.',
    'Contractions only if explicitly needed and listed in accepted_variants.',
    'Return JSON matching the schema.',
  ].join(' ');

  const userParts = [
    part4Prompt,
    '',
    `Blueprint ID: ${blueprint.blueprint_id}`,
    `Blueprint status: ${blueprint.status}`,
    '',
    isExample
      ? [
          'Generate EXAMPLE item (0) only.',
          'It must NOT collide with scored-slot families/keywords:',
          scoredKeywords.join(', '),
          'Use a different family/target/keyword from those scored slots.',
          'question_number must be 0.',
          'Choose a common B2 transformation suitable as a worked example.',
        ].join('\n')
      : [
          'Generate ONE scored item for this slot. Do not change blueprint fields.',
          JSON.stringify(slot, null, 2),
          `question_number must be ${slot.question_number}.`,
          `keyword must be exactly: ${slot.keyword_constraint.keyword}`,
          `family_id must be exactly: ${slot.family_id}`,
          `target_structure must be exactly: ${slot.target_structure}`,
          `difficulty_band must be exactly: ${slot.difficulty_band}`,
        ].join('\n'),
  ];

  if (previousFail) {
    userParts.push(
      '',
      'PREVIOUS ATTEMPT FAILED VALIDATION. Fix only this item.',
      'Previous JSON:',
      JSON.stringify(previousFail.item, null, 2),
      'Errors:',
      previousFail.errors.join('\n'),
    );
  }

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: previousFail ? 0.35 : 0.4,
    max_tokens: 1200,
    response_format: { type: 'json_schema', json_schema: itemSchema },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userParts.join('\n') },
    ],
  });

  const item = JSON.parse(completion.choices[0].message.content);
  // Enforce blueprint authority for scored slots
  if (!isExample && slot) {
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
  } else {
    item.question_number = 0;
  }

  return {
    item,
    usage: {
      model: completion.model || MODEL,
      prompt_tokens: completion.usage?.prompt_tokens ?? null,
      completion_tokens: completion.usage?.completion_tokens ?? null,
      total_tokens: completion.usage?.total_tokens ?? null,
    },
  };
}

async function generateWithRetries(client, ctx) {
  let previousFail = null;
  let best = null;
  for (let attempt = 1; attempt <= MAX_ITEM_ATTEMPTS; attempt++) {
    const { item, usage } = await generateItem(client, { ...ctx, previousFail });
    const check = validateItem(item, ctx.isExample ? null : ctx.slot, {
      isExample: ctx.isExample,
    });
    const record = { item, usage, check, attempt, repaired: Boolean(previousFail) };
    best = record;
    console.log(
      `  ${ctx.isExample ? 'example(0)' : 'Q' + ctx.slot.question_number} attempt ${attempt}: ${check.status}` +
        (check.errors.length ? ` | ${check.errors.join('; ')}` : ''),
    );
    if (check.status !== 'fail') return record;
    previousFail = { item, errors: check.errors, warnings: check.warnings };
  }
  return best;
}

function buildHumanReview(docs) {
  const lines = [];
  lines.push('# DRALO RUOE — Human Review Pack · PHASE B (Part 4)');
  lines.push('');
  lines.push('Readable representation of the two Phase B Part 4 outputs.');
  lines.push('');
  lines.push('- Blueprint-only pipeline · No Content Brief / Style Card input');
  lines.push('- Pedagogical approval remains **PENDING_HUMAN_REVIEW**');
  lines.push('- Checklist: `04_REVIEW/DRALO_RUOE_Checklist_Revision_Part4_Piloto_v1_0.docx`');
  lines.push('');

  for (const doc of docs) {
    const e = doc.exercise;
    lines.push(`# ${doc.ruoe_exam_id} · Part 4 · ${doc.blueprint_id}`);
    lines.push('');
    lines.push(`_Source file: \`${doc._relpath}\`_`);
    lines.push('');
    lines.push('## Vista alumno');
    lines.push('');
    lines.push(`**Part title:** ${e.part_title}`);
    lines.push('');
    lines.push('**Instructions**');
    lines.push('');
    lines.push(e.instructions);
    lines.push('');
    lines.push('### Example (0)');
    lines.push('');
    lines.push(e.example.sentence1);
    lines.push('');
    lines.push(`**${e.example.keyword}**`);
    lines.push('');
    lines.push(e.example.sentence2);
    lines.push('');
    for (const q of e.questions) {
      lines.push(`### Question ${q.question_number}`);
      lines.push('');
      lines.push(q.sentence1);
      lines.push('');
      lines.push(`**${q.keyword}**`);
      lines.push('');
      lines.push(q.sentence2);
      lines.push('');
    }

    lines.push('---');
    lines.push('');
    lines.push('## Vista revisor');
    lines.push('');
    lines.push(`| Campo | Valor |`);
    lines.push(`| --- | --- |`);
    lines.push(`| Blueprint ID | ${doc.blueprint_id} |`);
    lines.push(`| Blueprint version | ${doc.blueprint_version} |`);
    lines.push(`| Exam ID (blueprint) | ${doc.exam_id} |`);
    lines.push(`| RUOE exam ID | ${doc.ruoe_exam_id} |`);
    lines.push(`| Task validator status | ${doc.self_check.status} |`);
    lines.push(`| Pedagogical approval | ${doc.pedagogical_approval} |`);
    lines.push('');

    const renderItem = (item, check, label) => {
      lines.push(`### ${label}`);
      lines.push('');
      lines.push(`- **Full answer:** ${item.answer}`);
      lines.push(`- **Keyword:** ${item.keyword}`);
      lines.push(`- **Transformation Family:** ${item.family_id} — ${item.family_name || ''}`);
      lines.push(`- **Target structure:** ${item.target_structure || ''}`);
      lines.push(`- **Difficulty:** ${item.difficulty_band || ''}`);
      lines.push(`- **Marking point 1:** ${item.marking_points?.[0] || ''}`);
      lines.push(`- **Marking point 2:** ${item.marking_points?.[1] || ''}`);
      lines.push(
        `- **Accepted variants:** ${(item.accepted_variants || []).length ? item.accepted_variants.join(' / ') : '_(none listed)_'}`,
      );
      lines.push(`- **Validator status:** ${check?.status || 'n/a'}`);
      if (check?.warnings?.length) {
        lines.push(`- **Warnings:** ${check.warnings.join('; ')}`);
      } else {
        lines.push('- **Warnings:** none');
      }
      if (check?.errors?.length) {
        lines.push(`- **Errors:** ${check.errors.join('; ')}`);
      }
      lines.push(
        `- **Rationale / semantic equivalence:** ${item.semantic_equivalence_rationale || item.semantic_equivalence_goal || '_(n/a)_'}`,
      );
      if (item.alternative_route_check) {
        lines.push(`- **Alternative-route check:** ${item.alternative_route_check}`);
      }
      lines.push(`- **Blueprint ID:** ${doc.blueprint_id}${item.slot_id ? ` / ${item.slot_id}` : ' / example'}`);
      lines.push('');
    };

    renderItem(e.example, doc.item_checks.example, 'Example (0)');
    for (const q of e.questions) {
      renderItem(q, doc.item_checks[`Q${q.question_number}`], `Question ${q.question_number}`);
    }
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY missing');
    process.exit(1);
  }

  const blueprintsDoc = JSON.parse(
    read(
      path.join(
        PACK_ROOT,
        '02_APPROVED_INPUTS',
        'DRALO_RUOE_Transformation_Blueprints_Pilot_v1_0_APPROVED.json',
      ),
    ),
  );
  const part4Prompt = loadPart4Prompt();
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const outputs = [];
  const summaryItems = [];

  for (const blueprint of blueprintsDoc.blueprints) {
    if (!String(blueprint.status).toLowerCase().includes('approved')) {
      throw new Error(`Blueprint ${blueprint.blueprint_id} not approved`);
    }
    console.log(`\n=== ${blueprint.blueprint_id} ===`);
    const folder = EXAM_FOLDER[blueprint.blueprint_id];
    const outDir = path.join(PACK_ROOT, '05_OUTPUTS', folder);
    fs.mkdirSync(outDir, { recursive: true });

    const scoredKeywords = blueprint.slots.map(
      (s) => `${s.family_id}/${s.keyword_constraint.keyword}`,
    );

    const exampleRec = await generateWithRetries(client, {
      part4Prompt,
      blueprint,
      slot: null,
      isExample: true,
      scoredKeywords,
    });

    const questions = [];
    const itemChecks = { example: exampleRec.check };
    const itemAttempts = { example: exampleRec.attempt };
    const repairedItems = [];
    if (exampleRec.repaired) repairedItems.push('example(0)');

    for (const slot of blueprint.slots) {
      const rec = await generateWithRetries(client, {
        part4Prompt,
        blueprint,
        slot,
        isExample: false,
        scoredKeywords,
      });
      questions.push(rec.item);
      itemChecks[`Q${slot.question_number}`] = rec.check;
      itemAttempts[`Q${slot.question_number}`] = rec.attempt;
      if (rec.repaired || rec.attempt > 1) repairedItems.push(`Q${slot.question_number}`);
      summaryItems.push({
        blueprint_id: blueprint.blueprint_id,
        question: slot.question_number,
        status: rec.check.status,
        errors: rec.check.errors,
        warnings: rec.check.warnings,
        attempt: rec.attempt,
        repaired: Boolean(rec.repaired || rec.attempt > 1),
      });
    }

    const allChecks = [exampleRec.check, ...Object.values(itemChecks).filter((c, i) => i > 0)];
    // rebuild allChecks properly
    const checksList = [exampleRec.check, ...blueprint.slots.map((s) => itemChecks[`Q${s.question_number}`])];
    const failCount = checksList.filter((c) => c.status === 'fail').length;
    const warnCount = checksList.filter((c) => c.status === 'pass_with_warnings').length;
    const taskStatus = failCount
      ? 'fail'
      : warnCount
        ? 'pass_with_warnings'
        : 'pass';

    const exercise = {
      part_title: 'Part 4 — Key Word Transformations',
      instructions:
        'For questions 25–30, complete the second sentence so that it has a similar meaning to the first sentence, using the word given. Do not change the word given. You must use between two and five words, including the word given. Here is an example (0).',
      example: exampleRec.item,
      questions,
    };

    const rel = `05_OUTPUTS/${folder}/${blueprint.blueprint_id}_Part4.json`;
    const doc = {
      pack_version: '1.1',
      batch_id: 'RUOE-PILOT-01',
      phase: 'B',
      generation_version: GENERATION_VERSION,
      generated_at: new Date().toISOString(),
      blueprint_id: blueprint.blueprint_id,
      blueprint_version: blueprint.blueprint_version,
      exam_id: blueprint.exam_id,
      ruoe_exam_id: RUOE_EXAM_ID[blueprint.blueprint_id],
      part: 'Part 4',
      part_number: 4,
      model: MODEL,
      item_attempts: itemAttempts,
      repaired_items: repairedItems,
      item_checks: itemChecks,
      self_check: {
        status: taskStatus,
        fail_count: failCount,
        warning_count: warnCount,
        scored_items: 6,
      },
      human_review_required: true,
      pedagogical_approval: 'PENDING_HUMAN_REVIEW',
      exercise,
      _relpath: rel,
    };

    fs.writeFileSync(path.join(PACK_ROOT, rel), JSON.stringify(doc, null, 2));
    console.log('Wrote', rel, 'status=', taskStatus);
    outputs.push(doc);

    summaryItems.push({
      blueprint_id: blueprint.blueprint_id,
      question: 'example(0)',
      status: exampleRec.check.status,
      errors: exampleRec.check.errors,
      warnings: exampleRec.check.warnings,
      attempt: exampleRec.attempt,
      repaired: Boolean(exampleRec.repaired || exampleRec.attempt > 1),
    });
  }

  // Human review
  const humanPath = path.join(PACK_ROOT, '05_OUTPUTS', 'HUMAN_REVIEW_PHASE_B.md');
  fs.writeFileSync(humanPath, buildHumanReview(outputs));
  console.log('Wrote', humanPath);

  // Phase B report section + update combined reports
  const phaseASummaryPath = path.join(PACK_ROOT, '05_OUTPUTS', 'PILOT_VALIDATION_SUMMARY.json');
  let phaseA = null;
  if (fs.existsSync(phaseASummaryPath)) {
    try {
      phaseA = JSON.parse(read(phaseASummaryPath)).phase_a || null;
    } catch {
      phaseA = null;
    }
  }

  const phaseB = {
    status: outputs.every((d) => d.self_check.status !== 'fail')
      ? 'COMPLETE_READY_FOR_HUMAN_REVIEW'
      : 'COMPLETE_WITH_FAILURES',
    part4_task_count: 2,
    scored_transformations: 12,
    model: MODEL,
    generation_version: GENERATION_VERSION,
    files: outputs.map((d) => d._relpath),
    human_review: '05_OUTPUTS/HUMAN_REVIEW_PHASE_B.md',
    human_review_checklist: '04_REVIEW/DRALO_RUOE_Checklist_Revision_Part4_Piloto_v1_0.docx',
    pedagogical_approval: 'PENDING_HUMAN_REVIEW',
    tasks: outputs.map((d) => ({
      blueprint_id: d.blueprint_id,
      ruoe_exam_id: d.ruoe_exam_id,
      status: d.self_check.status,
      fail_count: d.self_check.fail_count,
      warning_count: d.self_check.warning_count,
      repaired_items: d.repaired_items,
      item_checks: d.item_checks,
    })),
    item_results: summaryItems.sort((a, b) =>
      `${a.blueprint_id}-${a.question}`.localeCompare(`${b.blueprint_id}-${b.question}`),
    ),
  };

  const validationSummary = {
    pack_version: '1.1',
    batch_id: 'RUOE-PILOT-01',
    generated_at: new Date().toISOString(),
    phase_a: phaseA || {
      status: 'PREVIOUSLY_COMPLETED',
      note: 'See prior Phase A artefacts in 05_OUTPUTS',
    },
    phase_b: phaseB,
  };
  fs.writeFileSync(phaseASummaryPath, JSON.stringify(validationSummary, null, 2));

  const scoredPass = summaryItems.filter(
    (i) => i.question !== 'example(0)' && i.status === 'pass',
  ).length;
  const scoredWarn = summaryItems.filter(
    (i) => i.question !== 'example(0)' && i.status === 'pass_with_warnings',
  ).length;
  const scoredFail = summaryItems.filter(
    (i) => i.question !== 'example(0)' && i.status === 'fail',
  ).length;

  const reportPath = path.join(PACK_ROOT, '05_OUTPUTS', 'PILOT_GENERATION_REPORT.md');
  let existing = fs.existsSync(reportPath) ? read(reportPath) : '';
  // Keep Phase A section if present; append/replace Phase B
  if (existing.includes('## PHASE B')) {
    existing = existing.split('## PHASE B')[0].trimEnd() + '\n\n';
  } else if (existing && !existing.endsWith('\n')) {
    existing += '\n\n';
  }

  const phaseBReport = `## PHASE B — Part 4 Blueprint pipeline

Status: **${phaseB.status}**  
Generated: ${new Date().toISOString()}  
Model: \`${MODEL}\`  
Generation version: \`${GENERATION_VERSION}\`

### Scope
- TBP-PILOT-EX01 → RUOE-PILOT-E01 Part 4
- TBP-PILOT-EX02 → RUOE-PILOT-E02 Part 4
- 2 examples + **12 scored transformations** (Q25–30 × 2)

### Automatic validation (scored items only)

| Result | Count |
| --- | ---: |
| pass | ${scoredPass} |
| pass_with_warnings | ${scoredWarn} |
| fail | ${scoredFail} |

### Files
${outputs.map((d) => `- \`${d._relpath}\` (task status: ${d.self_check.status})`).join('\n')}
- \`05_OUTPUTS/HUMAN_REVIEW_PHASE_B.md\`

### Local repairs
${outputs
  .map((d) =>
    d.repaired_items.length
      ? `- ${d.blueprint_id}: ${d.repaired_items.join(', ')}`
      : `- ${d.blueprint_id}: none`,
  )
  .join('\n')}

### Human review
All Part 4 items require human pedagogical review using \`04_REVIEW/DRALO_RUOE_Checklist_Revision_Part4_Piloto_v1_0.docx\`.

Automatic checks do **not** equal pedagogical approval.

### Stop
PHASE B complete. No orchestrator, no P1–P7 integration, no production writes.
`;

  if (!existing.includes('## PHASE A')) {
    existing =
      `# DRALO RUOE — Pilot Generation Report\n\nBatch: RUOE-PILOT-01\nPack: v1.1\n\n## PHASE A — Content Brief pipeline\n\nStatus: previously completed (see Phase A artefacts).\n\n`;
  }

  fs.writeFileSync(reportPath, existing + phaseBReport);
  fs.writeFileSync(
    path.join(PACK_ROOT, '05_OUTPUTS', '_phase_b_run_results.json'),
    JSON.stringify({ generated_at: new Date().toISOString(), phase_b: phaseB }, null, 2),
  );

  console.log('\nPHASE B complete');
  console.log(JSON.stringify({ scoredPass, scoredWarn, scoredFail, files: phaseB.files }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
