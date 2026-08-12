import test from 'node:test';
import assert from 'node:assert/strict';
import { WRITING_CATEGORY_KEYS, writingCategoryKeySchema } from '../domain/categories';
import {
  PROMPT_VERSIONS,
  SCHEMA_VERSION,
  SOURCE_DOC_VERSIONS,
  TASK_ANALYSIS_SCHEMA_VERSION,
  WRITING_ENGINE_VERSION,
} from '../domain/engine-version';
import {
  CAMBRIDGE_CRITERION_KEYS,
  DRALO_RESULT_DISCLAIMER,
  FINAL_CTA,
  assessmentRecordInputSchema,
  assessmentRecordSchema,
  buildDefaultVersionProvenance,
  buildTaskAnalysisCacheIdentity,
  criterionDecisionRecordSchema,
  criterionFeedbackSchema,
  criterionMarkSchema,
  feedbackPayloadSchema,
  finalizeAssessmentRecord,
  findForbiddenAssessmentHistoryKeys,
  findForbiddenStylingKeys,
  findForbiddenV3FieldKeys,
  globalResultSchema,
  sumCriterionMarks,
  taskAnalysisCacheIdentitySchema,
  taskAnalysisSchema,
  validateOpeningStrengthsCardinality,
  validateOpeningStrengthsEvidence,
  writingAnnotationSchema,
} from '../domain/schemas';

const MODEL = {
  model: 'gpt-4o-2024-08-06',
  snapshot_id: 'gpt-4o-2024-08-06',
  temperature: 0,
  response_format: 'json_schema',
};

function baseCriterionDecision(
  criterion: 'content' | 'communicative_achievement' | 'organisation' | 'language',
  mark: number,
) {
  const record = {
    criterion,
    mark,
    band_anchor: `Band ${mark} anchor for ${criterion}.`,
    positive_evidence: mark >= 1 ? [`Positive evidence for ${criterion}.`] : [],
    limiting_evidence: mark >= 1 && mark <= 4 ? [`Limiting evidence for ${criterion}.`] : [],
    text_evidence: [
      {
        quote: `Evidence for ${criterion}.`,
        occurrence_index: 0,
        span_start: 0,
        span_end: 10,
        bound_text: `Evidence f`,
      },
    ],
    why_not_higher: mark === 5 ? 'No meaningful limiting evidence observed.' : 'Higher band not reached.',
    why_not_lower:
      mark >= 1 ? 'Lower band avoided because performance exceeds that descriptor.' : undefined,
    adjacent_band_evidence:
      mark === 2 || mark === 4
        ? {
            lower_band_reference: `${criterion}.band_${mark - 1}`,
            lower_band_evidence: `Band ${mark - 1} evidence for ${criterion}.`,
            higher_band_reference: `${criterion}.band_${mark + 1}`,
            higher_band_evidence: `Band ${mark + 1} evidence for ${criterion}.`,
          }
        : undefined,
    band_ceiling_reached: mark === 5,
    band_floor_reached: mark === 0,
    confidence: 'high' as const,
    source_rule_ids: ['A04'],
    evidence_observation_ids: [],
  };
  return record;
}

function buildCriteria(marks: [number, number, number, number]) {
  return {
    content: baseCriterionDecision('content', marks[0]),
    communicative_achievement: baseCriterionDecision('communicative_achievement', marks[1]),
    organisation: baseCriterionDecision('organisation', marks[2]),
    language: baseCriterionDecision('language', marks[3]),
  };
}

// ---------------------------------------------------------------------------
// 1. Cambridge criterion marks
// ---------------------------------------------------------------------------

test('criterionMarkSchema accepts integers 0–5 only', () => {
  for (const mark of [0, 1, 2, 3, 4, 5]) {
    assert.equal(criterionMarkSchema.safeParse(mark).success, true);
  }
});

test('criterionMarkSchema rejects 3.5', () => {
  assert.equal(criterionMarkSchema.safeParse(3.5).success, false);
});

test('criterionMarkSchema rejects out-of-range integers', () => {
  assert.equal(criterionMarkSchema.safeParse(-1).success, false);
  assert.equal(criterionMarkSchema.safeParse(6).success, false);
});

// ---------------------------------------------------------------------------
// 2. Exactly four assessment criteria
// ---------------------------------------------------------------------------

test('CAMBRIDGE_CRITERION_KEYS are exactly the four Cambridge criteria', () => {
  assert.deepEqual(CAMBRIDGE_CRITERION_KEYS, [
    'content',
    'communicative_achievement',
    'organisation',
    'language',
  ]);
});

// ---------------------------------------------------------------------------
// 3. raw_total
// ---------------------------------------------------------------------------

test('assessmentRecordInputSchema omits raw_total — not an independent scoring field', () => {
  const withRawTotal = assessmentRecordInputSchema.safeParse({
    status: 'complete',
    criteria: buildCriteria([3, 3, 4, 3]),
    max_total: 20,
    single_task_scale_claim_allowed: false,
    raw_total: 13,
  });
  assert.equal(withRawTotal.success, false);
});

test('finalizeAssessmentRecord computes raw_total as sum of four marks', () => {
  const input = assessmentRecordInputSchema.parse({
    status: 'complete',
    criteria: buildCriteria([3, 3, 4, 3]),
    max_total: 20,
    single_task_scale_claim_allowed: false,
  });
  const record = finalizeAssessmentRecord(input);
  assert.equal(record.raw_total, 13);
  assert.equal(sumCriterionMarks(record.criteria!), 13);
});

test('assessmentRecordSchema rejects raw_total that does not equal criterion sum', () => {
  const input = assessmentRecordInputSchema.parse({
    status: 'complete',
    criteria: buildCriteria([3, 3, 4, 3]),
    max_total: 20,
    single_task_scale_claim_allowed: false,
  });
  const bad = { ...input, raw_total: 12 };
  assert.equal(assessmentRecordSchema.safeParse(bad).success, false);
});

test('assessmentRecordSchema enforces max_total of 20', () => {
  const input = finalizeAssessmentRecord(
    assessmentRecordInputSchema.parse({
      status: 'complete',
      criteria: buildCriteria([5, 5, 5, 5]),
      max_total: 20,
      single_task_scale_claim_allowed: false,
    }),
  );
  assert.equal(input.raw_total, 20);
  assert.equal(input.max_total, 20);
});

// ---------------------------------------------------------------------------
// 4. Band reasoning
// ---------------------------------------------------------------------------

test('criterionDecisionRecordSchema requires why_not_higher', () => {
  const base = baseCriterionDecision('content', 3);
  const { why_not_higher: _, ...without } = base;
  assert.equal(
    criterionDecisionRecordSchema.safeParse({ ...without, why_not_higher: '' }).success,
    false,
  );
});

test('criterionDecisionRecordSchema requires why_not_lower for marks 1–5', () => {
  const record = baseCriterionDecision('content', 3);
  const { why_not_lower: _, ...without } = record;
  assert.equal(criterionDecisionRecordSchema.safeParse(without).success, false);
});

test('criterionDecisionRecordSchema requires adjacent_band_evidence for bands 2 and 4', () => {
  for (const mark of [2, 4]) {
    const record = {
      ...baseCriterionDecision('content', mark),
      adjacent_band_evidence: undefined,
    };
    assert.equal(criterionDecisionRecordSchema.safeParse(record).success, false);
  }
});

// ---------------------------------------------------------------------------
// 5. Single-writing safeguards
// ---------------------------------------------------------------------------

function buildGlobalResult(overrides: Record<string, unknown> = {}) {
  return {
    criteria: { content: 3, communicative_achievement: 3, organisation: 4, language: 3 },
    raw_total: 13,
    max_total: 20,
    level_indicator: null,
    single_task_scale_claim_allowed: false,
    disclaimer: DRALO_RESULT_DISCLAIMER,
    ...overrides,
  };
}

test('v3 contracts contain no passed/required/readiness/cefr fields', () => {
  const samplePayload = {
    engine_version: WRITING_ENGINE_VERSION,
    schema_version: SCHEMA_VERSION,
    provenance: buildDefaultVersionProvenance(MODEL),
    global_result: buildGlobalResult(),
    criterion_feedback: CAMBRIDGE_CRITERION_KEYS.map((criterion, i) => ({
      criterion,
      mark: [3, 3, 4, 3][i],
      summary: 'Summary.',
      expanded: {
        what_worked: 'The argument is easy to follow.',
        what_limited_the_band: 'Supporting detail stays general.',
        evidence: [],
        next_focus: 'Add one concrete example per idea.',
      },
    })),
    opening_strengths: [],
    annotations: [],
    review_next: [
      {
        review_id: 'rev1',
        concept: 'Development',
        reason: 'Add specific examples.',
        source: 'observation' as const,
        source_ids: ['obs-1'],
        resource_key: null,
      },
    ],
    final_cta: FINAL_CTA,
    resource_key: null,
    learner_history_applied: false,
  };
  assert.deepEqual(findForbiddenV3FieldKeys(samplePayload), []);
  assert.equal(feedbackPayloadSchema.safeParse(samplePayload).success, true);
});

test('global_result enforces level_indicator null and single_task_scale_claim_allowed false', () => {
  assert.equal(globalResultSchema.safeParse(buildGlobalResult()).success, true);
  assert.equal(
    globalResultSchema.safeParse(buildGlobalResult({ level_indicator: 'B2' })).success,
    false,
  );
  assert.equal(
    globalResultSchema.safeParse(buildGlobalResult({ single_task_scale_claim_allowed: true }))
      .success,
    false,
  );
  // The total is a copy of four frozen marks, so it cannot disagree with them.
  assert.equal(globalResultSchema.safeParse(buildGlobalResult({ raw_total: 14 })).success, false);
});

// ---------------------------------------------------------------------------
// 6. Interactive Writing Map categories
// ---------------------------------------------------------------------------

test('writingCategoryKeySchema accepts exactly six closed keys', () => {
  for (const key of WRITING_CATEGORY_KEYS) {
    assert.equal(writingCategoryKeySchema.safeParse(key).success, true);
  }
  assert.equal(writingCategoryKeySchema.safeParse('good').success, false);
  assert.equal(writingCategoryKeySchema.safeParse('voc').success, false);
  assert.equal(writingCategoryKeySchema.safeParse('punctuation').success, false);
});

// ---------------------------------------------------------------------------
// 7. Semantic category independence
// ---------------------------------------------------------------------------

test('domain annotation schema rejects styling fields', () => {
  const base = {
    annotation_id: 'ann-1',
    observation_id: 'obs-1',
    category_key: 'grammar',
    span_start: 0,
    span_end: 5,
    original_text: 'Fast ',
    feedback_kind: 'explanation',
    local_explanation: 'Fix agreement.',
  };
  assert.equal(writingAnnotationSchema.safeParse(base).success, true);
  assert.equal(
    writingAnnotationSchema.safeParse({ ...base, color: '#ff0000' }).success,
    false,
  );
  assert.equal(
    writingAnnotationSchema.safeParse({ ...base, css_class: 'writing-map-grammar' }).success,
    false,
  );
  assert.deepEqual(findForbiddenStylingKeys({ annotations: [{ hex: '#fff' }] }), ['annotations[0].hex']);
});

// ---------------------------------------------------------------------------
// 8. Opening strengths cardinality
// ---------------------------------------------------------------------------

function strength(id: string, headline: string) {
  return {
    strength_id: `s${id}`,
    observation_id: `o${id}`,
    headline,
    explanation: `Concrete evidence for ${headline}`,
  };
}

test('opening strengths cardinality follows eligible genuine strengths', () => {
  assert.equal(validateOpeningStrengthsCardinality([], 0), true);
  assert.equal(validateOpeningStrengthsCardinality([], 1), false);
  assert.equal(
    validateOpeningStrengthsCardinality(
      [strength('1', 'Clear structure.')],
      1,
    ),
    true,
  );
  assert.equal(
    validateOpeningStrengthsCardinality(
      [strength('1', 'Only one.')],
      2,
    ),
    false,
  );
  assert.equal(
    validateOpeningStrengthsCardinality(
      [strength('1', 'A.'), strength('2', 'B.')],
      2,
    ),
    true,
  );
  assert.equal(
    validateOpeningStrengthsCardinality(
      [strength('1', 'A.'), strength('2', 'B.'), strength('3', 'C.')],
      3,
    ),
    true,
  );
  assert.equal(
    validateOpeningStrengthsCardinality(
      [strength('1', 'Only one manufactured.')],
      3,
    ),
    false,
  );
});

test('opening strengths must reference strength observations — no manufactured praise', () => {
  const annotations = [
    {
      annotation_id: 'ann-s1',
      observation_id: 'obs-strength-1',
      category_key: 'strength' as const,
      span_start: 0,
      span_end: 10,
      original_text: 'Fast food ',
      feedback_kind: 'strength' as const,
      local_explanation: 'Effective contrast.',
    },
  ];
  const strengths = [
    {
      strength_id: 's1',
      observation_id: 'obs-strength-1',
      headline: 'Effective contrast.',
      explanation: '"However" moves the reader cleanly from problem to alternative.',
    },
  ];
  const strengthIds = new Set(['obs-strength-1']);
  assert.equal(validateOpeningStrengthsEvidence(strengths, annotations, strengthIds), true);
  assert.equal(
    validateOpeningStrengthsEvidence(
      [
        {
          strength_id: 's2',
          observation_id: 'obs-fake',
          headline: 'Fake praise.',
          explanation: 'No evidence behind it.',
        },
      ],
      annotations,
      strengthIds,
    ),
    false,
  );
});

// ---------------------------------------------------------------------------
// 9. Learner-history isolation
// ---------------------------------------------------------------------------

test('assessmentRecordInputSchema rejects learner-history fields', () => {
  const base = {
    status: 'complete' as const,
    criteria: buildCriteria([3, 3, 4, 3]),
    max_total: 20 as const,
    single_task_scale_claim_allowed: false as const,
    learner_history: { prior_scores: [10] },
  };
  assert.equal(assessmentRecordInputSchema.safeParse(base).success, false);
  assert.deepEqual(
    findForbiddenAssessmentHistoryKeys({ learner_context: { stage: 'B1' } }),
    ['learner_context'],
  );
});

// ---------------------------------------------------------------------------
// 10. Version / provenance
// ---------------------------------------------------------------------------

test('buildDefaultVersionProvenance pins engine, schema, doc and prompt versions', () => {
  const provenance = buildDefaultVersionProvenance(MODEL);
  assert.equal(provenance.engine_version, WRITING_ENGINE_VERSION);
  assert.equal(provenance.schema_version, SCHEMA_VERSION);
  assert.deepEqual(provenance.doc_versions, SOURCE_DOC_VERSIONS);
  assert.deepEqual(provenance.prompt_versions, PROMPT_VERSIONS);
  assert.equal(provenance.model_config.model, MODEL.model);
});

// ---------------------------------------------------------------------------
// 11. Task-analysis cache identity contract
// ---------------------------------------------------------------------------

test('taskAnalysisCacheIdentitySchema supports versioned cache fingerprint inputs', () => {
  const identity = buildTaskAnalysisCacheIdentity({
    task_content_hash: 'sha256:abc123',
    task_type: 'b2_part1_essay',
    model_config: MODEL,
  });
  assert.equal(identity.task_requirements_version, SOURCE_DOC_VERSIONS.task_requirements);
  assert.equal(identity.task_analysis_prompt_version, PROMPT_VERSIONS.task_analysis);
  assert.equal(identity.task_analysis_schema_version, TASK_ANALYSIS_SCHEMA_VERSION);
  assert.equal(taskAnalysisCacheIdentitySchema.safeParse(identity).success, true);
});

test('taskAnalysisSchema enforces automatic_penalty false', () => {
  const base = {
    task_type: 'b2_part1_essay',
    target_reader: 'English teacher',
    communicative_purpose: 'Discuss a topic with reasons',
    register: 'neutral',
    mandatory_content_points: [{ id: 'cp1', point: 'recycling' }],
    recommendations_not_requirements: ['optional hook'],
    ambiguities: [],
    word_guidance: { word_min: 140, word_max: 190, automatic_penalty: false as const },
    task_analysis_schema_version: TASK_ANALYSIS_SCHEMA_VERSION,
  };
  assert.equal(taskAnalysisSchema.safeParse(base).success, true);
  assert.equal(
    taskAnalysisSchema.safeParse({
      ...base,
      word_guidance: { automatic_penalty: true },
    }).success,
    false,
  );
});

// ---------------------------------------------------------------------------
// 12. Progressive-disclosure feedback contract
// ---------------------------------------------------------------------------

test('feedbackPayloadSchema represents Doc 04 progressive disclosure fields', () => {
  const payload = feedbackPayloadSchema.parse({
    engine_version: WRITING_ENGINE_VERSION,
    schema_version: SCHEMA_VERSION,
    provenance: buildDefaultVersionProvenance(MODEL),
    global_result: buildGlobalResult(),
    criterion_feedback: CAMBRIDGE_CRITERION_KEYS.map((criterion, i) => ({
      criterion,
      mark: [3, 3, 4, 3][i],
      summary: 'Concise criterion summary.',
      expanded: {
        what_worked: 'Ideas are relevant and the opinion is clear.',
        what_limited_the_band: 'Two of the points stay at the level of assertion.',
        evidence: [],
        next_focus: 'Ground each claim in one concrete situation.',
      },
    })),
    opening_strengths: [
      {
        strength_id: 's1',
        observation_id: 'obs-s1',
        headline: 'Clear paragraphing.',
        explanation: 'Each paragraph handles one idea, so the argument is easy to follow.',
      },
      {
        strength_id: 's2',
        observation_id: 'obs-s2',
        headline: 'Good contrast.',
        explanation: '"However" marks the shift to the counter-argument precisely.',
      },
    ],
    annotations: [
      {
        annotation_id: 'ann-1',
        observation_id: 'obs-1',
        category_key: 'vocabulary',
        span_start: 0,
        span_end: 12,
        original_text: 'is very popu',
        feedback_kind: 'suggestion',
        local_explanation: 'More natural collocation.',
        suggested_change: 'is very popular',
      },
    ],
    review_next: [
      {
        review_id: 'rev1',
        concept: 'Specific examples',
        reason: 'Develop ideas with concrete detail.',
        source: 'assessment_limitation' as const,
        source_ids: ['content'],
        resource_key: null,
      },
    ],
    final_cta: FINAL_CTA,
    resource_key: null,
    learner_history_applied: false,
  });

  assert.equal(payload.global_result.raw_total, 13);
  assert.equal(payload.criterion_feedback.length, 4);
  assert.equal(payload.opening_strengths.length, 2);
  assert.equal(payload.annotations.length, 1);
  assert.equal(payload.review_next.length, 1);
  assert.equal(payload.final_cta, 'Write another task');
});

test('criterionFeedbackSchema rejects decimal marks', () => {
  assert.equal(
    criterionFeedbackSchema.safeParse({
      criterion: 'content',
      mark: 3.5,
      summary: 'x',
      expanded: {
        what_worked: 'x',
        what_limited_the_band: 'x',
        evidence: [],
        next_focus: 'x',
      },
    }).success,
    false,
  );
});
