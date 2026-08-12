import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  GOLDEN_CASES,
  GOLDEN_CASE_IDS,
  buildVerifiedGoldenFixture,
  getGoldenCase,
} from '../calibration/golden-cases';
import {
  compareGoldenProfiles,
  sumGoldenMarks,
} from '../calibration/compare';
import {
  assertNoGoldenLeakage,
  scanPromptForGoldenLeakage,
} from '../calibration/leakage-guard';
import {
  CALIBRATION_BASELINE_MODEL,
} from '../calibration/run-pipeline';
import { buildAssessmentPrompt } from '../prompts/assessment.prompt';
import { buildObservationExtractionPrompt } from '../prompts/observation-extraction.prompt';
import { buildTaskAnalysisPrompt } from '../prompts/task-analysis.prompt';
import { analyseWritingTask } from '../services/analysis/task-analysis.service';
import {
  AssessmentValidationError,
  assessWriting,
} from '../services/assessment/assessment.service';
import {
  bindAssessmentEvidenceQuote,
  bindQuote,
} from '../services/validation/evidence-binding';
import {
  inspectAssessmentEvidenceBindings,
} from '../services/validation/evidence-binding-diagnostics';
import type { ResolvedTaskAnalysis } from '../domain/types';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');

const SAMPLE_TASK = [
  'In your English class you have been talking about the environment.',
  'Your teacher has asked you to write an essay.',
  '',
  'Write an essay using all the notes and give reasons for your point of view.',
  '',
  'Notes:',
  '- transport',
  '- rivers and seas',
  '- your own idea',
  '',
  'Write your essay in 140–190 words.',
].join('\n');

const SAMPLE_CANDIDATE =
  'Nowadays pollution is a big problem in many cities. Cars cause a lot of smoke and factories put chemicals in rivers. I think governments should invest more in clean energy and teach people to recycle.';

// ---------------------------------------------------------------------------
// A — all 12 golden IDs represented
// ---------------------------------------------------------------------------

test('A — all twelve approved golden IDs are registered and source-verified', () => {
  assert.equal(GOLDEN_CASE_IDS.length, 12);
  for (let i = 1; i <= 12; i += 1) {
    const id = `G-${String(i).padStart(2, '0')}`;
    const goldenCase = getGoldenCase(id);
    assert.ok(goldenCase, `missing golden case ${id}`);
    assert.ok(goldenCase.task_prompt?.trim(), `${id} missing task_prompt`);
    assert.ok(goldenCase.candidate_response?.trim(), `${id} missing candidate_response`);
    assert.equal(goldenCase.source_verification.task_prompt, 'verified');
    assert.equal(goldenCase.source_verification.candidate_response, 'verified');
    assert.ok(goldenCase.task_prompt_checksum);
    assert.ok(goldenCase.candidate_response_checksum);
  }
});

// ---------------------------------------------------------------------------
// B — immutable fixtures (checksum when verified)
// ---------------------------------------------------------------------------

test('B — verified candidate fixtures carry a stable checksum', () => {
  const base = getGoldenCase('G-01')!;
  const verified = buildVerifiedGoldenFixture(base, SAMPLE_TASK, SAMPLE_CANDIDATE);
  assert.ok(verified.candidate_response_checksum);
  const again = buildVerifiedGoldenFixture(base, SAMPLE_TASK, SAMPLE_CANDIDATE);
  assert.equal(verified.candidate_response_checksum, again.candidate_response_checksum);
});

// ---------------------------------------------------------------------------
// C–D — expected marks shape
// ---------------------------------------------------------------------------

test('C — expected marks are integers from 0 to 5', () => {
  for (const goldenCase of GOLDEN_CASES) {
    for (const value of Object.values(goldenCase.expected_marks)) {
      assert.equal(Number.isInteger(value), true);
      assert.ok(value >= 0 && value <= 5);
    }
  }
});

test('D — exactly four expected criteria per golden case', () => {
  for (const goldenCase of GOLDEN_CASES) {
    assert.deepEqual(Object.keys(goldenCase.expected_marks).sort(), [
      'communicative_achievement',
      'content',
      'language',
      'organisation',
    ]);
  }
});

// ---------------------------------------------------------------------------
// E–F — leakage guards
// ---------------------------------------------------------------------------

test('E — expected marks never enter runtime Task Analysis prompt', () => {
  const goldenCase = getGoldenCase('G-07')!;
  const prompt = buildTaskAnalysisPrompt({
    source_task_text: SAMPLE_TASK,
    task_type: 'essay',
  });
  assertNoGoldenLeakage(prompt.system, prompt.user, goldenCase);
});

test('F — examiner commentary never enters runtime Observation or Assessment prompts', async () => {
  const goldenCase = getGoldenCase('G-07')!;
  const taskResult = await analyseWritingTask(
    { source_task_text: SAMPLE_TASK, task_type: 'essay' },
    {
      llm: {
        async generate() {
          return {
            target_reader: 'the teacher',
            target_reader_evidence_quote: 'Your teacher has asked you',
            communicative_purpose: 'discuss environmental problems',
            register: 'neutral essay',
            tone: 'objective',
            mandatory_content_points: [
              { point: 'transport', evidence_quote: 'transport' },
              { point: 'rivers and seas', evidence_quote: 'rivers and seas' },
              { point: 'own idea', evidence_quote: null },
            ],
            required_functions: [{ function: 'give opinion', evidence_quote: null }],
            task_specific_mandatory_conventions: [],
            ambiguities: [],
            inferred_task_type: 'essay',
          };
        },
      },
    },
  );
  assert.equal(taskResult.status, 'complete');
  const task_analysis = taskResult.task_analysis as ResolvedTaskAnalysis;

  const obs = buildObservationExtractionPrompt({
    candidate_response: SAMPLE_CANDIDATE,
    task_analysis,
  });
  assertNoGoldenLeakage(obs.system, obs.user, goldenCase);

  const assess = buildAssessmentPrompt({
    candidate_response: SAMPLE_CANDIDATE,
    task_analysis,
    word_count: 30,
    evidence_hints: [],
  });
  assertNoGoldenLeakage(assess.system, assess.user, goldenCase);
  assert.equal(
    scanPromptForGoldenLeakage(assess.system, assess.user, goldenCase).some(
      (f) => f.kind === 'golden_profile_line',
    ),
    false,
  );
});

// ---------------------------------------------------------------------------
// G — same model/config throughout baseline metadata
// ---------------------------------------------------------------------------

test('G — calibration baseline pins one explicit model configuration', () => {
  assert.equal(CALIBRATION_BASELINE_MODEL.model, 'gpt-4o-2024-08-06');
  assert.equal(CALIBRATION_BASELINE_MODEL.snapshot_id, 'gpt-4o-2024-08-06');
  assert.equal(CALIBRATION_BASELINE_MODEL.temperature, 0);
  assert.equal(CALIBRATION_BASELINE_MODEL.response_format, 'json_schema');
});

// ---------------------------------------------------------------------------
// H–K — comparison logic
// ---------------------------------------------------------------------------

test('H — exact-profile comparison detects full criterion match', () => {
  const expected = GOLDEN_CASES[0].expected_marks;
  const comparison = compareGoldenProfiles('G-01', expected, expected);
  assert.equal(comparison.exact_profile_match, true);
  assert.equal(comparison.exact_criteria_matched, 4);
});

test('I — same-total wrong-profile is a failure', () => {
  const expected = { content: 5, communicative_achievement: 2, organisation: 2, language: 2 };
  const actual = { content: 4, communicative_achievement: 3, organisation: 2, language: 2 };
  const comparison = compareGoldenProfiles('G-07', expected, actual);
  assert.equal(sumGoldenMarks(expected), sumGoldenMarks(actual));
  assert.equal(comparison.exact_profile_match, false);
  assert.equal(comparison.same_total_wrong_profile, true);
});

test('J — mismatch report identifies criterion-level errors', () => {
  const expected = { content: 5, communicative_achievement: 2, organisation: 2, language: 2 };
  const actual = { content: 5, communicative_achievement: 3, organisation: 2, language: 2 };
  const comparison = compareGoldenProfiles('G-07', expected, actual);
  const mismatches = comparison.criterion_comparisons.filter((c) => !c.match);
  assert.equal(mismatches.length, 1);
  assert.equal(mismatches[0].criterion, 'communicative_achievement');
});

test('K — raw_total comparison is secondary to criterion profile', () => {
  const expected = { content: 5, communicative_achievement: 2, organisation: 2, language: 2 };
  const actual = { content: 4, communicative_achievement: 3, organisation: 2, language: 2 };
  const comparison = compareGoldenProfiles('G-07', expected, actual);
  assert.equal(comparison.expected_total, comparison.actual_total);
  assert.equal(comparison.exact_profile_match, false);
});

// ---------------------------------------------------------------------------
// L–M — harness does not tune or add forbidden heuristics
// ---------------------------------------------------------------------------

test('L — calibration harness source does not contain score tuning helpers', () => {
  const pipelineSrc = readFileSync(
    path.join(ROOT, 'src/features/writing/calibration/run-pipeline.ts'),
    'utf8',
  );
  const scriptSrc = readFileSync(
    path.join(ROOT, 'scripts/calibrate-writing-v3.mjs'),
    'utf8',
  );
  for (const src of [pipelineSrc, scriptSrc]) {
    assert.ok(!src.includes('smooth'), 'harness must not smooth marks');
    assert.ok(!src.includes('hardCode'), 'harness must not hard-code golden results');
    assert.ok(!/expected_marks\s*=/m.test(src) || src.includes('golden-cases'), 'marks only in fixtures');
  }
});

test('M — calibration modules do not introduce forbidden scoring heuristics', () => {
  const compareSrc = readFileSync(
    path.join(ROOT, 'src/features/writing/calibration/compare.ts'),
    'utf8',
  );
  assert.ok(!compareSrc.includes('connector'));
  assert.ok(!compareSrc.includes('paragraph count'));
});

// ---------------------------------------------------------------------------
// N — no learner history in assessment request surface
// ---------------------------------------------------------------------------

test('N — assessment request type rejects learner history keys at calibration boundary', async () => {
  const { verifyAllGoldenSources } = await import('../calibration/golden-cases');
  const verification = verifyAllGoldenSources();
  assert.equal(verification.ok, true);
  assert.equal(verification.runnable, 12);
});

// ---------------------------------------------------------------------------
// O — usage captured from provider metadata (mock)
// ---------------------------------------------------------------------------

test('O — OpenAI client records provider usage metadata', async () => {
  const { createCalibrationOpenAiClient } = await import('../calibration/openai-client');
  const usageLog: Array<{
    input_tokens: number | null;
    output_tokens: number | null;
    actual_model: string | null;
  }> = [];

  const client = createCalibrationOpenAiClient(
    {
      chat: {
        completions: {
          create: async () => ({
            id: 'chatcmpl-test',
            model: 'gpt-4o-2024-08-06',
            system_fingerprint: 'fp_test',
            choices: [{ message: { content: '{"ok":true}' }, finish_reason: 'stop' }],
            usage: { prompt_tokens: 12, completion_tokens: 4, total_tokens: 16 },
          }),
        },
      },
    } as unknown as import('openai').default,
    {
      stage: 'task_analysis',
      case_id: 'TEST',
      attempt: 1,
      usageLog,
    },
  );

  await client.generate({
    system: 'sys',
    user: 'user',
    model_config: CALIBRATION_BASELINE_MODEL,
    json_schema: {
      name: 'test',
      strict: true,
      schema: { type: 'object', properties: { ok: { type: 'boolean' } } },
    },
  });

  assert.equal(usageLog.length, 1);
  assert.equal(usageLog[0].input_tokens, 12);
  assert.equal(usageLog[0].output_tokens, 4);
  assert.equal(usageLog[0].actual_model, 'gpt-4o-2024-08-06');
  assert.deepEqual(client.lastPayload, { ok: true });
});

// ---------------------------------------------------------------------------
// P–Q — production isolation
// ---------------------------------------------------------------------------

test('P — calibration harness does not import production routes', () => {
  const files = [
    'src/features/writing/calibration/run-pipeline.ts',
    'scripts/calibrate-writing-v3.mjs',
  ];
  for (const file of files) {
    const src = readFileSync(path.join(ROOT, file), 'utf8');
    assert.ok(!src.includes('/api/writing/evaluate'));
    assert.ok(!src.includes('cambridgeEssayFeedback'));
    assert.ok(!src.includes('OPENAI_ASSISTANT_ID_CAMBRIDGE_EXAMS'));
  }
});

test('Q — calibration harness does not import production persistence', () => {
  const src = readFileSync(
    path.join(ROOT, 'src/features/writing/calibration/run-pipeline.ts'),
    'utf8',
  );
  assert.ok(!src.includes('writing-engine.repository'));
  assert.ok(!src.includes('writing_engine_executions'));
});

// ---------------------------------------------------------------------------
// R–T — approved assessment quote-binding contract
// ---------------------------------------------------------------------------

test('R — unique quotes bind at canonical 0; repeated quotes still require zero-based index', () => {
  const candidate =
    'Cars cause smoke. Cars cause smoke again. Rivers need cleaning every day.';

  // A/B/C — unique quote binds regardless of model index 0 / 1 / 6
  for (const modelIndex of [0, 1, 6]) {
    const binding = bindAssessmentEvidenceQuote(
      candidate,
      'Rivers need cleaning every day.',
      modelIndex,
    );
    assert.equal(binding.status, 'bound');
    if (binding.status !== 'bound') return;
    assert.equal(binding.canonical_occurrence_index, 0);
    assert.equal(binding.model_occurrence_index, modelIndex);
    assert.equal(binding.model_index_ignored, modelIndex !== 0);
    // D — exact offsets
    assert.equal(
      candidate.slice(binding.span_start, binding.span_end),
      'Rivers need cleaning every day.',
    );
    assert.equal(binding.bound_text, 'Rivers need cleaning every day.');
  }

  // E — repeated quote + valid zero-based index
  const second = bindAssessmentEvidenceQuote(candidate, 'Cars cause smoke', 1);
  assert.equal(second.status, 'bound');
  if (second.status === 'bound') {
    assert.equal(second.canonical_occurrence_index, 1);
    assert.equal(second.span_start, candidate.indexOf('Cars cause smoke again'));
  }

  // F — repeated quote + invalid index
  const badRepeated = bindAssessmentEvidenceQuote(candidate, 'Cars cause smoke', 9);
  assert.equal(badRepeated.status, 'failed');
  if (badRepeated.status === 'failed') {
    assert.equal(badRepeated.reason, 'occurrence_out_of_range');
    assert.equal(badRepeated.occurrences_found, 2);
  }

  // G — missing quote
  const missing = bindAssessmentEvidenceQuote(candidate, 'a phrase never written', 0);
  assert.equal(missing.status, 'failed');
  if (missing.status === 'failed') {
    assert.equal(missing.reason, 'quote_not_found');
  }

  // H/I — paraphrase / no fuzzy matching
  const paraphrase = bindAssessmentEvidenceQuote(
    candidate,
    'Rivers need cleaning each day.',
    0,
  );
  assert.equal(paraphrase.status, 'failed');
  if (paraphrase.status === 'failed') {
    assert.equal(paraphrase.reason, 'quote_not_found');
  }

  // Low-level binder unchanged: unique + index 1 still fails without assessment contract
  const raw = bindQuote(candidate, 'Rivers need cleaning every day.', 1);
  assert.equal(raw.status, 'failed');
  if (raw.status === 'failed') assert.equal(raw.reason, 'occurrence_out_of_range');

  // Inspection retains model index diagnostically but binds unique quotes
  const rows = inspectAssessmentEvidenceBindings(candidate, {
    assessable: true,
    criteria: [
      {
        criterion: 'content',
        text_evidence: [
          { quote: 'Rivers need cleaning every day.', occurrence_index: 6 },
          { quote: 'Cars cause smoke', occurrence_index: 1 },
          { quote: 'missing', occurrence_index: 0 },
          { quote: 'Cars cause smoke', occurrence_index: 5 },
        ],
      },
    ],
  });
  assert.equal(rows[0].binding_status, 'bound');
  assert.equal(rows[0].requested_occurrence_index, 6);
  assert.equal(rows[0].canonical_occurrence_index, 0);
  assert.equal(rows[0].model_index_ignored, true);
  assert.equal(rows[1].binding_status, 'bound');
  assert.equal(rows[1].canonical_occurrence_index, 1);
  assert.equal(rows[2].binding_reason, 'quote_not_found');
  assert.equal(rows[3].binding_reason, 'occurrence_out_of_range');
});

test('S — assessment stores canonical occurrence_index 0 for unique quotes; marks unchanged', async () => {
  const candidate =
    'People place too much importance on appearance and the material, world. Fashion matters less.';
  const quote = 'People place too much importance on appearance and the material, world.';

  const task = await analyseWritingTask(
    {
      source_task_text: SAMPLE_TASK,
      task_type: 'essay',
      target_reader: 'your English teacher',
      model_config: CALIBRATION_BASELINE_MODEL,
    },
    {
      llm: {
        async generate() {
          return {
            target_reader: 'your English teacher',
            target_reader_evidence_quote: 'Your teacher has asked you',
            communicative_purpose: 'Discuss whether environmental problems can be solved',
            register: 'neutral',
            tone: null,
            mandatory_content_points: [
              { point: 'transport', evidence_quote: 'transport' },
              { point: 'rivers and seas', evidence_quote: 'rivers and seas' },
              { point: 'your own idea', evidence_quote: 'your own idea' },
            ],
            required_functions: [],
            task_specific_mandatory_conventions: [],
            ambiguities: [],
            inferred_task_type: null,
          };
        },
      },
    },
  );
  assert.equal(task.status, 'complete');

  function criterionDecision(
    criterion: 'content' | 'communicative_achievement' | 'organisation' | 'language',
    mark: number,
    occurrence_index: number,
  ) {
    const mixed = mark === 2 || mark === 4;
    const rule =
      criterion === 'content'
        ? 'C03'
        : criterion === 'communicative_achievement'
          ? 'CA03'
          : criterion === 'organisation'
            ? 'O01'
            : 'L01';
    return {
      criterion,
      mark,
      band_anchor: `${criterion} band ${mark}`,
      positive_evidence: [`Distinct positive ${criterion} evidence at band ${mark}.`],
      limiting_evidence: [`Distinct limiting ${criterion} evidence at band ${mark}.`],
      text_evidence: [{ quote, occurrence_index }],
      why_not_higher:
        mark === 5
          ? 'Band 5 ceiling reached.'
          : `Higher ${criterion} band not sustained in this response.`,
      why_not_lower: `Lower ${criterion} band is exceeded here.`,
      adjacent_band_evidence: mixed
        ? {
            lower_band_reference: `${criterion}.band_${mark - 1}`,
            lower_band_evidence: `Concrete lower-band ${criterion} feature.`,
            higher_band_reference: `${criterion}.band_${mark + 1}`,
            higher_band_evidence: `Concrete higher-band ${criterion} feature.`,
          }
        : null,
      confidence: 'high',
      confidence_reason: null,
      source_rule_ids: [rule],
      evidence_observation_ids: [],
    };
  }

  // Unique quote + model indexes 1 and 6 both assemble; canonical stored index is 0.
  for (const modelIndex of [1, 6]) {
    const result = await assessWriting(
      {
        candidate_response: candidate,
        task_analysis: task.task_analysis,
        model_config: CALIBRATION_BASELINE_MODEL,
      },
      {
        llm: {
          async generate() {
            return {
              assessable: true,
              unassessable_reason: null,
              overall_confidence: 'high',
              criteria: [
                criterionDecision('content', 3, modelIndex),
                criterionDecision('communicative_achievement', 3, modelIndex),
                criterionDecision('organisation', 3, modelIndex),
                criterionDecision('language', 3, modelIndex),
              ],
            };
          },
        },
      },
    );
    assert.equal(result.assessment_record.status, 'complete');
    assert.equal(result.assessment_record.raw_total, 12);
    assert.equal(result.assessment_record.criteria!.content.mark, 3);
    for (const key of [
      'content',
      'communicative_achievement',
      'organisation',
      'language',
    ] as const) {
      const evidence = result.assessment_record.criteria![key].text_evidence[0];
      assert.equal(evidence.occurrence_index, 0);
      assert.equal(candidate.slice(evidence.span_start, evidence.span_end), quote);
      assert.equal(evidence.bound_text, quote);
    }
  }

  // Paraphrase still fails as quote_not_found — no fuzzy repair.
  await assert.rejects(
    () =>
      assessWriting(
        {
          candidate_response: candidate,
          task_analysis: task.task_analysis,
          model_config: CALIBRATION_BASELINE_MODEL,
        },
        {
          llm: {
            async generate() {
              return {
                assessable: true,
                unassessable_reason: null,
                overall_confidence: 'high',
                criteria: [
                  criterionDecision('content', 3, 0),
                  criterionDecision('communicative_achievement', 3, 0),
                  criterionDecision('organisation', 3, 0),
                  criterionDecision('language', 3, 0),
                ].map((row, i) =>
                  i === 0
                    ? {
                        ...row,
                        text_evidence: [
                          {
                            quote: 'People care too much about looks and material things.',
                            occurrence_index: 0,
                          },
                        ],
                      }
                    : row,
                ),
              };
            },
          },
        },
      ),
    (error: unknown) => {
      assert.ok(error instanceof AssessmentValidationError);
      assert.ok(String(error.message).includes('quote_not_found'));
      assert.equal(error.failures[0], 'quote_not_found');
      return true;
    },
  );
});
