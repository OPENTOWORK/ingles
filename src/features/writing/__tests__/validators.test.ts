import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SCHEMA_VERSION, SOURCE_DOC_VERSIONS, WRITING_ENGINE_VERSION } from '../domain/engine-version';
import {
  CONFIDENCE_LEVELS,
  PEDAGOGICAL_PRIORITY_LEVELS,
  confidenceSchema,
  pedagogicalPrioritySchema,
  validationResultSchema,
} from '../domain/schemas';
import type { ResolvedTaskAnalysis } from '../domain/types';
import { analyseWritingTask } from '../services/analysis/task-analysis.service';
import { extractObservations } from '../services/observation/observation.service';
import { assessWriting } from '../services/assessment/assessment.service';
import {
  FORBIDDEN_HEURISTIC_RULES,
  LEGITIMATE_PHRASES,
  detectForbiddenHeuristics,
  isForbiddenHeuristic,
} from '../services/validation/forbidden-heuristics';
import {
  MIN_DISTINCT_RATIONALE_LENGTH,
  VALIDATOR_VERSION,
  buildValidationResult,
  eligibleObservationIds,
  isTargetReaderUnresolved,
  validateAssessment,
  validateEngineOutput,
  validateNoProgressionLeakage,
  validateObservations,
  validateProvenance,
  validateTaskAnalysis,
} from '../services/validation/deterministic-validators';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CANDIDATE = [
  'Fast food is very popular today. Many people eat it every day because it is cheap and quick.',
  'However, I believe it is harmful for our health. My friend eats fast food three times a week and he feels tired.',
  'In conclusion, we should reduce fast food and cook at home more often.',
].join('\n');

const ESSAY_TASK =
  'Write an essay in 140–190 words.\nSome people say that fast food is always a bad thing to eat. Do you agree?\nYou should write about: health, price and convenience, your own idea.';

const EVIDENCE: Record<string, string> = {
  content: 'it is cheap and quick',
  communicative_achievement: 'However, I believe it is harmful for our health',
  organisation: 'In conclusion,',
  language: 'he feels tired',
};

const RULE: Record<string, string> = {
  content: 'C03',
  communicative_achievement: 'CA03',
  organisation: 'O01',
  language: 'L01',
};

let TASK_ANALYSIS: ResolvedTaskAnalysis;
let OBSERVATIONS: Awaited<ReturnType<typeof extractObservations>>;

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
  }
  return value;
}

test('setup: build the Phase 2 and Phase 3 fixtures', async () => {
  const analysis = await analyseWritingTask(
    { source_task_text: ESSAY_TASK, task_type: 'essay' },
    {
      llm: {
        async generate() {
          return {
            target_reader: 'Your English teacher',
            target_reader_evidence_quote: null,
            communicative_purpose: 'Discuss the topic and give a clear opinion',
            register: 'neutral',
            tone: null,
            mandatory_content_points: [
              { point: 'Health', evidence_quote: null },
              { point: 'Price and convenience', evidence_quote: null },
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
  if (analysis.status !== 'complete') throw new Error('task analysis fixture failed');
  TASK_ANALYSIS = analysis.task_analysis;

  OBSERVATIONS = await extractObservations(
    { candidate_response: CANDIDATE, task_analysis: TASK_ANALYSIS },
    {
      llm: {
        async generate() {
          return {
            base_correction_strategy: 'focused',
            principal_focus: 'grammar',
            strategy_rationale: 'Grammar is treated thoroughly.',
            observations: [
              observationItem(),
              observationItem({ text_quote: 'a phrase the candidate never wrote' }),
            ],
          };
        },
      },
    },
  );
  assert.equal(TASK_ANALYSIS.task_type, 'essay');
  assert.equal(OBSERVATIONS.observations.length, 2);
});

function observationItem(overrides: Record<string, unknown> = {}) {
  return {
    domain: 'grammar',
    observation_type: 'accuracy_error',
    polarity: 'negative',
    scope: 'local',
    text_quote: 'he feels tired',
    occurrence_index: 0,
    supporting_quotes: [],
    intended_meaning: 'He feels tired.',
    diagnosis: 'The verb form is worth checking.',
    suggested_change: null,
    voice_preservation: null,
    communicative_impact: 'minor',
    within_script_frequency: 'isolated',
    knowledge_status: 'uncertain',
    foundational_importance: 'basic_expected_form',
    transferability: 'across_writing_and_use_of_english',
    pedagogical_priority: 'high',
    confidence: 'high',
    ambitious_attempt: false,
    learning_opportunity: null,
    teacher_dna_rule_ids: ['R17'],
    pattern_key: null,
    ...overrides,
  };
}

function boundEvidence(criterion: string) {
  const quote = EVIDENCE[criterion];
  const start = CANDIDATE.indexOf(quote);
  return [{ quote, occurrence_index: 0, span_start: start, span_end: start + quote.length, bound_text: quote }];
}

function decision(criterion: string, mark: number, overrides: Record<string, unknown> = {}) {
  const mixed = mark === 2 || mark === 4;
  return {
    criterion,
    mark,
    band_anchor: `${criterion} band ${mark} descriptor`,
    positive_evidence: mark >= 1 ? [`The response shows ${criterion} strength at band ${mark}.`] : [],
    limiting_evidence:
      mark >= 1 && mark <= 4 ? [`The response is limited in ${criterion} at band ${mark}.`] : [],
    text_evidence: boundEvidence(criterion),
    why_not_higher:
      mark === 5
        ? 'Band 5 is the highest available band and its descriptor is met.'
        : `The next band is not reached because the ${criterion} descriptor is not sustained.`,
    ...(mark >= 1
      ? { why_not_lower: `The lower band is exceeded because ${criterion} performance is stronger.` }
      : {}),
    ...(mixed
      ? {
          adjacent_band_evidence: {
            lower_band_reference: `${criterion}.band_${mark - 1}`,
            lower_band_evidence: `Concrete band ${mark - 1} feature observed for ${criterion}.`,
            higher_band_reference: `${criterion}.band_${mark + 1}`,
            higher_band_evidence: `Concrete band ${mark + 1} feature observed for ${criterion}.`,
          },
        }
      : {}),
    band_ceiling_reached: mark === 5,
    band_floor_reached: mark === 0,
    confidence: 'high',
    source_rule_ids: [RULE[criterion]],
    evidence_observation_ids: [],
    ...overrides,
  };
}

/**
 * Fixtures are deliberately loose: most tests corrupt one field to prove a
 * validator catches it, which the strict contract type would forbid outright.
 */
function record(
  marks: [number, number, number, number],
  overrides: Record<string, unknown> = {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  const criteria = {
    content: decision('content', marks[0]),
    communicative_achievement: decision('communicative_achievement', marks[1]),
    organisation: decision('organisation', marks[2]),
    language: decision('language', marks[3]),
  };
  return {
    status: 'complete',
    criteria,
    raw_total: marks[0] + marks[1] + marks[2] + marks[3],
    max_total: 20,
    single_task_scale_claim_allowed: false,
    overall_confidence: 'high',
    word_count: 62,
    word_count_penalty_applied: false,
    ...overrides,
  };
}

function provenance(overrides: Record<string, unknown> = {}) {
  return {
    engine_version: WRITING_ENGINE_VERSION,
    schema_version: SCHEMA_VERSION,
    doc_versions: { ...SOURCE_DOC_VERSIONS },
    assessment_prompt_version: '1.0.0',
    model_config: {
      model: 'gpt-4o-2024-08-06',
      snapshot_id: 'gpt-4o-2024-08-06',
      temperature: 0,
      response_format: 'json_schema',
    },
    ...overrides,
  };
}

function check(assessmentRecord: unknown, extra: Record<string, unknown> = {}) {
  return validateAssessment({
    assessment_record: deepFreeze(assessmentRecord),
    candidate_response: CANDIDATE,
    provenance: provenance(),
    ...extra,
  });
}

function ruleIds(failures: Array<{ rule_id: string }>): string[] {
  return [...new Set(failures.map((f) => f.rule_id))];
}

// ---------------------------------------------------------------------------
// Valid output
// ---------------------------------------------------------------------------

test('a valid complete assessment passes', () => {
  assert.deepEqual(check(record([4, 3, 3, 3])), []);
});

test('a highly asymmetric 5/2/2/2 profile passes structural validation', () => {
  const failures = check(record([5, 2, 2, 2]));
  assert.deepEqual(failures, []);
});

test('5/5/4/5 passes without Organisation being pushed to 5', () => {
  assert.deepEqual(check(record([5, 5, 4, 5])), []);
});

// ---------------------------------------------------------------------------
// Marks and totals
// ---------------------------------------------------------------------------

test('a fractional mark fails', () => {
  const failures = check(record([3.5 as unknown as number, 3, 3, 3]));
  assert.ok(ruleIds(failures).includes('V-AS-05'));
});

test('a raw-total mismatch fails', () => {
  const failures = check(record([3, 3, 3, 3], { raw_total: 20 }));
  assert.ok(ruleIds(failures).includes('V-AS-06'));
});

test('a missing criterion fails', () => {
  const base = record([3, 3, 3, 3]) as Record<string, Record<string, unknown>>;
  delete base.criteria.language;
  const failures = check({ ...base, raw_total: 9 });
  assert.ok(ruleIds(failures).includes('V-AS-04'));
});

test('an unknown or mislabelled criterion fails', () => {
  const wrongLabel = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  wrongLabel.criteria.organisation.criterion = 'language';
  assert.ok(ruleIds(check(wrongLabel)).includes('V-AS-04'));

  const extra = record([3, 3, 3, 3]) as Record<string, Record<string, unknown>>;
  extra.criteria.vocabulary = decision('content', 3);
  assert.ok(ruleIds(check(extra)).includes('V-AS-04'));
});

// ---------------------------------------------------------------------------
// Band boundaries
// ---------------------------------------------------------------------------

test('band 2 fails when either neighbour is missing', () => {
  for (const side of ['lower_band_evidence', 'higher_band_evidence']) {
    const base = record([2, 3, 3, 3]) as Record<string, Record<string, Record<string, Record<string, unknown>>>>;
    base.criteria.content.adjacent_band_evidence[side] = '';
    assert.ok(ruleIds(check(base)).includes('V-AS-10'), `${side} must be required`);
  }

  const missing = record([2, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  delete missing.criteria.content.adjacent_band_evidence;
  assert.ok(ruleIds(check(missing)).includes('V-AS-10'));
});

test('band 4 fails when either neighbour is missing', () => {
  for (const side of ['lower_band_evidence', 'higher_band_evidence']) {
    const base = record([4, 3, 3, 3]) as Record<string, Record<string, Record<string, Record<string, unknown>>>>;
    base.criteria.content.adjacent_band_evidence[side] = '   ';
    assert.ok(ruleIds(check(base)).includes('V-AS-10'), `${side} must be required`);
  }
});

test('an invented band 6 fails', () => {
  const base = record([5, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  base.criteria.content.why_not_higher = 'Band 6 would require a wider argument.';
  assert.ok(ruleIds(check(base)).includes('FH-17'));
});

test('an invented comparison below band 0 fails', () => {
  const withLower = record([0, 3, 3, 3], { raw_total: 9 }) as Record<string, Record<string, Record<string, unknown>>>;
  withLower.criteria.content.why_not_lower = 'The band below 0 is exceeded.';
  const failures = check(withLower);
  assert.ok(ruleIds(failures).includes('V-AS-08'));
  assert.ok(ruleIds(failures).includes('FH-17'));
});

test('a missing why_not_higher fails and is retryable', () => {
  const base = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  base.criteria.content.why_not_higher = '';
  const failures = check(base);
  const boundary = failures.find((f) => f.rule_id === 'V-AS-07');
  assert.ok(boundary);
  assert.equal(boundary?.severity, 'retryable_generation_failure');
});

test('a missing why_not_lower fails for marks 1 to 5', () => {
  const base = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  delete base.criteria.language.why_not_lower;
  assert.ok(ruleIds(check(base)).includes('V-AS-08'));
});

// ---------------------------------------------------------------------------
// Evidence traceability
// ---------------------------------------------------------------------------

test('an unbound assessment quote fails', () => {
  const base = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  base.criteria.content.text_evidence = [
    { quote: 'a sentence never written', occurrence_index: 0, span_start: 0, span_end: 24, bound_text: CANDIDATE.slice(0, 24) },
  ];
  assert.ok(ruleIds(check(base)).includes('V-EV-03'));
});

test('a forged offset fails even when the quote exists', () => {
  const base = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  const quote = EVIDENCE.content;
  base.criteria.content.text_evidence = [
    { quote, occurrence_index: 0, span_start: 0, span_end: quote.length, bound_text: quote },
  ];
  const failures = check(base);
  assert.ok(ruleIds(failures).includes('V-EV-02'));
});

test('a span that does not reproduce its own bound_text fails', () => {
  const base = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  base.criteria.content.text_evidence = [
    { quote: EVIDENCE.content, occurrence_index: 0, span_start: 5, span_end: 12, bound_text: EVIDENCE.content },
  ];
  assert.ok(ruleIds(check(base)).includes('V-EV-02'));
});

test('legitimate candidate evidence with no observation id still passes', () => {
  const base = record([4, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  const quote = 'we should reduce fast food';
  const start = CANDIDATE.indexOf(quote);
  base.criteria.organisation.text_evidence = [
    { quote, occurrence_index: 0, span_start: start, span_end: start + quote.length, bound_text: quote },
  ];
  base.criteria.organisation.evidence_observation_ids = [];

  const failures = validateAssessment({
    assessment_record: base,
    candidate_response: CANDIDATE,
    provenance: provenance(),
    observations: OBSERVATIONS,
  });
  assert.deepEqual(failures, []);
});

test('an unbindable observation cannot become Cambridge evidence', () => {
  const unbindable = OBSERVATIONS.observations.find((o) => o.binding_status === 'unbindable');
  assert.ok(unbindable);

  const eligible = eligibleObservationIds(OBSERVATIONS, CANDIDATE);
  assert.equal(eligible.has(unbindable!.observation_id), false);

  const base = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  base.criteria.content.evidence_observation_ids = [unbindable!.observation_id];
  const failures = validateAssessment({
    assessment_record: base,
    candidate_response: CANDIDATE,
    provenance: provenance(),
    observations: OBSERVATIONS,
  });
  assert.ok(ruleIds(failures).includes('V-EV-05'));
});

// ---------------------------------------------------------------------------
// Provenance and construct authority
// ---------------------------------------------------------------------------

test('Teacher DNA pedagogical priority is not scoring authority', () => {
  const base = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  base.criteria.content.source_rule_ids = ['R17'];
  const failures = check(base);
  assert.ok(ruleIds(failures).includes('V-PR-02'));
  assert.ok(failures.some((f) => f.message.includes('Teacher DNA')));
});

test('pedagogical priority used as a deduction fails', () => {
  const base = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  base.criteria.language.limiting_evidence = [
    'This is a pedagogically important pattern, so the band is lowered.',
  ];
  assert.ok(ruleIds(check(base)).includes('FH-15'));
});

test('a criterion justified only by another construct fails', () => {
  const base = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  base.criteria.content.source_rule_ids = ['L08'];
  assert.ok(ruleIds(check(base)).includes('V-PR-03'));
});

test('missing scoring provenance fails', () => {
  const base = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  base.criteria.content.source_rule_ids = [];
  assert.ok(ruleIds(check(base)).includes('V-PR-01'));
});

test('a learner-history scoring rationale fails', () => {
  for (const rationale of [
    'This is better than the previous writing submitted last month.',
    'The candidate has improved since the earlier essay.',
    'The course stage justifies this band.',
  ]) {
    const base = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
    base.criteria.content.positive_evidence = [rationale];
    assert.ok(ruleIds(check(base)).includes('FH-14'), rationale);
  }
});

// ---------------------------------------------------------------------------
// Forbidden heuristics
// ---------------------------------------------------------------------------

const HEURISTIC_CASES: Array<[string, string]> = [
  ['FH-01', 'There are seven errors, so the language band is 2.'],
  ['FH-01', 'The error count places the response below the anchor.'],
  ['FH-03', 'The response uses only 2 connectors, therefore Organisation is limited to band 2.'],
  ['FH-04', 'The number of paragraphs is too low for this band.'],
  ['FH-05', 'A title penalty is applied for the missing heading.'],
  ['FH-06', 'A word-count deduction applies because the response is short.'],
  ['FH-07', 'The marks were smoothed to keep the profile consistent.'],
  ['FH-08', 'Strong content compensates for the language mark.'],
  ['FH-09', 'This response demonstrates CEFR B2 ability.'],
  ['FH-09', 'The B2 standard is met.'],
  ['FH-10', 'Converted to a Cambridge English Scale score of 160.'],
  ['FH-11', 'The candidate passed / failed this task.'],
  ['FH-12', 'The response is above 12/20.'],
  ['FH-13', 'The learner shows exam readiness.'],
  ['FH-16', 'A half-band would be more accurate here.'],
  ['FH-17', 'Band 6 would require a wider argument.'],
];

test('every prohibited scoring heuristic is detected', () => {
  for (const [ruleId, text] of HEURISTIC_CASES) {
    assert.equal(isForbiddenHeuristic(text), ruleId, `"${text}" should trigger ${ruleId}`);
  }
});

test('legitimate descriptive numbers and scale vocabulary do not false-positive', () => {
  for (const phrase of LEGITIMATE_PHRASES) {
    assert.equal(isForbiddenHeuristic(phrase), null, `"${phrase}" must not be rejected`);
  }
  assert.deepEqual(detectForbiddenHeuristics({ notes: LEGITIMATE_PHRASES }, 'assessment'), []);
});

test('a record carrying a prohibited heuristic fails assessment validation', () => {
  for (const [, text] of HEURISTIC_CASES) {
    const base = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
    base.criteria.language.limiting_evidence = [text];
    assert.ok(check(base).length > 0, `"${text}" must fail validation`);
  }
});

test('a neutral count is a fact about the text, not a scoring rule', () => {
  for (const neutral of [
    'The response has three paragraphs.',
    'The text uses two connectors and relies mainly on reference.',
    'Verb-form slips occur in three places without blocking meaning.',
    'The response has three paragraphs. Each one develops a distinct idea.',
  ]) {
    assert.equal(isForbiddenHeuristic(neutral), null, `"${neutral}" must be allowed`);
  }
});

test('the same count fails as soon as it justifies a mark', () => {
  const causal: Array<[string, string]> = [
    ['FH-04', 'Because the response has three paragraphs, Organisation should be 4.'],
    ['FH-04', 'Only two paragraphs, so Organisation cannot exceed Band 3.'],
    ['FH-03', 'It uses six connectors, therefore the Organisation mark rises to 4.'],
    ['FH-01', 'There are four errors, so the Language band drops to 2.'],
  ];
  for (const [ruleId, text] of causal) {
    assert.equal(isForbiddenHeuristic(text), ruleId, `"${text}" should trigger ${ruleId}`);
  }
});

test('causation is judged sentence by sentence, not across a whole rationale', () => {
  // Two independent facts must not be welded into a causal claim by proximity.
  assert.equal(
    isForbiddenHeuristic('The response has three paragraphs. The Organisation band is 4.'),
    null,
  );
});

test('every declared heuristic rule owns at least one pattern', () => {
  assert.ok(FORBIDDEN_HEURISTIC_RULES.length >= 15);
  for (const rule of FORBIDDEN_HEURISTIC_RULES) {
    assert.ok(
      rule.patterns.length + (rule.causal_patterns?.length ?? 0) > 0,
      `${rule.rule_id} has no pattern`,
    );
    assert.ok(rule.description.length > 0);
  }
});

test('progression vocabulary is rejected and the legacy 12/20 rule stays outside the engine', () => {
  assert.deepEqual(validateNoProgressionLeakage(record([3, 3, 3, 3])), []);

  assert.ok(ruleIds(validateNoProgressionLeakage({ passed: true })).includes('V-PL-01'));
  assert.ok(ruleIds(validateNoProgressionLeakage({ readiness: 'ready' })).includes('V-PL-01'));
  assert.ok(
    ruleIds(validateNoProgressionLeakage({ note: 'The learner is above 12/20.' })).includes('V-PL-02'),
  );
  // The external product rule is not evaluated here — only its vocabulary is kept out.
  assert.deepEqual(validateNoProgressionLeakage({ raw_total: 13, max_total: 20 }), []);
});

// ---------------------------------------------------------------------------
// Incomplete assessment
// ---------------------------------------------------------------------------

test('an unresolved target reader with a complete /20 fails', () => {
  const unresolved = {
    ...TASK_ANALYSIS,
    target_reader: null,
    target_reader_resolution: { source: 'unresolved', confidence: 'unresolved' },
  };
  assert.equal(isTargetReaderUnresolved(unresolved), true);

  const failures = validateAssessment({
    assessment_record: record([4, 3, 3, 3]),
    candidate_response: CANDIDATE,
    provenance: provenance(),
    task_analysis: unresolved,
  });
  assert.ok(ruleIds(failures).includes('V-AS-15'));
});

test('an unresolved target reader with an incomplete assessment passes', async () => {
  const unresolved = {
    ...TASK_ANALYSIS,
    target_reader: null,
    target_reader_resolution: {
      source: 'unresolved' as const,
      confidence: 'unresolved' as const,
      notes: ['No reader could be established from the task wording.'],
    },
  };

  let calls = 0;
  const result = await assessWriting(
    { candidate_response: CANDIDATE, task_analysis: unresolved },
    {
      llm: {
        async generate() {
          calls += 1;
          return {};
        },
      },
    },
  );

  assert.equal(calls, 0);
  assert.equal(result.assessment_record.status, 'incomplete');
  assert.deepEqual(
    validateAssessment({
      assessment_record: result.assessment_record,
      candidate_response: CANDIDATE,
      provenance: result.provenance,
      task_analysis: unresolved,
    }),
    [],
  );
});

test('an incomplete assessment expressed as 0/20 fails', () => {
  const zero = {
    status: 'incomplete',
    incomplete_reason: 'The task prompt is unavailable.',
    criteria: record([0, 0, 0, 0]).criteria,
    raw_total: 0,
    max_total: 20,
    single_task_scale_claim_allowed: false,
  };
  const failures = check(zero);
  assert.ok(ruleIds(failures).includes('V-AS-03'));
  assert.ok(failures.some((f) => f.message.includes('not 0/20')));
});

test('an incomplete assessment must record its reason', () => {
  const failures = check({
    status: 'incomplete',
    max_total: 20,
    single_task_scale_claim_allowed: false,
  });
  assert.ok(ruleIds(failures).includes('V-AS-02'));
});

// ---------------------------------------------------------------------------
// Confidence
// ---------------------------------------------------------------------------

test('high, medium and low are accepted and moderate is rejected', () => {
  for (const confidence of ['high', 'medium', 'low']) {
    const base = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
    base.criteria.content.confidence = confidence;
    if (confidence !== 'high') {
      base.criteria.content.confidence_reason = 'The evidence base is thin.';
    }
    assert.deepEqual(check(base), [], `${confidence} must be accepted`);
  }

  const legacy = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  legacy.criteria.content.confidence = 'moderate';
  legacy.criteria.content.confidence_reason = 'Legacy vocabulary.';
  assert.ok(ruleIds(check(legacy)).includes('V-AS-11'));
});

test('confidence below high without a reason fails, and confidence never moves a mark', () => {
  const base = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  base.criteria.content.confidence = 'low';
  assert.ok(ruleIds(check(base)).includes('V-AS-11'));

  const adjusted = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  adjusted.criteria.content.confidence = 'low';
  adjusted.criteria.content.confidence_reason = 'Thin evidence.';
  adjusted.criteria.content.limiting_evidence = [
    'Low confidence, therefore lower the band by one.',
  ];
  assert.ok(ruleIds(check(adjusted)).includes('FH-18'));
});

// ---------------------------------------------------------------------------
// Immutability
// ---------------------------------------------------------------------------

test('validating a valid result leaves the input byte-identical', () => {
  const original = record([5, 2, 2, 2]);
  const snapshot = JSON.stringify(original);
  deepFreeze(original);

  validateAssessment({
    assessment_record: original,
    candidate_response: CANDIDATE,
    provenance: provenance(),
    observations: OBSERVATIONS,
    task_analysis: TASK_ANALYSIS,
  });

  assert.equal(JSON.stringify(original), snapshot);
  assert.equal(original.criteria.content.mark, 5);
  assert.equal(original.criteria.language.mark, 2);
  assert.equal(original.raw_total, 11);
});

test('validating a failed result does not repair or mutate it', () => {
  const broken = record([3, 3, 3, 3], { raw_total: 20 }) as Record<string, unknown>;
  (broken.criteria as Record<string, Record<string, unknown>>).content.mark = 4;
  const snapshot = JSON.stringify(broken);
  deepFreeze(broken);

  const failures = check(broken);
  assert.ok(failures.length > 0);
  assert.equal(JSON.stringify(broken), snapshot, 'the validator must never fix a mark');
  assert.equal((broken.criteria as Record<string, Record<string, unknown>>).content.mark, 4);
  assert.equal(broken.raw_total, 20);
});

test('the whole engine output is validated without mutation', () => {
  const frozen = {
    task_analysis: deepFreeze(structuredClone(TASK_ANALYSIS)),
    observations: deepFreeze(structuredClone(OBSERVATIONS)),
    assessment: deepFreeze({ assessment_record: record([4, 3, 3, 3]), provenance: provenance() }),
  };
  const snapshot = JSON.stringify(frozen);

  const result = validateEngineOutput({
    candidate_response: CANDIDATE,
    ...frozen,
    now: () => '2026-08-09T00:00:00.000Z',
  });

  assert.equal(JSON.stringify(frozen), snapshot);
  assert.equal(result.validation_status, 'passed');
  assert.equal(result.stage, 'engine_output');
  assert.deepEqual(result.failed_rules, []);
});

// ---------------------------------------------------------------------------
// Task analysis and observation validation
// ---------------------------------------------------------------------------

test('a valid task analysis passes and an out-of-scope genre fails', () => {
  assert.deepEqual(validateTaskAnalysis(deepFreeze(structuredClone(TASK_ANALYSIS))), []);

  const story = { ...structuredClone(TASK_ANALYSIS), task_type: 'story' };
  assert.ok(ruleIds(validateTaskAnalysis(story)).includes('V-TA-03'));

  const noTask = { ...structuredClone(TASK_ANALYSIS), source_task_text: '' };
  assert.ok(ruleIds(validateTaskAnalysis(noTask)).includes('V-TA-02'));
});

test('task analysis fails when a word-count penalty or criterion routing appears', () => {
  const penalty = structuredClone(TASK_ANALYSIS) as unknown as Record<string, Record<string, unknown>>;
  penalty.word_guidance.automatic_penalty = true;
  assert.ok(ruleIds(validateTaskAnalysis(penalty)).includes('V-TA-08'));

  const routed = structuredClone(TASK_ANALYSIS) as Record<string, unknown>;
  (routed.mandatory_content_points as Array<Record<string, unknown>>)[0].primary_criterion = 'content';
  assert.ok(ruleIds(validateTaskAnalysis(routed)).includes('V-TA-07'));
});

test('the three requirement classes must not overlap', () => {
  const overlapping = structuredClone(TASK_ANALYSIS) as Record<string, unknown>;
  const recommended = (overlapping.recommended_genre_features as Array<Record<string, unknown>>)[0];
  assert.ok(recommended, 'the essay fixture must declare a recommended feature');
  // Promoting a recommendation into a mandatory convention is exactly the
  // silent reclassification that would turn advice into a Content failure.
  (overlapping.mandatory_genre_conventions as Array<Record<string, unknown>>).push({
    id: 'mgc99',
    convention: recommended.feature,
    status: 'mandatory',
    source: 'doc01',
  });
  assert.ok(ruleIds(validateTaskAnalysis(overlapping)).includes('V-TA-06'));
});

test('observations pass, and scoring or history leakage fails', () => {
  assert.deepEqual(validateObservations(deepFreeze(structuredClone(OBSERVATIONS)), CANDIDATE), []);

  const scored = structuredClone(OBSERVATIONS) as Record<string, unknown>;
  (scored.observations as Array<Record<string, unknown>>)[0].mark = 3;
  assert.ok(validateObservations(scored, CANDIDATE).length > 0);

  const historic = structuredClone(OBSERVATIONS) as Record<string, unknown>;
  (historic.observations as Array<Record<string, unknown>>)[0].diagnosis =
    'You have made this mistake before.';
  assert.ok(validateObservations(historic, CANDIDATE).length > 0);
});

test('an observation span that does not reproduce the source fails', () => {
  const forged = structuredClone(OBSERVATIONS) as Record<string, unknown>;
  const observation = (forged.observations as Array<Record<string, unknown>>).find(
    (o) => o.binding_status === 'bound',
  )!;
  observation.span_start = 0;
  observation.span_end = 5;
  assert.ok(ruleIds(validateObservations(forged, CANDIDATE)).includes('V-OB-10'));
});

test('pattern grouping must not publish an occurrence count', () => {
  const counted = structuredClone(OBSERVATIONS) as Record<string, unknown>;
  (counted.pattern_groups as unknown[]).push({
    pattern_group_id: 'pg_test',
    pattern_key: 'third_person_s',
    observation_ids: ['obs_a', 'obs_b'],
    occurrence_count: 2,
  });
  assert.ok(ruleIds(validateObservations(counted, CANDIDATE)).includes('V-OB-07'));
});

test('an unbindable observation must stay unrenderable', () => {
  const promoted = structuredClone(OBSERVATIONS) as Record<string, unknown>;
  const unbindable = (promoted.observations as Array<Record<string, unknown>>).find(
    (o) => o.binding_status === 'unbindable',
  )!;
  unbindable.renderable_locally = true;
  assert.ok(ruleIds(validateObservations(promoted, CANDIDATE)).includes('V-OB-09'));
});

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------

test('provenance without a model identity fails', () => {
  assert.ok(
    ruleIds(validateProvenance({ ...provenance(), model_config: undefined }, 'assessment')).includes('V-VS-05'),
  );
  assert.ok(
    ruleIds(
      validateProvenance(
        { ...provenance(), model_config: { model: 'gpt-4o', temperature: 0 } },
        'assessment',
      ),
    ).includes('V-VS-05'),
    'an unpinned model id must be rejected',
  );
  assert.deepEqual(validateProvenance(provenance(), 'assessment'), []);
});

test('missing source versions fail', () => {
  const noDocs = { ...provenance() } as Record<string, unknown>;
  delete noDocs.doc_versions;
  assert.ok(ruleIds(validateProvenance(noDocs, 'assessment')).includes('V-VS-03'));

  const partial = { ...provenance(), doc_versions: { task_requirements: '1.0' } };
  const failures = validateProvenance(partial, 'assessment');
  assert.ok(failures.some((f) => f.message.includes('teacher_dna')));
  assert.ok(failures.some((f) => f.message.includes('cambridge_assessment')));

  const noPrompt = { ...provenance() } as Record<string, unknown>;
  delete noPrompt.assessment_prompt_version;
  assert.ok(ruleIds(validateProvenance(noPrompt, 'assessment')).includes('V-VS-04'));

  const noEngine = { ...provenance(), engine_version: '' };
  assert.ok(ruleIds(validateProvenance(noEngine, 'assessment')).includes('V-VS-01'));
});

test('version drift blocks generation and calibration but not a historical read', () => {
  const drifted = { ...provenance(), engine_version: '0.9.0' };

  for (const mode of ['current_generation', 'calibration'] as const) {
    const failures = validateProvenance(drifted, 'assessment', mode);
    assert.equal(failures.length, 1, mode);
    assert.equal(failures[0].severity, 'hard_failure', mode);
    assert.equal(failures[0].rule_id, 'V-VS-02');
  }

  const historical = validateProvenance(drifted, 'assessment', 'historical_read');
  assert.equal(historical.length, 1);
  assert.equal(historical[0].severity, 'non_blocking_warning');
});

test('a drifted historical result may be read but not still call itself calibrated', () => {
  const stale = { ...provenance(), engine_version: '0.9.0', calibration_status: 'calibrated' };
  const failures = validateProvenance(stale, 'assessment', 'historical_read');
  assert.ok(ruleIds(failures).includes('V-VS-06'));
  assert.ok(failures.some((f) => f.severity === 'hard_failure'));

  const honest = { ...provenance(), engine_version: '0.9.0', calibration_status: 'not_calibrated' };
  const readable = validateProvenance(honest, 'assessment', 'historical_read');
  assert.equal(readable.every((f) => f.severity === 'non_blocking_warning'), true);
});

test('the duplicate-rationale threshold ignores boilerplate and catches substantive reuse', () => {
  assert.equal(MIN_DISTINCT_RATIONALE_LENGTH, 25);

  // Short structural phrasing legitimately reads the same under two criteria.
  const boilerplate = record([5, 5, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  boilerplate.criteria.organisation.positive_evidence = ['Clear enough.'];
  boilerplate.criteria.language.positive_evidence = ['Clear enough.'];
  assert.deepEqual(check(boilerplate), []);

  const duplicated = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  const shared = 'The writer sustains a clear line of argument throughout the whole response.';
  duplicated.criteria.organisation.positive_evidence = [shared];
  duplicated.criteria.language.positive_evidence = [shared];
  assert.ok(ruleIds(check(duplicated)).includes('V-AS-16'));
});

test('pedagogical priority and confidence are separate constructs', () => {
  assert.deepEqual([...CONFIDENCE_LEVELS], [...PEDAGOGICAL_PRIORITY_LEVELS]);
  assert.notEqual(confidenceSchema, pedagogicalPrioritySchema);

  // Priority is a teaching signal and must never appear in a scoring record.
  const priced = record([3, 3, 3, 3]) as Record<string, Record<string, Record<string, unknown>>>;
  priced.criteria.content.pedagogical_priority = 'high';
  assert.ok(check(priced).length > 0);
});

// ---------------------------------------------------------------------------
// Result contract and retry policy
// ---------------------------------------------------------------------------

test('a hard failure produces a failed result with no retry target', () => {
  const result = buildValidationResult(
    [{ rule_id: 'V-AS-05', stage: 'assessment', severity: 'hard_failure', message: 'fractional mark' }],
    { stage: 'engine_output', now: () => '2026-08-09T00:00:00.000Z' },
  );
  assert.equal(result.validation_status, 'failed');
  assert.equal(result.retry_target, undefined);
  assert.equal(result.validator_version, VALIDATOR_VERSION);
});

test('a retryable failure names the earliest stage to regenerate', () => {
  const result = buildValidationResult(
    [
      { rule_id: 'V-AS-07', stage: 'assessment', severity: 'retryable_generation_failure', message: 'missing boundary' },
      { rule_id: 'V-OB-08', stage: 'observations', severity: 'retryable_generation_failure', message: 'missing focus' },
    ],
    { stage: 'engine_output', attempt: 2, now: () => '2026-08-09T00:00:00.000Z' },
  );
  assert.equal(result.validation_status, 'retry_required');
  assert.equal(result.retry_target, 'observations');
  assert.equal(result.attempt, 2);
  assert.ok(result.retry_reason?.includes('V-OB-08'));
});

test('a warning alone does not block the output', () => {
  const result = buildValidationResult(
    [{ rule_id: 'V-VS-02', stage: 'assessment', severity: 'non_blocking_warning', message: 'version drift' }],
    { stage: 'engine_output', now: () => '2026-08-09T00:00:00.000Z' },
  );
  assert.equal(result.validation_status, 'passed');
  assert.equal(result.warnings.length, 1);
  assert.deepEqual(result.failed_rules, []);
});

test('validation_status is not a learner outcome and the contract enforces its invariants', () => {
  const base = {
    stage: 'engine_output',
    attempt: 1,
    failed_rules: [],
    warnings: [],
    validated_at: '2026-08-09T00:00:00.000Z',
    engine_version: WRITING_ENGINE_VERSION,
    schema_version: SCHEMA_VERSION,
    validator_version: VALIDATOR_VERSION,
  };

  assert.equal(validationResultSchema.safeParse({ ...base, validation_status: 'passed' }).success, true);
  // The old boolean name is gone, so it cannot be mistaken for a student pass.
  assert.equal(validationResultSchema.safeParse({ ...base, passed: true }).success, false);
  assert.equal(
    validationResultSchema.safeParse({ ...base, validation_status: 'failed' }).success,
    false,
    'a non-passing result must name its failed rules',
  );
  assert.equal(
    validationResultSchema.safeParse({
      ...base,
      validation_status: 'retry_required',
      failed_rules: [
        { rule_id: 'V-AS-07', stage: 'assessment', severity: 'hard_failure', message: 'x' },
      ],
      retry_target: 'assessment',
      retry_reason: 'x',
    }).success,
    false,
    'a hard failure cannot be resolved by regeneration',
  );
  assert.equal(
    validationResultSchema.safeParse({
      ...base,
      validation_status: 'passed',
      warnings: [{ rule_id: 'V-AS-07', stage: 'assessment', severity: 'hard_failure', message: 'x' }],
    }).success,
    false,
  );
});

test('validation performs no model call and takes no client', () => {
  const source = readFileSync(
    new URL('../services/validation/deterministic-validators.ts', import.meta.url),
    'utf8',
  );
  for (const forbidden of ['openai', 'fetch(', 'llm', 'generate(']) {
    assert.equal(
      source.toLowerCase().includes(forbidden),
      false,
      `the validator must not reference ${forbidden}`,
    );
  }
});
