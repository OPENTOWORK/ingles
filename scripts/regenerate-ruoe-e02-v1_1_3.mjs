/**
 * RUOE-PILOT-E02 full regeneration v1.1.3 — local code prompts, no Supabase.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/regenerate-ruoe-e02-v1_1_3.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvLocal } from './load-env-local.mjs';
import {
  generatePilotPartFromBrief,
  generatePilotPart4FromBlueprint,
  getOpenAIClient,
} from '../src/lib/ruoePilotRegeneration.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACK = path.join(
  ROOT,
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
);
const INPUTS = path.join(PACK, '02_APPROVED_INPUTS');
const RUNTIME = path.join(PACK, '01_RUNTIME');
const OLD_OUT = path.join(PACK, '05_OUTPUTS');
const PREV_REGEN = path.join(PACK, '05_OUTPUTS_REGENERATED_v1_1_2');
const OUT = path.join(PACK, '05_OUTPUTS_REGENERATED_E02_v1_1_3');
const UPGRADE = path.join(ROOT, 'DRALO_RUOE_System_Quality_Upgrade_v1_0');

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const SEED_BASE = 202608191400;
const PACK_VERSION = '1.1.3-e02-regenerated';
const GENERATION_VERSION = 'pilot-regen-e02-v1.1.3';

const EXAM_PLAN = {
  ruoeExamId: 'RUOE-PILOT-E02',
  examFolder: 'EXAM-02',
  examSlot: 2,
  briefs: [
    'CB-PILOT-007',
    'CB-PILOT-008',
    'CB-PILOT-009',
    'CB-PILOT-010',
    'CB-PILOT-011',
    'CB-PILOT-012',
  ],
  blueprintId: 'TBP-PILOT-EX02',
};

const MAX_ATTEMPTS_BY_PART = {
  1: 5,
  2: 5,
  3: 4,
  4: 3,
  5: 4,
  6: 4,
  7: 4,
};

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function writeText(p, text) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text, 'utf8');
}

function loadStyleCard(styleCardId) {
  const id = String(styleCardId || '').replace(/^SC-/, '');
  const p = path.join(RUNTIME, '_style_cards', `SC-${id}.txt`);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function partNumberFromBrief(brief) {
  return Number(String(brief.part || '').replace(/\D/g, ''));
}

function outfileName(brief) {
  const pn = partNumberFromBrief(brief);
  return `${brief.brief_id}_Part${pn}.json`;
}

function blockingHardCount(record) {
  return record?.validation?.blocking_hard_count ?? record?.validation?.errors?.length ?? 0;
}

function qualityReviewHardCount(record) {
  return (
    record?.validation?.quality_review_hard_count ?? record?.part_quality?.errors?.length ?? 0
  );
}

function stampRecord(record) {
  record.pack_version = PACK_VERSION;
  record.generation_version = GENERATION_VERSION;
  record.pedagogical_approval = 'PENDING_HUMAN_REVIEW';
  record.human_review_required = true;
  return record;
}

function blindSolveIssues(record) {
  const pq = record?.part_quality;
  const mismatches = pq?.blindSolve?.mismatches || [];
  const ambiguous = pq?.blindSolve?.ambiguous || [];
  return { mismatches, ambiguous };
}

function isPartAccepted(record, partNumber) {
  if (!record?.validation?.ok) return false;
  if (blockingHardCount(record) > 0) return false;

  if (partNumber === 1 || partNumber === 2) {
    if (qualityReviewHardCount(record) > 0) return false;
    const { mismatches, ambiguous } = blindSolveIssues(record);
    if (mismatches.length > 0) return false;
    if (ambiguous.length > 0) return false;
  }

  if (partNumber === 3) {
    const stemErrors = (record.validation?.errors || []).filter((e) =>
      /stem|transform|derivation/i.test(String(e)),
    );
    if (stemErrors.length) return false;
  }

  if (partNumber === 4) {
    const p4Hard = record.part4_findings?.filter((f) => f.severity === 'HARD') || [];
    if (p4Hard.length) return false;
  }

  return true;
}

function flattenFindings(record) {
  const chunks = [];
  const push = (arr, label) => {
    if (!Array.isArray(arr)) return;
    for (const x of arr) {
      if (typeof x === 'string') chunks.push(`${label}: ${x}`);
      else if (x?.message) chunks.push(`${label}: ${x.message}`);
      else chunks.push(`${label}: ${JSON.stringify(x)}`);
    }
  };
  push(record.validation?.errors, 'HARD');
  push(record.validation?.qualityFails, 'QUALITY');
  push(record.validation?.warnings, 'WARNING');
  push(record.editorial_findings, 'EDITORIAL');
  push(record.part4_findings, 'P4');
  push(record.adversarial_findings, 'ADV');
  push(record.part_quality?.errors, 'PQ');
  return chunks;
}

function renderValidatorBlock(record) {
  const lines = [];
  lines.push(`- **Mechanical validation:** ${record.validation.ok ? 'PASS' : 'FAIL'}`);
  lines.push(`- **HARD count (blocking):** ${blockingHardCount(record)}`);
  if (qualityReviewHardCount(record)) {
    lines.push(`- **Quality-review HARD:** ${qualityReviewHardCount(record)}`);
  }
  lines.push(`- **QUALITY count:** ${record.validation.quality_fail_count}`);
  lines.push(`- **Warnings:** ${record.validation.warning_count}`);
  if (record.repairs_applied?.length) {
    lines.push(`- **Repairs applied:** ${record.repairs_applied.length}`);
    for (const r of record.repairs_applied) lines.push(`  - ${r}`);
  }
  const { mismatches, ambiguous } = blindSolveIssues(record);
  if (mismatches.length) {
    lines.push('- **Blind-solve mismatches:**');
    for (const m of mismatches) {
      lines.push(`  - Q${m.number}: key ${m.key} / solver ${m.solver}`);
    }
  }
  if (ambiguous.length) {
    lines.push('- **Ambiguity warnings:**');
    for (const a of ambiguous) {
      lines.push(
        `  - Q${a.number}: ${(a.letters || a.words || []).join('/')} — ${a.reason || ''}`,
      );
    }
  }
  if (record.validation.errors?.length) {
    lines.push('- **Blocking HARD:**');
    for (const e of record.validation.errors) lines.push(`  - ${e}`);
  }
  if (record.validation.qualityFails?.length) {
    lines.push('- **QUALITY findings:**');
    for (const e of record.validation.qualityFails) lines.push(`  - ${e}`);
  }
  if (record.validation.warnings?.length) {
    lines.push('- **Warnings:**');
    for (const e of record.validation.warnings) lines.push(`  - ${e}`);
  }
  return lines.join('\n');
}

function renderHumanReviewSection(record, sourceFile) {
  const lines = [];
  lines.push(`# ${record.ruoe_exam_id} · ${record.part} · ${record.brief_id || record.blueprint_id}`);
  lines.push('');
  lines.push(`Source: \`${sourceFile}\``);
  lines.push('');
  lines.push('## Validator summary');
  lines.push('');
  lines.push(renderValidatorBlock(record));
  lines.push('');
  lines.push('## Enunciado preview');
  lines.push('');
  lines.push(record.enunciado_preview || '(no preview)');
  lines.push('');
  lines.push('---');
  lines.push('');
  return lines.join('\n');
}

async function generateWithRetries({
  partNumber,
  outFile,
  generator,
  label,
}) {
  const maxAttempts = MAX_ATTEMPTS_BY_PART[partNumber] || 3;
  let lastRecord = null;
  const attemptLog = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const varietySeed = SEED_BASE + partNumber * 12000 + attempt * 7000;
    console.error(`  attempt ${attempt}/${maxAttempts} (seed ${varietySeed})…`);

    let record = await generator(varietySeed);
    record = stampRecord(record);
    writeJson(outFile, record);
    lastRecord = record;

    const accepted = isPartAccepted(record, partNumber);
    const entry = {
      attempt,
      variety_seed: varietySeed,
      mechanical_ok: record.validation?.ok,
      blocking_hard: blockingHardCount(record),
      quality_review_hard: qualityReviewHardCount(record),
      quality: record.validation?.quality_fail_count ?? 0,
      warnings: record.validation?.warning_count ?? 0,
      repairs: record.repairs_applied?.length || 0,
      blind_mismatches: blindSolveIssues(record).mismatches.length,
      blind_ambiguous: blindSolveIssues(record).ambiguous.length,
      accepted,
    };
    attemptLog.push(entry);

    console.error(
      `    mechanical ${entry.mechanical_ok ? 'PASS' : 'FAIL'} | blocking HARD ${entry.blocking_hard} | PQ ${entry.quality_review_hard} | blind ${entry.blind_mismatches}/${entry.blind_ambiguous}`,
    );

    if (accepted) {
      console.error('  → ACCEPTED');
      return { record, accepted: true, attemptLog };
    }
  }

  console.error(`  → NOT ACCEPTED after ${maxAttempts} attempts`);
  return { record: lastRecord, accepted: false, attemptLog };
}

function compareSnippet(oldRec, newRec, partNumber) {
  if (!oldRec) return '- (no prior file)';
  const oldTitle =
    oldRec.generated?.title || oldRec.generated?.partTitle || oldRec.working_title || '—';
  const newTitle =
    newRec.generated?.title || newRec.generated?.partTitle || newRec.working_title || '—';
  return `- Title: "${oldTitle}" → "${newTitle}" | mechanical ${oldRec.validation?.ok ? 'PASS' : 'FAIL'} → ${newRec.validation?.ok ? 'PASS' : 'FAIL'} | blocking HARD ${blockingHardCount(oldRec)} → ${blockingHardCount(newRec)}`;
}

async function main() {
  loadEnvLocal();
  const openai = getOpenAIClient();

  const briefsDoc = readJson(
    path.join(INPUTS, 'DRALO_RUOE_12_Content_Briefs_Pilot_v1_0_APPROVED.json'),
  );
  const bpDoc = readJson(
    path.join(INPUTS, 'DRALO_RUOE_Transformation_Blueprints_Pilot_v1_0_APPROVED.json'),
  );
  const briefById = Object.fromEntries(briefsDoc.briefs.map((b) => [b.brief_id, b]));
  const blueprintById = Object.fromEntries(bpDoc.blueprints.map((b) => [b.blueprint_id, b]));

  const examOut = path.join(OUT, EXAM_PLAN.examFolder);
  fs.mkdirSync(examOut, { recursive: true });

  const blueprint = blueprintById[EXAM_PLAN.blueprintId];
  const allRecords = {};
  const partRuns = [];
  const humanReviewLines = [
    '# DRALO RUOE — Human Review · E02 Regenerated v1.1.3',
    '',
    '**RUOE-PILOT-E02** · Parts 1–7 · British English · local code prompts',
    '',
    '**Pedagogical approval:** PENDING_HUMAN_REVIEW',
    '',
  ];

  console.error(`\n=== ${EXAM_PLAN.ruoeExamId} v1.1.3 ===`);
  console.error(`Output: ${OUT}`);

  let partIndex = 0;
  for (const briefId of EXAM_PLAN.briefs) {
    const brief = briefById[briefId];
    const partNumber = partNumberFromBrief(brief);
    if (partNumber === 4) continue;

    partIndex += 1;
    console.error(`\nPart ${partNumber} (${briefId})…`);
    const outFile = path.join(examOut, outfileName(brief));

    const result = await generateWithRetries({
      partNumber,
      outFile,
      label: briefId,
      generator: (varietySeed) =>
        generatePilotPartFromBrief({
          brief,
          styleCardText: loadStyleCard(brief.style_card_id),
          examSlot: EXAM_PLAN.examSlot,
          openai,
          varietySeed,
          model: MODEL,
        }).then((r) => {
          r.pack_version = PACK_VERSION;
          r.generation_version = GENERATION_VERSION;
          return r;
        }),
    });

    allRecords[partNumber] = result.record;
    partRuns.push({
      part: partNumber,
      brief_id: briefId,
      file: path.relative(PACK, outFile),
      ...result.attemptLog[result.attemptLog.length - 1],
      attempts: result.attemptLog.length,
      attempt_log: result.attemptLog,
    });
    humanReviewLines.push(
      renderHumanReviewSection(result.record, path.relative(PACK, outFile)),
    );
  }

  console.error(`\nPart 4 (${EXAM_PLAN.blueprintId})…`);
  const p4File = path.join(examOut, `${EXAM_PLAN.blueprintId}_Part4.json`);
  const p4Result = await generateWithRetries({
    partNumber: 4,
    outFile: p4File,
    label: EXAM_PLAN.blueprintId,
    generator: (varietySeed) =>
      generatePilotPart4FromBlueprint({
        blueprint,
        examSlot: EXAM_PLAN.examSlot,
        openai,
        varietySeed,
        model: MODEL,
      }).then((r) => {
        r.pack_version = PACK_VERSION;
        r.generation_version = GENERATION_VERSION;
        return r;
      }),
  });

  allRecords[4] = p4Result.record;
  partRuns.push({
    part: 4,
    blueprint_id: EXAM_PLAN.blueprintId,
    file: path.relative(PACK, p4File),
    ...p4Result.attemptLog[p4Result.attemptLog.length - 1],
    attempts: p4Result.attemptLog.length,
    attempt_log: p4Result.attemptLog,
  });
  humanReviewLines.push(renderHumanReviewSection(p4Result.record, path.relative(PACK, p4File)));

  const manifest = {
    version: 'v1.1.3-e02',
    generated_at: new Date().toISOString(),
    ruoe_exam_id: EXAM_PLAN.ruoeExamId,
    useCodePrompts: true,
    british_english_required: true,
    supabase_sync: false,
    production_write: false,
    pedagogical_approval: 'PENDING_HUMAN_REVIEW',
    model: MODEL,
    output_folder: path.relative(PACK, OUT),
    parts: partRuns,
  };

  writeJson(path.join(OUT, 'regeneration_manifest.json'), manifest);
  writeText(path.join(OUT, 'HUMAN_REVIEW_REGENERATED_E02_v1_1_3.md'), humanReviewLines.join('\n'));
  writeJson(path.join(OUT, 'validation_summary.json'), {
    generated_at: new Date().toISOString(),
    parts: partRuns.map((p) => ({
      part: p.part,
      accepted: p.accepted,
      mechanical_ok: p.mechanical_ok,
      blocking_hard: p.blocking_hard,
      quality_review_hard: p.quality_review_hard,
      quality: p.quality,
      warnings: p.warnings,
      blind_mismatches: p.blind_mismatches,
      blind_ambiguous: p.blind_ambiguous,
      attempts: p.attempts,
    })),
  });

  const acceptedCount = partRuns.filter((p) => p.accepted).length;
  const mechanicalPass = partRuns.filter((p) => p.mechanical_ok).length;

  const comparisonLines = [
    '# E02 comparison notes (v1.1.2 → v1.1.3)',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    'Compared against `05_OUTPUTS_REGENERATED_v1_1_2/EXAM-02/` (not used as generation source).',
    '',
  ];

  for (const run of partRuns) {
    const pn = run.part;
    let prevPath = null;
    if (pn === 4) {
      prevPath = path.join(PREV_REGEN, EXAM_PLAN.examFolder, `${EXAM_PLAN.blueprintId}_Part4.json`);
    } else {
      const brief = briefById[run.brief_id];
      prevPath = path.join(PREV_REGEN, EXAM_PLAN.examFolder, outfileName(brief));
    }
    const oldRec = fs.existsSync(prevPath) ? readJson(prevPath) : null;
    comparisonLines.push(`## Part ${pn}`);
    comparisonLines.push('');
    comparisonLines.push(compareSnippet(oldRec, allRecords[pn], pn));
    comparisonLines.push('');
  }

  writeText(path.join(OUT, 'E02_COMPARISON_v1_1_2_to_v1_1_3.md'), comparisonLines.join('\n'));

  const report = [
    '# E02_REGENERATION_REPORT_v1_1_3',
    '',
    `**Date:** ${new Date().toISOString()}`,
    `**Exam:** RUOE-PILOT-E02`,
    `**Output:** \`${path.relative(ROOT, OUT)}/\``,
    '',
    '## Scope',
    '',
    '- Parts 1–7 regenerated with approved Content Briefs + Part 4 Blueprint.',
    '- Topic Bank / Style Card / family allocation unchanged.',
    '- British English mandatory in prompts.',
    '- Local code prompts (`resolveDefaultExamPartGenerationPrompt`).',
    '- No Supabase · no production.',
    '',
    '## Acceptance summary',
    '',
    `- Parts accepted (full criteria): **${acceptedCount}/7**`,
    `- Parts mechanical PASS: **${mechanicalPass}/7**`,
    `- Blocking HARD (sum): **${partRuns.reduce((s, p) => s + p.blocking_hard, 0)}**`,
    '',
    '## Status by Part',
    '',
    '| Part | Brief/Blueprint | Mechanical | Accepted | Blocking HARD | Q-review HARD | QUALITY | Warnings | Blind mismatch | Blind ambiguous | Attempts |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ];

  for (const p of partRuns) {
    report.push(
      `| ${p.part} | ${p.brief_id || p.blueprint_id} | ${p.mechanical_ok ? 'PASS' : 'FAIL'} | ${p.accepted ? 'YES' : 'NO'} | ${p.blocking_hard} | ${p.quality_review_hard} | ${p.quality} | ${p.warnings} | ${p.blind_mismatches} | ${p.blind_ambiguous} | ${p.attempts} |`,
    );
  }

  report.push('', '## Repairs applied', '');
  for (const p of partRuns) {
    const rec = allRecords[p.part];
    report.push(`### Part ${p.part}`);
    if (rec?.repairs_applied?.length) {
      for (const r of rec.repairs_applied) report.push(`- ${r}`);
    } else {
      report.push('- none');
    }
    report.push('');
  }

  report.push('## British English checks', '');
  report.push(
    '- Prompts include mandatory British English block (`BRITISH_ENGLISH_BLOCK` in `ruoePilotRegeneration.js`).',
    '- Editorial quality validator run on each part.',
    '- Human review required for naturalness confirmation.',
    '',
  );

  report.push('## Blind-solve disagreements', '');
  for (const p of partRuns) {
    const rec = allRecords[p.part];
    const { mismatches, ambiguous } = blindSolveIssues(rec);
    if (!mismatches.length && !ambiguous.length) {
      report.push(`- Part ${p.part}: none`);
      continue;
    }
    report.push(`- Part ${p.part}:`);
    for (const m of mismatches) {
      report.push(`  - mismatch Q${m.number}: key ${m.key} / solver ${m.solver}`);
    }
    for (const a of ambiguous) {
      report.push(
        `  - ambiguous Q${a.number}: ${(a.letters || a.words || []).join('/')} — ${a.reason || ''}`,
      );
    }
  }

  report.push('', '## Residual issues', '');
  if (acceptedCount < 7) {
    for (const p of partRuns.filter((x) => !x.accepted)) {
      report.push(`- Part ${p.part}: NOT accepted after ${p.attempts} attempts — review JSON and manifest.`);
      const rec = allRecords[p.part];
      for (const f of flattenFindings(rec).slice(0, 15)) {
        report.push(`  - ${f}`);
      }
    }
  } else {
    report.push('- All parts met acceptance criteria.');
  }

  report.push(
    '',
    '## Output files',
    '',
    `- JSON: \`${path.relative(PACK, examOut)}/\``,
    `- Manifest: \`regeneration_manifest.json\``,
    `- Human review: \`HUMAN_REVIEW_REGENERATED_E02_v1_1_3.md\``,
    `- Validation summary: \`validation_summary.json\``,
    '',
    '## Safety',
    '',
    '- Supabase sync: NOT performed',
    '- Production publish: NOT performed',
    '- Pedagogical approval: PENDING_HUMAN_REVIEW',
    '',
  );

  writeText(path.join(UPGRADE, 'E02_REGENERATION_REPORT_v1_1_3.md'), report.join('\n'));

  console.error('\n=== DONE ===');
  console.error(`Accepted: ${acceptedCount}/7 | Mechanical PASS: ${mechanicalPass}/7`);
  console.error(`Report: ${path.join(UPGRADE, 'E02_REGENERATION_REPORT_v1_1_3.md')}`);

  if (acceptedCount < 7) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
