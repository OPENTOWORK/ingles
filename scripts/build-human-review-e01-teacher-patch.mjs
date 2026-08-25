/**
 * Build HUMAN_REVIEW_E01_TEACHER_PATCH_v1_1_3.md from the patched E01 output.
 *
 * Read-only over 05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3: it renders a
 * student view (no keys, no correction marks) and a reviewer view (keys,
 * validator findings and the teacher-feedback changes) for Parts 1–7.
 *
 * Usage:
 *   node scripts/build-human-review-e01-teacher-patch.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHANGE_LOG, OBSERVATIONS_NOT_PATCHED } from './ruoe-e01-teacher-patch-content.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACK = path.join(
  ROOT,
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
);
const OUT_ROOT = path.join(PACK, '05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3');
const EXAM_DIR = path.join(OUT_ROOT, 'EXAM-01');

const PARTS = [
  { part: 1, file: 'CB-PILOT-001_Part1.json', status: 'patched' },
  { part: 2, file: 'CB-PILOT-002_Part2.json', status: 'patched' },
  { part: 3, file: 'CB-PILOT-003_Part3.json', status: 'patched' },
  { part: 4, file: 'TBP-PILOT-EX01_Part4.json', status: 'frozen' },
  { part: 5, file: 'CB-PILOT-004_Part5.json', status: 'patched' },
  { part: 6, file: 'CB-PILOT-005_Part6.json', status: 'frozen-no' },
  { part: 7, file: 'CB-PILOT-006_Part7.json', status: 'frozen' },
];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function esc(s) {
  return String(s ?? '').replace(/\r\n/g, '\n');
}

function asArray(v) {
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object') return Object.values(v);
  return [];
}

function parseOpt(opt) {
  if (typeof opt === 'string') {
    const m = opt.match(/^([A-H])\)\s*(.*)$/i) || opt.match(/^([A-H])\s+(.*)$/i);
    if (m) return { letter: m[1].toUpperCase(), text: m[2].trim() };
    return { letter: '', text: opt };
  }
  if (opt && typeof opt === 'object') {
    return {
      letter: String(opt.letter || opt.id || '').toUpperCase(),
      text: String(opt.text || opt.label || '').trim(),
    };
  }
  return null;
}

function optionLines(options) {
  return asArray(options)
    .map(parseOpt)
    .filter(Boolean)
    .map((o) => `- **${o.letter}.** ${o.text}`);
}

function listBlock(title, items) {
  const arr = asArray(items).filter(Boolean);
  if (!arr.length) return `- **${title}:** none\n`;
  return [`- **${title}:**`, ...arr.map((i) => `  - ${typeof i === 'string' ? i : JSON.stringify(i)}`), ''].join('\n');
}

function blankLine(len = 22) {
  return '_'.repeat(len);
}

/* ------------------------------------------------------------ student view */

function studentView(record) {
  const pn = record.part_number;
  const g = record.generated || {};
  const out = [];

  out.push('### Vista alumno');
  out.push('');
  out.push(`**${g.partTitle || record.part || `Part ${pn}`}**`);
  out.push('');
  out.push(esc(g.directions || ''));
  out.push('');

  if (pn === 4) {
    const ex = g.example;
    if (ex) {
      out.push('**Example (0)**');
      out.push('');
      out.push(esc(ex.sentence1 || ''));
      out.push('');
      out.push(`**${String(ex.keyword || '').toUpperCase()}**`);
      out.push('');
      out.push(esc(ex.sentence2Start || ''));
      out.push('');
    }
    out.push('**Questions 25–30**');
    out.push('');
    for (const q of asArray(g.questions)) {
      out.push(`**${q.number}.** ${esc(q.sentence1 || '')}`);
      out.push('');
      out.push(`**${String(q.keyword || '').toUpperCase()}**`);
      out.push('');
      out.push(esc(q.sentence2Start || ''));
      out.push('');
    }
    return out.join('\n');
  }

  if (pn === 7) {
    if (g.matchingIntro) {
      out.push(esc(g.matchingIntro));
      out.push('');
    }
    out.push('**Questions 43–52**');
    out.push('');
    for (const q of asArray(g.questions)) {
      out.push(`**${q.number}.** ${esc(q.prompt || q.question || '')} ${blankLine(6)}`);
    }
    out.push('');
    out.push('**Texts A–D**');
    out.push('');
    for (const sec of asArray(g.sections)) {
      out.push(`**${sec.letter || ''}. ${sec.name || sec.title || ''}**`);
      out.push('');
      out.push(esc(sec.text || sec.body || ''));
      out.push('');
    }
    return out.join('\n');
  }

  if (g.title) {
    out.push(`**${g.title}**`);
    out.push('');
  }

  if (pn === 1 && g.example) {
    out.push('**Example (0)**');
    out.push('');
    out.push(...optionLines(g.example.options));
    out.push('');
    out.push(`Answer: **${g.example.answer || '—'}** _(example — given to the candidate)_`);
    out.push('');
  }
  if ((pn === 2 || pn === 3) && g.example) {
    out.push(
      `**Example (0):** **${g.example.answer || '—'}**${
        g.example.stem ? ` (${g.example.stem})` : ''
      } _(example — given to the candidate)_`,
    );
    out.push('');
  }

  if (g.passage) {
    out.push(esc(g.passage));
    out.push('');
  }

  if (pn === 1) {
    out.push('**Questions 1–8**');
    out.push('');
    for (const q of asArray(g.questions)) {
      out.push(`**${q.number}**`);
      out.push(...optionLines(q.options));
      out.push('');
    }
  } else if (pn === 2) {
    out.push('**Questions 9–16** — write ONE word in each gap.');
    out.push('');
    for (const q of asArray(g.questions)) out.push(`- **${q.number}.** ${blankLine()}`);
    out.push('');
  } else if (pn === 3) {
    out.push('**Questions 17–24** — use the word in CAPITALS to form a word that fits the gap.');
    out.push('');
    for (const q of asArray(g.questions)) {
      out.push(`- **${q.number}.** ${String(q.stem || '').toUpperCase()} → ${blankLine()}`);
    }
    out.push('');
  } else if (pn === 5) {
    out.push('**Questions 31–36**');
    out.push('');
    for (const q of asArray(g.questions)) {
      out.push(`**${q.number}.** ${esc(q.prompt || q.question || '')}`);
      out.push(...optionLines(q.options));
      out.push('');
    }
  } else if (pn === 6) {
    out.push('**Questions 37–42** — sentences A–G');
    out.push('');
    for (const s of asArray(g.sentencePool)) {
      const o = parseOpt(s);
      out.push(`- **${o.letter}.** ${o.text}`);
    }
    out.push('');
    for (const q of asArray(g.questions)) out.push(`- **${q.number}.** ${blankLine(6)}`);
    out.push('');
  }

  return out.join('\n');
}

/* ----------------------------------------------------------- reviewer view */

function reviewerView(record) {
  const pn = record.part_number;
  const g = record.generated || {};
  const v = record.validation || {};
  const out = [];

  out.push('### Vista revisor');
  out.push('');
  if (record.brief_id) {
    out.push(`- **Content Brief:** ${record.brief_id}${record.brief_version ? ` (v${record.brief_version})` : ''}`);
  }
  if (record.blueprint_id) out.push(`- **Blueprint:** ${record.blueprint_id}`);
  if (record.style_card_id) out.push(`- **Style Card:** ${record.style_card_id}`);
  if (record.working_title) out.push(`- **Working title:** ${record.working_title}`);
  out.push(`- **Patch status:** ${record.patch_kind || 'frozen — copied unchanged from v1.1.2'}`);
  out.push(`- **Pedagogical approval:** ${record.pedagogical_approval || 'PENDING_HUMAN_REVIEW'}`);
  out.push(`- **Mechanical validator:** ${v.ok ? 'PASS' : 'FAIL'}`);
  out.push(`- **Blocking HARD:** ${v.blocking_hard_count ?? v.hard_fail_count ?? 0}`);
  out.push(`- **Quality-review HARD:** ${v.quality_review_hard_count ?? 0}`);
  out.push(`- **QUALITY findings:** ${v.quality_fail_count ?? 0}`);
  out.push(`- **Warnings:** ${v.warning_count ?? 0}`);
  out.push('');

  const changes = CHANGE_LOG.filter((c) => c.part === pn);
  if (changes.length) {
    out.push('#### Teacher-feedback changes applied in this Part');
    out.push('');
    for (const c of changes) {
      out.push(`- **${c.locus}**`);
      out.push(`  - Before: ${c.before}`);
      out.push(`  - After: ${c.after}`);
      out.push(`  - Feedback: ${c.feedback}`);
      out.push(`  - Reason: ${c.reason}`);
    }
    out.push('');
  } else {
    out.push('#### Teacher-feedback changes applied in this Part');
    out.push('');
    out.push('**None — this Part is frozen and was copied byte-for-byte from the v1.1.2 output.**');
    out.push('');
    out.push(
      'The validator findings below are the ones recorded in v1.1.2 and are reproduced unchanged, ' +
        'because re-running the validators would have meant touching a frozen Part.',
    );
    out.push('');
  }

  const obs = OBSERVATIONS_NOT_PATCHED.filter((o) => o.part === pn);
  if (obs.length) {
    out.push('#### Left unchanged on purpose (outside the feedback scope)');
    out.push('');
    for (const o of obs) out.push(`- **${o.locus}:** ${o.note}`);
    out.push('');
  }

  const bs = record.part_quality?.blindSolve;
  if (bs?.mismatches?.length || bs?.ambiguous?.length) {
    out.push('#### TEACHER ATTENTION — blind-solve');
    out.push('');
    for (const m of bs.mismatches || []) {
      out.push(`- Q${m.number}: key **${m.key ?? '—'}** / solver **${m.solver ?? m.best ?? '—'}**`);
    }
    for (const a of bs.ambiguous || []) {
      const alts = (a.letters || a.words || []).join(' / ');
      out.push(`- Q${a.number}: solver considers **${alts}** defensible — ${a.reason || ''}`);
    }
    out.push('');
  } else if (bs) {
    const solved =
      bs.solvedCount ??
      (Array.isArray(bs.answers) ? bs.answers.length : Array.isArray(bs.assignments) ? bs.assignments.length : null);
    const detail = solved ? `${solved} items solved, no mismatches` : 'no mismatches';
    out.push(`_Blind-solve agreed with every key (${detail}, no ambiguity flags)._`);
    out.push('');
  }

  const aiAnswers = record.part_quality?.blindSolve?.answers || record.part_quality?.blindSolve?.assignments;
  if (Array.isArray(aiAnswers) && aiAnswers.length) {
    const rendered = aiAnswers
      .map((a) => `${a.number ?? a.gap}=${a.letter}${a.confidence ? ` (${a.confidence})` : ''}`)
      .join(', ');
    out.push(`_Adversarial blind reconstruction: ${rendered}._`);
    out.push('');
  }

  out.push('#### Answer key');
  out.push('');
  if (pn === 4) {
    if (g.example) out.push(`- Example (0): **${g.example.answer || '—'}**`);
    for (const q of asArray(g.questions)) {
      const variants = asArray(q.grading_metadata?.fullAnswers);
      out.push(
        `- Q${q.number} (${String(q.keyword || '').toUpperCase()}): **${q.answer || '—'}**${
          variants.length > 1 ? ` · accepted: ${variants.join(' | ')}` : ''
        }`,
      );
    }
  } else if (pn === 6 || pn === 7) {
    const answers = asArray(g.matchingAnswers).length ? g.matchingAnswers : g.modelAnswers;
    for (const ma of answers) {
      const label = pn === 6 ? `Gap ${ma.number}` : `Q${ma.number}`;
      out.push(`- ${label}: **${ma.answer || ma.letter || '—'}**`);
    }
    if (pn === 6) {
      const used = new Set(answers.map((a) => String(a.answer || a.letter)));
      const unused = asArray(g.sentencePool)
        .map((s) => parseOpt(s).letter)
        .filter((l) => !used.has(l));
      out.push(`- Unused sentence: **${unused.join(', ') || '—'}**`);
    }
  } else {
    if (g.example?.answer) {
      out.push(
        `- Example (0): **${g.example.answer}**${g.example.stem ? ` (${g.example.stem})` : ''}`,
      );
    }
    for (const ma of asArray(g.modelAnswers)) {
      const label = pn === 1 || pn === 5 ? `Q${ma.number}` : `Gap (${ma.number})`;
      let extra = '';
      if (pn === 1 || pn === 5) {
        const q = asArray(g.questions).find((x) => Number(x.number) === Number(ma.number));
        const opt = asArray(q?.options)
          .map(parseOpt)
          .find((o) => o && o.letter === String(ma.answer).toUpperCase());
        if (opt) extra = ` — ${opt.text}`;
      }
      if (pn === 3 && ma.transformationFamily) extra = ` (${ma.transformationFamily})`;
      out.push(`- ${label}: **${ma.answer || '—'}**${extra}`);
    }
  }
  out.push('');

  if (pn === 5) {
    out.push('#### Evidence and rationale per item');
    out.push('');
    for (const q of asArray(g.questions)) {
      out.push(`- **Q${q.number}** (${q.questionType || '—'})`);
      if (q.evidence) out.push(`  - Evidence: ${esc(q.evidence)}`);
      if (q.rationale) out.push(`  - Rationale: ${esc(q.rationale)}`);
    }
    out.push('');
  }

  out.push('#### Validator findings');
  out.push('');
  out.push(listBlock('Blocking HARD', v.errors));
  out.push(listBlock('Quality-review HARD', v.quality_review_hard_findings));
  out.push(listBlock('QUALITY', v.qualityFails));
  out.push(listBlock('Warnings', v.warnings));

  if (asArray(v.warnings).some((w) => /validator failed to run/i.test(String(w)))) {
    out.push(
      '_The "validator failed to run" warning above is inherited from v1.1.2: the adversarial quality validator ' +
        'had a syntax error that has since been fixed. Re-running it here would have meant rewriting a frozen Part, ' +
        'so the warning is left as recorded._',
    );
    out.push('');
  }

  const rub = record.part_quality?.rubric;
  if (rub) {
    out.push('#### Automated rubric');
    out.push('');
    if (rub.verdict) out.push(`- Verdict: **${rub.verdict}**`);
    if (rub.cefrLevel) out.push(`- CEFR estimate: ${rub.cefrLevel}`);
    if (rub.realisticB2 != null) out.push(`- Realistic B2: ${rub.realisticB2}`);
    if (asArray(rub.issues).length) {
      out.push('- Issues:');
      for (const i of rub.issues) out.push(`  - ${i}`);
    }
    if (asArray(rub.weakItems).length) {
      out.push('- Weak items:');
      for (const w of rub.weakItems) out.push(`  - Q${w.number}: ${w.problem || JSON.stringify(w)}`);
    }
    out.push('');
  }

  return out.join('\n');
}

function buildChatGptReviewPack(records, activity) {
  const lines = [
    '# RUOE-PILOT-E01 — Cambridge B2 Reading & Use of English',
    '',
    '**Pilot Exam 1** · Teacher feedback patch v1.1.3 · British English · **PENDING_HUMAN_REVIEW**',
    '',
    '---',
    '',
    '## Instructions for external reviewer (e.g. ChatGPT)',
    '',
    'Review this B2 Cambridge-style Reading and Use of English pilot exam.',
    '',
    '**Context:** This is Exam 1 after a controlled patch from the second human teacher review — not a full regeneration. Parts 1, 2, 3, 5 were patched locally; Part 6 was rebuilt; Parts 4 and 7 are unchanged from v1.1.2.',
    '',
    '**Focus on:**',
    '- Natural British English at B2 level (not American, not AI-corporate tone)',
    '- Exam authenticity (format, difficulty, distractor quality)',
    '- Part 1 & 2: one clearly defensible answer per item; no answer leaked before the gap',
    '- Part 3: genuine word-formation derivations; no stem equals answer',
    '- Part 4: transformation distance, keyword use, marking-point coherence',
    '- Part 5: distractors grounded in the passage; questions follow passage order',
    '- Part 6: cohesion, six gaps, seven options, no option duplicated in passage',
    '- Part 7: meaning/paraphrase matching, not trivial word overlap',
    '',
    '**Structure below:**',
    '- **Vista alumno** — student view (no answer keys)',
    '- **Vista revisor** — answer keys, teacher-feedback changes, validator findings',
    '',
    '**Note:** Items marked **TEACHER ATTENTION** need a human decision. Treat automated findings as signals, not final verdicts.',
    '',
    '---',
    '',
  ];

  for (const r of records) {
    lines.push(`## Part ${r.part}`);
    lines.push('');
    lines.push(`_Source: \`05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3/EXAM-01/${r.file}\`_`);
    lines.push('');
    lines.push(studentView(r.record));
    lines.push('');
    lines.push(reviewerView(r.record));
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

/* ---------------------------------------------------------------- assembly */

function main() {
  const records = PARTS.map((p) => ({ ...p, record: readJson(path.join(EXAM_DIR, p.file)) }));

  const lines = [];
  lines.push('# HUMAN REVIEW — RUOE-PILOT-E01 · TEACHER FEEDBACK PATCH v1.1.3');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('- **Exam:** RUOE-PILOT-E01 (Reading and Use of English, Parts 1–7)');
  lines.push('- **Baseline:** `05_OUTPUTS_REGENERATED_v1_1_2/EXAM-01` (kept intact)');
  lines.push('- **This pack:** `05_OUTPUTS_REGENERATED_E01_TEACHER_PATCH_v1_1_3/EXAM-01`');
  lines.push('- **Kind:** controlled patch from the second human review — **not** a regeneration');
  lines.push('- **Status:** `PENDING_HUMAN_REVIEW` (nothing published, no Supabase, no production write)');
  lines.push('');
  lines.push('## What changed and what did not');
  lines.push('');
  lines.push('| Part | Activity | Status in this patch |');
  lines.push('| --- | --- | --- |');
  const activity = {
    1: 'Multiple-choice cloze',
    2: 'Open cloze',
    3: 'Word formation',
    4: 'Key word transformations',
    5: 'Multiple choice (reading)',
    6: 'Gapped text',
    7: 'Multiple matching',
  };
  for (const r of records) {
    const status =
      r.part === 4 || r.part === 7
        ? '**Frozen** — copied byte-for-byte, not re-validated'
        : r.part === 6
          ? '**Rebuilt** (Architecture v2, the only authorised rebuild)'
          : `Patched locally — ${CHANGE_LOG.filter((c) => c.part === r.part).length} change(s)`;
    lines.push(`| ${r.part} | ${activity[r.part]} | ${status} |`);
  }
  lines.push('');
  lines.push('## How to review');
  lines.push('');
  lines.push('1. Read the **student view** first. It contains no keys and no correction marks — it is what a candidate would see.');
  lines.push('2. Then open the **reviewer view** for the keys, the evidence, the validator findings and the list of teacher-feedback changes applied to that Part.');
  lines.push('3. Items marked **TEACHER ATTENTION** are where the automated blind solver disagreed with the key or flagged a second defensible answer. These need a human decision.');
  lines.push('4. Parts 4 and 7 are unchanged, so anything you flagged there previously still stands.');
  lines.push('');

  lines.push('## Answer keys at a glance');
  lines.push('');
  for (const r of records) {
    const g = r.record.generated || {};
    let keys;
    if (r.part === 4) {
      keys = asArray(g.questions).map((q) => `${q.number}=${q.answer}`).join(' · ');
    } else if (r.part === 6 || r.part === 7) {
      const answers = asArray(g.matchingAnswers).length ? g.matchingAnswers : g.modelAnswers;
      keys = answers.map((a) => `${a.number}=${a.answer || a.letter}`).join(' · ');
    } else {
      keys = asArray(g.modelAnswers).map((m) => `${m.number}=${m.answer}`).join(' · ');
    }
    lines.push(`- **Part ${r.part}:** ${keys}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const r of records) {
    lines.push(`# Part ${r.part} — ${activity[r.part]}`);
    lines.push('');
    lines.push(studentView(r.record));
    lines.push('');
    lines.push(reviewerView(r.record));
    lines.push('');
    lines.push('---');
    lines.push('');
  }

  lines.push('## Open questions for the teachers');
  lines.push('');
  for (const o of OBSERVATIONS_NOT_PATCHED) {
    lines.push(`- **Part ${o.part} — ${o.locus}:** ${o.note}`);
  }
  lines.push('');
  lines.push('## Confirmations');
  lines.push('');
  lines.push('- Part 4 and Part 7 were not regenerated, repaired, normalised or reformatted.');
  lines.push('- Content Brief IDs, Style Cards, topics, question counts and Cambridge numbering are unchanged in every Part.');
  lines.push('- Exam 2 was not touched.');
  lines.push('- All Parts remain `PENDING_HUMAN_REVIEW`.');
  lines.push('');

  const outPath = path.join(OUT_ROOT, 'HUMAN_REVIEW_E01_TEACHER_PATCH_v1_1_3.md');
  fs.writeFileSync(outPath, lines.join('\n'), 'utf8');
  console.log('Written', outPath);

  const chatgptPath = path.join(OUT_ROOT, 'RUOE-PILOT-E01_CHATGPT_REVIEW.md');
  fs.writeFileSync(chatgptPath, buildChatGptReviewPack(records, activity), 'utf8');
  console.log('Written', chatgptPath);
}

main();
