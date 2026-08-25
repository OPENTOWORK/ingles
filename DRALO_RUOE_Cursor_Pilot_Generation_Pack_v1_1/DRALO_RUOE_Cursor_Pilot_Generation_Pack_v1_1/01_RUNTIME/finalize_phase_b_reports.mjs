import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PACK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  '05_OUTPUTS/EXAM-01/TBP-PILOT-EX01_Part4.json',
  '05_OUTPUTS/EXAM-02/TBP-PILOT-EX02_Part4.json',
];

const outputs = files.map((rel) => {
  const doc = JSON.parse(fs.readFileSync(path.join(PACK, rel), 'utf8'));
  doc._relpath = rel;
  return doc;
});

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
    lines.push('| Campo | Valor |');
    lines.push('| --- | --- |');
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
      lines.push(
        `- **Transformation Family:** ${item.family_id} — ${item.family_name || ''}`,
      );
      lines.push(`- **Target structure:** ${item.target_structure || ''}`);
      lines.push(`- **Difficulty:** ${item.difficulty_band || ''}`);
      lines.push(`- **Marking point 1:** ${item.marking_points?.[0] || ''}`);
      lines.push(`- **Marking point 2:** ${item.marking_points?.[1] || ''}`);
      lines.push(
        `- **Accepted variants:** ${(item.accepted_variants || []).length ? item.accepted_variants.join(' / ') : '_(none listed)_'}`,
      );
      lines.push(`- **Validator status:** ${check?.status || 'n/a'}`);
      lines.push(
        check?.warnings?.length
          ? `- **Warnings:** ${check.warnings.join('; ')}`
          : '- **Warnings:** none',
      );
      if (check?.errors?.length) {
        lines.push(`- **Errors:** ${check.errors.join('; ')}`);
      }
      lines.push(
        `- **Rationale / semantic equivalence:** ${item.semantic_equivalence_rationale || item.semantic_equivalence_goal || '_(n/a)_'}`,
      );
      if (item.alternative_route_check) {
        lines.push(`- **Alternative-route check:** ${item.alternative_route_check}`);
      }
      lines.push(
        `- **Blueprint ID:** ${doc.blueprint_id}${item.slot_id ? ` / ${item.slot_id}` : ' / example'}`,
      );
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

fs.writeFileSync(
  path.join(PACK, '05_OUTPUTS', 'HUMAN_REVIEW_PHASE_B.md'),
  buildHumanReview(outputs),
);

const item_results = [];
for (const d of outputs) {
  item_results.push({
    blueprint_id: d.blueprint_id,
    question: 'example(0)',
    status: d.item_checks.example.status,
    errors: d.item_checks.example.errors || [],
    warnings: d.item_checks.example.warnings || [],
    attempt: d.item_attempts?.example ?? null,
    repaired: (d.repaired_items || []).includes('example(0)'),
  });
  for (const q of d.exercise.questions) {
    const c = d.item_checks[`Q${q.question_number}`];
    item_results.push({
      blueprint_id: d.blueprint_id,
      question: q.question_number,
      status: c.status,
      errors: c.errors || [],
      warnings: c.warnings || [],
      attempt: d.item_attempts?.[`Q${q.question_number}`] ?? null,
      repaired: (d.repaired_items || []).includes(`Q${q.question_number}`),
    });
  }
}

const scored = item_results.filter((i) => i.question !== 'example(0)');
const scoredPass = scored.filter((i) => i.status === 'pass').length;
const scoredWarn = scored.filter((i) => i.status === 'pass_with_warnings').length;
const scoredFail = scored.filter((i) => i.status === 'fail').length;

let phaseA = null;
const summaryPath = path.join(PACK, '05_OUTPUTS', 'PILOT_VALIDATION_SUMMARY.json');
if (fs.existsSync(summaryPath)) {
  try {
    phaseA = JSON.parse(fs.readFileSync(summaryPath, 'utf8')).phase_a || null;
  } catch {
    phaseA = null;
  }
}

const phaseB = {
  status:
    scoredFail === 0
      ? 'COMPLETE_READY_FOR_HUMAN_REVIEW'
      : 'COMPLETE_WITH_FAILURES',
  part4_task_count: 2,
  scored_transformations: 12,
  generation_version: outputs[0]?.generation_version,
  model: outputs[0]?.model,
  files: files,
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
  })),
  counts: { pass: scoredPass, pass_with_warnings: scoredWarn, fail: scoredFail },
  item_results,
};

fs.writeFileSync(
  summaryPath,
  JSON.stringify(
    {
      pack_version: '1.1',
      batch_id: 'RUOE-PILOT-01',
      generated_at: new Date().toISOString(),
      phase_a: phaseA || { status: 'PREVIOUSLY_COMPLETED' },
      phase_b: phaseB,
    },
    null,
    2,
  ),
);

const reportPath = path.join(PACK, '05_OUTPUTS', 'PILOT_GENERATION_REPORT.md');
let existing = fs.existsSync(reportPath)
  ? fs.readFileSync(reportPath, 'utf8')
  : '# DRALO RUOE — Pilot Generation Report\n\n';
if (existing.includes('## PHASE B')) {
  existing = existing.split('## PHASE B')[0].trimEnd() + '\n\n';
}

const phaseBReport = `## PHASE B — Part 4 Blueprint pipeline

Status: **${phaseB.status}**  
Generated: ${new Date().toISOString()}  
Model: \`${phaseB.model}\`

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
${files.map((f) => `- \`${f}\``).join('\n')}
- \`05_OUTPUTS/HUMAN_REVIEW_PHASE_B.md\`

### Local repairs
${outputs
  .map((d) =>
    d.repaired_items?.length
      ? `- ${d.blueprint_id}: ${d.repaired_items.join(', ')}`
      : `- ${d.blueprint_id}: none`,
  )
  .join('\n')}

### Notes
- Repeated model failures concentrated on **marking-point split consistency** (answer correct, MP over-included words from sentence2).
- Local repair realigned marking points to the full answer without changing Blueprint family/keyword/target.
- EX01 Q26 regenerated for tense consistency with causative GET.
- Human pedagogical approval still required.

### Stop
PHASE B complete. No orchestrator, no P1–P7 integration, no production writes.
`;

fs.writeFileSync(reportPath, existing + phaseBReport);
fs.writeFileSync(
  path.join(PACK, '05_OUTPUTS', '_phase_b_run_results.json'),
  JSON.stringify({ generated_at: new Date().toISOString(), phase_b: phaseB }, null, 2),
);

console.log(JSON.stringify(phaseB.counts, null, 2));
console.log(
  outputs.map((d) => ({
    id: d.blueprint_id,
    status: d.self_check.status,
    repaired: d.repaired_items,
  })),
);
