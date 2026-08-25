/**
 * Distribution + Blueprint validator for the RUOE-PILOT-02 proposal (E03/E04).
 *
 * Read-only: reads the approved E01/E02 inputs as history and the proposed
 * E03/E04 inputs as the candidate map. Writes a validation report JSON.
 * Does not modify any approved or historical file.
 */
import fs from 'node:fs';
import path from 'node:path';

const PACK = path.resolve(
  process.cwd(),
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
  'DRALO_RUOE_Cursor_Pilot_Generation_Pack_v1_1',
);
const APPROVED = path.join(PACK, '02_APPROVED_INPUTS');
const PROPOSED = path.join(PACK, '02_PROPOSED_INPUTS_E03_E04_v1_0');

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

const historyBriefs = read(path.join(APPROVED, 'DRALO_RUOE_12_Content_Briefs_Pilot_v1_0_APPROVED.json')).briefs;
const historyBps = read(path.join(APPROVED, 'DRALO_RUOE_Transformation_Blueprints_Pilot_v1_0_APPROVED.json')).blueprints;
const proposal = read(path.join(PROPOSED, 'DRALO_RUOE_12_Content_Briefs_E03_E04_v1_0_PROPOSED.json'));
const proposedBps = read(path.join(PROPOSED, 'DRALO_RUOE_Transformation_Blueprints_E03_E04_v1_0_PROPOSED.json')).blueprints;

const hard = [];
const soft = [];
const info = [];
const fail = (arr, rule, msg) => arr.push({ rule, message: msg });

const BRIEF_PARTS = ['Part 1', 'Part 2', 'Part 3', 'Part 5', 'Part 6', 'Part 7'];
const COMPATIBLE_PARTS = {
  'SC-01': ['Part 1', 'Part 2', 'Part 3', 'Part 5', 'Part 6'],
  'SC-02': ['Part 1', 'Part 2', 'Part 3', 'Part 5', 'Part 6'],
  'SC-03': ['Part 1', 'Part 2', 'Part 3', 'Part 5', 'Part 6'],
  'SC-04': ['Part 1', 'Part 2', 'Part 3', 'Part 5', 'Part 6'],
  'SC-05': ['Part 1', 'Part 2', 'Part 3', 'Part 5', 'Part 6'],
  'SC-06': ['Part 7'],
};

const byExam = {};
for (const b of proposal.briefs) (byExam[b.exam_id] ||= []).push(b);

// ---- Content Brief distribution checks -------------------------------------

for (const [examId, briefs] of Object.entries(byExam)) {
  const parts = briefs.map((b) => b.part).sort();
  if (JSON.stringify(parts) !== JSON.stringify([...BRIEF_PARTS].sort())) {
    fail(hard, 'MAP-01', `${examId}: expected exactly ${BRIEF_PARTS.join(', ')}, got ${parts.join(', ')}`);
  }

  // DR-01 HARD — six different Main Topic IDs per exam
  const mts = briefs.map((b) => b.main_topic_id);
  if (new Set(mts).size !== 6) {
    fail(hard, 'DR-01', `${examId}: Main Topic IDs not unique → ${mts.join(', ')}`);
  }

  // DR-03 HARD — no duplicate TB ID inside one exam
  const tbs = briefs.map((b) => b.topic_id);
  if (new Set(tbs).size !== tbs.length) {
    fail(hard, 'DR-03', `${examId}: duplicate Topic Bank entry → ${tbs.join(', ')}`);
  }

  // DR-08 HARD — Style Card / Part compatibility
  for (const b of briefs) {
    const allowed = COMPATIBLE_PARTS[b.style_card_id];
    if (!allowed) fail(hard, 'DR-08', `${b.brief_id}: unknown Style Card ${b.style_card_id}`);
    else if (!allowed.includes(b.part)) {
      fail(hard, 'DR-08', `${b.brief_id}: ${b.style_card_id} is not compatible with ${b.part}`);
    }
  }

  // DR-09 HARD — Part 7 uses SC-06
  const p7 = briefs.find((b) => b.part === 'Part 7');
  if (p7 && p7.style_card_id !== 'SC-06') fail(hard, 'DR-09', `${examId}: Part 7 uses ${p7.style_card_id}`);
  for (const b of briefs) {
    if (b.style_card_id === 'SC-06' && b.part !== 'Part 7') {
      fail(hard, 'DR-09', `${b.brief_id}: SC-06 used outside Part 7`);
    }
  }

  // DR-05 HARD — no conceptual duplication inside the exam
  for (const key of ['central_idea_tag', 'tension_tag', 'progression_pattern']) {
    const vals = briefs
      .map((b) => b.conceptual_fingerprint?.[key])
      .filter((v) => v && v !== 'four_profile_comparison');
    const dupes = vals.filter((v, i) => vals.indexOf(v) !== i);
    if (dupes.length) fail(hard, 'DR-05', `${examId}: duplicate ${key} → ${[...new Set(dupes)].join(', ')}`);
  }

  // DR-10 HARD if P6 — discourse extension present
  const p6 = briefs.find((b) => b.part === 'Part 6');
  if (p6) {
    const ps = p6.part_specific || {};
    for (const f of [
      'paragraph_functions',
      'discourse_links',
      'reference_chain_plan',
      'sequencing_logic',
      'removable_sentence_opportunities',
      'interchangeability_risk',
    ]) {
      if (!ps[f] || (Array.isArray(ps[f]) && !ps[f].length)) {
        fail(hard, 'DR-10/BV-17', `${p6.brief_id}: missing Part 6 extension field '${f}'`);
      }
    }
    if ((ps.removable_sentence_opportunities || []).length < 6) {
      fail(hard, 'DR-10/BV-17', `${p6.brief_id}: fewer than 6 removable-sentence opportunities`);
    }
  }

  // BV-18 HARD if P7 — four-profile extension present
  if (p7) {
    const ps = p7.part_specific || {};
    const profiles = ps.profiles || {};
    for (const letter of ['A', 'B', 'C', 'D']) {
      const pr = profiles[letter];
      if (!pr) { fail(hard, 'BV-18', `${p7.brief_id}: missing profile ${letter}`); continue; }
      for (const f of ['role', 'trigger', 'motivation', 'difficulty', 'key_details', 'result_current_position', 'reflection_attitude']) {
        if (!pr[f] || (Array.isArray(pr[f]) && !pr[f].length)) {
          fail(hard, 'BV-18', `${p7.brief_id}: profile ${letter} missing '${f}'`);
        }
      }
    }
    for (const f of ['shared_frame', 'comparison_dimensions', 'controlled_overlap', 'exclusive_details', 'voice_differentiation', 'potential_answer_distribution']) {
      if (!ps[f] || (Array.isArray(ps[f]) && !ps[f].length)) {
        fail(hard, 'BV-18', `${p7.brief_id}: missing Part 7 extension field '${f}'`);
      }
    }
  }

  // Subtopic uniqueness within one exam (stricter than DR-02 requires)
  const sts = briefs.flatMap((b) => [b.subtopic_1_id, b.subtopic_2_id]);
  const stDupes = sts.filter((v, i) => sts.indexOf(v) !== i);
  if (stDupes.length) {
    fail(soft, 'DR-02', `${examId}: subtopic repeated inside the exam → ${[...new Set(stDupes)].join(', ')}`);
  }
}

// DR-20 HARD — nothing may be marked approved yet
for (const b of proposal.briefs) {
  if (b.editorial_status === 'Approved' || b.lifecycle_state === 'Active') {
    fail(hard, 'DR-20', `${b.brief_id}: marked approved/active before human review`);
  }
}

// DR-22 HARD — no Part 4 brief
if (proposal.briefs.some((b) => b.part === 'Part 4')) {
  fail(hard, 'DR-22', 'A Content Brief exists for Part 4; Part 4 must be blueprint-only.');
}

// ---- History checks against E01/E02 ----------------------------------------

const histTb = new Set(historyBriefs.map((b) => b.topic_id));
const histStNames = new Set(historyBriefs.flatMap((b) => [b.subtopic_1, b.subtopic_2]));
const histScByPart = {};
for (const b of historyBriefs) (histScByPart[b.part] ||= []).push(b.style_card_id);

for (const b of proposal.briefs) {
  if (histTb.has(b.topic_id)) fail(hard, 'DR-04', `${b.brief_id}: TB ${b.topic_id} already used in E01/E02`);
  for (const st of [b.subtopic_1, b.subtopic_2]) {
    if (histStNames.has(st)) {
      fail(soft, 'DR-02', `${b.brief_id}: subtopic '${st}' reused from E01/E02 (documented)`);
    }
  }
  if (b.style_card_id !== 'SC-06' && (histScByPart[b.part] || []).includes(b.style_card_id)) {
    fail(soft, 'DR-12', `${b.brief_id}: ${b.style_card_id} already used at ${b.part} in E01/E02`);
  }
}

// DR-12 — no Style Card repeated on the same Part across E03/E04 either
const scByPartProposed = {};
for (const b of proposal.briefs) (scByPartProposed[b.part] ||= []).push(b.style_card_id);
for (const [part, list] of Object.entries(scByPartProposed)) {
  if (part !== 'Part 7' && new Set(list).size !== list.length) {
    fail(soft, 'DR-12', `${part}: same Style Card used in both E03 and E04 → ${list.join(', ')}`);
  }
}

// DR-11 — Style Card balance across compatible Parts
const scCounts = {};
for (const b of [...historyBriefs, ...proposal.briefs]) {
  if (b.style_card_id === 'SC-06') continue;
  scCounts[b.style_card_id] = (scCounts[b.style_card_id] || 0) + 1;
}

// DR-07 — Main Topic concentration across all four exams
const mtCounts = {};
for (const b of [...historyBriefs, ...proposal.briefs]) {
  mtCounts[b.main_topic_id] = (mtCounts[b.main_topic_id] || 0) + 1;
}
const totalBriefs = historyBriefs.length + proposal.briefs.length;
for (const [mt, n] of Object.entries(mtCounts)) {
  const pct = (n / totalBriefs) * 100;
  if (pct > 20) fail(soft, 'DR-07', `${mt}: ${n}/${totalBriefs} briefs (${pct.toFixed(1)}%) exceeds the 15–20% guidance`);
}

// ---- Part 4 blueprint checks -----------------------------------------------

const histFamilies = new Set(historyBps.flatMap((b) => b.slots.map((s) => s.family_id)));
const histKeywords = new Set(historyBps.flatMap((b) => b.slots.map((s) => s.keyword_constraint.keyword)));
const histCollision = new Set(historyBps.flatMap((b) => b.slots.map((s) => s.collision_key)));
const histFamilyByExam = Object.fromEntries(historyBps.map((b) => [b.exam_id, new Set(b.slots.map((s) => s.family_id))]));
const e02Families = histFamilyByExam['PILOT-EXAM-02'] || new Set();

const allKeywordsProposed = [];
const examOrder = ['RUOE-PILOT-E03', 'RUOE-PILOT-E04'];

for (const bp of proposedBps) {
  const qs = bp.slots.map((s) => s.question_number).sort((a, b) => a - b);
  if (JSON.stringify(qs) !== JSON.stringify([25, 26, 27, 28, 29, 30])) {
    fail(hard, 'P4-DR-01', `${bp.blueprint_id}: scored slots are ${qs.join(',')}`);
  }
  const fams = bp.slots.map((s) => s.family_id);
  if (new Set(fams).size !== 6) fail(hard, 'P4-DR-02', `${bp.blueprint_id}: repeated primary family → ${fams.join(', ')}`);

  const kws = bp.slots.map((s) => s.keyword_constraint.keyword);
  if (new Set(kws).size !== 6) fail(hard, 'P4-DR-03', `${bp.blueprint_id}: repeated keyword → ${kws.join(', ')}`);
  allKeywordsProposed.push(...kws);

  const cks = bp.slots.map((s) => s.collision_key);
  if (new Set(cks).size !== 6) fail(hard, 'P4-DR-04', `${bp.blueprint_id}: duplicate collision_key → ${cks.join(', ')}`);

  for (const s of bp.slots) {
    for (const f of ['target_structure', 'semantic_equivalence_goal', 'answer_shape', 'marking_point_plan', 'difficulty_band', 'collision_key']) {
      if (!s[f]) fail(hard, 'P4-BV-schema', `${s.slot_id}: missing '${f}'`);
    }
    if (!Array.isArray(s.avoid) || !s.avoid.length) fail(hard, 'P4-BV-10', `${s.slot_id}: no avoid notes`);
    if (!/MP1:/.test(s.marking_point_plan) || !/MP2:/.test(s.marking_point_plan)) {
      fail(hard, 'P4-DR-10', `${s.slot_id}: marking_point_plan does not define MP1 and MP2`);
    }
    if (histKeywords.has(s.keyword_constraint.keyword)) {
      fail(hard, 'P4-DR-06', `${s.slot_id}: keyword ${s.keyword_constraint.keyword} already used in E01/E02`);
    }
    if (histCollision.has(s.collision_key)) {
      fail(hard, 'P4-DR-05', `${s.slot_id}: collision_key ${s.collision_key} already used in E01/E02`);
    }
  }

  const bands = bp.slots.map((s) => s.difficulty_band);
  const mix = {
    'B2-Core': bands.filter((b) => b === 'B2-Core').length,
    'B2-Standard': bands.filter((b) => b === 'B2-Standard').length,
    'B2-Strong': bands.filter((b) => b === 'B2-Strong').length,
  };
  if (mix['B2-Core'] !== 1 || mix['B2-Standard'] !== 4 || mix['B2-Strong'] !== 1) {
    fail(soft, 'P4-BV-11', `${bp.blueprint_id}: difficulty mix ${JSON.stringify(mix)} differs from the 1/4/1 pilot default`);
  }

  if (bp.status && /^Approved/i.test(bp.status)) {
    fail(hard, 'DR-20', `${bp.blueprint_id}: marked approved before human review`);
  }
}

// Global keyword uniqueness across the batch
if (new Set(allKeywordsProposed).size !== allKeywordsProposed.length) {
  fail(hard, 'P4-DR-06', `Keyword repeated across E03/E04 → ${allKeywordsProposed.join(', ')}`);
}

// P4-DR-05 SOFT — no family repeated in neighbouring exams
const e03Fams = new Set(proposedBps.find((b) => b.exam_id === examOrder[0]).slots.map((s) => s.family_id));
const e04Fams = new Set(proposedBps.find((b) => b.exam_id === examOrder[1]).slots.map((s) => s.family_id));
for (const f of e03Fams) {
  if (e02Families.has(f)) fail(soft, 'P4-DR-05', `E03 repeats family ${f} from the immediately preceding exam E02`);
  if (e04Fams.has(f)) fail(soft, 'P4-DR-05', `Family ${f} appears in both E03 and E04`);
}

// P4-DR-08 — coverage of the 14-family bank
const allFamilies = Array.from({ length: 14 }, (_, i) => `TF-${String(i + 1).padStart(2, '0')}`);
const coverage = {};
for (const f of allFamilies) coverage[f] = 0;
for (const bp of [...historyBps, ...proposedBps]) for (const s of bp.slots) coverage[s.family_id] += 1;
const untested = allFamilies.filter((f) => coverage[f] === 0);
if (untested.length) fail(soft, 'P4-DR-08', `Families still untested after E04: ${untested.join(', ')}`);
info.push({ rule: 'P4-DR-08', message: `Family coverage after E01–E04: ${JSON.stringify(coverage)}` });

const previouslyUntested = allFamilies.filter((f) => !histFamilies.has(f));
const nowCovered = previouslyUntested.filter((f) => e03Fams.has(f) || e04Fams.has(f));
info.push({
  rule: 'BP-SYS-§10',
  message: `Untested after E01/E02: ${previouslyUntested.join(', ')}. Covered by this batch: ${nowCovered.join(', ') || 'none'}.`,
});

// ---- Report -----------------------------------------------------------------

info.push({ rule: 'DR-07', message: `Main Topic counts across E01–E04: ${JSON.stringify(mtCounts)}` });
info.push({ rule: 'DR-11', message: `Style Card counts (compatible Parts) across E01–E04: ${JSON.stringify(scCounts)}` });

const report = {
  generated_at: new Date().toISOString(),
  scope: 'RUOE-PILOT-02 proposal (RUOE-PILOT-E03, RUOE-PILOT-E04)',
  note: 'Read-only validation. No approved input, historical output, Supabase table or production artefact was written.',
  hard_failures: hard,
  soft_warnings: soft,
  info,
  summary: {
    hard_failure_count: hard.length,
    soft_warning_count: soft.length,
    verdict: hard.length === 0 ? 'PASS (HARD) — awaiting human approval' : 'FAIL',
  },
};

fs.writeFileSync(
  path.join(PROPOSED, 'distribution_validation_e03_e04.json'),
  `${JSON.stringify(report, null, 2)}\n`,
  'utf8',
);

console.log(JSON.stringify(report, null, 2));
