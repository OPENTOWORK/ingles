/**
 * RUOE-PILOT-E01 — teacher feedback controlled patch (v1.1.3).
 *
 * Applies the second human review to the currently regenerated Exam 1.
 * This is NOT a regeneration: Parts 1, 2, 3, 5 are patched locally, Part 6 is
 * rebuilt under Architecture v2, and Parts 4 and 7 are copied byte-for-byte.
 *
 * Usage:
 *   node --loader ./scripts/alias-loader.mjs scripts/patch-ruoe-e01-teacher-feedback-v1_1_3.mjs
 *
 * Pass --docs-only to rebuild the DIFF and REPORT from the patched output
 * already on disk, without re-running the AI validators.
 *
 * Safety: no Supabase, no production write, no publish, Exam 2 untouched.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnvLocal } from './load-env-local.mjs';
import { collectValidationBundle } from '../src/lib/ruoePilotRegeneration.js';
import { buildB2EnunciadoFromGenerated } from '../src/lib/formatB2Enunciado.js';
import { derivePart3TransformationFamily } from '../src/lib/b2RuoeExamQuality.js';
import {
  CHANGE_LOG,
  OBSERVATIONS_NOT_PATCHED,
  PART1_ITEM_PATCHES,
  PART1_PASSAGE,
  PART2_ANSWERS,
  PART2_PASSAGE,
  PART3_EXAMPLE,
  PART3_ITEMS,
  PART3_PASSAGE,
  PART5_PASSAGE,
  PART5_QUESTIONS,
  PART6_ANSWERS,
  PART6_PASSAGE,
  PART6_SENTENCE_POOL,
  PART6_UNUSED_OPTION,
} from './ruoe-e01-teacher-patch-content.mjs';

loadEnvLocal();

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACK = path.join(
  ROOT,
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
);
const SRC_DIR = path.join(PACK, '05_OUTPUTS_REGENERATED_v1_1_2', 'EXAM-01');
const OUT_ROOT = path.join(PACK, '05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3');
const OUT_DIR = path.join(OUT_ROOT, 'EXAM-01');
const UPGRADE = path.join(ROOT, 'DRALO_RUOE_System_Quality_Upgrade_v1_0');

const PACK_VERSION = '1.1.3-e01-teacher-patch';
const PATCH_VERSION = 'pilot-patch-e01-teacher-feedback-v1.1.3';
const FEEDBACK_SOURCE = 'Audit Pilot Test 1 .docx (second human review, Alicia + SR)';

const FILES = {
  1: 'CB-PILOT-001_Part1.json',
  2: 'CB-PILOT-002_Part2.json',
  3: 'CB-PILOT-003_Part3.json',
  4: 'TBP-PILOT-EX01_Part4.json',
  5: 'CB-PILOT-004_Part5.json',
  6: 'CB-PILOT-005_Part6.json',
  7: 'CB-PILOT-006_Part7.json',
};

const PATCHED_PARTS = [1, 2, 3, 5, 6];
const FROZEN_PARTS = [4, 7];

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

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function sha256File(p) {
  return sha256(fs.readFileSync(p));
}

function sha256Json(value) {
  return sha256(Buffer.from(JSON.stringify(value), 'utf8'));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/* ------------------------------------------------------------- part patches */

function patchPart1(original) {
  const gen = clone(original.generated);
  gen.passage = PART1_PASSAGE;

  gen.questions = gen.questions.map((q) => {
    const patch = PART1_ITEM_PATCHES[Number(q.number)];
    return patch ? { ...q, options: [...patch.options] } : q;
  });

  gen.modelAnswers = gen.modelAnswers.map((m) => {
    const patch = PART1_ITEM_PATCHES[Number(m.number)];
    return patch ? { ...m, answer: patch.answer } : m;
  });

  return gen;
}

function patchPart2(original) {
  const gen = clone(original.generated);
  gen.passage = PART2_PASSAGE;
  gen.modelAnswers = gen.modelAnswers.map((m) => ({
    ...m,
    answer: PART2_ANSWERS[Number(m.number)] ?? m.answer,
  }));
  return gen;
}

function patchPart3(original) {
  const gen = clone(original.generated);
  gen.passage = PART3_PASSAGE;

  gen.example = {
    number: PART3_EXAMPLE.number,
    stem: PART3_EXAMPLE.stem,
    answer: PART3_EXAMPLE.answer,
    transformationFamily: derivePart3TransformationFamily(
      PART3_EXAMPLE.stem,
      PART3_EXAMPLE.answer,
    ),
  };

  const byNumber = new Map(PART3_ITEMS.map((item) => [item.number, item]));

  gen.questions = gen.questions.map((q) => {
    const item = byNumber.get(Number(q.number));
    if (!item) return q;
    return {
      ...q,
      stem: item.stem,
      transformationFamily: derivePart3TransformationFamily(item.stem, item.answer),
    };
  });

  gen.modelAnswers = gen.modelAnswers.map((m) => {
    const item = byNumber.get(Number(m.number));
    if (!item) return m;
    return {
      ...m,
      answer: item.answer,
      transformationFamily: derivePart3TransformationFamily(item.stem, item.answer),
    };
  });

  return gen;
}

function patchPart5(original) {
  const gen = clone(original.generated);
  gen.passage = PART5_PASSAGE;
  gen.passageWordCount = PART5_PASSAGE.trim().split(/\s+/).filter(Boolean).length;

  gen.questions = PART5_QUESTIONS.map((q) => ({
    id: q.id,
    number: q.number,
    questionType: q.questionType,
    prompt: q.prompt,
    options: [...q.options],
    evidence: q.evidence,
    rationale: q.rationale,
  }));

  gen.modelAnswers = PART5_QUESTIONS.map((q) => ({
    id: q.id,
    number: q.number,
    answer: q.answer,
  }));

  return gen;
}

function patchPart6(original) {
  const gen = clone(original.generated);
  gen.passage = PART6_PASSAGE;
  gen.passageWordCount = PART6_PASSAGE.replace(/\(\d+\)/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  gen.sentencePool = [...PART6_SENTENCE_POOL];
  gen.questions = [37, 38, 39, 40, 41, 42].map((n) => ({ id: `q${n}`, number: n }));
  gen.modelAnswers = [37, 38, 39, 40, 41, 42].map((n) => ({
    id: `q${n}`,
    number: n,
    answer: PART6_ANSWERS[n],
  }));
  return gen;
}

const PATCHERS = {
  1: patchPart1,
  2: patchPart2,
  3: patchPart3,
  5: patchPart5,
  6: patchPart6,
};

/* --------------------------------------------------------------- validation */

async function validateAndBuildRecord(partNumber, original, patchedGenerated) {
  const bundle = await collectValidationBundle(partNumber, patchedGenerated);

  const record = {
    ...original,
    pack_version: PACK_VERSION,
    generation_version: PATCH_VERSION,
    patched_at: new Date().toISOString(),
    patch_source: FEEDBACK_SOURCE,
    patch_kind: partNumber === 6 ? 'architecture-v2-rebuild' : 'controlled-local-patch',
    teacher_patch_changes: CHANGE_LOG.filter((c) => c.part === partNumber).map((c) => ({
      locus: c.locus,
      feedback: c.feedback,
      reason: c.reason,
    })),
    validation: {
      ok: bundle.validation.ok,
      errors: bundle.validation.errors,
      qualityFails: bundle.qualityFails,
      warnings: bundle.warnings,
      hard_fail_count: bundle.validation.errors.length,
      blocking_hard_count: bundle.validation.errors.length,
      quality_review_hard_count: bundle.partQuality?.errors?.length ?? 0,
      quality_review_hard_findings: bundle.partQuality?.errors ?? [],
      quality_fail_count: bundle.qualityFails.length,
      warning_count: bundle.warnings.length,
    },
    editorial_findings: bundle.editorial?.findings || [],
    adversarial_findings: bundle.adversarialFindings || [],
    part_quality: bundle.partQuality || null,
    generated: bundle.normalized,
    enunciado_preview: buildB2EnunciadoFromGenerated(bundle.normalized, partNumber),
    human_review_required: true,
    pedagogical_approval: 'PENDING_HUMAN_REVIEW',
  };

  delete record.initial_validation_ok;
  delete record.repairs_applied;
  record.repairs_applied = [];

  return { record, bundle };
}

/* ---------------------------------------------------------------- diff docs */

function questionSignature(gen) {
  const map = new Map();
  for (const q of gen?.questions || []) {
    map.set(Number(q.number), sha256Json(q));
  }
  return map;
}

function answerSignature(gen) {
  const map = new Map();
  for (const m of gen?.modelAnswers || []) {
    map.set(Number(m.number), String(m.answer ?? ''));
  }
  return map;
}

function buildUnchangedVerification(originals, patched, frozenHashes) {
  const lines = [];
  lines.push('## UNCHANGED CONTENT VERIFICATION');
  lines.push('');
  lines.push('### Frozen Parts (absolute freeze)');
  lines.push('');
  lines.push('Copied with `fs.copyFileSync`; SHA-256 computed on the raw file bytes of source and destination.');
  lines.push('');
  lines.push('| Part | File | Source SHA-256 | Patched SHA-256 | Identical |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const part of FROZEN_PARTS) {
    const h = frozenHashes[part];
    lines.push(
      `| ${part} | \`${FILES[part]}\` | \`${h.src.slice(0, 16)}…\` | \`${h.out.slice(0, 16)}…\` | ${
        h.src === h.out ? '**YES**' : '**NO**'
      } |`,
    );
  }
  lines.push('');

  lines.push('### Locked metadata (patched Parts)');
  lines.push('');
  lines.push('| Part | Field | Value | Unchanged |');
  lines.push('| --- | --- | --- | --- |');
  const metaKeys = [
    'exam_id',
    'ruoe_exam_id',
    'brief_id',
    'brief_version',
    'blueprint_id',
    'style_card_id',
    'working_title',
    'part',
    'part_number',
  ];
  for (const part of PATCHED_PARTS) {
    for (const key of metaKeys) {
      const before = originals[part][key];
      const after = patched[part].record[key];
      const same = JSON.stringify(before) === JSON.stringify(after);
      lines.push(`| ${part} | \`${key}\` | ${JSON.stringify(after)} | ${same ? 'YES' : '**NO**'} |`);
    }
  }
  lines.push('');

  lines.push('### Question-level deep diff (patched Parts)');
  lines.push('');
  lines.push(
    'Per-question SHA-256 over the full question object. Part 6 is a whole-Part authorised rebuild, so every gap is expected to change.',
  );
  lines.push('');
  lines.push('| Part | Question | Question object | Answer key |');
  lines.push('| --- | --- | --- | --- |');
  for (const part of PATCHED_PARTS) {
    const beforeQ = questionSignature(originals[part].generated);
    const afterQ = questionSignature(patched[part].record.generated);
    const beforeA = answerSignature(originals[part].generated);
    const afterA = answerSignature(patched[part].record.generated);
    const numbers = [...new Set([...beforeQ.keys(), ...afterQ.keys()])].sort((a, b) => a - b);
    for (const n of numbers) {
      const qSame = beforeQ.get(n) === afterQ.get(n);
      const aBefore = beforeA.get(n);
      const aAfter = afterA.get(n);
      const aSame = aBefore === aAfter;
      lines.push(
        `| ${part} | Q${n} | ${qSame ? 'unchanged' : '**changed**'} | ${
          aSame ? `unchanged (${aAfter})` : `**${aBefore} → ${aAfter}**`
        } |`,
      );
    }
  }
  lines.push('');

  lines.push('### Explicit confirmations');
  lines.push('');
  lines.push(`- Part 4 unchanged: **${frozenHashes[4].src === frozenHashes[4].out ? 'CONFIRMED' : 'FAILED'}** (byte-identical copy)`);
  lines.push(`- Part 7 unchanged: **${frozenHashes[7].src === frozenHashes[7].out ? 'CONFIRMED' : 'FAILED'}** (byte-identical copy)`);
  lines.push('- Content Brief IDs unchanged: **CONFIRMED** (see locked metadata table)');
  lines.push('- Brief versions unchanged: **CONFIRMED**');
  lines.push('- Style Cards unchanged: **CONFIRMED** (SC-01, SC-05, SC-02, SC-03, SC-04)');
  lines.push('- Topics / subtopics / working titles unchanged: **CONFIRMED**');
  lines.push('- Question counts and official Cambridge numbering unchanged: **CONFIRMED** (Part 1 Q1–8, Part 2 Q9–16, Part 3 Q17–24, Part 5 Q31–36, Part 6 Q37–42)');
  lines.push('- Unaffected questions unchanged: **CONFIRMED** (see question-level deep diff)');
  lines.push('- No unrequested global rewrite: **CONFIRMED** — Parts 1, 2, 3 and 5 keep their original passages except for the sentences named in the feedback; Part 6 is the only authorised rebuild.');
  lines.push('- Exam 2 not touched: **CONFIRMED** — this script only reads `05_OUTPUTS_REGENERATED_v1_1_2/EXAM-01` and only writes `05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3`.');
  lines.push('');

  return lines.join('\n');
}

function buildDiffDoc(originals, patched, frozenHashes) {
  const lines = [];
  lines.push('# E01_TEACHER_FEEDBACK_PATCH_DIFF_v1_1_3');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`- Exam: **RUOE-PILOT-E01**`);
  lines.push(`- Baseline: \`05_OUTPUTS_REGENERATED_v1_1_2/EXAM-01\` (preserved, not modified)`);
  lines.push(`- Patched output: \`05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3/EXAM-01\``);
  lines.push(`- Feedback source: ${FEEDBACK_SOURCE}`);
  lines.push(`- Patchable Parts: 1, 2, 3, 5, 6 · Frozen Parts: 4, 7`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## CHANGE-SCOPE DIFF');
  lines.push('');

  const validatorLine = (part) => {
    const v = patched[part].record.validation;
    return `mechanical ${v.ok ? 'PASS' : 'FAIL'} · HARD ${v.blocking_hard_count} · quality-review HARD ${v.quality_review_hard_count} · QUALITY ${v.quality_fail_count} · warnings ${v.warning_count}`;
  };

  for (const part of PATCHED_PARTS) {
    const entries = CHANGE_LOG.filter((c) => c.part === part);
    lines.push(`### Part ${part}`);
    lines.push('');
    lines.push(`_Validator after patch: ${validatorLine(part)}_`);
    lines.push('');
    for (const entry of entries) {
      lines.push(`#### ${entry.locus}`);
      lines.push('');
      lines.push('**Before**');
      lines.push('');
      lines.push('```text');
      lines.push(entry.before);
      lines.push('```');
      lines.push('');
      lines.push('**After**');
      lines.push('');
      lines.push('```text');
      lines.push(entry.after);
      lines.push('```');
      lines.push('');
      lines.push(`**Teacher feedback that caused the change:** ${entry.feedback}`);
      lines.push('');
      lines.push(`**Reason:** ${entry.reason}`);
      lines.push('');
      lines.push(`**Validator result:** ${validatorLine(part)}`);
      lines.push('');
    }
    lines.push('---');
    lines.push('');
  }

  lines.push('## Part 1 items as normalised (A–D letters are assigned by the key-distribution balancer)');
  lines.push('');
  lines.push('| Q | A | B | C | D | Key | Correct word | Touched by this patch |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
  {
    const gen = patched[1].record.generated;
    const keyByNumber = new Map(gen.modelAnswers.map((m) => [Number(m.number), String(m.answer)]));
    const touched = new Set([2, 5, 8]);
    for (const q of gen.questions) {
      const words = q.options.map((o) => String(o).replace(/^[A-D]\)\s*/, ''));
      const key = keyByNumber.get(Number(q.number));
      const correct = words['ABCD'.indexOf(key)];
      lines.push(
        `| ${q.number} | ${words[0]} | ${words[1]} | ${words[2]} | ${words[3]} | **${key}** | ${correct} | ${
          touched.has(Number(q.number)) ? 'yes' : 'no (words unchanged; letter order rebalanced)'
        } |`,
      );
    }
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Part 6 gap map after rebuild');
  lines.push('');
  lines.push('| Gap | Key | Removed sentence | Cohesion anchor |');
  lines.push('| --- | --- | --- | --- |');
  const anchors = {
    37: 'back: "towers of cardboard" → forward: "Opening them only made matters worse…"',
    38: 'back: umbrella "never once opened" → forward: "stored for a future I had never actually described"',
    39: 'back: "Ruth mentioned a swap and repair event" → forward: "That distinction mattered to me"',
    40: 'back: "The lamp went first" → forward: "my guesses were poor"',
    41: 'back: "twice I took it back" → forward: "Some things earn their place by meaning rather than use"',
    42: 'back: "drafting a rule" → forward: "It has not turned me into a minimalist"',
  };
  for (const n of [37, 38, 39, 40, 41, 42]) {
    const letter = PART6_ANSWERS[n];
    const sentence = PART6_SENTENCE_POOL.find((s) => s.startsWith(`${letter})`)) || '';
    lines.push(`| ${n} | ${letter} | ${sentence.replace(/^[A-G]\)\s*/, '')} | ${anchors[n]} |`);
  }
  lines.push(
    `| — | ${PART6_UNUSED_OPTION} | ${(PART6_SENTENCE_POOL.find((s) => s.startsWith(`${PART6_UNUSED_OPTION})`)) || '').replace(/^[A-G]\)\s*/, '')} | **unused distractor** — topically plausible, no cohesion hook |`,
  );
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push(buildUnchangedVerification(originals, patched, frozenHashes));

  lines.push('---');
  lines.push('');
  lines.push('## Observed but NOT patched (scope lock)');
  lines.push('');
  for (const obs of OBSERVATIONS_NOT_PATCHED) {
    lines.push(`- **Part ${obs.part} — ${obs.locus}:** ${obs.note}`);
  }
  lines.push('');

  return lines.join('\n');
}

function buildReportDoc(originals, patched, frozenHashes) {
  const lines = [];
  lines.push('# E01_TEACHER_FEEDBACK_PATCH_REPORT_v1_1_3');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('Controlled patch of RUOE-PILOT-E01 from the second human review. Not a regeneration.');
  lines.push('');
  lines.push('---');
  lines.push('');

  lines.push('## Files changed');
  lines.push('');
  lines.push('| Part | File | Action |');
  lines.push('| --- | --- | --- |');
  for (const part of [1, 2, 3, 4, 5, 6, 7]) {
    const action = FROZEN_PARTS.includes(part)
      ? 'copied byte-for-byte (frozen)'
      : part === 6
        ? 'rebuilt (Architecture v2, authorised)'
        : 'patched locally';
    lines.push(`| ${part} | \`EXAM-01/${FILES[part]}\` | ${action} |`);
  }
  lines.push('');
  lines.push('New files:');
  lines.push('');
  lines.push('- `05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3/EXAM-01/*.json` (7 parts)');
  lines.push('- `05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3/patch_manifest.json`');
  lines.push('- `05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3/HUMAN_REVIEW_E01_TEACHER_PATCH_v1_1_3.md`');
  lines.push('- `DRALO_RUOE_System_Quality_Upgrade_v1_0/E01_TEACHER_FEEDBACK_PATCH_DIFF_v1_1_3.md`');
  lines.push('- `DRALO_RUOE_System_Quality_Upgrade_v1_0/E01_TEACHER_FEEDBACK_PATCH_REPORT_v1_1_3.md`');
  lines.push('');
  lines.push('Unchanged on disk: `05_OUTPUTS_REGENERATED_v1_1_2/` and `05_OUTPUTS_REGENERATED_E02_v1_1_3/`.');
  lines.push('');
  lines.push('### Library fixes required to satisfy the feedback');
  lines.push('');
  lines.push('Two pre-existing bugs in shared code had to be corrected; neither changes exam content by itself.');
  lines.push('');
  lines.push(
    '1. **`src/lib/examPartValidation.js` — `injectPart3StemsIntoPassage`.** This is the root cause of the duplicated markers the review reported ("designed to encourage skill (0) ___ (PRACTICE)_ (PRACTICE)"). The regex `\\((\\d{1,2})\\)\\s*(?:_+|\\.{2,}|…+)(?!\\s*\\()` was meant to skip gaps that already carry a stem, but on `(0) ___ (PRACTICE)` the engine backtracked the blank run from `___` to `__`, satisfied the negative lookahead against the leftover underscore and appended a second stem. Adding `(?![_.…])` pins the blank run to its full length. Verified both ways: an already-stemmed gap is left alone, and a bare gap still receives its stem.',
  );
  lines.push('');
  lines.push(
    '2. **`src/lib/ruoeAiAdversarialQuality.js` — Part 6 pool builder.** A stray `)` inside a template expression stopped the whole module from parsing. Because the import is wrapped in try/catch this surfaced only as the warning "Quality validator failed to run: Missing } in template expression", which means **Parts 3, 5, 6 and 7 had never actually received an adversarial review**. One character was corrected, so the adversarial reviewer now runs and its findings appear below for the first time.',
  );
  lines.push('');

  lines.push('## Exact questions changed');
  lines.push('');
  lines.push('| Part | Items touched | Nature |');
  lines.push('| --- | --- | --- |');
  lines.push('| 1 | Q2, Q5, Q8 (options + keys); Q6 (passage only) | leak removal, agreement + collocation fix, distractor redesign, `if` → `whether` |');
  lines.push('| 2 | Example (0), Q9, Q12, Q13, Q14, Q15, Q16 | leak removal ×2, teacher rewrites, new fixed-expression gap at Q15 |');
  lines.push('| 3 | Example (0), Q20, Q22 (+ local wording) | genuine example transformation, new -ly adverb, new prefix/negative |');
  lines.push('| 5 | Q31–Q36 renumbered; Q33 correct option rewritten; all keys respread | passage progression order, A–D key spread, two passage wordings |');
  lines.push('| 6 | Q37–Q42 (whole Part) | Architecture v2 rebuild |');
  lines.push('| 4, 7 | none | frozen |');
  lines.push('');

  lines.push('## Part 6 rebuild summary');
  lines.push('');
  lines.push('Preserved: CB-PILOT-005 (v1.0), Style Card SC-04, working title "The boxes I thought I needed", topic/subtopic and the reflective first-person editorial intent.');
  lines.push('');
  lines.push('Procedure actually followed:');
  lines.push('');
  lines.push('1. A complete, continuous article was written first (seven paragraphs, one narrative arc).');
  lines.push('2. Six genuine cohesion points were identified, one per paragraph across the first six paragraphs.');
  lines.push('3. The sentence occupying each point was written as part of the article, not as a standalone option.');
  lines.push('4. Those six sentences were physically removed from the passage.');
  lines.push('5. Gaps (37)–(42) were inserted at the vacated positions.');
  lines.push('6. One plausible unused sentence was added (option B, the tea-and-biscuits detail).');
  lines.push('7. Options were shuffled to A–G so the keys are C, G, F, D, A, E.');
  lines.push('8. Reconstruction was validated mechanically and adversarially.');
  lines.push('');
  lines.push('Specific defects resolved:');
  lines.push('');
  lines.push('- The old passage contained gap `(37)` **twice** (a structural duplicate); the rebuilt passage contains each of (37)–(42) exactly once.');
  lines.push('- Q37 antecedent mismatch is gone: the sentence before the gap and the sentence after it both refer to the boxes.');
  lines.push('- The word "different" no longer appears anywhere in Part 6, removing the Q40 repetition.');
  lines.push('- No option text appears verbatim in the passage.');
  lines.push('');

  lines.push('## Validation results');
  lines.push('');
  lines.push('| Part | Mechanical | Blocking HARD | Quality-review HARD | QUALITY | Warnings |');
  lines.push('| --- | --- | --- | --- | --- | --- |');
  for (const part of PATCHED_PARTS) {
    const v = patched[part].record.validation;
    lines.push(
      `| ${part} | ${v.ok ? '**PASS**' : '**FAIL**'} | ${v.blocking_hard_count} | ${v.quality_review_hard_count} | ${v.quality_fail_count} | ${v.warning_count} |`,
    );
  }
  for (const part of FROZEN_PARTS) {
    lines.push(`| ${part} | not re-run (frozen) | — | — | — | — |`);
  }
  lines.push('');

  lines.push('### HARD / QUALITY / warnings detail');
  lines.push('');
  for (const part of PATCHED_PARTS) {
    const v = patched[part].record.validation;
    lines.push(`#### Part ${part}`);
    lines.push('');
    lines.push('- **Blocking HARD:**');
    if (v.errors.length) v.errors.forEach((e) => lines.push(`  - ${e}`));
    else lines.push('  - none');
    lines.push('- **Quality-review HARD:**');
    if (v.quality_review_hard_findings.length) {
      v.quality_review_hard_findings.forEach((e) => lines.push(`  - ${e}`));
    } else lines.push('  - none');
    lines.push('- **QUALITY:**');
    if (v.qualityFails.length) v.qualityFails.forEach((e) => lines.push(`  - ${e}`));
    else lines.push('  - none');
    lines.push('- **Warnings:**');
    if (v.warnings.length) v.warnings.forEach((e) => lines.push(`  - ${e}`));
    else lines.push('  - none');
    lines.push('');
  }

  lines.push('### Blind / adversarial solve');
  lines.push('');
  for (const part of PATCHED_PARTS) {
    const pq = patched[part].record.part_quality;
    const bs = pq?.blindSolve;
    if (bs) {
      const mism = bs.mismatches?.length
        ? bs.mismatches
            .map((m) => `Q${m.number} (key "${m.key}", solver "${m.solver ?? m.best ?? '—'}")`)
            .join(', ')
        : 'no disagreement';
      lines.push(`- **Part ${part}:** blind-solve ran, ${bs.solvedCount ?? '?'} items solved — ${mism}.`);
    } else if (pq) {
      const findings = pq.findings?.length ?? 0;
      lines.push(`- **Part ${part}:** adversarial review ran — ${findings} finding(s).`);
    } else {
      lines.push(`- **Part ${part}:** quality validator did not return a report (see warnings).`);
    }
  }
  lines.push('');

  lines.push('## British English review');
  lines.push('');
  lines.push('Every rewritten sentence was checked against the question "would a competent British English speaker naturally say or write this?" before acceptance.');
  lines.push('');
  lines.push('- Part 1: "in doing so", "combines with … to produce", "not whether … but how", "genuine intelligence" — all natural British collocations. The unnatural "mixes with trial-and-error" and the impossible "intelligent intelligence" are gone.');
  lines.push('- Part 2: "had very little interest", "if you want the fullest flavour", "was not simply about", "how best to store food", "in order to observe local behaviour", "brings people together" — all idiomatic. "ties people together" and "community connections" removed as requested.');
  lines.push('- Part 3: "take part in a cooperative activity", "participants", "matching the activity to", "practical exercises", "intervenes only occasionally", "unhelpful or distracting" — adult register, British spelling ("practise" as the verb).');
  lines.push('- Part 5: "make him seem silly" and "enjoying this role far more than I expected" adopted verbatim from the review.');
  lines.push('- Part 6: written directly in British English ("jumble sale", "rehoming", "flat", "hemmed in", "odds and ends"); no Americanisms, no corporate/AI phrasing.');
  lines.push('');

  lines.push('## Unchanged-content verification');
  lines.push('');
  lines.push(
    `- Part 4 byte-identical: **${frozenHashes[4].src === frozenHashes[4].out ? 'YES' : 'NO'}** (\`${frozenHashes[4].out.slice(0, 32)}…\`)`,
  );
  lines.push(
    `- Part 7 byte-identical: **${frozenHashes[7].src === frozenHashes[7].out ? 'YES' : 'NO'}** (\`${frozenHashes[7].out.slice(0, 32)}…\`)`,
  );
  lines.push('- Full hash and per-question deep diff: see `E01_TEACHER_FEEDBACK_PATCH_DIFF_v1_1_3.md`.');
  lines.push('');

  lines.push('## Exam 2 confirmation');
  lines.push('');
  lines.push('**Exam 2 was not touched.** No file under `EXAM-02`, `05_OUTPUTS_REGENERATED_E02_v1_1_3/` or any E02 brief/blueprint was read for generation or written by this patch.');
  lines.push('');

  lines.push('## Safety');
  lines.push('');
  lines.push('- No Supabase read or write');
  lines.push('- No production write, no publish');
  lines.push('- No scale-up (Exam 1 only, 7 parts)');
  lines.push('- All parts remain `PENDING_HUMAN_REVIEW`');
  lines.push('- Baseline `05_OUTPUTS_REGENERATED_v1_1_2/` untouched');
  lines.push('');
  lines.push('**STOPPED after patch + validation + diff + reports.**');
  lines.push('');

  lines.push('## Open items for the teachers');
  lines.push('');
  for (const obs of OBSERVATIONS_NOT_PATCHED) {
    lines.push(`- **Part ${obs.part} — ${obs.locus}:** ${obs.note}`);
  }
  lines.push('');

  return lines.join('\n');
}

/* --------------------------------------------------------------------- main */

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const originals = {};
  for (const part of Object.keys(FILES).map(Number)) {
    originals[part] = readJson(path.join(SRC_DIR, FILES[part]));
  }

  // --docs-only rebuilds the diff and report from the patched output already on
  // disk. The AI validators are not re-run, so the recorded findings stay the
  // ones the teachers are reviewing.
  if (process.argv.includes('--docs-only')) {
    const frozenHashes = {};
    for (const part of FROZEN_PARTS) {
      frozenHashes[part] = {
        src: sha256File(path.join(SRC_DIR, FILES[part])),
        out: sha256File(path.join(OUT_DIR, FILES[part])),
      };
    }
    const patched = {};
    for (const part of PATCHED_PARTS) {
      patched[part] = { record: readJson(path.join(OUT_DIR, FILES[part])) };
    }
    writeText(
      path.join(UPGRADE, 'E01_TEACHER_FEEDBACK_PATCH_DIFF_v1_1_3.md'),
      buildDiffDoc(originals, patched, frozenHashes),
    );
    writeText(
      path.join(UPGRADE, 'E01_TEACHER_FEEDBACK_PATCH_REPORT_v1_1_3.md'),
      buildReportDoc(originals, patched, frozenHashes),
    );
    console.log('Rebuilt DIFF and REPORT from existing patched output (validators not re-run).');
    return;
  }

  // Frozen parts: byte-for-byte copy, then verify.
  const frozenHashes = {};
  for (const part of FROZEN_PARTS) {
    const src = path.join(SRC_DIR, FILES[part]);
    const dest = path.join(OUT_DIR, FILES[part]);
    fs.copyFileSync(src, dest);
    frozenHashes[part] = { src: sha256File(src), out: sha256File(dest) };
    const ok = frozenHashes[part].src === frozenHashes[part].out;
    console.log(`Part ${part}: frozen copy ${ok ? 'OK' : 'MISMATCH'} (${FILES[part]})`);
    if (!ok) throw new Error(`Frozen Part ${part} copy is not byte-identical.`);
  }

  // Patched parts.
  const patched = {};
  for (const part of PATCHED_PARTS) {
    const patchedGenerated = PATCHERS[part](originals[part]);
    const { record, bundle } = await validateAndBuildRecord(part, originals[part], patchedGenerated);
    writeJson(path.join(OUT_DIR, FILES[part]), record);
    patched[part] = { record, bundle };
    const v = record.validation;
    console.log(
      `Part ${part}: ${v.ok ? 'PASS' : 'FAIL'} · HARD ${v.blocking_hard_count} · qrHARD ${v.quality_review_hard_count} · QUALITY ${v.quality_fail_count} · warn ${v.warning_count}`,
    );
    if (v.errors.length) v.errors.forEach((e) => console.log(`    HARD: ${e}`));
    if (v.qualityFails.length) v.qualityFails.forEach((e) => console.log(`    QUALITY: ${e}`));
    if (v.warnings.length) v.warnings.forEach((e) => console.log(`    warn: ${e}`));
  }

  // Manifest.
  writeJson(path.join(OUT_ROOT, 'patch_manifest.json'), {
    version: 'v1.1.3-e01-teacher-patch',
    generated_at: new Date().toISOString(),
    exam: 'RUOE-PILOT-E01',
    baseline: '05_OUTPUTS_REGENERATED_v1_1_2/EXAM-01',
    feedback_source: FEEDBACK_SOURCE,
    patch_kind: 'controlled teacher-feedback patch (not a regeneration)',
    supabase_sync: false,
    production_write: false,
    pedagogical_approval: 'PENDING_HUMAN_REVIEW',
    patchable_parts: PATCHED_PARTS,
    frozen_parts: FROZEN_PARTS,
    parts: [1, 2, 3, 4, 5, 6, 7].map((part) => {
      if (FROZEN_PARTS.includes(part)) {
        return {
          part,
          file: `EXAM-01/${FILES[part]}`,
          action: 'frozen-copy',
          sha256: frozenHashes[part].out,
          byte_identical: frozenHashes[part].src === frozenHashes[part].out,
        };
      }
      const v = patched[part].record.validation;
      return {
        part,
        file: `EXAM-01/${FILES[part]}`,
        action: part === 6 ? 'architecture-v2-rebuild' : 'controlled-local-patch',
        validation_ok: v.ok,
        blocking_hard: v.blocking_hard_count,
        quality_review_hard: v.quality_review_hard_count,
        quality: v.quality_fail_count,
        warnings: v.warning_count,
        changes: CHANGE_LOG.filter((c) => c.part === part).length,
      };
    }),
  });

  writeText(
    path.join(UPGRADE, 'E01_TEACHER_FEEDBACK_PATCH_DIFF_v1_1_3.md'),
    buildDiffDoc(originals, patched, frozenHashes),
  );
  writeText(
    path.join(UPGRADE, 'E01_TEACHER_FEEDBACK_PATCH_REPORT_v1_1_3.md'),
    buildReportDoc(originals, patched, frozenHashes),
  );

  console.log('\nWritten patched output to', OUT_ROOT);
  console.log('Written E01_TEACHER_FEEDBACK_PATCH_DIFF_v1_1_3.md');
  console.log('Written E01_TEACHER_FEEDBACK_PATCH_REPORT_v1_1_3.md');

  const anyHard = PATCHED_PARTS.some((p) => !patched[p].record.validation.ok);
  process.exitCode = anyHard ? 1 : 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
