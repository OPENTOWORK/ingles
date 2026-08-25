/**
 * Build teacher human-review packs from 05_OUTPUTS_REGENERATED_v1_1_2 (read-only).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
function normalizePassageGapMarkers(text) {
  return String(text || '')
    .replace(/_+\((\d{1,2})\)_+/g, '($1) ___')
    .replace(/\((\d{1,2})\)_{2,}/g, '($1) ___')
    .replace(/\((\d{1,2})\)\s*\.{3,}/g, '($1) ___')
    .replace(/\((\d{1,2})\)\s*…+/g, '($1) ___');
}

function normalizePart3PassageGaps(text) {
  let t = normalizePassageGapMarkers(text);
  t = t.replace(/_+\((\d{1,2})\)\s+([A-Z][A-Z-]{1,})\b/g, '($1) ___ ($2)');
  t = t.replace(
    /\((\d{1,2})\)\s*(?:_+|\.{2,}|…+)\s+(?!\()([A-Z][A-Z-]{1,})\b/g,
    '($1) ___ ($2)',
  );
  t = t.replace(/\((\d{1,2})\)(?!\s*(?:_+|\.{2,}|…+))\s+(?!\()([A-Z][A-Z-]{2,})\b/g, '($1) ___ ($2)');
  t = t.replace(/\((\d{1,2})\)\s+\(([A-Z][A-Z-]*)\)/g, '($1) ___ ($2)');
  return t;
}

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACK = path.join(
  ROOT,
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
);
const OUT_DIR = path.join(PACK, '05_OUTPUTS_REGENERATED_v1_1_2');
const UPGRADE = path.join(ROOT, 'DRALO_RUOE_System_Quality_Upgrade_v1_0');

const EXAM_PLANS = [
  {
    ruoeExamId: 'RUOE-PILOT-E01',
    outFile: 'HUMAN_REVIEW_REGENERATED_E01_v1_1_2.md',
    folder: 'EXAM-01',
    parts: [
      { part: 1, file: 'CB-PILOT-001_Part1.json' },
      { part: 2, file: 'CB-PILOT-002_Part2.json' },
      { part: 3, file: 'CB-PILOT-003_Part3.json' },
      { part: 4, file: 'TBP-PILOT-EX01_Part4.json' },
      { part: 5, file: 'CB-PILOT-004_Part5.json' },
      { part: 6, file: 'CB-PILOT-005_Part6.json' },
      { part: 7, file: 'CB-PILOT-006_Part7.json' },
    ],
  },
  {
    ruoeExamId: 'RUOE-PILOT-E02',
    outFile: 'HUMAN_REVIEW_REGENERATED_E02_v1_1_2.md',
    folder: 'EXAM-02',
    parts: [
      { part: 1, file: 'CB-PILOT-007_Part1.json' },
      { part: 2, file: 'CB-PILOT-008_Part2.json' },
      { part: 3, file: 'CB-PILOT-009_Part3.json' },
      { part: 4, file: 'TBP-PILOT-EX02_Part4.json' },
      { part: 5, file: 'CB-PILOT-010_Part5.json' },
      { part: 6, file: 'CB-PILOT-011_Part6.json' },
      { part: 7, file: 'CB-PILOT-012_Part7.json' },
    ],
  },
];

function readJson(relPath, baseDir = OUT_DIR) {
  return JSON.parse(fs.readFileSync(path.join(baseDir, relPath), 'utf8'));
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

function renderOptionsList(options) {
  return asArray(options)
    .map(parseOpt)
    .filter(Boolean)
    .map((o) => `- **${o.letter}.** ${o.text}`)
    .join('\n');
}

function studentView(record) {
  const pn = record.part_number;
  const g = record.generated || {};
  const lines = [];

  lines.push('### Vista alumno');
  lines.push('');
  lines.push(`**Part title:** ${g.partTitle || record.part || `Part ${pn}`}`);
  lines.push('');
  lines.push('**Instructions**');
  lines.push('');
  lines.push(esc(g.directions || ''));
  lines.push('');

  if (pn === 4) {
    const ex = g.example;
    if (ex) {
      lines.push('#### Example (0)');
      lines.push('');
      lines.push(esc(ex.sentence1 || ''));
      lines.push('');
      lines.push(`**${String(ex.keyword || '').toUpperCase()}**`);
      lines.push('');
      let s2 = String(ex.sentence2Start || ex.sentence2 || '').trim();
      if (s2 && !/_{2,}|\.{4,}/.test(s2)) s2 = `${s2} __________________`;
      lines.push(esc(s2));
      lines.push('');
    }
    lines.push('#### Questions 25–30');
    lines.push('');
    for (const q of asArray(g.questions)) {
      lines.push(`**Question ${q.number}**`);
      lines.push('');
      lines.push(esc(q.sentence1 || ''));
      lines.push('');
      lines.push(`**${String(q.keyword || '').toUpperCase()}**`);
      lines.push('');
      let s2 = String(q.sentence2Start || q.sentence2 || '').trim();
      if (s2 && !/_{2,}|\.{4,}/.test(s2)) s2 = `${s2} __________________`;
      lines.push(esc(s2));
      lines.push('');
    }
    return lines.join('\n');
  }

  if (pn === 7) {
    if (g.matchingIntro) {
      lines.push(esc(g.matchingIntro));
      lines.push('');
    }
    lines.push('#### Questions 43–52');
    lines.push('');
    for (const q of asArray(g.questions)) {
      lines.push(`- **${q.number}.** ${esc(q.prompt || q.question || '')}`);
    }
    lines.push('');
    lines.push('#### Texts A–D');
    lines.push('');
    for (const sec of asArray(g.sections)) {
      const letter = sec.letter || sec.id || '';
      const name = sec.name || sec.title || '';
      lines.push(`##### ${letter}. ${name}`);
      lines.push('');
      lines.push(esc(sec.text || sec.body || ''));
      lines.push('');
    }
    return lines.join('\n');
  }

  if (g.title) {
    lines.push(`**Text title:** ${g.title}`);
    lines.push('');
  }

  if (pn === 1 && g.example) {
    lines.push('#### Example (0)');
    lines.push('');
    lines.push(renderOptionsList(g.example.options));
    lines.push('');
  }

  if (pn === 2 && g.example) {
    lines.push('#### Example (0)');
    lines.push('');
    const exSent = String(g.example.sentence || g.example.text || '').trim();
    if (exSent) lines.push(esc(exSent));
    lines.push('');
  }

  if (pn === 3 && g.example) {
    lines.push('#### Example (0)');
    lines.push('');
    const stem = String(g.example.stem || g.example.baseWord || '').trim();
    if (stem) lines.push(`(0) ___ (${stem.toUpperCase()})`);
    lines.push('');
  }

  if (g.passage) {
    lines.push('**Text / passage**');
    lines.push('');
    const passage =
      pn === 3 ? normalizePart3PassageGaps(g.passage) : normalizePassageGapMarkers(g.passage);
    lines.push(esc(passage));
    lines.push('');
  }

  if (pn === 6 && g.sentencePool?.length) {
    lines.push('**Sentence pool (A–G)**');
    lines.push('');
    for (const s of asArray(g.sentencePool)) {
      const p = parseOpt(s);
      if (p) lines.push(`- **${p.letter}.** ${p.text}`);
      else lines.push(`- ${s}`);
    }
    lines.push('');
    lines.push('**Gaps:** (37)–(42) — choose one sentence A–G for each gap.');
    lines.push('');
  }

  if (pn === 5) {
    lines.push('#### Questions 31–36');
    lines.push('');
    for (const q of asArray(g.questions)) {
      lines.push(`**Question ${q.number}**`);
      lines.push('');
      lines.push(esc(q.prompt || q.question || ''));
      lines.push('');
      lines.push(renderOptionsList(q.options));
      lines.push('');
    }
    return lines.join('\n');
  }

  if (pn === 1) {
    lines.push('#### Questions 1–8');
    lines.push('');
    for (const q of asArray(g.questions).filter((q) => Number(q.number) !== 0)) {
      lines.push(`**Question ${q.number}**`);
      lines.push('');
      lines.push(renderOptionsList(q.options));
      lines.push('');
    }
  }

  return lines.join('\n');
}

function listBlock(title, items) {
  if (!items?.length) return `- **${title}:** none\n`;
  let out = `- **${title}:**\n`;
  for (const x of items) out += `  - ${x}\n`;
  return out;
}

function reviewerView(record, examId) {
  const pn = record.part_number;
  const g = record.generated || {};
  const v = record.validation || {};
  const lines = [];

  lines.push('### Vista revisor');
  lines.push('');

  if (record.brief_id) {
    lines.push(`- **Content Brief ID:** ${record.brief_id} (${record.brief_version || '—'})`);
    if (record.working_title) lines.push(`- **Working title:** ${record.working_title}`);
  }
  if (record.blueprint_id) lines.push(`- **Blueprint ID:** ${record.blueprint_id}`);
  if (record.style_card_id) lines.push(`- **Style Card:** ${record.style_card_id}`);
  lines.push(`- **Pedagogical approval:** ${record.pedagogical_approval || 'PENDING_HUMAN_REVIEW'}`);
  lines.push(`- **Mechanical validator:** ${v.ok ? 'PASS' : 'FAIL'}`);
  lines.push(
    `- **Blocking HARD:** ${v.blocking_hard_count ?? v.errors?.length ?? 0}`,
  );
  if (v.quality_review_hard_count || record.part_quality?.errors?.length) {
    lines.push(
      `- **Quality-review HARD (non-blocking mechanical):** ${v.quality_review_hard_count ?? record.part_quality?.errors?.length ?? 0}`,
    );
  }
  lines.push(`- **QUALITY findings:** ${v.quality_fail_count ?? v.qualityFails?.length ?? 0}`);
  lines.push(`- **Warnings:** ${v.warning_count ?? v.warnings?.length ?? 0}`);
  lines.push('');

  if (record.part_quality?.blindSolve?.mismatches?.length) {
    lines.push('#### ⚠ TEACHER ATTENTION — blind-solve disagreement');
    lines.push('');
    for (const m of record.part_quality.blindSolve.mismatches) {
      const solver = m.solver ?? m.best ?? '—';
      const key = m.key ?? '—';
      lines.push(`- Q${m.number}: key **${key}** / solver **${solver}**`);
    }
    if (record.part_quality.blindSolve.ambiguous?.length) {
      lines.push('');
      lines.push('**Additional ambiguity warnings:**');
      for (const a of record.part_quality.blindSolve.ambiguous) {
        const alts = (a.letters || a.words || []).join('/');
        lines.push(`- Q${a.number}: possible **${alts}** — ${a.reason || ''}`);
      }
    }
    lines.push('');
  }

  lines.push('#### Validator findings');
  lines.push('');
  lines.push(listBlock('Blocking HARD (validation.errors)', v.errors));
  lines.push(
    listBlock(
      'Quality-review HARD (part_quality.errors)',
      v.quality_review_hard_findings || record.part_quality?.errors,
    ),
  );
  lines.push(listBlock('QUALITY', v.qualityFails));
  lines.push(listBlock('Warnings', v.warnings));
  lines.push(listBlock('Repairs applied', record.repairs_applied));
  if (record.part_quality?.rubric) {
    const rub = record.part_quality.rubric;
    lines.push('#### Pedagogical rubric (automated)');
    lines.push('');
    if (rub.verdict) lines.push(`- Verdict: ${rub.verdict}`);
    if (rub.realisticB2 != null) lines.push(`- Realistic B2: ${rub.realisticB2}`);
    if (rub.cefrLevel) lines.push(`- CEFR level: ${rub.cefrLevel}`);
    if (rub.issues?.length) lines.push(listBlock('Rubric issues', rub.issues).trimEnd());
    if (rub.weakItems?.length) {
      lines.push('- **Weak items:**');
      for (const w of rub.weakItems) {
        lines.push(`  - Q${w.number}: ${w.problem || JSON.stringify(w)}`);
      }
    }
    lines.push('');
  }
  if (record.editorial_findings?.length) {
    lines.push(
      listBlock(
        'Editorial findings',
        record.editorial_findings.map((f) => f.reason || f.message || JSON.stringify(f)),
      ),
    );
  }
  if (record.adversarial_findings?.length) {
    lines.push(
      listBlock(
        'Adversarial findings',
        record.adversarial_findings.map((f) => f.reason || f.message || JSON.stringify(f)),
      ),
    );
  }
  lines.push('');

  if (pn === 4) {
    lines.push('#### Answer key & Part 4 metadata');
    lines.push('');
    const ex = g.example;
    if (ex) {
      lines.push('**Example (0)**');
      lines.push(`- Canonical answer: ${ex.answer || '—'}`);
      lines.push('');
    }
    const itemMeta = asArray(record.part4_quality_metrics?.itemMeta);
    const metaByNum = Object.fromEntries(itemMeta.map((m) => [m.number, m]));
    for (const q of asArray(g.questions)) {
      const num = q.number;
      const meta = q.grading_metadata || q.gradingMetadata || {};
      const mps = asArray(meta.markingPoints);
      const itemM = metaByNum[num] || {};
      lines.push(`**Question ${num}**`);
      lines.push(`- Canonical answer: **${q.answer || '—'}**`);
      lines.push(`- Keyword: ${String(q.keyword || '').toUpperCase()}`);
      const fam = q.family_id || '—';
      const famName = q.family_name || q.transformation_family || '';
      lines.push(`- Transformation Family: ${fam}${famName ? ` — ${famName}` : ''}`);
      lines.push(`- Target structure: ${q.target_structure || meta.target_structure || '—'}`);
      lines.push(`- Difficulty band: ${q.difficulty_band || itemM.band || '—'}`);
      lines.push(
        `- Transformation distance: ${q.transformation_distance || itemM.distance || '—'}`,
      );
      const fullAnswers = asArray(meta.fullAnswers);
      if (fullAnswers.length) {
        lines.push(`- Accepted variants: ${fullAnswers.join(' | ')}`);
      }
      if (mps.length >= 2) {
        lines.push(`- MP1 (${mps[0].label || '—'}): ${asArray(mps[0].accepted).join(' | ')}`);
        lines.push(`- MP2 (${mps[1].label || '—'}): ${asArray(mps[1].accepted).join(' | ')}`);
      }
      if (q.alternative_route_check) {
        lines.push(`- Alternative-route check: ${q.alternative_route_check}`);
      }
      lines.push('');
    }
    const p4Findings = record.part4_findings || [];
    if (p4Findings.length) {
      lines.push('#### Part 4 QUALITY findings (preserved)');
      lines.push('');
      for (const f of p4Findings) {
        lines.push(`- [${f.rule_id || 'QUALITY'}] ${f.location || ''}: ${f.reason || f.message || JSON.stringify(f)}`);
      }
      lines.push('');
    }
    return lines.join('\n');
  }

  lines.push('#### Answer key');
  lines.push('');

  if (pn === 1 || pn === 5) {
    if (g.example?.answer) lines.push(`- Example (0): **${g.example.answer}**`);
    for (const ma of asArray(g.modelAnswers)) {
      lines.push(`- Q${ma.number}: **${ma.answer || '—'}**`);
    }
    for (const q of asArray(g.questions)) {
      if (Number(q.number) === 0) continue;
      if (q.answer && !asArray(g.modelAnswers).some((m) => m.number === q.number)) {
        lines.push(`- Q${q.number}: **${q.answer}**`);
      }
    }
  } else if (pn === 2 || pn === 3) {
    if (g.example?.answer) lines.push(`- Example (0): **${g.example.answer}**`);
    for (const ma of asArray(g.modelAnswers)) {
      lines.push(`- Gap (${ma.number}): **${ma.answer || '—'}**`);
    }
    for (const q of asArray(g.questions)) {
      if (q.answer) lines.push(`- Q${q.number}: **${q.answer}**`);
    }
  } else if (pn === 6) {
    for (const ma of asArray(g.matchingAnswers).length ? g.matchingAnswers : g.modelAnswers) {
      lines.push(`- Gap (${ma.number}): **${ma.answer || ma.letter || '—'}**`);
    }
  } else if (pn === 7) {
    const answers = asArray(g.matchingAnswers).length ? g.matchingAnswers : g.modelAnswers;
    for (const ma of answers) {
      lines.push(`- Q${ma.number}: **${ma.answer || ma.letter || '—'}**`);
    }
  }

  lines.push('');
  return lines.join('\n');
}

const PHASE_A_PARTS = [1, 2, 3, 5, 6, 7];
const PART4_ONLY = [4];

const SPLIT_PACKS = [
  {
    outFile: 'HUMAN_REVIEW_REGENERATED_PARTS_1-3-5-6-7_v1_1_2.md',
    title: 'Parts 1, 2, 3, 5, 6, 7',
    partNumbers: PHASE_A_PARTS,
  },
  {
    outFile: 'HUMAN_REVIEW_REGENERATED_PART4_v1_1_2.md',
    title: 'Part 4',
    partNumbers: PART4_ONLY,
  },
];

function buildExamPack(plan, partNumbers = null) {
  const filter = partNumbers ?? plan.parts.map((p) => p.part);
  const selected = plan.parts.filter((p) => filter.includes(p.part));
  const lines = [];
  lines.push(`# ${plan.ruoeExamId} — Human Review Pack (Regenerated v1.1.2)`);
  lines.push('');
  lines.push('Second human review · Regenerated outputs only · **PENDING_HUMAN_REVIEW**');
  lines.push('');
  lines.push(`Source folder: \`05_OUTPUTS_REGENERATED_v1_1_2/${plan.folder}/\``);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const { part, file } of selected) {
    const record = readJson(path.join(plan.folder, file));
    lines.push(`## Part ${part}`);
    lines.push('');
    lines.push(`_Source: \`${plan.folder}/${file}\`_`);
    lines.push('');
    lines.push(studentView(record));
    lines.push('');
    lines.push(reviewerView(record, plan.ruoeExamId));
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

function buildCombinedPack(splitPack) {
  const lines = [];
  lines.push(`# Human Review — ${splitPack.title} (Regenerated v1.1.2)`);
  lines.push('');
  lines.push('Second human review · Regenerated outputs only · **PENDING_HUMAN_REVIEW**');
  lines.push('');
  lines.push(`Source folder: \`05_OUTPUTS_REGENERATED_v1_1_2/\``);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const plan of EXAM_PLANS) {
    lines.push(`# ${plan.ruoeExamId}`);
    lines.push('');
    lines.push(`Folder: \`05_OUTPUTS_REGENERATED_v1_1_2/${plan.folder}/\``);
    lines.push('');
    lines.push('---');
    lines.push('');

    const selected = plan.parts.filter((p) => splitPack.partNumbers.includes(p.part));
    for (const { part, file } of selected) {
      const record = readJson(path.join(plan.folder, file));
      lines.push(`## Part ${part}`);
      lines.push('');
      lines.push(`_Source: \`${plan.folder}/${file}\`_`);
      lines.push('');
      lines.push(studentView(record));
      lines.push('');
      lines.push(reviewerView(record, plan.ruoeExamId));
      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}

const E02_V1_1_3_DIR = path.join(PACK, '05_OUTPUTS_REGENERATED_E02_v1_1_3');
const E02_PLAN = EXAM_PLANS.find((p) => p.ruoeExamId === 'RUOE-PILOT-E02');

function buildE02ChatGptReviewPack() {
  const folder = E02_PLAN.folder;
  const lines = [
    '# RUOE-PILOT-E02 — Cambridge B2 Reading & Use of English',
    '',
    '**Pilot Exam 2** · Regenerated v1.1.3 · British English · **PENDING_HUMAN_REVIEW**',
    '',
    '---',
    '',
    '## Instructions for external reviewer (e.g. ChatGPT)',
    '',
    'Review this B2 Cambridge-style Reading and Use of English pilot exam.',
    '',
    '**Focus on:**',
    '- Natural British English at B2 level (not American, not AI-corporate tone)',
    '- Exam authenticity (format, difficulty, distractor quality)',
    '- Part 1 & 2: one clearly defensible answer per item; no ambiguous gaps/options',
    '- Part 4: transformation distance, keyword use, marking-point coherence',
    '- Part 5: distractors grounded in the passage; correct paragraph references',
    '- Part 6: cohesion, six gaps, seven options, no option duplicated in passage',
    '- Part 7: meaning/paraphrase matching, not trivial word overlap',
    '',
    '**Structure below:**',
    '- **Vista alumno** — student view (no answer keys)',
    '- **Vista revisor** — answer keys, validator status, automated findings',
    '',
    '**Note:** Parts 1 and 2 may still have validator flags from the last regeneration run. Treat automated findings as signals, not final verdicts.',
    '',
    '---',
    '',
  ];

  for (const { part, file } of E02_PLAN.parts) {
    const record = readJson(path.join(folder, file), E02_V1_1_3_DIR);
    lines.push(`## Part ${part}`);
    lines.push('');
    lines.push(`_Source: \`05_OUTPUTS_REGENERATED_E02_v1_1_3/${folder}/${file}\`_`);
    lines.push('');
    lines.push(studentView(record));
    lines.push('');
    lines.push(reviewerView(record, E02_PLAN.ruoeExamId));
    lines.push('---');
    lines.push('');
  }

  return lines.join('\n');
}

const reportLines = [
  '# HUMAN_REVIEW_PACK_GENERATION_REPORT_v1_1_2',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  'Teacher review packs built from `05_OUTPUTS_REGENERATED_v1_1_2/` only. No JSON modified.',
  '',
  '## Source JSON per Part',
  '',
  '| Exam | Part | Source JSON |',
  '| --- | --- | --- |',
];

for (const plan of EXAM_PLANS) {
  if (process.argv.includes('--e02-chatgpt-only')) continue;
  const content = buildExamPack(plan);
  const outPath = path.join(OUT_DIR, plan.outFile);
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`Written ${outPath}`);

  for (const { part, file } of plan.parts) {
    reportLines.push(`| ${plan.ruoeExamId} | ${part} | \`05_OUTPUTS_REGENERATED_v1_1_2/${plan.folder}/${file}\` |`);
  }
}

for (const splitPack of SPLIT_PACKS) {
  if (process.argv.includes('--e02-chatgpt-only')) break;
  const splitPath = path.join(OUT_DIR, splitPack.outFile);
  fs.writeFileSync(splitPath, buildCombinedPack(splitPack), 'utf8');
  console.log(`Written ${splitPath}`);
}

reportLines.push(
  '',
  '## Output files',
  '',
  `- \`05_OUTPUTS_REGENERATED_v1_1_2/HUMAN_REVIEW_REGENERATED_E01_v1_1_2.md\``,
  `- \`05_OUTPUTS_REGENERATED_v1_1_2/HUMAN_REVIEW_REGENERATED_E02_v1_1_2.md\``,
  `- \`05_OUTPUTS_REGENERATED_v1_1_2/HUMAN_REVIEW_REGENERATED_PARTS_1-3-5-6-7_v1_1_2.md\``,
  `- \`05_OUTPUTS_REGENERATED_v1_1_2/HUMAN_REVIEW_REGENERATED_PART4_v1_1_2.md\``,
  '',
  '## Validation checklist',
  '',
  '- E01: Parts 1–7 each once',
  '- E02: Parts 1–7 each once',
  '- Student views: no answer keys exposed',
  '- Reviewer views: answer keys and findings included',
  '- E02 P1/P2: TEACHER ATTENTION blocks present',
  '- All Parts: PENDING_HUMAN_REVIEW',
  '',
  '## Safety',
  '',
  '- No JSON content modified',
  '- No regeneration performed',
  '- No Supabase / no production',
  '',
);

fs.writeFileSync(
  path.join(UPGRADE, 'HUMAN_REVIEW_PACK_GENERATION_REPORT_v1_1_2.md'),
  reportLines.join('\n'),
  'utf8',
);
if (!process.argv.includes('--e02-chatgpt-only')) {
  console.log('Written HUMAN_REVIEW_PACK_GENERATION_REPORT_v1_1_2.md');
}

if (process.argv.includes('--e02-chatgpt-only') || process.argv.includes('--e02-chatgpt')) {
  const chatgptPath = path.join(E02_V1_1_3_DIR, 'RUOE-PILOT-E02_CHATGPT_REVIEW.md');
  fs.writeFileSync(chatgptPath, buildE02ChatGptReviewPack(), 'utf8');
  console.log(`Written ${chatgptPath}`);
}
