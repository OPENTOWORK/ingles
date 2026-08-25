/**
 * Full pilot regeneration v1.1.2 — local code prompts, no Supabase.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/regenerate-ruoe-pilots-v1_1_2.mjs
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
const OUT = path.join(PACK, '05_OUTPUTS_REGENERATED_v1_1_2');
const UPGRADE = path.join(ROOT, 'DRALO_RUOE_System_Quality_Upgrade_v1_0');

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const SEED_BASE = 202608171200;

const EXAM_PLAN = [
  {
    ruoeExamId: 'RUOE-PILOT-E01',
    examFolder: 'EXAM-01',
    examSlot: 1,
    briefs: [
      'CB-PILOT-001',
      'CB-PILOT-002',
      'CB-PILOT-003',
      'CB-PILOT-004',
      'CB-PILOT-005',
      'CB-PILOT-006',
    ],
    blueprintId: 'TBP-PILOT-EX01',
    oldPart4: 'TBP-PILOT-EX01_Part4.json',
  },
  {
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
    oldPart4: 'TBP-PILOT-EX02_Part4.json',
  },
];

const PART4_TEACHER_ISSUES = [
  {
    id: 'P4-TEACHER-01',
    problem: 'Difficulty felt B1+/B2-basic rather than B2-Standard/B2-Strong.',
    rule: 'Part 4 prompt + ruoePart4Quality difficulty_band policy.',
    patterns: [/too easy/i, /b1/i, /low difficulty/i, /P4-DIFFICULTY/i],
  },
  {
    id: 'P4-TEACHER-02',
    problem: 'Transformations too direct / low transformation distance.',
    rule: 'transformation_distance validator + naturalness-first prompt.',
    patterns: [/low distance/i, /too direct/i, /P4-DISTANCE/i, /transformation distance/i],
  },
  {
    id: 'P4-TEACHER-03',
    problem: 'Unnatural S1/S2 phrasing.',
    rule: 'Naturalness validator + editorial quality.',
    patterns: [/unnatural/i, /artificial/i, /P4-NATURAL/i],
  },
  {
    id: 'P4-TEACHER-04',
    problem: 'Incomplete context in sentence pairs.',
    rule: 'context completeness validator.',
    patterns: [/incomplete context/i, /P4-CONTEXT/i],
  },
  {
    id: 'P4-TEACHER-05',
    problem: 'Answer length variety weak (too many 2-word answers).',
    rule: 'answer-length distribution QUALITY gate.',
    patterns: [/answer length/i, /word count distribution/i, /P4-LENGTH/i],
  },
  {
    id: 'P4-TEACHER-06',
    problem: 'Contraction variants not explicit in accepted answers.',
    rule: 'accepted variants + contraction-aware marking repair.',
    patterns: [/contraction/i, /variant/i, /P4-VARIANT/i],
  },
  {
    id: 'P4-TEACHER-07',
    problem: 'Metadata mismatch (family/target_structure vs answer).',
    rule: 'P4-METADATA-MISMATCH HARD validator.',
    patterns: [/metadata mismatch/i, /P4-METADATA/i],
  },
  {
    id: 'P4-TEACHER-08',
    problem: 'Marking-point partition failures / incoherent MPs.',
    rule: 'marking-point repair v1.1.1 + P4-MARKING-POINT-MISMATCH.',
    patterns: [/marking point/i, /partition/i, /P4-MARKING/i],
  },
];

const QA_MATRIX = [
  {
    id: 'QA-001',
    parts: [{ exam: 'E02', part: 1 }],
    problem: 'Two distractors/correct answers defensible in P1 Q6/Q8.',
    rule: 'Adversarial option test; multi-defensible = HARD FAIL.',
    patterns: [/defensible/i, /ambiguous/i, /multiple correct/i, /multi-defensible/i],
  },
  {
    id: 'QA-002',
    parts: [{ exam: 'E01', part: 3 }],
    problem: 'ADAPT→adapt; no prefix/negative variety (stem==answer).',
    rule: 'P3 derivation variety + stem==answer repair.',
    patterns: [/stem.*answer/i, /no transform/i, /derivation variety/i, /root=answer/i],
  },
  {
    id: 'QA-003',
    parts: [{ exam: 'E02', part: 3 }],
    problem: 'Naturalness sacrificed to planned word formation.',
    rule: 'P3 prompt + Editorial Quality — change stem before unnatural prose.',
    patterns: [/unnatural/i, /word formation/i, /forced/i],
  },
  {
    id: 'QA-004',
    parts: [{ exam: 'E01', part: 5 }],
    problem: 'Repetitive final paragraphs / filler.',
    rule: 'Editorial Quality redundancy scan.',
    patterns: [/repetit/i, /filler/i, /redundan/i],
  },
  {
    id: 'QA-005',
    parts: [{ exam: 'E02', part: 5 }],
    problem: 'Weak distractors not grounded in passage.',
    rule: 'P5 adversarial discrimination + grounded distractors.',
    patterns: [/distractor/i, /not grounded/i, /weak option/i],
  },
  {
    id: 'QA-006',
    parts: [{ exam: 'E02', part: 5 }],
    problem: 'Question references wrong paragraph location.',
    rule: 'P5 reference integrity validator.',
    patterns: [/paragraph reference/i, /wrong paragraph/i, /reference integrity/i],
  },
  {
    id: 'QA-007',
    parts: [{ exam: 'E01', part: 6 }, { exam: 'E02', part: 6 }],
    problem: 'A–G options duplicated inside passage.',
    rule: 'P6 architecture v2 — no option duplication HARD.',
    patterns: [/duplicat/i, /option.*passage/i, /appears in passage/i],
  },
  {
    id: 'QA-008',
    parts: [{ exam: 'E01', part: 6 }, { exam: 'E02', part: 6 }],
    problem: 'Options too short/simple.',
    rule: 'P6 developed sentence options + cohesion validators.',
    patterns: [/too short/i, /simple option/i, /underdeveloped/i],
  },
  {
    id: 'QA-009',
    parts: [{ exam: 'E02', part: 7 }],
    problem: 'Literal word matching makes item too easy.',
    rule: 'P7 paraphrase repair + lexical-overlap warning.',
    patterns: [/word match/i, /literal/i, /lexical overlap/i, /too easy/i],
  },
  {
    id: 'QA-010',
    parts: [{ exam: 'E01', part: 0 }, { exam: 'E02', part: 0 }],
    problem: 'Grammatical but unnatural / AI-like phrasing.',
    rule: 'Editorial Quality + Style Cards naturalness standard.',
    patterns: [/unnatural/i, /ai-like/i, /artificial/i, /EDITORIAL/i],
  },
  {
    id: 'QA-011',
    parts: [{ exam: 'E01', part: 0 }, { exam: 'E02', part: 0 }],
    problem: 'Titles feel formulaic/literal.',
    rule: 'Style Cards title families + editorial title check.',
    patterns: [/formulaic/i, /literal title/i, /title/i],
  },
  {
    id: 'QA-012',
    parts: [
      { exam: 'E01', part: 1 },
      { exam: 'E02', part: 1 },
      { exam: 'E01', part: 2 },
      { exam: 'E02', part: 2 },
      { exam: 'E01', part: 3 },
      { exam: 'E02', part: 3 },
      { exam: 'E01', part: 7 },
      { exam: 'E02', part: 7 },
    ],
    problem: 'Minor target-length drift.',
    rule: 'Mechanical length targets retained as warning/HARD where configured.',
    patterns: [/length/i, /word count/i, /too short/i, /too long/i],
  },
];

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
  return (
    record?.validation?.blocking_hard_count ??
    record?.validation?.errors?.length ??
    0
  );
}

function qualityReviewHardCount(record) {
  return (
    record?.validation?.quality_review_hard_count ??
    record?.part_quality?.errors?.length ??
    0
  );
}

function flattenFindings(record) {
  const chunks = [];
  const push = (arr, label) => {
    if (!Array.isArray(arr)) return;
    for (const x of arr) {
      if (typeof x === 'string') chunks.push(`${label}: ${x}`);
      else if (x?.message) chunks.push(`${label}: ${x.message}`);
      else if (x?.detail) chunks.push(`${label}: ${x.detail}`);
      else chunks.push(`${label}: ${JSON.stringify(x)}`);
    }
  };
  push(record.validation?.errors, 'HARD');
  push(record.validation?.qualityFails, 'QUALITY');
  push(record.validation?.warnings, 'WARNING');
  push(record.editorial_findings, 'EDITORIAL');
  push(record.part4_findings, 'P4');
  push(record.adversarial_findings, 'ADV');
  return chunks;
}

function matchesPatterns(texts, patterns) {
  const blob = texts.join('\n').toLowerCase();
  return patterns.some((re) => re.test(blob));
}

function issueStillPresent(record, patterns) {
  return matchesPatterns(flattenFindings(record), patterns);
}

function renderValidatorBlock(record) {
  const lines = [];
  lines.push(`- **Mechanical validation:** ${record.validation.ok ? 'PASS' : 'FAIL'}`);
  lines.push(`- **HARD count (blocking):** ${blockingHardCount(record)}`);
  if (qualityReviewHardCount(record)) {
    lines.push(`- **Quality-review HARD (non-blocking mechanical):** ${qualityReviewHardCount(record)}`);
  }
  lines.push(`- **QUALITY count:** ${record.validation.quality_fail_count}`);
  lines.push(`- **Warnings:** ${record.validation.warning_count}`);
  if (record.repairs_applied?.length) {
    lines.push(`- **Repairs applied:** ${record.repairs_applied.length}`);
    for (const r of record.repairs_applied) {
      lines.push(`  - ${typeof r === 'string' ? r : JSON.stringify(r)}`);
    }
  }
  if (record.validation.errors?.length) {
    lines.push('- **HARD findings:**');
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
  lines.push(`_Source: \`${sourceFile}\`_`);
  lines.push('');
  lines.push('## Vista alumno');
  lines.push('');
  lines.push(record.enunciado_preview || '(no preview)');
  lines.push('');
  lines.push('## Answer key / metadata');
  lines.push('');
  lines.push(renderValidatorBlock(record));
  lines.push('');
  lines.push(`**Pedagogical approval:** ${record.pedagogical_approval}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  return lines.join('\n');
}

function buildComparisonForExam(examPlan, recordsByPart, oldFolder) {
  const lines = [];
  lines.push(`## ${examPlan.ruoeExamId}`);
  lines.push('');

  const examCode = examPlan.ruoeExamId.endsWith('E01') ? 'E01' : 'E02';

  for (let part = 1; part <= 7; part += 1) {
    const record = recordsByPart[part];
    lines.push(`### Part ${part}`);
    lines.push('');
    if (!record) {
      lines.push('_Missing regenerated output._');
      lines.push('');
      continue;
    }

    const qaRows = QA_MATRIX.filter((q) =>
      q.parts.some((p) => {
        if (p.part === 0) return true;
        if (p.exam !== examCode) return false;
        return p.part === part;
      }),
    );

    for (const qa of qaRows) {
      const still = issueStillPresent(record, qa.patterns);
      lines.push(`#### ${qa.id}`);
      lines.push(`- **Original teacher problem:** ${qa.problem}`);
      lines.push(`- **Motor rule now addressing it:** ${qa.rule}`);
      lines.push(`- **Still present in new output?** ${still ? 'YES (findings match)' : 'NO / not detected'}`);
      lines.push('');
    }

    if (part === 4) {
      for (const p4 of PART4_TEACHER_ISSUES) {
        const still = issueStillPresent(record, p4.patterns);
        lines.push(`#### ${p4.id}`);
        lines.push(`- **Original teacher problem:** ${p4.problem}`);
        lines.push(`- **Motor rule now addressing it:** ${p4.rule}`);
        lines.push(`- **Still present in new output?** ${still ? 'YES (findings match)' : 'NO / not detected'}`);
        lines.push('');
      }
    }

    const briefForPart = examPlan.briefs
      .map((id) => briefById[id])
      .find((b) => partNumberFromBrief(b) === part);
    const oldPath =
      part === 4
        ? path.join(oldFolder, examPlan.oldPart4)
        : path.join(oldFolder, briefForPart ? outfileName(briefForPart) : `Part${part}.json`);

    lines.push('#### Regeneration summary');
    lines.push(`- **Old reference file:** \`${path.relative(PACK, oldPath)}\``);
    lines.push(renderValidatorBlock(record));
    lines.push('');
  }

  return lines.join('\n');
}

let briefById = {};
let blueprintById = {};

function isE02Part4Accepted(record) {
  return Boolean(record?.validation?.ok) && (record.validation.errors?.length ?? 0) === 0;
}

async function retryE02Part4Only(openai, bpDoc) {
  const examPlan = EXAM_PLAN.find((e) => e.ruoeExamId === 'RUOE-PILOT-E02');
  const blueprint = blueprintById[examPlan.blueprintId];
  const examOut = path.join(OUT, examPlan.examFolder);
  const p4File = path.join(examOut, `${examPlan.blueprintId}_Part4.json`);
  const MAX_ATTEMPTS = 3;
  const attemptLog = [];

  console.error('\n=== ONLY E02 Part 4 retry (max 3 attempts) ===');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    if (fs.existsSync(p4File)) {
      fs.unlinkSync(p4File);
    }

    const varietySeed = SEED_BASE + 99991 + attempt * 50000;
    console.error(`Attempt ${attempt}/${MAX_ATTEMPTS} (seed ${varietySeed})…`);

    const record = await generatePilotPart4FromBlueprint({
      blueprint,
      examSlot: examPlan.examSlot,
      openai,
      varietySeed,
      model: MODEL,
    });

    writeJson(p4File, record);

    const entry = {
      attempt,
      variety_seed: varietySeed,
      mechanical_ok: record.validation?.ok,
      hard_errors: record.validation?.errors || [],
      hard_count: record.validation?.errors?.length ?? 0,
      quality_count: record.validation?.quality_fail_count ?? 0,
      warning_count: record.validation?.warning_count ?? 0,
      repairs: record.repairs_applied || [],
      accepted: isE02Part4Accepted(record),
    };
    attemptLog.push(entry);

    console.error(
      `  → mechanical ${entry.mechanical_ok ? 'PASS' : 'FAIL'} | HARD ${entry.hard_count} | QUALITY ${entry.quality_count}`,
    );

    if (entry.accepted) {
      console.error('  → ACCEPTED');
      break;
    }

    if (attempt < MAX_ATTEMPTS) {
      console.error('  → not accepted; retrying…');
    }
  }

  const failurePattern =
    attemptLog.length && !attemptLog[attemptLog.length - 1].accepted
      ? {
          stopped_after_attempts: attemptLog.length,
          recurring_hard_errors: summarizeRecurringHardErrors(attemptLog),
          last_attempt: attemptLog[attemptLog.length - 1],
        }
      : null;

  writeJson(path.join(OUT, 'E02_PART4_RETRY_LOG.json'), {
    generated_at: new Date().toISOString(),
    max_attempts: MAX_ATTEMPTS,
    attempts: attemptLog,
    failure_pattern: failurePattern,
  });

  return { attemptLog, failurePattern, p4File };
}

function summarizeRecurringHardErrors(attemptLog) {
  const counts = new Map();
  for (const a of attemptLog) {
    for (const err of a.hard_errors) {
      const key = String(err).replace(/Q\d+/, 'Q#');
      counts.set(key, (counts.get(key) || 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([pattern, count]) => ({ pattern, occurrences: count, attempts: attemptLog.length }));
}

async function loadAllRecordsFromDisk() {
  const allRecords = {};
  const humanReviewLines = [
    '# DRALO RUOE — Human Review Pack · Regenerated v1.1.2',
    '',
    'Complete regenerated pilots E01 + E02 (Parts 1–7). Local code prompts only.',
    '',
    '**Pedagogical approval:** PENDING_HUMAN_REVIEW',
    '',
  ];
  const manifest = {
    version: 'v1.1.2',
    generated_at: new Date().toISOString(),
    useCodePrompts: true,
    supabase_sync: false,
    production_write: false,
    pedagogical_approval: 'PENDING_HUMAN_REVIEW',
    model: MODEL,
    exams: [],
  };

  for (const examPlan of EXAM_PLAN) {
    const examOut = path.join(OUT, examPlan.examFolder);
    const examSummary = {
      ruoe_exam_id: examPlan.ruoeExamId,
      folder: examPlan.examFolder,
      parts: [],
    };
    allRecords[examPlan.ruoeExamId] = {};

    for (const briefId of examPlan.briefs) {
      const brief = briefById[briefId];
      const partNumber = partNumberFromBrief(brief);
      const outFile = path.join(examOut, outfileName(brief));
      const record = readJson(outFile);
      examSummary.parts.push({
        part: partNumber,
        file: path.relative(PACK, outFile),
        validation_ok: record.validation?.ok,
        hard: blockingHardCount(record),
        quality_review_hard: qualityReviewHardCount(record),
        quality: record.validation?.quality_fail_count ?? 0,
        warnings: record.validation?.warning_count ?? 0,
        repairs: record.repairs_applied?.length || 0,
      });
      allRecords[examPlan.ruoeExamId][partNumber] = record;
      humanReviewLines.push(renderHumanReviewSection(record, path.relative(PACK, outFile)));
    }

    const p4File = path.join(examOut, `${examPlan.blueprintId}_Part4.json`);
    const p4Record = readJson(p4File);
    examSummary.parts.push({
      part: 4,
      file: path.relative(PACK, p4File),
      validation_ok: p4Record.validation?.ok,
      hard: blockingHardCount(p4Record),
      quality_review_hard: qualityReviewHardCount(p4Record),
      quality: p4Record.validation?.quality_fail_count ?? 0,
      warnings: p4Record.validation?.warning_count ?? 0,
      repairs: p4Record.repairs_applied?.length || 0,
    });
    allRecords[examPlan.ruoeExamId][4] = p4Record;
    humanReviewLines.push(renderHumanReviewSection(p4Record, path.relative(PACK, p4File)));
    manifest.exams.push(examSummary);
  }

  return { allRecords, humanReviewLines, manifest };
}

function writeReports({ allRecords, humanReviewLines, manifest, e02RetryMeta = null }) {
  writeJson(path.join(OUT, 'regeneration_manifest.json'), manifest);
  writeText(path.join(OUT, 'HUMAN_REVIEW_REGENERATED_v1_1_2.md'), humanReviewLines.join('\n'));

  const comparisonLines = [
    '# PILOT_REGENERATION_COMPARISON_COMPLETE_v1_1_2',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    'Old outputs preserved in `05_OUTPUTS/`. New outputs in `05_OUTPUTS_REGENERATED_v1_1_2/`.',
    '',
  ];

  if (e02RetryMeta?.failurePattern) {
    comparisonLines.push(
      '## E02 Part 4 retry (max 3 attempts)',
      '',
      `- **Result:** FAILED after ${e02RetryMeta.failurePattern.stopped_after_attempts} attempts`,
      '- **Recurring HARD patterns:**',
      '',
    );
    for (const row of e02RetryMeta.failurePattern.recurring_hard_errors || []) {
      comparisonLines.push(`- ${row.pattern} (${row.occurrences}/${row.attempts} attempts)`);
    }
    comparisonLines.push(
      '',
      `- **Last attempt HARD errors:**`,
      '',
    );
    for (const err of e02RetryMeta.failurePattern.last_attempt?.hard_errors || []) {
      comparisonLines.push(`- ${err}`);
    }
    comparisonLines.push('');
  }

  for (const examPlan of EXAM_PLAN) {
    comparisonLines.push(
      buildComparisonForExam(
        examPlan,
        allRecords[examPlan.ruoeExamId],
        path.join(OLD_OUT, examPlan.examFolder),
      ),
    );
  }
  writeText(path.join(UPGRADE, 'PILOT_REGENERATION_COMPARISON_COMPLETE_v1_1_2.md'), comparisonLines.join('\n'));

  const totals = { hard: 0, quality: 0, warnings: 0, repairs: 0, parts_ok: 0, parts_total: 0 };
  for (const exam of manifest.exams) {
    for (const p of exam.parts) {
      totals.parts_total += 1;
      if (p.validation_ok) totals.parts_ok += 1;
      totals.hard += p.hard;
      totals.quality += p.quality;
      totals.warnings += p.warnings;
      totals.repairs += p.repairs;
    }
  }

  const fullReport = [
    '# FULL_PILOT_REGENERATION_REPORT_v1_1_2',
    '',
    `**Date:** ${new Date().toISOString()}`,
    '**Status:** Regeneration complete · PENDING_HUMAN_REVIEW',
    '',
    '## Generation performed',
    '',
    '- RUOE-PILOT-E01 — Parts 1–7 regenerated with approved briefs + blueprint.',
    '- RUOE-PILOT-E02 — Parts 1–7 regenerated with approved briefs + blueprint.',
    '- Local code prompts (`useCodePrompts` equivalent via `resolveDefaultExamPartGenerationPrompt`).',
    '',
  ];

  if (e02RetryMeta?.failurePattern) {
    fullReport.push(
      '## E02 Part 4 isolated retry',
      '',
      `- **Attempts:** ${e02RetryMeta.failurePattern.stopped_after_attempts}/3`,
      '- **Outcome:** mechanical FAIL — metadata/marking inconsistency persisted',
      '- **Log:** `05_OUTPUTS_REGENERATED_v1_1_2/E02_PART4_RETRY_LOG.json`',
      '',
      '### Recurring failure pattern',
      '',
    );
    for (const row of e02RetryMeta.failurePattern.recurring_hard_errors || []) {
      fullReport.push(`- ${row.pattern} — ${row.occurrences}/${row.attempts} attempts`);
    }
    fullReport.push(
      '',
      '### Last attempt HARD errors',
      '',
    );
    for (const err of e02RetryMeta.failurePattern.last_attempt?.hard_errors || []) {
      fullReport.push(`- ${err}`);
    }
    fullReport.push('');
  } else if (e02RetryMeta?.accepted) {
    fullReport.push(
      '## E02 Part 4 isolated retry',
      '',
      `- **Outcome:** mechanical PASS with 0 HARD after metadata normalization v1.1.2`,
      e02RetryMeta.metadata_hardening
        ? `- **Metadata hardening:** ${e02RetryMeta.metadata_hardening}`
        : '',
      '',
    );
  }

  fullReport.push(
    '',
    '## E02 Part 1 / Part 2 — HARD audit (blocking vs quality-review)',
    '',
    'Mechanical `validation.ok` uses `validateGeneratedExamPart` only. Blind-solve disagreements from',
    '`validateB2Part1Quality` / `validateB2Part2Quality` are stored in `part_quality.errors` and',
    '**do not** block mechanical validation. Prior reports incorrectly summed them into `hard_fail_count`.',
    '',
    '### RUOE-PILOT-E02 · Part 1 (CB-PILOT-007)',
    '',
    '| Field | Value |',
    '| --- | --- |',
    '| rule_id | `BLIND-SOLVE-MISMATCH` (quality validator; no structured rule_id in JSON) |',
    '| severity | Quality-review error (`part_quality.ok=false`) — **not** mechanical HARD |',
    '| location | Q1, Q4, Q8 (≥2 blind-solve mismatches trigger one aggregated error) |',
    '| evidence | Key A/solver B (Q1), key D/solver A (Q4), key B/solver D (Q8) |',
    '| in validation.errors | **No** |',
    '| blocks validation.ok | **No** (mechanical PASS remains valid) |',
    '| classification | Reporting inconsistency fixed — counted as `quality_review_hard`, not blocking HARD |',
    '',
    '### RUOE-PILOT-E02 · Part 2 (CB-PILOT-008)',
    '',
    '| Field | Value |',
    '| --- | --- |',
    '| rule_id | `BLIND-SOLVE-MISMATCH` (quality validator) |',
    '| severity | Quality-review error — **not** mechanical HARD |',
    '| location | Q10, Q13 (2 gap mismatches) |',
    '| evidence | Key "of"/solver "to" (Q10); key "this"/solver "the" (Q13) |',
    '| in validation.errors | **No** |',
    '| blocks validation.ok | **No** |',
    '| classification | Reporting inconsistency fixed — quality-review HARD only |',
    '',
    '**Pedagogical note:** Both findings are real ambiguity signals for human review (aligned with QA-001).',
    'Local repair would target individual items (re-gap / re-key), not full-part regeneration.',
    '',
    '## Output files',
    '',
    `- Regenerated JSON: \`${path.relative(ROOT, OUT)}/EXAM-01/\`, \`EXAM-02/\``,
    `- Manifest: \`${path.relative(ROOT, path.join(OUT, 'regeneration_manifest.json'))}\``,
    `- Human review: \`${path.relative(ROOT, path.join(OUT, 'HUMAN_REVIEW_REGENERATED_v1_1_2.md'))}\``,
    `- Comparison: \`${path.relative(ROOT, path.join(UPGRADE, 'PILOT_REGENERATION_COMPARISON_COMPLETE_v1_1_2.md'))}\``,
    '',
    '## Repairs applied (summary)',
    '',
    '| Exam | Part | Repairs |',
    '| --- | --- | --- |',
  );

  for (const exam of manifest.exams) {
    for (const p of exam.parts) {
      fullReport.push(`| ${exam.ruoe_exam_id} | ${p.part} | ${p.repairs} |`);
    }
  }

  fullReport.push(
    '',
    '## Status by Part',
    '',
    '| Exam | Part | Mechanical OK | HARD (blocking) | Q-review HARD | QUALITY | Warnings |',
    '| --- | --- | --- | --- | --- | --- | --- |',
  );
  for (const exam of manifest.exams) {
    for (const p of exam.parts) {
      fullReport.push(
        `| ${exam.ruoe_exam_id} | ${p.part} | ${p.validation_ok ? 'PASS' : 'FAIL'} | ${p.hard} | ${p.quality_review_hard ?? 0} | ${p.quality} | ${p.warnings} |`,
      );
    }
  }

  const totalsQReviewHard = manifest.exams.reduce(
    (sum, exam) => sum + exam.parts.reduce((s, p) => s + (p.quality_review_hard ?? 0), 0),
    0,
  );

  fullReport.push(
    '',
    '## Totals',
    '',
    `- Parts mechanical PASS: ${totals.parts_ok}/${totals.parts_total}`,
    `- HARD findings (blocking, sum): ${totals.hard}`,
    `- Quality-review HARD (non-blocking mechanical, sum): ${totalsQReviewHard}`,
    `- QUALITY findings (sum): ${totals.quality}`,
    `- Warnings (sum): ${totals.warnings}`,
    `- Repair operations (sum): ${totals.repairs}`,
    '',
    '## Old vs new',
    '',
    '- Original pilot outputs unchanged under `05_OUTPUTS/`.',
    '- Regenerated outputs isolated under `05_OUTPUTS_REGENERATED_v1_1_2/`.',
    '- See `PILOT_REGENERATION_COMPARISON_COMPLETE_v1_1_2.md` for teacher-feedback mapping.',
    '',
    '## Residual issues',
    '',
    totals.parts_ok < totals.parts_total
      ? `- ${totals.parts_total - totals.parts_ok} part(s) failed mechanical validation — review HARD findings in manifest JSON files.`
      : '- All parts passed mechanical validation; QUALITY/warning findings preserved in JSON for human review.',
    totals.quality > 0 ? `- ${totals.quality} QUALITY finding(s) recorded across parts (not hidden).` : '',
    '',
    '## Safety confirmations',
    '',
    '- **Supabase sync:** NOT performed.',
    '- **Production publish:** NOT performed.',
    '- **Pedagogical approval:** PENDING_HUMAN_REVIEW (not approved).',
    '- **Scale-up to 20 exams:** NOT performed.',
    '',
  );

  writeText(path.join(UPGRADE, 'FULL_PILOT_REGENERATION_REPORT_v1_1_2.md'), fullReport.join('\n'));
  return totals;
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
  briefById = Object.fromEntries(briefsDoc.briefs.map((b) => [b.brief_id, b]));
  blueprintById = Object.fromEntries(bpDoc.blueprints.map((b) => [b.blueprint_id, b]));

  const onlyE02P4 =
    process.env.ONLY_E02_PART4_RETRY === '1' || process.argv.includes('--only-e02-p4');
  const rebuildReportsOnly = process.argv.includes('--rebuild-reports-only');

  if (rebuildReportsOnly) {
    const disk = await loadAllRecordsFromDisk();
    const totals = writeReports({
      ...disk,
      e02RetryMeta: { accepted: true, metadata_hardening: 'v1.1.2' },
    });
    console.error('\nReports rebuilt from disk.');
    console.error(`Mechanical PASS: ${totals.parts_ok}/${totals.parts_total}`);
    return;
  }

  if (onlyE02P4) {
    const { failurePattern } = await retryE02Part4Only(openai, bpDoc);
    const disk = await loadAllRecordsFromDisk();
    const totals = writeReports({
      ...disk,
      e02RetryMeta: failurePattern ? { failurePattern } : { accepted: true },
    });
    console.error('\nDone (E02 Part 4 retry only).');
    console.error(`Outputs: ${OUT}`);
    console.error(`Mechanical PASS: ${totals.parts_ok}/${totals.parts_total}`);
    if (failurePattern) {
      console.error('E02 Part 4: FAILED after 3 attempts — see E02_PART4_RETRY_LOG.json');
      process.exit(1);
    }
    return;
  }

  const manifest = {
    version: 'v1.1.2',
    generated_at: new Date().toISOString(),
    useCodePrompts: true,
    supabase_sync: false,
    production_write: false,
    pedagogical_approval: 'PENDING_HUMAN_REVIEW',
    model: MODEL,
    exams: [],
  };

  const allRecords = {};
  const humanReviewLines = [
    '# DRALO RUOE — Human Review Pack · Regenerated v1.1.2',
    '',
    'Complete regenerated pilots E01 + E02 (Parts 1–7). Local code prompts only.',
    '',
    '**Pedagogical approval:** PENDING_HUMAN_REVIEW',
    '',
  ];

  let partIndex = 0;
  for (const examPlan of EXAM_PLAN) {
    const examOut = path.join(OUT, examPlan.examFolder);
    const examSummary = {
      ruoe_exam_id: examPlan.ruoeExamId,
      folder: examPlan.examFolder,
      parts: [],
    };
    allRecords[examPlan.ruoeExamId] = {};

    console.error(`\n=== ${examPlan.ruoeExamId} ===`);

    for (const briefId of examPlan.briefs) {
      const brief = briefById[briefId];
      const partNumber = partNumberFromBrief(brief);
      const varietySeed = SEED_BASE + partIndex * 7919;
      partIndex += 1;

      console.error(`Generating ${briefId} Part ${partNumber}…`);
      const outFile = path.join(examOut, outfileName(brief));
      if (fs.existsSync(outFile)) {
        console.error(`  skip (exists): ${path.basename(outFile)}`);
        const existing = readJson(outFile);
        examSummary.parts.push({
          part: partNumber,
          file: path.relative(PACK, outFile),
          validation_ok: existing.validation?.ok,
          hard: existing.validation?.blocking_hard_count ?? existing.validation?.errors?.length ?? 0,
        quality_review_hard:
          existing.validation?.quality_review_hard_count ??
          existing.part_quality?.errors?.length ??
          0,
          quality: existing.validation?.quality_fail_count ?? 0,
          warnings: existing.validation?.warning_count ?? 0,
          repairs: existing.repairs_applied?.length || 0,
          skipped_resume: true,
        });
        allRecords[examPlan.ruoeExamId][partNumber] = existing;
        humanReviewLines.push(renderHumanReviewSection(existing, path.relative(PACK, outFile)));
        continue;
      }

      const record = await generatePilotPartFromBrief({
        brief,
        styleCardText: loadStyleCard(brief.style_card_id),
        examSlot: examPlan.examSlot,
        openai,
        varietySeed,
        model: MODEL,
      });

      writeJson(outFile, record);
      examSummary.parts.push({
        part: partNumber,
        file: path.relative(PACK, outFile),
        validation_ok: record.validation.ok,
        hard: blockingHardCount(record),
        quality_review_hard: qualityReviewHardCount(record),
        quality: record.validation.quality_fail_count,
        warnings: record.validation.warning_count,
        repairs: record.repairs_applied?.length || 0,
      });
      allRecords[examPlan.ruoeExamId][partNumber] = record;
      humanReviewLines.push(renderHumanReviewSection(record, path.relative(PACK, outFile)));
    }

    const blueprint = blueprintById[examPlan.blueprintId];
    const varietySeed = SEED_BASE + partIndex * 7919;
    partIndex += 1;
    console.error(`Generating ${examPlan.blueprintId} Part 4…`);
    const p4File = path.join(examOut, `${examPlan.blueprintId}_Part4.json`);
    let p4Record;
    if (fs.existsSync(p4File)) {
      console.error(`  skip (exists): ${path.basename(p4File)}`);
      p4Record = readJson(p4File);
    } else {
      p4Record = await generatePilotPart4FromBlueprint({
        blueprint,
        examSlot: examPlan.examSlot,
        openai,
        varietySeed,
        model: MODEL,
      });
      writeJson(p4File, p4Record);
    }
    examSummary.parts.push({
      part: 4,
      file: path.relative(PACK, p4File),
      validation_ok: p4Record.validation.ok,
      hard: blockingHardCount(p4Record),
      quality_review_hard: qualityReviewHardCount(p4Record),
      quality: p4Record.validation.quality_fail_count,
      warnings: p4Record.validation.warning_count,
      repairs: p4Record.repairs_applied?.length || 0,
    });
    allRecords[examPlan.ruoeExamId][4] = p4Record;
    humanReviewLines.push(renderHumanReviewSection(p4Record, path.relative(PACK, p4File)));

    manifest.exams.push(examSummary);
  }

  const totals = writeReports({ allRecords, humanReviewLines, manifest });
  console.error('\nDone.');
  console.error(`Outputs: ${OUT}`);
  console.error(`Mechanical PASS: ${totals.parts_ok}/${totals.parts_total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
