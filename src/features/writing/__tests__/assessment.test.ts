import test from 'node:test';
import assert from 'node:assert/strict';
import { SOURCE_DOC_VERSIONS } from '../domain/engine-version';
import {
  CAMBRIDGE_CRITERION_KEYS,
  criterionDecisionRecordSchema,
  criterionMarkSchema,
  findForbiddenAssessmentBehaviour,
  finalizeAssessmentRecord,
  sumCriterionMarks,
} from '../domain/schemas';
import type { ObservationExtractionResult, ResolvedTaskAnalysis } from '../domain/types';
import { WRITING_CATEGORY_KEYS } from '../domain/categories';
import {
  CRITERION_DESCRIPTORS,
  getBandAnchor,
  neighbouringBands,
} from '../prompts/knowledge/doc03-cambridge-descriptors';
import { GOLDEN_CASES } from '../calibration/golden-cases';
import { sumGoldenMarks } from '../calibration/compare';
import {
  DOC03_RULE_IDS,
  isDoc03RuleId,
  isRuleCitableBy,
} from '../prompts/knowledge/doc03-assessment-rules';
import { buildAssessmentPrompt } from '../prompts/assessment.prompt';
import { analyseWritingTask } from '../services/analysis/task-analysis.service';
import { extractObservations } from '../services/observation/observation.service';
import {
  AssessmentConfigurationError,
  AssessmentValidationError,
  assessWriting,
  buildEvidenceIndex,
  checkTaskContext,
  countWords,
  type AssessmentLlmClient,
} from '../services/assessment/assessment.service';

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

async function buildTaskAnalysis(options: {
  sourceText?: string;
  points?: string[];
} = {}): Promise<ResolvedTaskAnalysis> {
  const points = options.points ?? ['Health', 'Price and convenience'];
  const result = await analyseWritingTask(
    { source_task_text: options.sourceText ?? ESSAY_TASK, task_type: 'essay' },
    {
      llm: {
        async generate() {
          return {
            target_reader: 'Your English teacher',
            target_reader_evidence_quote: null,
            communicative_purpose: 'Discuss the topic and give a clear opinion',
            register: 'neutral',
            tone: null,
            mandatory_content_points: points.map((point) => ({ point, evidence_quote: null })),
            required_functions: [],
            task_specific_mandatory_conventions: [],
            ambiguities: [],
            inferred_task_type: null,
          };
        },
      },
    },
  );
  if (result.status !== 'complete') throw new Error('task analysis fixture failed');
  return result.task_analysis;
}

let TASK_ANALYSIS: ResolvedTaskAnalysis;

type Decision = Record<string, unknown>;

const EVIDENCE: Record<string, string> = {
  content: 'it is cheap and quick',
  communicative_achievement: 'However, I believe it is harmful for our health',
  organisation: 'In conclusion,',
  language: 'he feels tired',
};

function decision(
  criterion: 'content' | 'communicative_achievement' | 'organisation' | 'language',
  mark: number,
  overrides: Decision = {},
): Decision {
  const mixed = mark === 2 || mark === 4;
  return {
    criterion,
    mark,
    band_anchor: `${criterion} band ${mark} descriptor`,
    positive_evidence: mark >= 1 ? [`The response shows ${criterion} strength at band ${mark}.`] : [],
    limiting_evidence:
      mark >= 1 && mark <= 4 ? [`The response is limited in ${criterion} at band ${mark}.`] : [],
    text_evidence: [{ quote: EVIDENCE[criterion], occurrence_index: 0 }],
    why_not_higher:
      mark === 5
        ? 'Band 5 is the highest available band and its descriptor is met.'
        : `The next band is not reached because the ${criterion} descriptor is not sustained.`,
    why_not_lower:
      mark >= 1 ? `The lower band is exceeded because ${criterion} performance is stronger.` : null,
    adjacent_band_evidence: mixed
      ? {
          lower_band_reference: `${criterion}.band_${mark - 1}`,
          lower_band_evidence: `Concrete band ${mark - 1} feature observed for ${criterion}.`,
          higher_band_reference: `${criterion}.band_${mark + 1}`,
          higher_band_evidence: `Concrete band ${mark + 1} feature observed for ${criterion}.`,
        }
      : null,
    confidence: 'high',
    confidence_reason: null,
    source_rule_ids: [criterionRule(criterion)],
    evidence_observation_ids: [],
    ...overrides,
  };
}

function criterionRule(criterion: string): string {
  return {
    content: 'C03',
    communicative_achievement: 'CA03',
    organisation: 'O01',
    language: 'L01',
  }[criterion] as string;
}

function output(marks: [number, number, number, number], overrides: Record<string, unknown> = {}) {
  return {
    assessable: true,
    unassessable_reason: null,
    overall_confidence: 'high',
    criteria: [
      decision('content', marks[0]),
      decision('communicative_achievement', marks[1]),
      decision('organisation', marks[2]),
      decision('language', marks[3]),
    ],
    ...overrides,
  };
}

function fakeLlm(payload: unknown): AssessmentLlmClient & { calls: number; last?: unknown } {
  const client = {
    calls: 0,
    last: undefined as unknown,
    async generate(request: unknown) {
      client.calls += 1;
      client.last = request;
      return payload;
    },
  };
  return client;
}

async function run(payload: unknown, extra: Record<string, unknown> = {}) {
  return assessWriting(
    { candidate_response: CANDIDATE, task_analysis: TASK_ANALYSIS, ...extra },
    { llm: fakeLlm(payload) },
  );
}

test('setup: build the task analysis fixture', async () => {
  TASK_ANALYSIS = await buildTaskAnalysis();
  assert.equal(TASK_ANALYSIS.task_type, 'essay');
});

// ---------------------------------------------------------------------------
// A–F — marks, totals and asymmetry
// ---------------------------------------------------------------------------

test('A — every criterion mark is an integer from 0 to 5', async () => {
  const result = await run(output([5, 3, 3, 3]));
  const criteria = result.assessment_record.criteria!;

  for (const key of CAMBRIDGE_CRITERION_KEYS) {
    const mark = criteria[key].mark;
    assert.equal(Number.isInteger(mark), true);
    assert.ok(mark >= 0 && mark <= 5);
  }
});

test('B — a fractional mark is rejected', async () => {
  assert.equal(criterionMarkSchema.safeParse(3.5).success, false);
  await assert.rejects(() => run(output([3.5 as unknown as number, 3, 3, 3])), AssessmentValidationError);
});

test('C — raw_total is computed by code from the four marks', async () => {
  const result = await run(output([5, 2, 2, 2]));
  const criteria = result.assessment_record.criteria!;

  assert.equal(result.assessment_record.raw_total, 11);
  assert.equal(result.assessment_record.raw_total, sumCriterionMarks(criteria));
  assert.equal(result.assessment_record.max_total, 20);
});

test('D — a total supplied by the model is discarded, never reconciled', async () => {
  const result = await run(
    output([3, 3, 3, 3], { raw_total: 20, total_score: 20, overall_mark: 20 }),
  );

  assert.equal(result.assessment_record.raw_total, 12);
  assert.equal('total_score' in result.assessment_record, false);
  assert.equal('overall_mark' in result.assessment_record, false);
});

test('E — the official 5/2/2/2 profile is accepted without smoothing', async () => {
  const result = await run(output([5, 2, 2, 2]));
  const criteria = result.assessment_record.criteria!;

  assert.deepEqual(
    CAMBRIDGE_CRITERION_KEYS.map((key) => criteria[key].mark),
    [5, 2, 2, 2],
  );
  assert.equal(result.assessment_record.raw_total, 11);
});

test('F — 5/5/4/5 is accepted without forcing Organisation up to 5', async () => {
  const result = await run(output([5, 5, 4, 5]));
  const criteria = result.assessment_record.criteria!;

  assert.equal(criteria.organisation.mark, 4);
  assert.equal(criteria.language.mark, 5);
  assert.ok(criteria.organisation.adjacent_band_evidence);
});

// ---------------------------------------------------------------------------
// G–K — criterion independence
// ---------------------------------------------------------------------------

test('G — complete content stays high while Language is weak', async () => {
  const result = await run(output([5, 2, 2, 2]));
  const criteria = result.assessment_record.criteria!;

  assert.equal(criteria.content.mark, 5);
  assert.equal(criteria.language.mark, 2);
  assert.equal(criteria.content.band_ceiling_reached, true);
});

test('H — strong Language does not repair a missing mandatory content point', async () => {
  const result = await run(
    output([3, 4, 4, 5], {
      criteria: [
        decision('content', 3, {
          limiting_evidence: ['The third required aspect is never addressed.'],
          why_not_higher: 'A mandatory point is absent, so the reader is not fully informed.',
        }),
        decision('communicative_achievement', 4),
        decision('organisation', 4),
        decision('language', 5),
      ],
    }),
  );
  const criteria = result.assessment_record.criteria!;

  assert.equal(criteria.language.mark, 5);
  assert.equal(criteria.content.mark, 3);
  assert.ok(criteria.content.why_not_higher.includes('mandatory point'));
});

test('I — a register mismatch moves Communicative Achievement without touching Language', async () => {
  const result = await run(
    output([5, 2, 4, 4], {
      criteria: [
        decision('content', 5),
        decision('communicative_achievement', 2, {
          limiting_evidence: ['The conversational stance conflicts with the register the task sets.'],
          source_rule_ids: ['CA07', 'X04'],
        }),
        decision('organisation', 4),
        decision('language', 4),
      ],
    }),
  );
  const criteria = result.assessment_record.criteria!;

  assert.equal(criteria.communicative_achievement.mark, 2);
  assert.equal(criteria.language.mark, 4);
  assert.equal(criteria.content.mark, 5);
});

test('J — weak cohesion moves Organisation without touching CA or Language', async () => {
  const result = await run(
    output([4, 4, 2, 4], {
      criteria: [
        decision('content', 4),
        decision('communicative_achievement', 4),
        decision('organisation', 2, {
          limiting_evidence: ['Ideas are presented as a list with no relationship across the text.'],
          source_rule_ids: ['O08', 'X05'],
        }),
        decision('language', 4),
      ],
    }),
  );
  const criteria = result.assessment_record.criteria!;

  assert.equal(criteria.organisation.mark, 2);
  assert.equal(criteria.communicative_achievement.mark, 4);
  assert.equal(criteria.language.mark, 4);
});

test('K — one feature may serve two criteria only through distinct rationales', async () => {
  const shared = 'The report headings group the information into labelled sections for the reader.';

  const distinct = await run(
    output([4, 4, 4, 4], {
      criteria: [
        decision('content', 4),
        decision('communicative_achievement', 4, {
          positive_evidence: ['The headings match the report genre the task requires.'],
        }),
        decision('organisation', 4, {
          positive_evidence: ['The headings create a visible route through the information.'],
        }),
        decision('language', 4),
      ],
    }),
  );
  assert.equal(distinct.assessment_record.raw_total, 16);

  await assert.rejects(
    () =>
      run(
        output([4, 4, 4, 4], {
          criteria: [
            decision('content', 4),
            decision('communicative_achievement', 4, { positive_evidence: [shared] }),
            decision('organisation', 4, { positive_evidence: [shared] }),
            decision('language', 4),
          ],
        }),
      ),
    AssessmentValidationError,
  );
});

// ---------------------------------------------------------------------------
// L–O — band boundaries
// ---------------------------------------------------------------------------

test('L — band 2 requires concrete evidence from bands 1 and 3', async () => {
  await assert.rejects(
    () =>
      run(
        output([3, 3, 3, 3], {
          criteria: [
            decision('content', 2, { adjacent_band_evidence: null }),
            decision('communicative_achievement', 3),
            decision('organisation', 3),
            decision('language', 3),
          ],
        }),
      ),
    AssessmentValidationError,
  );

  const result = await run(output([2, 3, 3, 3]));
  const evidence = result.assessment_record.criteria!.content.adjacent_band_evidence!;
  assert.equal(evidence.lower_band_reference, 'content.band_1');
  assert.equal(evidence.higher_band_reference, 'content.band_3');
  assert.deepEqual(neighbouringBands(2), { lower: 1, higher: 3 });
});

test('M — band 4 requires concrete evidence from bands 3 and 5', async () => {
  const result = await run(output([4, 3, 3, 3]));
  const evidence = result.assessment_record.criteria!.content.adjacent_band_evidence!;

  assert.equal(evidence.lower_band_reference, 'content.band_3');
  assert.equal(evidence.higher_band_reference, 'content.band_5');
  assert.ok(evidence.lower_band_evidence.length > 0);
  assert.ok(evidence.higher_band_evidence.length > 0);
  assert.deepEqual(neighbouringBands(4), { lower: 3, higher: 5 });
});

test('N — band 5 reaches the ceiling and never invents a band 6', async () => {
  const result = await run(output([5, 5, 5, 5]));
  const criteria = result.assessment_record.criteria!;

  for (const key of CAMBRIDGE_CRITERION_KEYS) {
    assert.equal(criteria[key].band_ceiling_reached, true);
    assert.equal(criteria[key].adjacent_band_evidence, undefined);
    assert.equal(/band\s*6/i.test(criteria[key].why_not_higher), false);
  }

  await assert.rejects(
    () =>
      run(
        output([5, 5, 5, 5], {
          criteria: [
            decision('content', 5, { why_not_higher: 'Band 6 would require more development.' }),
            decision('communicative_achievement', 5),
            decision('organisation', 5),
            decision('language', 5),
          ],
        }),
      ),
    AssessmentValidationError,
  );
});

test('N2 — bands 1, 3 and 5 reject adjacent_band_evidence without changing the mark', async () => {
  const illegalAdj = {
    lower_band_reference: 'band_below',
    lower_band_evidence: 'lower evidence',
    higher_band_reference: 'band_above',
    higher_band_evidence: 'higher evidence',
  };

  for (const mark of [1, 3, 5] as const) {
    await assert.rejects(
      () =>
        run(
          output([3, 3, 3, 3], {
            criteria: [
              decision('content', mark, { adjacent_band_evidence: illegalAdj }),
              decision('communicative_achievement', 3),
              decision('organisation', 3),
              decision('language', 3),
            ],
          }),
        ),
      (error: unknown) => {
        assert.ok(error instanceof AssessmentValidationError);
        assert.ok(error.message.includes(`has mark ${mark}`));
        assert.ok(error.message.includes('only permitted for marks 2 and 4'));
        assert.ok(error.message.includes('adjacent_band_evidence set to null'));
        assert.ok(error.message.includes('Do not change the mark'));
        // No silent repair: mark is still the illegal model's mark in the feedback.
        assert.ok(!error.message.includes('has mark 2'));
        return true;
      },
    );
  }
});

test('N3 — missing adjacent_band_evidence on band 2/4 is retryable and mark-preserving', async () => {
  await assert.rejects(
    () =>
      run(
        output([3, 3, 3, 3], {
          criteria: [
            decision('content', 4, { adjacent_band_evidence: null }),
            decision('communicative_achievement', 3),
            decision('organisation', 3),
            decision('language', 3),
          ],
        }),
      ),
    (error: unknown) => {
      assert.ok(error instanceof AssessmentValidationError);
      assert.ok(error.message.includes('has mark 4'));
      assert.ok(error.message.includes('REQUIRED for marks 2 and 4'));
      assert.ok(error.message.includes('do not change the mark'));
      return true;
    },
  );
});

test('N4 — generation_feedback is appended for structural retries without altering marks', async () => {
  const feedback =
    'Criterion content has mark 3. adjacent_band_evidence is only permitted for marks 2 and 4. Regenerate the criterion with adjacent_band_evidence set to null. Do not change the mark.';
  const client = fakeLlm(output([3, 3, 3, 3]));
  await assessWriting(
    {
      candidate_response: CANDIDATE,
      task_analysis: TASK_ANALYSIS,
      generation_feedback: feedback,
    },
    { llm: client },
  );
  const request = client.last as { user?: string };
  assert.ok(String(request?.user || '').includes('GENERATION CONTRACT FEEDBACK'));
  assert.ok(String(request?.user || '').includes(feedback));
});

test('O — band 0 reaches the floor and never compares with a lower band', async () => {
  const result = await run(
    output([0, 1, 1, 1], {
      criteria: [
        decision('content', 0, {
          positive_evidence: [],
          limiting_evidence: ['The response addresses a different subject entirely.'],
          why_not_lower: null,
        }),
        decision('communicative_achievement', 1),
        decision('organisation', 1),
        decision('language', 1),
      ],
    }),
  );
  const content = result.assessment_record.criteria!.content;

  assert.equal(content.band_floor_reached, true);
  assert.equal(content.why_not_lower, undefined);

  assert.equal(
    criterionDecisionRecordSchema.safeParse({
      ...contentFixture(0),
      why_not_lower: 'The band below is exceeded.',
    }).success,
    false,
  );
});

function contentFixture(mark: number) {
  return {
    criterion: 'content' as const,
    mark,
    band_anchor: 'anchor',
    positive_evidence: mark >= 1 ? ['positive'] : [],
    limiting_evidence: mark >= 1 && mark <= 4 ? ['limiting'] : [],
    text_evidence: [
      { quote: 'q', occurrence_index: 0, span_start: 0, span_end: 1, bound_text: 'F' },
    ],
    why_not_higher: 'reason',
    band_ceiling_reached: mark === 5,
    band_floor_reached: mark === 0,
    confidence: 'high' as const,
    source_rule_ids: ['C03'],
    evidence_observation_ids: [],
  };
}

// ---------------------------------------------------------------------------
// P–V — forbidden scoring behaviours
// ---------------------------------------------------------------------------

test('P — word count is contextual and carries no deduction', async () => {
  const result = await run(output([5, 5, 5, 5]));

  assert.equal(result.assessment_record.word_count, countWords(CANDIDATE));
  assert.equal(result.assessment_record.word_count_penalty_applied, false);
  assert.equal(result.assessment_record.raw_total, 20);

  await assert.rejects(
    () =>
      run(
        output([3, 3, 3, 3], {
          criteria: [
            decision('content', 3, {
              limiting_evidence: ['A word-count penalty applies because the response is short.'],
            }),
            decision('communicative_achievement', 3),
            decision('organisation', 3),
            decision('language', 3),
          ],
        }),
      ),
    AssessmentValidationError,
  );
});

test('Q — a title penalty is rejected', async () => {
  await assert.rejects(
    () =>
      run(
        output([3, 3, 3, 3], {
          criteria: [
            decision('content', 3),
            decision('communicative_achievement', 3, {
              limiting_evidence: ['A title penalty is applied for the missing heading.'],
            }),
            decision('organisation', 3),
            decision('language', 3),
          ],
        }),
      ),
    AssessmentValidationError,
  );
});

test('R — connector counting is rejected', async () => {
  await assert.rejects(
    () =>
      run(
        output([3, 3, 3, 3], {
          criteria: [
            decision('content', 3),
            decision('communicative_achievement', 3),
            decision('organisation', 3, {
              limiting_evidence: ['The response uses only 2 connectors across the whole text.'],
            }),
            decision('language', 3),
          ],
        }),
      ),
    AssessmentValidationError,
  );
});

test('S — paragraph counting is rejected', async () => {
  await assert.rejects(
    () =>
      run(
        output([3, 3, 3, 3], {
          criteria: [
            decision('content', 3),
            decision('communicative_achievement', 3),
            decision('organisation', 3, {
              limiting_evidence: ['The number of paragraphs is too low for this band.'],
            }),
            decision('language', 3),
          ],
        }),
      ),
    AssessmentValidationError,
  );
});

test('T — error counting is rejected', async () => {
  await assert.rejects(
    () =>
      run(
        output([3, 3, 3, 3], {
          criteria: [
            decision('content', 3),
            decision('communicative_achievement', 3),
            decision('organisation', 3),
            decision('language', 3, {
              limiting_evidence: ['There are 7 errors in the response.'],
            }),
          ],
        }),
      ),
    AssessmentValidationError,
  );
  await assert.rejects(
    () =>
      run(
        output([3, 3, 3, 3], {
          criteria: [
            decision('content', 3),
            decision('communicative_achievement', 3),
            decision('organisation', 3),
            decision('language', 3, {
              limiting_evidence: ['The error count places this below the anchor.'],
            }),
          ],
        }),
      ),
    AssessmentValidationError,
  );
});

test('U — no CEFR level or Cambridge Scale claim leaves this layer', async () => {
  const result = await run(output([4, 4, 4, 4]));
  const serialised = JSON.stringify(result);

  assert.equal(/cefr/i.test(serialised), false);
  assert.equal(/cambridge english scale/i.test(serialised), false);
  assert.equal(result.assessment_record.single_task_scale_claim_allowed, false);

  await assert.rejects(
    () =>
      run(
        output([4, 4, 4, 4], {
          criteria: [
            decision('content', 4, { positive_evidence: ['This is a CEFR B2 performance.'] }),
            decision('communicative_achievement', 4),
            decision('organisation', 4),
            decision('language', 4),
          ],
        }),
      ),
    AssessmentValidationError,
  );
});

test('V — no pass/fail judgement and no 12/20 threshold', async () => {
  const result = await run(output([3, 3, 3, 3]));
  const serialised = JSON.stringify(result);

  assert.equal(/\bpass(ed)?\b/i.test(serialised), false);
  assert.equal(/12\s*\/\s*20/.test(serialised), false);
  assert.equal('passed' in result.assessment_record, false);

  for (const rationale of ['The candidate passed / failed this task.', 'This is above 12/20.']) {
    await assert.rejects(
      () =>
        run(
          output([3, 3, 3, 3], {
            criteria: [
              decision('content', 3, { positive_evidence: [rationale] }),
              decision('communicative_achievement', 3),
              decision('organisation', 3),
              decision('language', 3),
            ],
          }),
        ),
      AssessmentValidationError,
    );
  }
});

test('W — learner history cannot be passed into the assessment', async () => {
  for (const key of ['learner_history', 'course_stage', 'previous_marks', 'exam_date']) {
    await assert.rejects(
      () =>
        assessWriting(
          {
            candidate_response: CANDIDATE,
            task_analysis: TASK_ANALYSIS,
            [key]: { anything: true },
          } as never,
          { llm: fakeLlm(output([3, 3, 3, 3])) },
        ),
      AssessmentConfigurationError,
    );
  }

  const result = await run(output([3, 3, 3, 3]));
  assert.equal(result.provenance.learner_history_available, false);
});

// ---------------------------------------------------------------------------
// X–Z — Phase-3 observation safety
// ---------------------------------------------------------------------------

async function buildObservations(items: Record<string, unknown>[]): Promise<ObservationExtractionResult> {
  return extractObservations(
    { candidate_response: CANDIDATE, task_analysis: TASK_ANALYSIS },
    {
      llm: {
        async generate() {
          return {
            base_correction_strategy: 'focused',
            principal_focus: 'grammar',
            strategy_rationale: 'Grammar is treated thoroughly.',
            observations: items,
          };
        },
      },
    },
  );
}

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

test('X — Phase-3 pedagogical weighting never reaches the assessment', async () => {
  const observations = await buildObservations([observationItem()]);
  const hints = buildEvidenceIndex(observations, CANDIDATE);

  assert.equal(hints.length, 1);
  for (const forbidden of [
    'pedagogical_priority',
    'foundational_importance',
    'transferability',
    'learning_opportunity',
    'ambitious_attempt',
    'teacher_dna_rule_ids',
    'within_script_frequency',
  ]) {
    assert.equal(forbidden in hints[0], false, `${forbidden} must not reach Layer 3`);
  }

  const client = fakeLlm(output([3, 3, 3, 3]));
  await assessWriting(
    { candidate_response: CANDIDATE, task_analysis: TASK_ANALYSIS, observations },
    { llm: client },
  );
  const prompt = client.last as { user: string; system: string };
  assert.equal(/pedagogical_priority|teacher_dna_rule_ids|principal_focus/.test(prompt.user), false);
  assert.deepEqual(findForbiddenAssessmentBehaviour({ user: prompt.user }), []);

  // The same marks are produced whether or not the observations were supplied.
  const withoutObservations = await run(output([3, 3, 3, 3]));
  const withObservations = await assessWriting(
    { candidate_response: CANDIDATE, task_analysis: TASK_ANALYSIS, observations },
    { llm: fakeLlm(output([3, 3, 3, 3])) },
  );
  assert.equal(
    withObservations.assessment_record.raw_total,
    withoutObservations.assessment_record.raw_total,
  );
});

test('Y — an unbindable Phase-3 observation can never become Cambridge evidence', async () => {
  const observations = await buildObservations([
    observationItem({ text_quote: 'a phrase the candidate never wrote' }),
    observationItem(),
  ]);

  const unbindable = observations.observations.find((o) => o.binding_status === 'unbindable');
  assert.ok(unbindable, 'the fixture must contain an unbindable observation');

  const hints = buildEvidenceIndex(observations, CANDIDATE);
  assert.equal(hints.some((hint) => hint.observation_id === unbindable!.observation_id), false);

  const result = await assessWriting(
    {
      candidate_response: CANDIDATE,
      task_analysis: TASK_ANALYSIS,
      observations,
    },
    {
      llm: fakeLlm(
        output([3, 3, 3, 3], {
          criteria: [
            decision('content', 3, { evidence_observation_ids: [unbindable!.observation_id] }),
            decision('communicative_achievement', 3),
            decision('organisation', 3),
            decision('language', 3),
          ],
        }),
      ),
    },
  );

  assert.deepEqual(result.assessment_record.criteria!.content.evidence_observation_ids, []);
});

test('Z — evidence Phase 3 never selected can still be found in the full response', async () => {
  const observations = await buildObservations([observationItem()]);
  const client = fakeLlm(
    output([4, 4, 4, 4], {
      criteria: [
        decision('content', 4),
        decision('communicative_achievement', 4),
        decision('organisation', 4, {
          text_evidence: [{ quote: 'we should reduce fast food', occurrence_index: 0 }],
          positive_evidence: ['The closing proposal completes the route the essay set up.'],
        }),
        decision('language', 4),
      ],
    }),
  );

  const result = await assessWriting(
    { candidate_response: CANDIDATE, task_analysis: TASK_ANALYSIS, observations },
    { llm: client },
  );

  const evidence = result.assessment_record.criteria!.organisation.text_evidence[0];
  assert.equal(evidence.bound_text, 'we should reduce fast food');
  assert.equal(
    (client.last as { user: string }).user.includes('we should reduce fast food'),
    true,
    'the complete candidate response is always supplied',
  );
  const hints = buildEvidenceIndex(observations, CANDIDATE);
  assert.equal(hints.some((hint) => hint.quote.includes('we should reduce')), false);
  assert.ok((client.last as { user: string }).user.includes('incomplete by design'));
});

// ---------------------------------------------------------------------------
// AA–AE — incomplete, binding, confidence and taxonomy separation
// ---------------------------------------------------------------------------

test('AA — missing task context produces an incomplete assessment, not a guessed /20', async () => {
  const noTask: ResolvedTaskAnalysis = { ...TASK_ANALYSIS, source_task_text: '' };
  assert.equal(checkTaskContext(noTask).sufficient, false);

  // The second route: a task whose requirement map could not be established.
  assert.equal(
    checkTaskContext({
      ...TASK_ANALYSIS,
      mandatory_content_points: [],
      required_functions: [],
    }).sufficient,
    false,
  );
  // The third route: Phase 2 exhausted its resolution chain for the reader.
  assert.equal(
    checkTaskContext({
      ...TASK_ANALYSIS,
      target_reader: null,
      target_reader_resolution: { source: 'unresolved', notes: ['No reader in the task wording.'] },
    }).sufficient,
    false,
  );
  assert.equal(checkTaskContext(TASK_ANALYSIS).sufficient, true);

  const client = fakeLlm(output([3, 3, 3, 3]));
  const result = await assessWriting(
    { candidate_response: CANDIDATE, task_analysis: noTask },
    { llm: client },
  );

  assert.equal(result.assessment_record.status, 'incomplete');
  assert.equal(result.assessment_record.criteria, undefined);
  assert.equal(result.assessment_record.raw_total, undefined);
  assert.ok(result.assessment_record.incomplete_reason);
  assert.equal(client.calls, 0, 'no model call is made without a scorable task');

  // An incomplete assessment is never expressed as a zero profile.
  assert.equal(
    finalizeAssessmentRecord({
      status: 'incomplete',
      incomplete_reason: 'no task',
      max_total: 20,
      single_task_scale_claim_allowed: false,
    }).raw_total,
    undefined,
  );
});

test('AA2 — the model may also report the response as unassessable', async () => {
  const result = await run(
    output([3, 3, 3, 3], {
      assessable: false,
      unassessable_reason: 'The response answers a different task.',
      criteria: [],
    }),
  );

  assert.equal(result.assessment_record.status, 'incomplete');
  assert.equal(result.assessment_record.raw_total, undefined);
  assert.equal(result.assessment_record.incomplete_reason, 'The response answers a different task.');
});

test('AB — every evidence quote must bind to the candidate response', async () => {
  const result = await run(output([3, 3, 3, 3]));
  const criteria = result.assessment_record.criteria!;

  for (const key of CAMBRIDGE_CRITERION_KEYS) {
    for (const evidence of criteria[key].text_evidence) {
      assert.equal(
        CANDIDATE.slice(evidence.span_start, evidence.span_end),
        evidence.bound_text,
        'offsets must reproduce the exact source substring',
      );
    }
  }

  await assert.rejects(
    () =>
      run(
        output([3, 3, 3, 3], {
          criteria: [
            decision('content', 3, {
              text_evidence: [{ quote: 'a sentence that was never written', occurrence_index: 0 }],
            }),
            decision('communicative_achievement', 3),
            decision('organisation', 3),
            decision('language', 3),
          ],
        }),
      ),
    AssessmentValidationError,
  );
});

test('AC — confidence is a safeguard and never alters a mark', async () => {
  const high = await run(output([4, 4, 4, 4]));
  const low = await run(
    output([4, 4, 4, 4], {
      overall_confidence: 'low',
      criteria: [
        decision('content', 4, {
          confidence: 'low',
          confidence_reason: 'The response is short, so the evidence base is thin.',
        }),
        decision('communicative_achievement', 4, {
          confidence: 'medium',
          confidence_reason: 'The register sits between two profiles.',
        }),
        decision('organisation', 4),
        decision('language', 4),
      ],
    }),
  );

  assert.equal(low.assessment_record.raw_total, high.assessment_record.raw_total);
  assert.equal(low.assessment_record.criteria!.content.mark, 4);
  assert.equal(low.assessment_record.criteria!.content.confidence, 'low');
  assert.equal(low.assessment_record.overall_confidence, 'low');

  // Confidence below high must carry its reason.
  assert.equal(
    criterionDecisionRecordSchema.safeParse({ ...contentFixture(3), confidence: 'low' }).success,
    false,
  );
});

test('AD — recommended genre features are never mandatory content points', async () => {
  const article = await analyseWritingTask(
    {
      source_task_text:
        'You have seen this announcement in an international magazine. Write an article about the place you like most in your town.',
      task_type: 'article',
    },
    {
      llm: {
        async generate() {
          return {
            target_reader: 'Readers of an international magazine',
            target_reader_evidence_quote: 'in an international magazine',
            communicative_purpose: 'Describe and recommend a place',
            register: 'neutral',
            tone: null,
            mandatory_content_points: [{ point: 'The place you like most', evidence_quote: null }],
            required_functions: [],
            task_specific_mandatory_conventions: [],
            ambiguities: [],
            inferred_task_type: null,
          };
        },
      },
    },
  );
  if (article.status !== 'complete') throw new Error('article fixture failed');

  assert.ok(article.task_analysis.recommended_genre_features.length > 0);
  const recommended = article.task_analysis.recommended_genre_features.map((f) => f.feature);
  const mandatory = article.task_analysis.mandatory_content_points.map((p) => p.point);
  for (const feature of recommended) {
    assert.equal(mandatory.includes(feature), false);
  }

  const prompt = buildAssessmentPrompt({
    candidate_response: CANDIDATE,
    task_analysis: article.task_analysis,
    word_count: countWords(CANDIDATE),
    evidence_hints: [],
  });
  assert.ok(prompt.user.includes('Its absence is never a mark reduction.'));
  assert.ok(prompt.user.includes('Never a binary Content completion item.'));
});

test('AE — Cambridge criteria stay independent of the Interactive Writing Map categories', async () => {
  // Four scoring constructs against six annotation categories: neither set can be
  // derived from the other, and "content" appearing in both is a naming
  // coincidence rather than a mapping.
  assert.equal(CAMBRIDGE_CRITERION_KEYS.length, 4);
  assert.equal(WRITING_CATEGORY_KEYS.length, 6);

  const categories = WRITING_CATEGORY_KEYS as readonly string[];
  const criteria = CAMBRIDGE_CRITERION_KEYS as readonly string[];
  for (const criterion of ['communicative_achievement', 'language']) {
    assert.equal(categories.includes(criterion), false, `${criterion} has no annotation category`);
  }
  for (const category of ['grammar', 'vocabulary', 'spelling', 'strength']) {
    assert.equal(criteria.includes(category), false, `${category} is not a Cambridge criterion`);
  }

  // No annotation vocabulary reaches a scoring decision.
  const result = await run(output([4, 4, 4, 4]));
  const serialised = JSON.stringify(result);
  assert.equal(/category_key|colour|color|annotation/i.test(serialised), false);
  assert.deepEqual(findForbiddenAssessmentBehaviour(result), []);
});

// ---------------------------------------------------------------------------
// Rule provenance, descriptors and configuration
// ---------------------------------------------------------------------------

test('source_rule_ids must cite Document 03, never a Teacher DNA rule', async () => {
  for (const id of ['R17', 'R01', 'ZZ99']) {
    assert.equal(isDoc03RuleId(id), false);
    await assert.rejects(
      () =>
        run(
          output([3, 3, 3, 3], {
            criteria: [
              decision('content', 3, { source_rule_ids: [id] }),
              decision('communicative_achievement', 3),
              decision('organisation', 3),
              decision('language', 3),
            ],
          }),
        ),
      AssessmentValidationError,
    );
  }

  assert.ok(DOC03_RULE_IDS.length >= 120);
  assert.equal(DOC03_RULE_IDS.some((id) => /^R\d\d$/.test(id)), false);
});

test('a criterion cannot be justified only by another criterion’s rulebook', async () => {
  assert.equal(isRuleCitableBy('content', 'L08'), false);
  assert.equal(isRuleCitableBy('content', 'C03'), true);
  assert.equal(isRuleCitableBy('content', 'X01'), true);

  await assert.rejects(
    () =>
      run(
        output([3, 3, 3, 3], {
          criteria: [
            decision('content', 3, { source_rule_ids: ['L08'] }),
            decision('communicative_achievement', 3),
            decision('organisation', 3),
            decision('language', 3),
          ],
        }),
      ),
    AssessmentValidationError,
  );
});

test('band anchors distinguish official descriptors from mixed profiles', () => {
  for (const criterion of CAMBRIDGE_CRITERION_KEYS) {
    const set = CRITERION_DESCRIPTORS[criterion];
    assert.equal(set.bands.length, 6);
    for (const band of [0, 1, 3, 5]) {
      assert.equal(getBandAnchor(criterion, band)?.kind, 'official_descriptor');
    }
    for (const band of [2, 4]) {
      const anchor = getBandAnchor(criterion, band);
      assert.equal(anchor?.kind, 'mixed_profile');
      assert.ok(anchor?.official.includes('shares features'));
      assert.equal(/midpoint|percentage|minus one/i.test(anchor?.operational ?? ''), false);
    }
  }
  assert.equal(neighbouringBands(3), null);
  assert.equal(neighbouringBands(5), null);
});

test('the twelve official calibration profiles are stored in golden infrastructure only', () => {
  assert.equal(GOLDEN_CASES.length, 12);

  const asymmetric = GOLDEN_CASES.find((p) => p.case_id === 'G-07');
  assert.deepEqual(asymmetric?.expected_marks, {
    content: 5,
    communicative_achievement: 2,
    organisation: 2,
    language: 2,
  });
  assert.equal(sumGoldenMarks(asymmetric!.expected_marks), 11);

  for (const profile of GOLDEN_CASES) {
    const total = sumGoldenMarks(profile.expected_marks);
    assert.ok(total >= 0 && total <= 20);
  }
});

test('assessment provenance records the pinned model and the open calibration state', async () => {
  const result = await run(output([3, 3, 3, 3]));

  assert.equal(result.provenance.cambridge_assessment_version, SOURCE_DOC_VERSIONS.cambridge_assessment);
  assert.equal(result.provenance.model_config.temperature, 0);
  assert.equal(result.provenance.llm_calls, 1);
  assert.equal(result.provenance.calibration_status, 'not_calibrated');
  assert.equal(result.provenance.task_fingerprint, TASK_ANALYSIS.provenance.task_fingerprint);
});

test('the service refuses to run without an explicit pinned model and client', async () => {
  await assert.rejects(
    () => assessWriting({ candidate_response: CANDIDATE, task_analysis: TASK_ANALYSIS }, {}),
    AssessmentConfigurationError,
  );
  await assert.rejects(
    () =>
      assessWriting(
        {
          candidate_response: CANDIDATE,
          task_analysis: TASK_ANALYSIS,
          model_config: { model: 'gpt-4o' },
        },
        { llm: fakeLlm(output([3, 3, 3, 3])) },
      ),
    Error,
  );
  await assert.rejects(
    () =>
      assessWriting(
        { candidate_response: '   ', task_analysis: TASK_ANALYSIS },
        { llm: fakeLlm(output([3, 3, 3, 3])) },
      ),
    AssessmentConfigurationError,
  );
});

test('a missing or duplicated criterion decision is rejected', async () => {
  await assert.rejects(
    () =>
      run(
        output([3, 3, 3, 3], {
          criteria: [decision('content', 3), decision('organisation', 3), decision('language', 3)],
        }),
      ),
    AssessmentValidationError,
  );
  await assert.rejects(
    () =>
      run(
        output([3, 3, 3, 3], {
          criteria: [
            decision('content', 3),
            decision('content', 4),
            decision('communicative_achievement', 3),
            decision('organisation', 3),
            decision('language', 3),
          ],
        }),
      ),
    AssessmentValidationError,
  );
});

test('the prompt states the prohibitions it relies on', () => {
  const prompt = buildAssessmentPrompt({
    candidate_response: CANDIDATE,
    task_analysis: TASK_ANALYSIS,
    word_count: countWords(CANDIDATE),
    evidence_hints: [],
  });

  assert.ok(prompt.system.includes('Do not output a total.'));
  assert.ok(prompt.system.includes('never invent a band 6'));
  assert.ok(prompt.system.includes('Never smooth the marks'));
  assert.ok(prompt.system.includes('Length carries no penalty'));
  assert.ok(prompt.system.includes('Creating half marks inside the Cambridge subscales.'));
  assert.ok(prompt.system.includes('Content 5, Communicative Achievement 2, Organisation 2, Language 2'));
  assert.equal(/\bR\d\d\./.test(prompt.system), false, 'Teacher DNA rules are not scoring authority');
});
