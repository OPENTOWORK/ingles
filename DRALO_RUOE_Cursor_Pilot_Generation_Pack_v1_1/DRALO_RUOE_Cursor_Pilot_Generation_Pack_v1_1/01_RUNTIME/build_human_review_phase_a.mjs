/**
 * Build HUMAN_REVIEW_PHASE_A.md from existing Phase A JSON outputs.
 * Does not modify exercise JSON files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PACK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const FILES = [
  '05_OUTPUTS/EXAM-01/CB-PILOT-001_Part1.json',
  '05_OUTPUTS/EXAM-01/CB-PILOT-002_Part2.json',
  '05_OUTPUTS/EXAM-01/CB-PILOT-003_Part3.json',
  '05_OUTPUTS/EXAM-01/CB-PILOT-004_Part5.json',
  '05_OUTPUTS/EXAM-01/CB-PILOT-005_Part6.json',
  '05_OUTPUTS/EXAM-01/CB-PILOT-006_Part7.json',
  '05_OUTPUTS/EXAM-02/CB-PILOT-007_Part1.json',
  '05_OUTPUTS/EXAM-02/CB-PILOT-008_Part2.json',
  '05_OUTPUTS/EXAM-02/CB-PILOT-009_Part3.json',
  '05_OUTPUTS/EXAM-02/CB-PILOT-010_Part5.json',
  '05_OUTPUTS/EXAM-02/CB-PILOT-011_Part6.json',
  '05_OUTPUTS/EXAM-02/CB-PILOT-012_Part7.json',
];

function esc(s) {
  return String(s ?? '').replace(/\r\n/g, '\n');
}

function renderOptions(opts) {
  if (!opts) return '';
  return ['A', 'B', 'C', 'D', 'E', 'F', 'G']
    .filter((L) => opts[L] != null)
    .map((L) => `- **${L}.** ${opts[L]}`)
    .join('\n');
}

function studentPart1or2or3(doc) {
  const e = doc.exercise;
  const out = [];
  out.push('### Vista alumno');
  out.push('');
  out.push(`**Part title:** ${e.part_title || ''}`);
  out.push('');
  out.push('**Instructions**');
  out.push('');
  out.push(esc(e.instructions));
  out.push('');
  out.push(`**Text title:** ${e.text_title || ''}`);
  out.push('');
  out.push(esc(e.passage_with_gaps));
  out.push('');
  if (e.example) {
    out.push('**Example (0)**');
    out.push('');
    if (e.example.options) out.push(renderOptions(e.example.options));
    if (e.example.stem) out.push(`Stem: **${e.example.stem}**`);
    out.push('');
  }
  out.push('**Questions**');
  out.push('');
  for (const q of e.questions || []) {
    out.push(`#### Question ${q.number}`);
    out.push('');
    if (q.stem) out.push(`Stem: **${q.stem}**`);
    if (q.prompt) out.push(esc(q.prompt));
    if (q.options) {
      out.push('');
      out.push(renderOptions(q.options));
    }
    out.push('');
  }
  return out.join('\n');
}

function studentPart5(doc) {
  const e = doc.exercise;
  const out = [];
  out.push('### Vista alumno');
  out.push('');
  out.push(`**Part title:** ${e.part_title || ''}`);
  out.push('');
  out.push('**Instructions**');
  out.push('');
  out.push(esc(e.instructions));
  out.push('');
  out.push(`**Text title:** ${e.text_title || ''}`);
  out.push('');
  out.push(esc(e.article));
  out.push('');
  out.push('**Questions**');
  out.push('');
  for (const q of e.questions || []) {
    out.push(
      `#### Question ${q.number}${q.question_type ? ` (${q.question_type})` : ''}`,
    );
    out.push('');
    out.push(esc(q.prompt));
    out.push('');
    out.push(renderOptions(q.options));
    out.push('');
  }
  return out.join('\n');
}

function studentPart6(doc) {
  const e = doc.exercise;
  const out = [];
  out.push('### Vista alumno');
  out.push('');
  out.push(`**Part title:** ${e.part_title || ''}`);
  out.push('');
  out.push('**Instructions**');
  out.push('');
  out.push(esc(e.instructions));
  out.push('');
  out.push(`**Text title:** ${e.text_title || ''}`);
  out.push('');
  out.push(esc(e.passage_with_gaps));
  out.push('');
  out.push('**Sentence pool (A–G)**');
  out.push('');
  out.push(renderOptions(e.sentence_pool));
  out.push('');
  out.push('**Questions / gaps**');
  out.push('');
  for (const q of e.questions || []) {
    out.push(`- Gap **(${q.number})** — choose one sentence from A–G`);
  }
  out.push('');
  return out.join('\n');
}

function studentPart7(doc) {
  const e = doc.exercise;
  const out = [];
  out.push('### Vista alumno');
  out.push('');
  out.push(`**Part title:** ${e.part_title || ''}`);
  out.push('');
  out.push('**Instructions**');
  out.push('');
  out.push(esc(e.instructions));
  out.push('');
  if (e.matching_intro) {
    out.push(esc(e.matching_intro));
    out.push('');
  }
  out.push(`**Common context / title:** ${e.common_context_title || ''}`);
  out.push('');
  for (const L of ['A', 'B', 'C', 'D']) {
    const s = e.sections?.[L];
    if (!s) continue;
    out.push(`#### ${L}. ${s.label || ''}`);
    out.push('');
    out.push(esc(s.text));
    out.push('');
  }
  out.push('**Questions**');
  out.push('');
  for (const q of e.questions || []) {
    out.push(`**${q.number}.** ${esc(q.prompt)}`);
    out.push('');
  }
  return out.join('\n');
}

function reviewer(doc) {
  const e = doc.exercise;
  const sc = doc.self_check || {};
  const out = [];
  out.push('### Vista revisor');
  out.push('');
  out.push('| Campo | Valor |');
  out.push('| --- | --- |');
  out.push(`| Content Brief ID | ${doc.brief_id || ''} |`);
  out.push(`| Style Card ID | ${doc.style_card_id || ''} |`);
  out.push(`| Exam ID | ${doc.exam_id || ''} |`);
  out.push(`| Working title | ${doc.working_title || ''} |`);
  out.push(`| Validator status | ${sc.status || 'n/a'} |`);
  out.push(`| Word count (auto) | ${sc.word_count ?? 'n/a'} |`);
  out.push(
    `| Pedagogical approval | ${doc.pedagogical_approval || 'PENDING_HUMAN_REVIEW'} |`,
  );
  out.push('');

  if ((sc.warnings || []).length) {
    out.push('**Warnings**');
    out.push('');
    for (const w of sc.warnings) out.push(`- ${w}`);
    out.push('');
  } else {
    out.push('**Warnings:** none');
    out.push('');
  }

  if ((sc.errors || []).length) {
    out.push('**Errors (auto)**');
    out.push('');
    for (const er of sc.errors) out.push(`- ${er}`);
    out.push('');
  }

  out.push('**Answer key**');
  out.push('');
  if (e.example) {
    const exAns = e.example.answer || '';
    const exStem = e.example.stem ? ` · stem ${e.example.stem}` : '';
    const exExpl = e.example.explanation ? ` — ${e.example.explanation}` : '';
    out.push(`- Example (0): **${exAns}**${exStem}${exExpl}`);
  }
  if (doc.part_number === 6 && e.unused_sentence) {
    out.push(`- Unused sentence: **${e.unused_sentence}**`);
  }
  for (const q of e.questions || []) {
    let line = `- Q${q.number}: **${q.answer ?? ''}**`;
    if (q.stem) line += ` (from ${q.stem})`;
    out.push(line);
  }
  out.push('');

  out.push('**Rationale / explanation**');
  out.push('');
  if (e.example?.explanation) {
    out.push(`- Example (0): ${esc(e.example.explanation)}`);
  }
  for (const q of e.questions || []) {
    const bits = [];
    if (q.rationale) bits.push(q.rationale);
    if (q.explanation) bits.push(q.explanation);
    if (q.evidence) bits.push(`Evidence: ${q.evidence}`);
    if (q.lexical_focus) bits.push(`Lexical focus: ${q.lexical_focus}`);
    if (q.grammar_focus) bits.push(`Grammar focus: ${q.grammar_focus}`);
    if (q.transformation_type) bits.push(`Transformation: ${q.transformation_type}`);
    if (q.cohesion_focus) bits.push(`Cohesion: ${q.cohesion_focus}`);
    if (q.question_type) bits.push(`Type: ${q.question_type}`);
    out.push(
      `- Q${q.number}: ${bits.length ? bits.map(esc).join(' | ') : '_(no rationale stored)_'}`,
    );
  }
  out.push('');

  if (e.validation_notes) {
    out.push('**Generator validation notes**');
    out.push('');
    for (const k of [
      'brief_fidelity_notes',
      'style_card_notes',
      'british_english_notes',
      'factuality_notes',
      'answer_validity_notes',
    ]) {
      if (e.validation_notes[k]) out.push(`- ${k}: ${esc(e.validation_notes[k])}`);
    }
    if ((e.validation_notes.self_check_flags || []).length) {
      out.push(
        `- self_check_flags: ${e.validation_notes.self_check_flags.join('; ')}`,
      );
    }
    out.push('');
  }

  return out.join('\n');
}

function renderOne(doc, sourceFile) {
  const pn = doc.part_number;
  let student = '';
  if (pn === 1 || pn === 2 || pn === 3) student = studentPart1or2or3(doc);
  else if (pn === 5) student = studentPart5(doc);
  else if (pn === 6) student = studentPart6(doc);
  else if (pn === 7) student = studentPart7(doc);
  else student = '### Vista alumno\n\n_(unsupported part)_\n';

  return [
    `## ${doc.exam_id} · ${doc.part} · ${doc.brief_id}`,
    '',
    `_Source file: \`${sourceFile}\`_`,
    '',
    student,
    '---',
    '',
    reviewer(doc),
    '',
    '---',
    '',
  ].join('\n');
}

const chunks = [];
chunks.push('# DRALO RUOE — Human Review Pack · PHASE A');
chunks.push('');
chunks.push('Readable representation of the 12 existing Phase A JSON outputs.');
chunks.push('');
chunks.push(
  '- **No regeneration** · **No content edits** · **Not uploaded to production**',
);
chunks.push('- Pedagogical approval remains **PENDING_HUMAN_REVIEW**');
chunks.push(
  '- Checklist: `04_REVIEW/DRALO_RUOE_Checklist_Revision_Ejercicios_Piloto_v1_1.docx`',
);
chunks.push('- PHASE B / Part 4: **not included**');
chunks.push('');
chunks.push('## Contents');
chunks.push('');
chunks.push('1. [EXAM-01](#exam-01)');
chunks.push('2. [EXAM-02](#exam-02)');
chunks.push('');

chunks.push('# EXAM-01');
chunks.push('');
for (const f of FILES.filter((x) => x.includes('EXAM-01'))) {
  const doc = JSON.parse(fs.readFileSync(path.join(PACK, f), 'utf8'));
  chunks.push(renderOne(doc, f));
}

chunks.push('# EXAM-02');
chunks.push('');
for (const f of FILES.filter((x) => x.includes('EXAM-02'))) {
  const doc = JSON.parse(fs.readFileSync(path.join(PACK, f), 'utf8'));
  chunks.push(renderOne(doc, f));
}

const outPath = path.join(PACK, '05_OUTPUTS', 'HUMAN_REVIEW_PHASE_A.md');
fs.writeFileSync(outPath, chunks.join('\n'), 'utf8');
console.log('Wrote', outPath);
console.log('bytes', fs.statSync(outPath).size);
