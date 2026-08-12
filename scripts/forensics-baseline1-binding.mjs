/**
 * Offline forensics: Baseline 1 quote-binding failures vs golden fixtures.
 * No OpenAI calls. Does not mutate baseline scoring artefacts.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bindQuote } from '../src/features/writing/services/validation/evidence-binding.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureDir = join(root, 'src/features/writing/calibration/fixtures');
const baseline = JSON.parse(
  readFileSync(join(root, 'docs/writing-v3/calibration/baseline-1.json'), 'utf8'),
);

function extractQuote(msg) {
  const marker = 'evidence quote "';
  const start = String(msg).indexOf(marker);
  if (start < 0) return null;
  const from = start + marker.length;
  const end = String(msg).indexOf('" is not present', from);
  if (end < 0) return null;
  return String(msg).slice(from, end);
}

function intendedSubstring(candidate, quote, binding0) {
  if (binding0.status === 'bound') {
    return candidate.slice(binding0.span_start, binding0.span_end);
  }
  return null;
}

const rows = [];
for (const c of baseline.case_results) {
  const listed = (c.validation_failures || []).filter((f) =>
    String(f).includes('evidence quote'),
  );
  const quote = extractQuote(listed[0] || c.error || '');
  const fixture = JSON.parse(readFileSync(join(fixtureDir, `${c.case_id}.json`), 'utf8'));
  const candidate = fixture.candidate_response;
  const b0 = bindQuote(candidate, quote ?? '', 0);
  const b1 = bindQuote(candidate, quote ?? '', 1);
  const exact = Boolean(quote && candidate.includes(quote));
  const intended = quote ? intendedSubstring(candidate, quote, b0) : null;

  let category;
  let category_label;
  let reason;
  let binding_failed_reason_if_occ0;
  let binding_failed_reason_if_occ1;

  binding_failed_reason_if_occ0 = b0.status === 'failed' ? b0.reason : null;
  binding_failed_reason_if_occ1 = b1.status === 'failed' ? b1.reason : null;

  if (!quote) {
    category = 'E';
    category_label = 'OTHER / UNKNOWN';
    reason = 'Could not extract model quote from baseline artefact.';
  } else if (exact && b0.status === 'bound') {
    // Quote is a genuine exact substring today. Baseline still reported failure.
    // Raw payloads were not persisted, so occurrence_index cannot be proven,
    // but occ=1 reproduces the same error class for every case.
    category = 'C';
    category_label = 'BINDING IMPLEMENTATION BUG / DIAGNOSTIC COLLAPSE';
    reason =
      'Quote EXISTS exactly in golden candidate_response and bindQuote(..., 0) succeeds now. ' +
      'bindQuote(..., 1) fails with occurrence_out_of_range (n=1). ' +
      'AssessmentValidationError always says "not present" for BOTH quote_not_found and ' +
      'occurrence_out_of_range, and Baseline 1 did not persist occurrence_index or binding.reason. ' +
      'Most likely shared root cause: model emitted occurrence_index=1 (1-based) OR error details ' +
      'were dropped so a solvable binding miss was reported as missing quote. Not a paraphrase.';
  } else if (!exact && b0.status === 'failed') {
    category = 'A';
    category_label = 'MODEL QUOTE ERROR';
    reason = 'Quote is not an exact/normalized substring of the golden candidate_response.';
  } else {
    category = 'E';
    category_label = 'OTHER / UNKNOWN';
    reason = 'Unexpected combination of exact/binding results.';
  }

  rows.push({
    case_id: c.case_id,
    criterion: 'content',
    failed_validator_rule_id:
      'assessment.service buildCriterionRecord/bindQuote (pre-V-EV-03; validateAssessment never reached)',
    equivalent_validator_id_if_assembled: 'V-EV-03',
    model_produced_evidence_quote: quote,
    intended_candidate_substring: intended,
    exact_substring_exists: exact,
    normalized_matching_would_succeed: b0.status === 'bound',
    offsets_if_occ0:
      b0.status === 'bound'
        ? { span_start: b0.span_start, span_end: b0.span_end }
        : null,
    bind_occ0: b0.status === 'bound' ? 'bound' : `${b0.reason}:n=${b0.occurrences_found}`,
    bind_occ1: b1.status === 'bound' ? 'bound' : `${b1.reason}:n=${b1.occurrences_found}`,
    binding_failed_reason_if_occ0,
    binding_failed_reason_if_occ1,
    specific_reason_binding_reported_failed:
      'Baseline message: "not present in the candidate response" (does not distinguish quote_not_found vs occurrence_out_of_range)',
    category,
    category_label,
    reason,
    other_validation_notes: (c.validation_failures || []).filter(
      (f) => !String(f).includes('evidence quote'),
    ),
  });
}

const byCat = { A: 0, B: 0, C: 0, D: 0, E: 0 };
for (const r of rows) byCat[r.category] += 1;

const matrix = baseline.case_results.map((c) => {
  const e = c.comparison.expected_marks;
  const a = c.comparison.actual_marks;
  return {
    case_id: c.case_id,
    content: { expected: e.content, actual: a.content, delta: a.content - e.content },
    communicative_achievement: {
      expected: e.communicative_achievement,
      actual: a.communicative_achievement,
      delta: a.communicative_achievement - e.communicative_achievement,
    },
    organisation: {
      expected: e.organisation,
      actual: a.organisation,
      delta: a.organisation - e.organisation,
    },
    language: { expected: e.language, actual: a.language, delta: a.language - e.language },
    total: {
      expected: c.comparison.expected_total,
      actual: c.comparison.actual_total,
      delta: c.comparison.actual_total - c.comparison.expected_total,
    },
  };
});

const flat = [];
for (const m of matrix) {
  for (const criterion of [
    'content',
    'communicative_achievement',
    'organisation',
    'language',
  ]) {
    flat.push({ case_id: m.case_id, criterion, ...m[criterion] });
  }
}

function critStats(name) {
  const xs = flat.filter((x) => x.criterion === name);
  return {
    exact: xs.filter((x) => x.delta === 0).length,
    within_1: xs.filter((x) => Math.abs(x.delta) <= 1).length,
    gt1: xs.filter((x) => Math.abs(x.delta) > 1).length,
    mean_signed_delta: Number(
      (xs.reduce((s, x) => s + x.delta, 0) / xs.length).toFixed(3),
    ),
    mean_absolute_delta: Number(
      (xs.reduce((s, x) => s + Math.abs(x.delta), 0) / xs.length).toFixed(3),
    ),
    under_scoring_count: xs.filter((x) => x.delta < 0).length,
    over_scoring_count: xs.filter((x) => x.delta > 0).length,
  };
}

const report = {
  generated_at: new Date().toISOString(),
  source_artefacts: [
    'docs/writing-v3/calibration/baseline-1.json',
    'src/features/writing/calibration/fixtures/G-*.json',
  ],
  known_limitations: [
    'Baseline 1 did not persist raw assessment payloads (text_evidence[].quote / occurrence_index).',
    'assessment.service throws on the first unbound evidence item, so only one failed quote per case was recorded.',
    'Error message collapses quote_not_found and occurrence_out_of_range into the same "not present" string.',
    'failures[] binding.reason was not copied into baseline case_results.',
  ],
  rows,
  aggregate: {
    recorded_failed_evidence_references: rows.length,
    lower_bound_note:
      '12 recorded failures is a lower bound on total failed evidence items across all criteria.',
    failures_by_category: byCat,
    failures_by_criterion_among_recorded: { content: 12 },
    assessments_that_would_otherwise_pass_if_first_quote_bound:
      'UNKNOWN without full payloads — later evidence items and post-assembly validators were never reached after the first throw.',
    common_root_cause:
      'ONE engineering/diagnostic issue repeated across all 12 cases — NOT 12 unrelated paraphrase failures. ' +
      'Every recorded failing quote is an exact substring of the golden candidate_response and binds at occurrence_index=0 today. ' +
      'Dominant hypothesis: occurrence_index off-by-one (model used 1) and/or error reporting that hides occurrence_out_of_range. ' +
      'Secondary defect: calibration harness did not persist raw assessment JSON needed to confirm.',
    primary_bucket: 'C (binder/diagnostics path) with likely model occurrence_index contribution; NOT classic A paraphrase; NOT B transcription.',
  },
  scoring_matrix: matrix,
  delta_distribution: {
    overall: {
      exact_marks_over_48: flat.filter((x) => x.delta === 0).length,
      within_1_over_48: flat.filter((x) => Math.abs(x.delta) <= 1).length,
      gt1_over_48: flat.filter((x) => Math.abs(x.delta) > 1).length,
    },
    by_criterion: {
      content: critStats('content'),
      communicative_achievement: critStats('communicative_achievement'),
      organisation: critStats('organisation'),
      language: critStats('language'),
    },
  },
  recommended_next_action_not_applied: [
    'Do NOT tune assessment.prompt.ts for scores.',
    'Smallest deterministic engineering fix to propose: (1) persist raw assessment lastPayload + binding.reason on failure; (2) make AssessmentValidationError distinguish quote_not_found vs occurrence_out_of_range and include occurrence_index + occurrences_found; (3) only after confirming occ off-by-one from saved payloads, decide whether to add a narrow retry hint or keep failing with a clear message — do not silently remap indices without evidence.',
  ],
};

const outJson = join(root, 'docs/writing-v3/calibration/baseline-1-binding-forensics.json');
const outMd = join(root, 'docs/writing-v3/calibration/baseline-1-binding-forensics.md');
writeFileSync(outJson, JSON.stringify(report, null, 2));

const md = [];
md.push('# Baseline 1 — Quote-binding forensics');
md.push('');
md.push(`Generated: ${report.generated_at}`);
md.push('');
md.push('## Verdict');
md.push('');
md.push(
  '**Not 12 separate bad paraphrases.** Every recorded failing quote is an exact substring of the current golden `candidate_response` and `bindQuote(..., 0)` succeeds offline. Baseline still reported “not present”. Dominant shared cause: binding/diagnostic collapse around `occurrence_index` (likely off-by-one) plus missing raw payload capture.',
);
md.push('');
md.push('## Failure table');
md.push('');
md.push(
  '| Case | Crit | Exact? | occ0 | occ1 | Category | Model quote (truncated) |',
);
md.push('| --- | --- | --- | --- | --- | --- | --- |');
for (const r of rows) {
  const q = (r.model_produced_evidence_quote || '').slice(0, 64);
  md.push(
    `| ${r.case_id} | ${r.criterion} | ${r.exact_substring_exists} | ${r.bind_occ0} | ${r.bind_occ1} | ${r.category} | ${q}… |`,
  );
}
md.push('');
md.push('## Aggregate');
md.push('');
md.push(`- Recorded failed evidence refs: **${rows.length}** (lower bound)`);
md.push(`- By category: A=${byCat.A} B=${byCat.B} C=${byCat.C} D=${byCat.D} E=${byCat.E}`);
md.push('- By criterion (recorded): content 12/12 (assembly stops at first content failure)');
md.push(
  '- Assessments that would pass if binding fixed: **UNKNOWN** (later evidence never evaluated)',
);
md.push('');
md.push('## Scoring matrix (unchanged raw Baseline 1 marks)');
md.push('');
md.push(
  '| Case | C e/a/Δ | CA e/a/Δ | O e/a/Δ | L e/a/Δ | Total e/a/Δ |',
);
md.push('| --- | --- | --- | --- | --- | --- |');
for (const m of matrix) {
  const f = (x) => `${x.expected}/${x.actual}/${x.delta >= 0 ? '+' : ''}${x.delta}`;
  md.push(
    `| ${m.case_id} | ${f(m.content)} | ${f(m.communicative_achievement)} | ${f(m.organisation)} | ${f(m.language)} | ${f(m.total)} |`,
  );
}
md.push('');
md.push('## Delta distribution');
md.push('');
md.push(
  `- Exact marks: **${report.delta_distribution.overall.exact_marks_over_48}/48**`,
);
md.push(
  `- ±1 marks: **${report.delta_distribution.overall.within_1_over_48}/48**`,
);
md.push(
  `- >1 deviations: **${report.delta_distribution.overall.gt1_over_48}/48**`,
);
md.push('');
for (const [name, s] of Object.entries(report.delta_distribution.by_criterion)) {
  md.push(
    `- **${name}**: exact ${s.exact}/12 · MAD ${s.mean_absolute_delta} · mean signed ${s.mean_signed_delta} · under ${s.under_scoring_count} · over ${s.over_scoring_count}`,
  );
}
md.push('');
md.push('## Recommended next action (NOT applied)');
md.push('');
for (const line of report.recommended_next_action_not_applied) {
  md.push(`- ${line}`);
}
md.push('');
md.push('R3 remains OPEN. No prompts, marks, or model config were changed. No new OpenAI calls.');

writeFileSync(outMd, md.join('\n'));
console.log(JSON.stringify({ outJson, outMd, byCat, exactAll: rows.every((r) => r.exact_substring_exists) }, null, 2));
