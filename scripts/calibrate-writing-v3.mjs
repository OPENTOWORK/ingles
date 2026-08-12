#!/usr/bin/env node
/**
 * Phase 9 — Cambridge golden calibration runner.
 *
 * Runs Task Analysis → Observation → Assessment → deterministic validation
 * against official golden cases. Local / calibration only — no production routes,
 * no persistence writes.
 *
 * Usage:
 *   npm run writing:calibrate
 *   node ... scripts/calibrate-writing-v3.mjs --cases=G-01,G-09 --out-id=binding-diagnostic-1
 *
 * Baseline 1 artefacts (baseline-1.json / .md) must not be overwritten by
 * diagnostic runs — use a distinct --out-id.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';
import { loadEnvLocal } from './load-env-local.mjs';
import {
  GOLDEN_CASES,
  isGoldenCaseRunnable,
  listMissingGoldenSources,
  verifyAllGoldenSources,
} from '../src/features/writing/calibration/golden-cases.ts';
import {
  aggregateCriterionAccuracy,
  aggregateMeanAbsoluteDeviation,
  sumGoldenMarks,
} from '../src/features/writing/calibration/compare.ts';
import { createCalibrationOpenAiClient } from '../src/features/writing/calibration/openai-client.ts';
import {
  buildBaselineModelMetadata,
  runCalibrationCase,
} from '../src/features/writing/calibration/run-pipeline.ts';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'docs', 'writing-v3', 'calibration');

function parseArgs(argv) {
  const args = { cases: null, outId: 'baseline-1' };
  for (const raw of argv) {
    if (raw.startsWith('--cases=')) {
      args.cases = raw
        .slice('--cases='.length)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (raw.startsWith('--out-id=')) {
      args.outId = raw.slice('--out-id='.length).trim() || 'baseline-1';
    }
  }
  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function buildAggregate(caseResults, totalCases) {
  const comparisons = caseResults.map((r) => r.comparison).filter(Boolean);
  const withActual = comparisons.filter((c) => c.actual_marks);

  const exact_profiles_matched = withActual.filter((c) => c.exact_profile_match).length;
  const exact_criterion_marks_matched = withActual.reduce(
    (sum, c) => sum + c.exact_criteria_matched,
    0,
  );
  const total_criterion_marks = withActual.length * 4;

  const same_total_wrong_profile_cases = withActual
    .filter((c) => c.same_total_wrong_profile)
    .map((c) => c.case_id);

  return {
    exact_profiles_matched,
    total_cases: totalCases,
    exact_criterion_marks_matched,
    total_criterion_marks,
    content_accuracy: aggregateCriterionAccuracy(withActual).content,
    communicative_achievement_accuracy:
      aggregateCriterionAccuracy(withActual).communicative_achievement,
    organisation_accuracy: aggregateCriterionAccuracy(withActual).organisation,
    language_accuracy: aggregateCriterionAccuracy(withActual).language,
    mean_absolute_mark_deviation: aggregateMeanAbsoluteDeviation(withActual),
    same_total_wrong_profile_cases,
    validation_failures: caseResults.filter((r) => r.validation_status === 'failed').length,
    retry_failures: 0,
  };
}

function formatBindingDiagnostics(report) {
  const lines = ['', '## Quote-binding diagnostics', ''];
  for (const row of report.case_results) {
    const attempts = row.binding_diagnostics || [];
    if (!attempts.length) {
      lines.push(
        `### ${row.case_id}`,
        '',
        '_No binding diagnostics captured (assessment assembled or no payload)._',
        '',
      );
      continue;
    }
    lines.push(`### ${row.case_id}`, '');
    for (const attempt of attempts) {
      lines.push(
        `Attempt ${attempt.attempt}: first_failure=${attempt.first_failure_reason ?? 'none'} (${attempt.criterion_of_first_failure ?? '—'})`,
      );
      lines.push('');
      lines.push(
        '| Criterion | occ_idx | occurrences_found | status | reason | quote (trunc) |',
      );
      lines.push('| --- | ---: | ---: | --- | --- | --- |');
      for (const ev of attempt.evidence_bindings || []) {
        const q = String(ev.quote || '')
          .slice(0, 72)
          .replace(/\|/g, '\\|');
        lines.push(
          `| ${ev.criterion} | ${ev.requested_occurrence_index} | ${ev.occurrences_found} | ${ev.binding_status} | ${ev.binding_reason ?? '—'} | ${q} |`,
        );
      }
      lines.push('');
    }
  }
  return lines;
}

function formatMarkdown(report) {
  const lines = [
    `# Writing v3 Calibration — ${report.baseline_id}`,
    '',
    `Generated: ${report.generated_at}`,
    '',
    '## Baseline model / config',
    '',
    `- Engine: ${report.engine_version}`,
    `- Model: ${report.model_config.snapshot_id}`,
    `- Temperature: ${report.model_config.temperature}`,
    `- Response format: ${report.model_config.response_format}`,
    '',
    `## Status: ${report.status}`,
    '',
  ];

  if (report.diagnostic_only) {
    lines.push(
      '## Diagnostic run',
      '',
      `- Cases: ${(report.selected_cases || []).join(', ')}`,
      '- This is **not** Baseline 2 and must not overwrite Baseline 1.',
      '',
    );
  }

  if (report.missing_source_cases.length) {
    lines.push('## GOLDEN SOURCE MISSING', '');
    for (const id of report.missing_source_cases) {
      lines.push(`- ${id}: verbatim task_prompt and candidate_response not in repository`);
    }
    lines.push('');
  }

  lines.push('## Expected vs actual matrix', '');
  lines.push(
    '| Case | Exp C | Act C | Exp CA | Act CA | Exp O | Act O | Exp L | Act L | Exp /20 | Act /20 | Profile | Validation |',
  );
  lines.push(
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  );

  for (const row of report.case_results) {
    const golden = GOLDEN_CASES.find((c) => c.case_id === row.case_id);
    const exp = row.comparison?.expected_marks ?? golden?.expected_marks;
    const act = row.comparison?.actual_marks;
    const profile = row.comparison?.exact_profile_match ? 'yes' : 'no';
    const fmt = (n) => (n == null ? '—' : String(n));
    const expTotal = exp ? sumGoldenMarks(exp) : null;
    lines.push(
      `| ${row.case_id} | ${fmt(exp?.content)} | ${fmt(act?.content)} | ${fmt(exp?.communicative_achievement)} | ${fmt(act?.communicative_achievement)} | ${fmt(exp?.organisation)} | ${fmt(act?.organisation)} | ${fmt(exp?.language)} | ${fmt(act?.language)} | ${fmt(expTotal)} | ${fmt(row.comparison?.actual_total)} | ${row.runnable ? profile : 'BLOCKED'} | ${row.validation_status} |`,
    );
  }

  lines.push('', '## Aggregate', '');
  lines.push(
    `- Exact profiles matched: ${report.aggregate.exact_profiles_matched} / ${report.aggregate.total_cases}`,
  );
  lines.push(
    `- Exact criterion marks matched: ${report.aggregate.exact_criterion_marks_matched} / ${report.aggregate.total_criterion_marks}`,
  );
  lines.push(`- Content accuracy: ${(report.aggregate.content_accuracy * 100).toFixed(1)}%`);
  lines.push(
    `- Communicative Achievement accuracy: ${(report.aggregate.communicative_achievement_accuracy * 100).toFixed(1)}%`,
  );
  lines.push(
    `- Organisation accuracy: ${(report.aggregate.organisation_accuracy * 100).toFixed(1)}%`,
  );
  lines.push(`- Language accuracy: ${(report.aggregate.language_accuracy * 100).toFixed(1)}%`);
  lines.push(
    `- Mean abs deviation: C ${report.aggregate.mean_absolute_mark_deviation.content.toFixed(2)} · CA ${report.aggregate.mean_absolute_mark_deviation.communicative_achievement.toFixed(2)} · O ${report.aggregate.mean_absolute_mark_deviation.organisation.toFixed(2)} · L ${report.aggregate.mean_absolute_mark_deviation.language.toFixed(2)}`,
  );
  lines.push(
    `- Same-total wrong-profile cases: ${report.aggregate.same_total_wrong_profile_cases.join(', ') || 'none'}`,
  );
  lines.push(`- Validation failures: ${report.aggregate.validation_failures}`);

  lines.push(...formatBindingDiagnostics(report));

  const mismatches = report.case_results.flatMap((row) => row.diagnostics || []);
  if (mismatches.length) {
    lines.push('', '## Mismatch forensics', '');
    for (const d of mismatches) {
      lines.push(
        `- **${d.case_id} / ${d.criterion}**: expected ${d.expected_mark}, actual ${d.actual_mark} · origin=${d.mismatch_origin}`,
      );
      lines.push(`  - why_not_higher: ${d.why_not_higher}`);
      lines.push(`  - why_not_lower: ${d.why_not_lower}`);
      lines.push(`  - rules: ${(d.source_rule_ids || []).join(', ') || '—'}`);
    }
  }

  const profiles = report.aggregate.exact_profiles_matched;
  lines.push('', '## R3', '');
  if (report.diagnostic_only) {
    lines.push(
      '**OPEN** — Quote-binding diagnostic only. Baseline 1 unchanged. No scoring tuning.',
      '',
    );
  } else if (profiles === 12) {
    lines.push(
      '**R3 CANDIDATE FOR HUMAN REVIEW** — Baseline 1 exact profile match 12/12; do not auto-close.',
      '',
    );
  } else {
    lines.push(
      `**OPEN** — Baseline 1 exact profiles ${profiles}/12. No prompt tuning applied after this run.`,
      '',
    );
  }

  return lines.join('\n');
}

async function main() {
  const cli = parseArgs(process.argv.slice(2));
  const outId = cli.outId;
  const selectedIds = cli.cases;

  if (selectedIds && outId === 'baseline-1') {
    console.error(
      'Refusing to write a partial case filter over baseline-1. Use --out-id=<diagnostic-id>.',
    );
    process.exit(2);
  }

  ensureDir(OUT_DIR);
  const meta = buildBaselineModelMetadata();
  const verification = verifyAllGoldenSources();
  if (!verification.ok) {
    console.error('SOURCE VERIFICATION FAILED — refusing partial baseline.');
    console.error(JSON.stringify(verification, null, 2));
    process.exit(2);
  }

  const missing = listMissingGoldenSources();
  let casesToRun = GOLDEN_CASES.filter(isGoldenCaseRunnable);
  if (selectedIds) {
    const unknown = selectedIds.filter((id) => !GOLDEN_CASES.some((c) => c.case_id === id));
    if (unknown.length) {
      console.error(`Unknown case ids: ${unknown.join(', ')}`);
      process.exit(2);
    }
    casesToRun = GOLDEN_CASES.filter((c) => selectedIds.includes(c.case_id));
  }

  const diagnosticOnly = Boolean(selectedIds);
  const report = {
    baseline_id: outId,
    generated_at: new Date().toISOString(),
    ...meta,
    diagnostic_only: diagnosticOnly,
    selected_cases: selectedIds,
    status: diagnosticOnly
      ? 'partial'
      : casesToRun.length === 0
        ? 'blocked_missing_sources'
        : casesToRun.length < GOLDEN_CASES.length
          ? 'partial'
          : 'complete',
    missing_source_cases: missing.map((c) => c.case_id),
    runnable_cases: casesToRun.length,
    case_results: [],
    aggregate: null,
  };

  if (casesToRun.length === 0) {
    console.error('No runnable cases selected.');
    process.exit(2);
  }

  const env = loadEnvLocal();
  if (!env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY missing — cannot run calibration calls.');
    process.exit(1);
  }
  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  for (const goldenCase of casesToRun) {
    const usageLog = [];
    const factory = {
      usageLog,
      lastAssessmentClient: null,
      forStage(stage, attempt = 1) {
        const client = createCalibrationOpenAiClient(openai, {
          stage,
          case_id: goldenCase.case_id,
          attempt,
          usageLog,
        });
        if (stage === 'assessment') factory.lastAssessmentClient = client;
        return client;
      },
    };
    console.error(`Running ${goldenCase.case_id}…`);
    try {
      const result = await runCalibrationCase(goldenCase, factory, 1);
      report.case_results.push(result);
      const firstBind = result.binding_diagnostics?.[0];
      console.error(
        `  ${goldenCase.case_id}: profile=${result.comparison?.exact_profile_match ? 'MATCH' : 'MISS'} validation=${result.validation_status}` +
          (firstBind ? ` bind_first=${firstBind.first_failure_reason ?? 'ok'}` : ''),
      );
    } catch (error) {
      console.error(`  ${goldenCase.case_id}: FATAL`, error);
      report.case_results.push({
        case_id: goldenCase.case_id,
        label: goldenCase.label,
        runnable: true,
        source_verification: goldenCase.source_verification,
        comparison: null,
        validation_status: 'failed',
        validation_failures: [error instanceof Error ? error.message : String(error)],
        assessment_confidence: null,
        retries: 0,
        latency_ms: 0,
        usage: usageLog,
        diagnostics: [],
        binding_diagnostics: [],
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  report.aggregate = buildAggregate(report.case_results, casesToRun.length);

  const jsonPath = path.join(OUT_DIR, `${outId}.json`);
  const mdPath = path.join(OUT_DIR, `${outId}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(mdPath, formatMarkdown(report), 'utf8');

  console.log(`Calibration report written to ${jsonPath}`);
  console.log(`Markdown report written to ${mdPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
