/**
 * Recompute PHASE A self-checks and write final report/summary.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PACK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const briefs = JSON.parse(
  fs.readFileSync(
    path.join(PACK, '02_APPROVED_INPUTS', 'DRALO_RUOE_12_Content_Briefs_Pilot_v1_0_APPROVED.json'),
    'utf8',
  ),
).briefs;

function countWords(text) {
  return String(text || '')
    .replace(/\([0-9]+\)/g, ' ')
    .replace(/[^\p{L}\p{N}'’-]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function examFolder(examId) {
  return examId.includes('E01') ? 'EXAM-01' : 'EXAM-02';
}

function partSlug(part) {
  return part.replace(/\s+/g, '');
}

function selfCheck(brief, exercise, partNumber) {
  const errors = [];
  const warnings = [];
  const passage =
    exercise.passage_with_gaps ||
    exercise.article ||
    Object.values(exercise.sections || {})
      .map((s) => s.text)
      .join(' ');
  const wc = countWords(passage);

  if (partNumber === 1 || partNumber === 2 || partNumber === 3) {
    if (wc < 150 || wc > 180) errors.push(`word_count ${wc} outside 150–180`);
    else if (wc < 160 || wc > 170) warnings.push(`word_count ${wc} outside target 160–170`);
  }
  if (partNumber === 5) {
    if (wc < 550 || wc > 650) errors.push(`word_count ${wc} outside 550–650`);
    else if (wc < 580 || wc > 620) warnings.push(`word_count ${wc} outside target 580–620`);
  }
  if (partNumber === 6) {
    if (wc < 500 || wc > 600) errors.push(`word_count ${wc} outside 500–600`);
    else if (wc < 540 || wc > 570) warnings.push(`word_count ${wc} outside target 540–570`);
  }
  if (partNumber === 7) {
    for (const letter of ['A', 'B', 'C', 'D']) {
      const swc = countWords(exercise.sections?.[letter]?.text);
      if (swc < 120 || swc > 150) warnings.push(`section ${letter} word_count ${swc} outside target 120–150`);
      if (swc < 100 || swc > 180) errors.push(`section ${letter} word_count ${swc} severely off-range`);
    }
  }

  if (partNumber === 1) {
    for (const n of [0, 1, 2, 3, 4, 5, 6, 7, 8]) {
      if (!String(exercise.passage_with_gaps).includes(`(${n})`)) errors.push(`missing gap marker (${n})`);
    }
    const letters = (exercise.questions || []).map((q) => q.answer);
    for (const L of ['A', 'B', 'C', 'D']) {
      if (letters.filter((x) => x === L).length > 3) errors.push(`answer letter ${L} appears more than 3 times`);
    }
    for (const q of exercise.questions || []) {
      for (const L of ['A', 'B', 'C', 'D']) {
        const opt = q.options?.[L] || '';
        if (opt.trim().split(/\s+/).length !== 1) errors.push(`Q${q.number} option ${L} is not a single word`);
      }
    }
  }
  if (partNumber === 2) {
    for (const n of [0, 9, 10, 11, 12, 13, 14, 15, 16]) {
      if (!String(exercise.passage_with_gaps).includes(`(${n})`)) errors.push(`missing gap marker (${n})`);
    }
  }
  if (partNumber === 3) {
    for (const n of [0, 17, 18, 19, 20, 21, 22, 23, 24]) {
      if (!String(exercise.passage_with_gaps).includes(`(${n})`)) errors.push(`missing gap marker (${n})`);
    }
    for (const q of exercise.questions || []) {
      if (!q.stem || q.stem !== q.stem.toUpperCase()) errors.push(`Q${q.number} stem must be CAPITALS`);
    }
  }
  if (partNumber === 5) {
    const letters = (exercise.questions || []).map((q) => q.answer);
    if (new Set(letters).size < 3) errors.push('Part 5 answers use fewer than 3 different letters');
    let run = 1;
    for (let i = 1; i < letters.length; i++) {
      run = letters[i] === letters[i - 1] ? run + 1 : 1;
      if (run > 2) errors.push(`Part 5 answer letter run exceeds 2 at Q${31 + i}`);
    }
  }
  if (partNumber === 6) {
    for (const n of [37, 38, 39, 40, 41, 42]) {
      if (!String(exercise.passage_with_gaps).includes(`(${n})`)) errors.push(`missing gap marker (${n})`);
    }
    const answers = (exercise.questions || []).map((q) => q.answer);
    if (new Set(answers).size !== 6) errors.push('Part 6 answers must be six distinct letters');
    if (answers.includes(exercise.unused_sentence)) errors.push('unused_sentence appears among answers');
  }
  if (partNumber === 7) {
    const used = new Set((exercise.questions || []).map((q) => q.answer));
    for (const L of ['A', 'B', 'C', 'D']) if (!used.has(L)) warnings.push(`profile ${L} unused in answers`);
  }

  return {
    status: errors.length ? 'fail' : warnings.length ? 'pass_with_warnings' : 'pass',
    errors,
    warnings,
    word_count: wc,
  };
}

const PART_NUM = { 'Part 1': 1, 'Part 2': 2, 'Part 3': 3, 'Part 5': 5, 'Part 6': 6, 'Part 7': 7 };
const results = [];

for (const brief of briefs) {
  const rel = `05_OUTPUTS/${examFolder(brief.exam_id)}/${brief.brief_id}_${partSlug(brief.part)}.json`;
  const full = path.join(PACK, rel);
  const doc = JSON.parse(fs.readFileSync(full, 'utf8'));
  const check = selfCheck(brief, doc.exercise, PART_NUM[brief.part]);
  doc.self_check = check;
  doc.human_review_required = true;
  doc.pedagogical_approval = 'PENDING_HUMAN_REVIEW';
  fs.writeFileSync(full, JSON.stringify(doc, null, 2));
  results.push({
    brief_id: brief.brief_id,
    exam_id: brief.exam_id,
    part: brief.part,
    style_card_id: brief.style_card_id,
    working_title: brief.working_title,
    file: rel,
    status: check.status,
    errors: check.errors,
    warnings: check.warnings,
    word_count: check.word_count,
    attempt: doc.attempt ?? null,
  });
}

fs.writeFileSync(
  path.join(PACK, '05_OUTPUTS', '_phase_a_run_results.json'),
  JSON.stringify({ generated_at: new Date().toISOString(), phase: 'A', results }, null, 2),
);

const pass = results.filter((r) => r.status === 'pass');
const warn = results.filter((r) => r.status === 'pass_with_warnings');
const fail = results.filter((r) => r.status === 'fail');

const report = `# DRALO RUOE — Pilot Generation Report

Batch: RUOE-PILOT-01  
Pack: v1.1  
Generated: ${new Date().toISOString()}

## PHASE A — Content Brief pipeline

Status: **COMPLETE — READY FOR HUMAN REVIEW**  
Scope: Exam 1 + Exam 2 · Parts 1, 2, 3, 5, 6, 7 · **12 exercises**  
Part 4 / PHASE B: **not started**

### Automatic self-check summary

| Result | Count |
| --- | ---: |
| pass | ${pass.length} |
| pass_with_warnings | ${warn.length} |
| fail | ${fail.length} |

### Per-exercise results

| Brief | Exam | Part | Style | Auto status | Words | Notes |
| --- | --- | --- | --- | --- | ---: | --- |
${results
  .map((r) => {
    const notes = [...(r.errors || []), ...(r.warnings || [])].join('; ') || '—';
    return `| ${r.brief_id} | ${r.exam_id} | ${r.part} | ${r.style_card_id} | ${r.status} | ${r.word_count ?? '—'} | ${notes.replace(/\|/g, '/')} |`;
  })
  .join('\n')}

### Files generated

${results.map((r) => `- \`${r.file}\``).join('\n')}

### Human review required

All 12 exercises require human pedagogical review using:

\`04_REVIEW/DRALO_RUOE_Checklist_Revision_Ejercicios_Piloto_v1_1.docx\`

Automatic checks do **not** equal pedagogical approval.

### Implementation notes / limitations

- Generation used Chat Completions model \`gpt-4o-2024-08-06\` with pack runtime prompts + approved briefs + Style Cards.
- Some outputs required local repair passes for hard length bands and MCQ answer-letter balance after model attempts failed those mechanical constraints.
- No production DB writes. No Part 4 generation. No orchestrator integration.
- Repeated length failures (especially Parts 5/6 initial under-length; Parts 1/3 slight over-length) are evidence for later prompt/validator tightening, not for rewriting Style Cards or Content Briefs in this pilot.

## PHASE B — Part 4 Blueprint pipeline

Status: **NOT STARTED** (waiting for explicit instruction after Phase A handoff)
`;

fs.writeFileSync(path.join(PACK, '05_OUTPUTS', 'PILOT_GENERATION_REPORT.md'), report);

const summary = {
  pack_version: '1.1',
  batch_id: 'RUOE-PILOT-01',
  generated_at: new Date().toISOString(),
  phase_a: {
    status: fail.length ? 'COMPLETE_WITH_FAILURES' : 'COMPLETE_READY_FOR_HUMAN_REVIEW',
    exercise_count: 12,
    pass: pass.length,
    pass_with_warnings: warn.length,
    fail: fail.length,
    results,
    human_review_checklist: '04_REVIEW/DRALO_RUOE_Checklist_Revision_Ejercicios_Piloto_v1_1.docx',
    pedagogical_approval: 'PENDING_HUMAN_REVIEW',
  },
  phase_b: {
    status: 'NOT_STARTED',
    note: 'Awaiting explicit instruction after Phase A human handoff',
  },
};

fs.writeFileSync(
  path.join(PACK, '05_OUTPUTS', 'PILOT_VALIDATION_SUMMARY.json'),
  JSON.stringify(summary, null, 2),
);

console.log(JSON.stringify(results, null, 2));
console.log('fail', fail.length, 'warn', warn.length, 'pass', pass.length);
