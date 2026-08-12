import test from 'node:test';
import assert from 'node:assert/strict';
import { WRITING_CATEGORY_KEYS } from '../domain/categories';
import { SCHEMA_VERSION, SOURCE_DOC_VERSIONS, WRITING_ENGINE_VERSION } from '../domain/engine-version';
import {
  DRALO_RESULT_DISCLAIMER,
  FINAL_CTA,
  findForbiddenStylingKeys,
  findForbiddenV3FieldKeys,
} from '../domain/schemas';
import type { AssessmentResult, ObservationExtractionResult, ResolvedTaskAnalysis } from '../domain/types';
import { analyseWritingTask } from '../services/analysis/task-analysis.service';
import {
  FeedbackValidationError,
  composeFeedback,
  copyFrozenAssessmentResult,
  findFeedbackTextIssues,
  selectAnnotatable,
} from '../services/feedback/feedback-composer.service';
import {
  HistoryBoundaryError,
  buildHistoryOverlay,
  historyPriorityBoost,
  supportsLongitudinalClaim,
} from '../services/feedback/learner-history-enrichment.service';
import {
  buildValidationResult,
  validateFeedbackPayload,
} from '../services/validation/deterministic-validators';
import {
  DOMAIN_TO_CATEGORY,
  GLOBAL_ONLY_DOMAINS,
  projectDomainToCategory,
} from '../prompts/knowledge/doc04-feedback-rules';
import { extractObservations } from '../services/observation/observation.service';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CANDIDATE = [
  'Fast food is very popular today. Many people eat it every day because it is cheap and quick.',
  'However, I believe it is harmful for our health. My friend eat fast food three times a week and he feels tired.',
  'In conclusion, we should reduce fast food and cook at home more often.',
].join('\n');

const ESSAY_TASK =
  'Write an essay in 140–190 words.\nSome people say that fast food is always a bad thing to eat. Do you agree?\nYou should write about: health, price and convenience, your own idea.';

const MODEL = {
  model: 'gpt-4o-2024-08-06',
  snapshot_id: 'gpt-4o-2024-08-06',
  temperature: 0,
  response_format: 'json_schema' as const,
};

let TASK_ANALYSIS: ResolvedTaskAnalysis;
let OBSERVATIONS: ObservationExtractionResult;
let GRAMMAR_ID = '';
let STRENGTH_ID = '';
let GLOBAL_ID = '';
let UNBINDABLE_ID = '';

function span(quote: string) {
  const start = CANDIDATE.indexOf(quote);
  if (start < 0) throw new Error(`fixture quote not found: ${quote}`);
  return { start, end: start + quote.length };
}

function observationItem(overrides: Record<string, unknown> = {}) {
  return {
    domain: 'grammar',
    observation_type: 'accuracy_error',
    polarity: 'negative',
    scope: 'local',
    text_quote: 'My friend eat fast food',
    occurrence_index: 0,
    supporting_quotes: [],
    intended_meaning: 'My friend eats fast food.',
    diagnosis: 'The third-person singular -s is missing.',
    suggested_change: 'My friend eats fast food',
    voice_preservation: {
      preserves_stance: true,
      preserves_central_meaning: true,
      register_is_the_target: false,
    },
    communicative_impact: 'minor',
    within_script_frequency: 'isolated',
    knowledge_status: 'likely_lapse',
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

test('setup: Phase 2 and Phase 3 fixtures', async () => {
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
            strategy_rationale: 'Grammar deserves the main attention on this script.',
            observations: [
              observationItem(),
              observationItem({
                domain: 'strength',
                observation_type: 'strength',
                polarity: 'positive',
                text_quote: 'However, I believe it is harmful for our health',
                intended_meaning: 'The writer states a clear position.',
                diagnosis: 'The contrast marker moves cleanly from the general view to the opinion.',
                suggested_change: null,
                voice_preservation: null,
                communicative_impact: 'none',
                knowledge_status: 'uncertain',
                foundational_importance: 'not_applicable',
                pedagogical_priority: 'low',
                teacher_dna_rule_ids: ['R21'],
              }),
              observationItem({
                domain: 'communicative_appropriacy',
                observation_type: 'appropriacy_issue',
                scope: 'global',
                text_quote: null,
                supporting_quotes: [{ quote: 'we should reduce fast food', occurrence_index: 0 }],
                intended_meaning: 'The writer addresses the reader directly.',
                diagnosis: 'The register drifts towards the conversational in the closing move.',
                suggested_change: null,
                voice_preservation: null,
                communicative_impact: 'minor',
                foundational_importance: 'target_level_control',
                pedagogical_priority: 'medium',
                teacher_dna_rule_ids: ['R30'],
              }),
              observationItem({
                domain: 'vocabulary_collocation',
                text_quote: 'a phrase the candidate never wrote',
                intended_meaning: 'Unclear.',
                diagnosis: 'Unbindable by construction.',
                suggested_change: null,
                voice_preservation: null,
                pedagogical_priority: 'low',
                teacher_dna_rule_ids: ['R25'],
              }),
            ],
          };
        },
      },
    },
  );

  for (const observation of OBSERVATIONS.observations) {
    if (observation.domain === 'grammar') GRAMMAR_ID = observation.observation_id;
    if (observation.domain === 'strength') STRENGTH_ID = observation.observation_id;
    if (observation.domain === 'communicative_appropriacy') GLOBAL_ID = observation.observation_id;
    if (observation.binding_status === 'unbindable') UNBINDABLE_ID = observation.observation_id;
  }
  assert.ok(GRAMMAR_ID && STRENGTH_ID && GLOBAL_ID && UNBINDABLE_ID);
});

function evidence(quote: string) {
  const { start, end } = span(quote);
  return [{ quote, occurrence_index: 0, span_start: start, span_end: end, bound_text: quote }];
}

const CRITERION_EVIDENCE: Record<string, string> = {
  content: 'it is cheap and quick',
  communicative_achievement: 'However, I believe it is harmful for our health',
  organisation: 'In conclusion,',
  language: 'he feels tired',
};

const CRITERION_RULE: Record<string, string> = {
  content: 'C03',
  communicative_achievement: 'CA03',
  organisation: 'O01',
  language: 'L01',
};

function decision(criterion: string, mark: number) {
  const mixed = mark === 2 || mark === 4;
  return {
    criterion,
    mark,
    band_anchor: `${criterion} band ${mark} descriptor`,
    positive_evidence: [`The response shows ${criterion} strength at band ${mark}.`],
    limiting_evidence: mark <= 4 ? [`The response is limited in ${criterion} at band ${mark}.`] : [],
    text_evidence: evidence(CRITERION_EVIDENCE[criterion]),
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
    source_rule_ids: [CRITERION_RULE[criterion]],
    evidence_observation_ids: [],
  };
}

function assessment(marks: [number, number, number, number] = [4, 3, 3, 3]): AssessmentResult {
  return {
    assessment_record: {
      status: 'complete',
      criteria: {
        content: decision('content', marks[0]),
        communicative_achievement: decision('communicative_achievement', marks[1]),
        organisation: decision('organisation', marks[2]),
        language: decision('language', marks[3]),
      },
      raw_total: marks[0] + marks[1] + marks[2] + marks[3],
      max_total: 20,
      single_task_scale_claim_allowed: false,
      overall_confidence: 'high',
      word_count: 62,
      word_count_penalty_applied: false,
    },
    provenance: {
      engine_version: WRITING_ENGINE_VERSION,
      schema_version: SCHEMA_VERSION,
      doc_versions: { ...SOURCE_DOC_VERSIONS },
      assessment_prompt_version: '1.0.0',
      model_config: MODEL,
      calibration_status: 'not_calibrated',
      llm_calls: 1,
    },
  } as unknown as AssessmentResult;
}

function llmFeedback(overrides: Record<string, unknown> = {}) {
  return {
    opening_strengths: [
      {
        observation_id: STRENGTH_ID,
        headline: 'Your contrast lands clearly.',
        explanation: '"However" moves the reader from the common view to your own position in one step.',
      },
    ],
    annotations: [
      {
        observation_id: GRAMMAR_ID,
        feedback_kind: 'correction',
        local_explanation: 'Third person singular needs -s.',
        suggested_change: 'My friend eats fast food',
        teaching_prompt: null,
      },
    ],
    criterion_feedback: ['content', 'communicative_achievement', 'organisation', 'language'].map(
      (criterion) => ({
        criterion,
        summary: `Your ${criterion} does the job with room to grow.`,
        what_worked: `You cover what the task asks for in ${criterion}.`,
        what_limited_the_band: `Development stays general in ${criterion}.`,
        evidence_indices: [0],
        next_focus: `Practise finishing each ${criterion} point with one concrete example the reader can picture.`,
      }),
    ),
    review_next: [
      {
        concept: 'Third person singular -s',
        reason: 'It slipped once and it is worth a quick check before you submit.',
        source: 'observation',
        source_ids: [GRAMMAR_ID],
      },
    ],
    ...overrides,
  };
}

function fakeLlm(output: unknown, counter?: { calls: number }) {
  return {
    async generate() {
      if (counter) counter.calls += 1;
      return output;
    },
  };
}

async function compose(output: unknown = llmFeedback(), extra: Record<string, unknown> = {}) {
  return composeFeedback(
    {
      candidate_response: CANDIDATE,
      task_analysis: TASK_ANALYSIS,
      observations: OBSERVATIONS,
      assessment: assessment(),
      ...extra,
    } as never,
    { llm: fakeLlm(output) },
  );
}

/** Builds an observation set whose only content is N genuine strengths. */
async function observationsWithStrengths(quotes: string[]): Promise<ObservationExtractionResult> {
  return extractObservations(
    { candidate_response: CANDIDATE, task_analysis: TASK_ANALYSIS },
    {
      llm: {
        async generate() {
          return {
            base_correction_strategy: 'comprehensive',
            principal_focus: null,
            strategy_rationale: 'The script is controlled, so nothing competes for attention.',
            observations: quotes.map((quote) =>
              observationItem({
                domain: 'strength',
                observation_type: 'strength',
                polarity: 'positive',
                text_quote: quote,
                intended_meaning: 'The writer makes an effective choice.',
                diagnosis: `"${quote}" works because it guides the reader deliberately.`,
                suggested_change: null,
                voice_preservation: null,
                communicative_impact: 'none',
                knowledge_status: 'uncertain',
                foundational_importance: 'not_applicable',
                pedagogical_priority: 'low',
                teacher_dna_rule_ids: ['R21'],
              }),
            ),
          };
        },
      },
    },
  );
}

/** A mutable deep copy, so a test can corrupt one field the contract forbids. */
function loosen(value: unknown): Record<string, unknown> {
  return structuredClone(value) as Record<string, unknown>;
}

function ruleIds(failures: Array<{ rule_id: string }>): string[] {
  return [...new Set(failures.map((f) => f.rule_id))];
}

function validate(payload: unknown, record = assessment().assessment_record) {
  return validateFeedbackPayload({
    feedback_payload: payload,
    assessment_record: record,
    candidate_response: CANDIDATE,
    observations: OBSERVATIONS,
  });
}

// ---------------------------------------------------------------------------
// A–F: the marks belong to the assessment
// ---------------------------------------------------------------------------

test('A — the four marks are copied exactly from the assessment', async () => {
  const { feedback_payload } = await compose();
  assert.deepEqual(feedback_payload.global_result.criteria, {
    content: 4,
    communicative_achievement: 3,
    organisation: 3,
    language: 3,
  });
  for (const row of feedback_payload.criterion_feedback) {
    assert.equal(row.mark, feedback_payload.global_result.criteria[row.criterion]);
  }
  assert.deepEqual(validate(feedback_payload), []);
});

test('B — a model that tries to change a mark changes nothing', async () => {
  const hostile = llmFeedback({
    criteria: { content: 1, communicative_achievement: 1, organisation: 1, language: 1 },
    raw_total: 4,
    marks: { content: 0 },
    overall_band: 2,
  });
  const { feedback_payload } = await compose(hostile);

  assert.equal(feedback_payload.global_result.raw_total, 13);
  assert.equal(feedback_payload.global_result.criteria.content, 4);
  // The extra keys never reach the payload: the schema has nowhere to put them.
  assert.equal('raw_total' in (feedback_payload as unknown as Record<string, unknown>), false);
  assert.equal('marks' in (feedback_payload as unknown as Record<string, unknown>), false);
});

test('C — the total out of 20 is the assessment total', async () => {
  const { feedback_payload } = await compose();
  assert.equal(feedback_payload.global_result.raw_total, 13);
  assert.equal(feedback_payload.global_result.max_total, 20);

  const tampered = loosen(feedback_payload);
  (tampered.global_result as Record<string, unknown>).raw_total = 20;
  assert.ok(ruleIds(validate(tampered)).includes('V-FB-02'));
});

test('D, E, F — no CEFR, no pass/fail, no 12/20 and no readiness', async () => {
  const { feedback_payload } = await compose();
  const serialised = JSON.stringify(feedback_payload);

  for (const forbidden of [/cefr/i, /\bb2 standard\b/i, /pass\s*\/\s*fail/i, /12\s*\/\s*20/, /readiness/i]) {
    assert.equal(forbidden.test(serialised), false, `${forbidden} must not appear`);
  }
  assert.deepEqual(findForbiddenV3FieldKeys(feedback_payload), []);
  assert.equal(feedback_payload.global_result.level_indicator, null);
  assert.equal(feedback_payload.global_result.single_task_scale_claim_allowed, false);
  assert.equal(feedback_payload.global_result.disclaimer, DRALO_RESULT_DISCLAIMER);

  const leaking = loosen(feedback_payload);
  (leaking.criterion_feedback as Array<Record<string, unknown>>)[0].summary =
    'You are above 12/20, so you have passed.';
  assert.ok(validate(leaking).length > 0);
});

// ---------------------------------------------------------------------------
// G–K: opening strengths
// ---------------------------------------------------------------------------

test('G — no genuine strength means no opening strength', async () => {
  const withoutStrengths = {
    ...OBSERVATIONS,
    observations: OBSERVATIONS.observations.filter((o) => o.polarity !== 'positive'),
  };
  const { feedback_payload } = await compose(llmFeedback({ opening_strengths: [] }), {
    observations: withoutStrengths,
  });
  assert.equal(feedback_payload.opening_strengths.length, 0);
});

test('H — one genuine strength yields one', async () => {
  const { feedback_payload } = await compose();
  assert.equal(feedback_payload.opening_strengths.length, 1);
  assert.equal(feedback_payload.opening_strengths[0].observation_id, STRENGTH_ID);
});

test('I — with several genuine strengths the opening shows two or three', async () => {
  const rich = await observationsWithStrengths([
    'Fast food is very popular today',
    'However, I believe it is harmful for our health',
    'In conclusion, we should reduce fast food',
    'it is cheap and quick',
  ]);
  const ids = rich.observations
    .filter((o) => o.polarity === 'positive')
    .map((o) => o.observation_id);
  assert.equal(ids.length, 4);

  const select = (count: number) =>
    llmFeedback({
      annotations: [],
      review_next: [],
      opening_strengths: ids.slice(0, count).map((id, i) => ({
        observation_id: id,
        headline: `Strength ${i + 1}`,
        explanation: 'Specific, evidence-based praise.',
      })),
    });

  for (const count of [2, 3]) {
    const { feedback_payload } = await compose(select(count), { observations: rich });
    assert.equal(feedback_payload.opening_strengths.length, count);
  }

  // Four is an invalid generation. Code must not decide which one to drop.
  await assert.rejects(
    () => compose(select(4), { observations: rich }),
    (error: Error) =>
      error instanceof FeedbackValidationError &&
      error.failures.some((f) => f.includes('two or three must be shown')),
  );

  // Under-selection is equally a generation problem, not something to pad.
  await assert.rejects(
    () => compose(select(1), { observations: rich }),
    FeedbackValidationError,
  );
});

test('I — over-selection is retryable and points the retry at feedback', async () => {
  const rich = await observationsWithStrengths([
    'Fast food is very popular today',
    'However, I believe it is harmful for our health',
    'In conclusion, we should reduce fast food',
    'it is cheap and quick',
  ]);
  const ids = rich.observations
    .filter((o) => o.polarity === 'positive')
    .map((o) => o.observation_id);

  const { feedback_payload } = await compose(
    llmFeedback({
      annotations: [],
      review_next: [],
      opening_strengths: ids.slice(0, 3).map((id, i) => ({
        observation_id: id,
        headline: `Strength ${i + 1}`,
        explanation: 'Specific, evidence-based praise.',
      })),
    }),
    { observations: rich },
  );

  const overselected = loosen(feedback_payload);
  (overselected.opening_strengths as Array<Record<string, unknown>>).push({
    strength_id: 'str_4',
    observation_id: ids[3],
    headline: 'A fourth strength.',
    explanation: 'Also genuine, but the opening is not the place for it.',
  });

  const failures = validateFeedbackPayload({
    feedback_payload: overselected,
    assessment_record: assessment().assessment_record,
    candidate_response: CANDIDATE,
    observations: rich,
  });
  const overSelection = failures.find((f) => f.rule_id === 'V-FB-07');
  assert.ok(overSelection, 'over-selection must fail V-FB-07');
  assert.equal(overSelection!.severity, 'retryable_generation_failure');

  const result = buildValidationResult(failures, { stage: 'feedback' });
  assert.equal(result.validation_status, 'retry_required');
  assert.equal(result.retry_target, 'feedback');
});

test('J, K — praise must point at real positive evidence', async () => {
  await assert.rejects(
    () => compose(llmFeedback({
      opening_strengths: [
        { observation_id: 'obs_invented', headline: 'Great job!', explanation: 'Well done.' },
      ],
    })),
    FeedbackValidationError,
  );

  // Praising a negative observation is manufactured praise by another route.
  await assert.rejects(
    () => compose(llmFeedback({
      opening_strengths: [
        { observation_id: GRAMMAR_ID, headline: 'Excellent grammar!', explanation: 'Flawless.' },
      ],
    })),
    FeedbackValidationError,
  );
});

// ---------------------------------------------------------------------------
// L–S: annotations
// ---------------------------------------------------------------------------

test('L, M, N, O — explanation depth follows the issue and a strength carries no correction', async () => {
  const { feedback_payload } = await compose(
    llmFeedback({
      annotations: [
        {
          observation_id: GRAMMAR_ID,
          feedback_kind: 'correction',
          local_explanation: 'Third person singular needs -s.',
          suggested_change: 'My friend eats fast food',
          teaching_prompt: null,
        },
        {
          observation_id: STRENGTH_ID,
          feedback_kind: 'strength',
          local_explanation: 'This contrast tells the reader exactly where your opinion starts.',
          suggested_change: null,
          teaching_prompt: null,
        },
      ],
    }),
  );

  const correction = feedback_payload.annotations.find((a) => a.feedback_kind === 'correction');
  const strength = feedback_payload.annotations.find((a) => a.feedback_kind === 'strength');
  assert.ok(correction?.suggested_change, 'a correction states the corrected form');
  assert.equal(strength?.suggested_change, undefined, 'a strength carries no correction');
  assert.deepEqual(validate(feedback_payload), []);

  // A correction with no corrected form is not a correction.
  await assert.rejects(
    () => compose(llmFeedback({
      annotations: [
        {
          observation_id: GRAMMAR_ID,
          feedback_kind: 'correction',
          local_explanation: 'Something is wrong here.',
          suggested_change: null,
          teaching_prompt: null,
        },
      ],
    })),
    FeedbackValidationError,
  );
});

test('P — an unbindable observation cannot become an annotation', async () => {
  const { annotatable } = selectAnnotatable(OBSERVATIONS.observations, CANDIDATE);
  assert.equal(annotatable.some((a) => a.observation_id === UNBINDABLE_ID), false);

  await assert.rejects(
    () => compose(llmFeedback({
      annotations: [
        {
          observation_id: UNBINDABLE_ID,
          feedback_kind: 'suggestion',
          local_explanation: 'Try a more natural phrase.',
          suggested_change: null,
          teaching_prompt: null,
        },
      ],
    })),
    FeedbackValidationError,
  );
});

test('Q — a global appropriacy observation stays global', () => {
  const { annotatable, global } = selectAnnotatable(OBSERVATIONS.observations, CANDIDATE);
  assert.equal(annotatable.some((a) => a.observation_id === GLOBAL_ID), false);
  assert.ok(global.some((g) => g.observation_id === GLOBAL_ID));

  // Doc 04 defines no honest local category for these domains.
  for (const domain of GLOBAL_ONLY_DOMAINS) {
    assert.equal(projectDomainToCategory(domain), null);
  }
});

test('R — annotation offsets reproduce the candidate text and match the observation', async () => {
  const { feedback_payload } = await compose();
  for (const annotation of feedback_payload.annotations) {
    assert.equal(
      CANDIDATE.slice(annotation.span_start, annotation.span_end),
      annotation.original_text,
    );
    const source = OBSERVATIONS.observations.find(
      (o) => o.observation_id === annotation.observation_id,
    );
    assert.equal(annotation.span_start, source?.span_start);
    assert.equal(annotation.span_end, source?.span_end);
  }

  const forged = loosen(feedback_payload);
  (forged.annotations as Array<Record<string, unknown>>)[0].span_start = 0;
  assert.ok(ruleIds(validate(forged)).includes('V-FB-04'));
});

test('S — the payload carries no colour or styling', async () => {
  const { feedback_payload } = await compose();
  assert.deepEqual(findForbiddenStylingKeys(feedback_payload), []);

  const styled = loosen(feedback_payload);
  (styled.annotations as Array<Record<string, unknown>>)[0].color = '#ff0000';
  assert.ok(validate(styled).length > 0);
});

test('the six categories are closed and the projection never invents a seventh', () => {
  for (const category of Object.values(DOMAIN_TO_CATEGORY)) {
    assert.ok((WRITING_CATEGORY_KEYS as readonly string[]).includes(category as string));
  }
  assert.equal(WRITING_CATEGORY_KEYS.length, 6);
});

// ---------------------------------------------------------------------------
// T, U: the student's writing stays the student's
// ---------------------------------------------------------------------------

test('T — a suggestion that changes the student’s opinion is rejected', async () => {
  await assert.rejects(
    () => compose(llmFeedback({
      annotations: [
        {
          observation_id: GRAMMAR_ID,
          feedback_kind: 'correction',
          local_explanation: 'Rephrased.',
          suggested_change: 'My friend does not eat fast food',
          teaching_prompt: null,
        },
      ],
    })),
    (error: Error) =>
      error instanceof FeedbackValidationError &&
      error.failures.some((f) => f.includes('preserve')),
  );
});

test('U — an improved or rewritten version is rejected', async () => {
  for (const phrase of [
    'Here is a stronger B2 version of your essay.',
    'Compare yours with this model answer.',
    'Here is the rewritten version.',
  ]) {
    await assert.rejects(
      () => compose(llmFeedback({
        criterion_feedback: llmFeedback().criterion_feedback.map((row, i) =>
          i === 0 ? { ...row, next_focus: phrase } : row,
        ),
      })),
      FeedbackValidationError,
      phrase,
    );
  }
});

// ---------------------------------------------------------------------------
// V–Y: progressive disclosure
// ---------------------------------------------------------------------------

test('V, W — every criterion has a summary and a structurally richer expanded layer', async () => {
  const { feedback_payload } = await compose();
  assert.equal(feedback_payload.criterion_feedback.length, 4);

  for (const row of feedback_payload.criterion_feedback) {
    assert.ok(row.summary.length > 0);
    assert.ok(row.expanded.what_worked.length > 0);
    assert.ok(row.expanded.what_limited_the_band.length > 0);
    assert.ok(row.expanded.next_focus.length > 0);
    const expandedLength =
      row.expanded.what_worked.length +
      row.expanded.what_limited_the_band.length +
      row.expanded.next_focus.length;
    assert.ok(expandedLength > row.summary.length, `${row.criterion} expanded must add substance`);
  }
});

test('X — criterion evidence comes from the assessment record, not from the composer', async () => {
  const { feedback_payload } = await compose();
  const content = feedback_payload.criterion_feedback.find((r) => r.criterion === 'content')!;
  assert.equal(content.expanded.evidence.length, 1);
  assert.equal(content.expanded.evidence[0].bound_text, CRITERION_EVIDENCE.content);
  assert.equal(
    CANDIDATE.slice(
      content.expanded.evidence[0].span_start,
      content.expanded.evidence[0].span_end,
    ),
    CRITERION_EVIDENCE.content,
  );

  // An index the assessment never produced cannot become a quotation.
  await assert.rejects(
    () => compose(llmFeedback({
      criterion_feedback: llmFeedback().criterion_feedback.map((row) => ({
        ...row,
        evidence_indices: [7],
      })),
    })),
    FeedbackValidationError,
  );
});

test('Y — band 5 feedback consolidates and never invents a band 6', async () => {
  const topBand = assessment([5, 5, 5, 5]);
  const { feedback_payload } = await compose(llmFeedback(), { assessment: topBand });
  assert.equal(feedback_payload.global_result.raw_total, 20);
  assert.deepEqual(validate(feedback_payload, topBand.assessment_record), []);

  await assert.rejects(
    () => compose(
      llmFeedback({
        criterion_feedback: llmFeedback().criterion_feedback.map((row, i) =>
          i === 0 ? { ...row, next_focus: 'Aim for band 6 next time.' } : row,
        ),
      }),
      { assessment: topBand },
    ),
    FeedbackValidationError,
  );
});

// ---------------------------------------------------------------------------
// Z–AB: review next and the CTA
// ---------------------------------------------------------------------------

test('Z, AA — review items are traceable and carry no links in v1', async () => {
  const { feedback_payload } = await compose();
  for (const item of feedback_payload.review_next) {
    assert.equal(item.resource_key, null);
    assert.ok(item.source_ids.length > 0);
    assert.equal(JSON.stringify(item).includes('http'), false);
  }

  await assert.rejects(
    () => compose(llmFeedback({
      review_next: [
        {
          concept: 'Invented',
          reason: 'Untraceable.',
          source: 'observation',
          source_ids: ['obs_does_not_exist'],
        },
      ],
    })),
    FeedbackValidationError,
  );
});

test('AB — the final action is exactly the approved constant', async () => {
  const { feedback_payload } = await compose();
  assert.equal(feedback_payload.final_cta, FINAL_CTA);
  assert.equal(feedback_payload.final_cta, 'Write another task');

  const swapped = loosen(feedback_payload);
  swapped.final_cta = 'Save progress';
  assert.ok(ruleIds(validate(swapped)).includes('V-FB-09'));
});

test('AL — mechanical next_focus copies are rejected', async () => {
  const { feedback_payload } = await compose();
  const payload = loosen(feedback_payload);
  const row = payload.criterion_feedback[0];
  row.expanded.next_focus =
    'To move closer to the next band, work on the health argument is asserted rather than developed with a concrete consequence.';
  assert.ok(ruleIds(validate(payload)).includes('V-FB-15'));
});

test('AM — duplicate substantive review_next reasons are rejected', async () => {
  await assert.rejects(
    () =>
      compose(
        llmFeedback({
          review_next: [
            {
              concept: 'Third person singular -s',
              reason: 'It slipped once and it is worth a quick check before you submit.',
              source: 'observation',
              source_ids: [GRAMMAR_ID],
            },
            {
              concept: 'Spelling slips',
              reason: 'It slipped once and it is worth a quick check before you submit.',
              source: 'observation',
              source_ids: [GRAMMAR_ID],
            },
          ],
        }),
      ),
    FeedbackValidationError,
  );

  const { feedback_payload } = await compose();
  const generic = loosen(feedback_payload);
  generic.review_next[0].reason =
    'It appeared in this response and it is the kind of detail an examiner notices immediately.';
  assert.ok(ruleIds(validate(generic)).includes('V-FB-16'));
});

// ---------------------------------------------------------------------------
// AC–AF: learner history
// ---------------------------------------------------------------------------

test('AC — with no history there are no longitudinal claims', async () => {
  const { feedback_payload, history_applied } = await compose();
  assert.equal(history_applied, false);
  assert.equal(feedback_payload.learner_history_applied, false);

  for (const claim of [
    'You always forget the third person -s.',
    'You keep making this mistake.',
    'We worked on this before.',
    'You have improved since your last essay.',
  ]) {
    await assert.rejects(
      () => compose(llmFeedback({
        annotations: [
          {
            observation_id: GRAMMAR_ID,
            feedback_kind: 'explanation',
            local_explanation: claim,
            suggested_change: null,
            teaching_prompt: null,
          },
        ],
      })),
      FeedbackValidationError,
      claim,
    );
  }
});

test('AD — a verified overlay permits an evidence-backed recurrence claim', async () => {
  const history = {
    entries: [
      {
        observation_id: GRAMMAR_ID,
        confirmed_historical_recurrence: true,
        previously_taught: true,
        improvement_signal: 'unchanged' as const,
        history_evidence_ids: ['hist-2026-06-01', 'hist-2026-07-14'],
      },
    ],
  };

  const { feedback_payload, history_applied } = await compose(
    llmFeedback({
      annotations: [
        {
          observation_id: GRAMMAR_ID,
          feedback_kind: 'explanation',
          local_explanation: 'You keep making this slip, and we have looked at it before.',
          suggested_change: null,
          teaching_prompt: null,
        },
      ],
    }),
    { learner_history: history },
  );

  assert.equal(history_applied, true);
  assert.equal(feedback_payload.learner_history_applied, true);
  assert.deepEqual(validate(feedback_payload), []);

  // Without evidence the same claim is not permitted by the contract.
  assert.throws(
    () =>
      buildHistoryOverlay(
        OBSERVATIONS.observations,
        {
          entries: [
            {
              observation_id: GRAMMAR_ID,
              confirmed_historical_recurrence: true,
              previously_taught: false,
              improvement_signal: 'unknown' as const,
              history_evidence_ids: [],
            },
          ],
        },
        assessment().assessment_record,
      ),
    HistoryBoundaryError,
  );
});

test('AE — history enrichment leaves the assessment record byte-identical', async () => {
  const result = assessment();
  const before = JSON.stringify(result.assessment_record);
  const observationsBefore = JSON.stringify(OBSERVATIONS);

  await compose(llmFeedback(), {
    assessment: result,
    learner_history: {
      entries: [
        {
          observation_id: GRAMMAR_ID,
          confirmed_historical_recurrence: true,
          previously_taught: false,
          improvement_signal: 'unknown' as const,
          history_evidence_ids: ['hist-1'],
        },
      ],
    },
  });

  assert.equal(JSON.stringify(result.assessment_record), before);
  assert.equal(JSON.stringify(OBSERVATIONS), observationsBefore);
});

test('AF — history can reorder emphasis but never the total', async () => {
  const withHistory = await compose(llmFeedback(), {
    learner_history: {
      entries: [
        {
          observation_id: GRAMMAR_ID,
          confirmed_historical_recurrence: true,
          previously_taught: true,
          improvement_signal: 'regressed' as const,
          history_evidence_ids: ['hist-1'],
        },
      ],
    },
  });
  const without = await compose();

  assert.equal(
    withHistory.feedback_payload.global_result.raw_total,
    without.feedback_payload.global_result.raw_total,
  );
  assert.deepEqual(
    withHistory.feedback_payload.global_result.criteria,
    without.feedback_payload.global_result.criteria,
  );

  // Emphasis is exactly what it may change.
  assert.ok(
    historyPriorityBoost({
      observation_id: GRAMMAR_ID,
      confirmed_historical_recurrence: true,
      previously_taught: true,
      improvement_signal: 'regressed',
      history_evidence_ids: ['hist-1'],
    }) > 0,
  );
  assert.equal(supportsLongitudinalClaim(undefined), false);
});

test('history carrying scoring information is refused at the boundary', () => {
  assert.throws(
    () =>
      buildHistoryOverlay(
        OBSERVATIONS.observations,
        {
          entries: [],
          // A previous mark is exactly what must never travel with history.
          previous_scores: [11],
        } as never,
        assessment().assessment_record,
      ),
    HistoryBoundaryError,
  );

  assert.throws(
    () =>
      buildHistoryOverlay(
        OBSERVATIONS.observations,
        { entries: [] },
        { status: 'incomplete', incomplete_reason: 'No task.' } as never,
      ),
    HistoryBoundaryError,
  );
});

// ---------------------------------------------------------------------------
// AG–AK: selectivity, voice and the validation boundary
// ---------------------------------------------------------------------------

test('AG — a meaning-blocking issue cannot be quietly dropped', async () => {
  const blocking = await extractObservations(
    { candidate_response: CANDIDATE, task_analysis: TASK_ANALYSIS },
    {
      llm: {
        async generate() {
          return {
            base_correction_strategy: 'focused',
            principal_focus: 'grammar',
            strategy_rationale: 'Grammar deserves the main attention.',
            observations: [
              observationItem({
                communicative_impact: 'blocked',
                diagnosis: 'The reader cannot recover who eats the food.',
              }),
            ],
          };
        },
      },
    },
  );

  await assert.rejects(
    () =>
      compose(llmFeedback({ annotations: [], opening_strengths: [], review_next: [] }), {
        observations: blocking,
      }),
    (error: Error) =>
      error instanceof FeedbackValidationError &&
      error.failures.some((f) => f.includes('meaning-blocking')),
  );
});

test('AH, AI — there is no correction quota and no mandatory category mix', async () => {
  const single = await compose(
    llmFeedback({
      annotations: [
        {
          observation_id: GRAMMAR_ID,
          feedback_kind: 'correction',
          local_explanation: 'Third person singular needs -s.',
          suggested_change: 'My friend eats fast food',
          teaching_prompt: null,
        },
      ],
    }),
  );
  assert.equal(single.feedback_payload.annotations.length, 1);

  const none = await compose(
    llmFeedback({ annotations: [], review_next: [] }),
  );
  assert.equal(none.feedback_payload.annotations.length, 0);
  assert.equal(none.feedback_payload.review_next.length, 0);
  assert.deepEqual(validate(none.feedback_payload), []);

  const categories = new Set(single.feedback_payload.annotations.map((a) => a.category_key));
  assert.equal(categories.size, 1, 'one category is a valid outcome');
});

test('AJ — feedback claims no Cambridge affiliation and never speaks as a machine', async () => {
  for (const phrase of [
    'As an AI, I would suggest a clearer topic sentence.',
    'An official Cambridge examiner awarded this result.',
    'According to the system, your organisation is weak.',
  ]) {
    await assert.rejects(
      () => compose(llmFeedback({
        criterion_feedback: llmFeedback().criterion_feedback.map((row, i) =>
          i === 0 ? { ...row, summary: phrase } : row,
        ),
      })),
      FeedbackValidationError,
      phrase,
    );
  }

  const { feedback_payload } = await compose();
  assert.deepEqual(findFeedbackTextIssues(feedback_payload, false), []);
  assert.ok(feedback_payload.global_result.disclaimer.includes('not an official Cambridge result'));
});

test('AK — engine validation status can never be read as a learner outcome', async () => {
  const { feedback_payload } = await compose();
  const serialised = JSON.stringify(feedback_payload);
  assert.equal(/"passed"/.test(serialised), false);
  assert.equal(/validation_status/.test(serialised), false);
  assert.deepEqual(findForbiddenV3FieldKeys(feedback_payload), []);
});

// ---------------------------------------------------------------------------
// Contract and configuration guards
// ---------------------------------------------------------------------------

test('feedback cannot be composed for an incomplete assessment', () => {
  assert.throws(
    () => copyFrozenAssessmentResult({ status: 'incomplete', incomplete_reason: 'No task.' } as never),
    FeedbackValidationError,
  );
});

test('composition requires an injected pinned model and makes exactly one call', async () => {
  await assert.rejects(
    () =>
      composeFeedback({
        candidate_response: CANDIDATE,
        task_analysis: TASK_ANALYSIS,
        observations: OBSERVATIONS,
        assessment: assessment(),
      } as never),
    /explicitly injected model client/,
  );

  await assert.rejects(
    () =>
      composeFeedback(
        {
          candidate_response: CANDIDATE,
          task_analysis: TASK_ANALYSIS,
          observations: OBSERVATIONS,
          assessment: assessment(),
          model_config: { model: 'gpt-4o', temperature: 0, response_format: 'json_schema' },
        } as never,
        { llm: fakeLlm(llmFeedback()) },
      ),
    /pinned dated model snapshot/,
  );

  const counter = { calls: 0 };
  await composeFeedback(
    {
      candidate_response: CANDIDATE,
      task_analysis: TASK_ANALYSIS,
      observations: OBSERVATIONS,
      assessment: assessment(),
    } as never,
    { llm: fakeLlm(llmFeedback(), counter) },
  );
  assert.equal(counter.calls, 1);
});

test('the composition prompt offers the model no field for a mark', async () => {
  const { FEEDBACK_JSON_SCHEMA } = await import('../prompts/feedback-composition.prompt');
  const serialised = JSON.stringify(FEEDBACK_JSON_SCHEMA);
  for (const forbidden of ['mark', 'raw_total', 'band', 'score']) {
    assert.equal(serialised.includes(`"${forbidden}"`), false, `${forbidden} must not be requestable`);
  }
});
