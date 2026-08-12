import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SOURCE_DOC_VERSIONS,
  TASK_ANALYSIS_SCHEMA_VERSION,
} from '../domain/engine-version';
import {
  coreGenreExpectationSchema,
  findForbiddenTaskAnalysisKeys,
  mandatoryGenreConventionSchema,
  recommendedGenreFeatureSchema,
  resolvedTaskAnalysisSchema,
} from '../domain/schemas';
import { B2_FIRST_TASK_TYPES, normaliseTaskTypeValue } from '../domain/task-types';
import {
  DOC01_GENRE_RULES,
  selectWordingTriggeredConventions,
} from '../prompts/knowledge/doc01-genre-rules';
import { TASK_ANALYSIS_PROMPT_VERSION } from '../prompts/task-analysis.prompt';
import {
  TASK_ANALYSIS_BENCHMARK_MODEL,
  TaskAnalysisConfigurationError,
  TaskAnalysisValidationError,
  analyseWritingTask,
  assertPinnedModelConfig,
  assignStableIds,
  buildTaskAnalysisCacheKey,
  computeTaskFingerprint,
  normaliseTaskText,
  resolveTaskType,
  type TaskAnalysisLlmClient,
  type TaskAnalysisRequest,
} from '../services/analysis/task-analysis.service';
import type { ResolvedTaskAnalysis } from '../domain/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type LlmOutput = Record<string, unknown>;

function llmOutput(overrides: LlmOutput = {}): LlmOutput {
  return {
    target_reader: 'Your English teacher',
    target_reader_evidence_quote: null,
    communicative_purpose: 'Discuss the topic and give a clear opinion',
    register: 'neutral',
    tone: null,
    mandatory_content_points: [{ point: 'Health', evidence_quote: null }],
    required_functions: [],
    task_specific_mandatory_conventions: [],
    ambiguities: [],
    inferred_task_type: null,
    ...overrides,
  };
}

function fakeLlm(
  output: LlmOutput | LlmOutput[],
): TaskAnalysisLlmClient & { calls: number } {
  const queue = Array.isArray(output) ? [...output] : null;
  const client = {
    calls: 0,
    async generate() {
      client.calls += 1;
      if (queue) return queue.shift() ?? {};
      return output;
    },
  };
  return client;
}

async function analyse(
  request: TaskAnalysisRequest,
  output: LlmOutput | LlmOutput[] = llmOutput(),
): Promise<ResolvedTaskAnalysis> {
  const result = await analyseWritingTask(request, { llm: fakeLlm(output) });
  assert.equal(result.status, 'complete');
  if (result.status !== 'complete') throw new Error('unreachable');
  return result.task_analysis;
}

function conventionTexts(analysis: ResolvedTaskAnalysis): string[] {
  return analysis.mandatory_genre_conventions.map((c) => c.convention);
}

function recommendedTexts(analysis: ResolvedTaskAnalysis): string[] {
  return analysis.recommended_genre_features.map((f) => f.feature);
}

function coreExpectationTexts(analysis: ResolvedTaskAnalysis): string[] {
  return analysis.core_genre_expectations.map((e) => e.expectation);
}

function matches(list: string[], pattern: RegExp): string[] {
  return list.filter((item) => pattern.test(item));
}

const ESSAY_TASK =
  'Write an essay in 140–190 words.\nSome people say that fast food is always a bad thing to eat. Do you agree?\nYou should write about: health, price and convenience, your own idea.';

// ---------------------------------------------------------------------------
// Essay
// ---------------------------------------------------------------------------

test('essay: a title stays recommended and never becomes mandatory', async () => {
  const analysis = await analyse({ source_task_text: ESSAY_TASK, task_type: 'essay' });

  assert.equal(matches(recommendedTexts(analysis), /title/i).length, 1);
  assert.deepEqual(matches(conventionTexts(analysis), /title/i), []);
  assert.ok(
    analysis.recommendations_not_requirements.some((item) => /title/i.test(item)),
    'the title must be exposed as a recommendation, not a requirement',
  );
});

test('essay: the suggested paragraph structure is not enforced as the only valid organisation', async () => {
  const analysis = await analyse({ source_task_text: ESSAY_TASK, task_type: 'essay' });

  assert.equal(
    matches(recommendedTexts(analysis), /introduction, body and conclusion/i).length,
    1,
  );
  assert.deepEqual(matches(conventionTexts(analysis), /introduction, body and conclusion/i), []);
});

test('essay: coherence is not encoded as a mandatory Layer-1 convention', async () => {
  const analysis = await analyse({ source_task_text: ESSAY_TASK, task_type: 'essay' });

  assert.deepEqual(conventionTexts(analysis), []);
  assert.deepEqual(coreExpectationTexts(analysis), []);
  assert.deepEqual(matches(conventionTexts(analysis), /coheren/i), []);
});

// ---------------------------------------------------------------------------
// Informal email
// ---------------------------------------------------------------------------

const INFORMAL_EMAIL_TASK =
  'You have received an email from your English-speaking friend Sam:\nI am visiting your town next month and I would like to try some local food. Where should I go and what should I eat?\nWrite your email.';

test('informal email: informal relationship, greeting and closing conventions are recognised', async () => {
  const analysis = await analyse({ source_task_text: INFORMAL_EMAIL_TASK });

  assert.equal(analysis.task_type, 'informal_email');
  assert.equal(analysis.register, 'informal, friendly and natural');
  assert.equal(matches(conventionTexts(analysis), /informal greeting and closing/i).length, 1);
  assert.equal(matches(conventionTexts(analysis), /friendly, natural register/i).length, 1);
});

test('informal email: every content point in the prompt is captured with a stable id', async () => {
  const analysis = await analyse(
    { source_task_text: INFORMAL_EMAIL_TASK },
    llmOutput({
      mandatory_content_points: [
        { point: 'Say where Sam should go', evidence_quote: 'Where should I go' },
        { point: 'Say what Sam should eat', evidence_quote: 'what should I eat' },
      ],
    }),
  );

  assert.deepEqual(
    analysis.mandatory_content_points.map((p) => p.id),
    ['cp01', 'cp02'],
  );
  assert.deepEqual(
    analysis.mandatory_content_points.map((p) => p.point),
    ['Say where Sam should go', 'Say what Sam should eat'],
  );
  assert.equal(analysis.mandatory_content_points[0].evidence_quote, 'Where should I go');
});

// ---------------------------------------------------------------------------
// Formal email
// ---------------------------------------------------------------------------

const FORMAL_EMAIL_TASK =
  'You are attending a language course abroad. Write an email to the course director asking for information about the timetable and complaining about the accommodation.';

test('formal email: a polite and professional relationship is recognised', async () => {
  const analysis = await analyse({ source_task_text: FORMAL_EMAIL_TASK });

  assert.equal(analysis.task_type, 'formal_email');
  assert.equal(analysis.register, 'formal, polite and professional');
  assert.equal(matches(conventionTexts(analysis), /formal greeting and closing/i).length, 1);
  assert.equal(matches(conventionTexts(analysis), /polite and professional register/i).length, 1);
  assert.equal(matches(conventionTexts(analysis), /avoid unnecessarily colloquial/i).length, 1);
});

test('formal email: request / complaint / enquiry functions are extracted from the wording', async () => {
  const analysis = await analyse(
    { source_task_text: FORMAL_EMAIL_TASK },
    llmOutput({
      required_functions: [
        { function: 'Request information about the timetable', evidence_quote: 'asking for information about the timetable' },
        { function: 'Complain about the accommodation', evidence_quote: 'complaining about the accommodation' },
      ],
    }),
  );

  assert.deepEqual(
    analysis.required_functions.map((fn) => fn.id),
    ['fn01', 'fn02'],
  );
  assert.ok(analysis.required_functions.every((fn) => fn.origin === 'task_wording'));
  // Doc 01's conditional "suitable formal phrases" convention fires on this wording.
  assert.equal(matches(conventionTexts(analysis), /suitable formal phrases/i).length, 1);
});

// ---------------------------------------------------------------------------
// Article
// ---------------------------------------------------------------------------

const ARTICLE_TASK =
  'Articles wanted: Healthy habits for busy students. What healthy habits would you suggest to students who have little free time? Write an article giving advice and examples.';

test('article: engaging the reader is a core expectation, never a binary mandatory convention', async () => {
  const analysis = await analyse({ source_task_text: ARTICLE_TASK });

  assert.equal(analysis.task_type, 'article');
  assert.deepEqual(coreExpectationTexts(analysis), ['Engage the reader.']);
  assert.deepEqual(conventionTexts(analysis), []);

  const expectation = analysis.core_genre_expectations[0];
  assert.equal(expectation.status, 'core_expectation');
  assert.equal(expectation.binary_completion_check, false);
});

test('article: the task wording cannot turn reader engagement into a checkbox', async () => {
  const analysis = await analyse(
    { source_task_text: ARTICLE_TASK },
    llmOutput({
      task_specific_mandatory_conventions: [
        { convention: 'Engage the reader.', evidence_quote: 'Write an article giving advice and examples.' },
      ],
    }),
  );

  assert.deepEqual(conventionTexts(analysis), []);
  assert.ok(
    analysis.ambiguities.some((note) => /stays a quality judgement/i.test(note)),
    'the rejected promotion must be reported',
  );
});

test('article: catchy title, rhetorical questions and anecdotes are never automatically mandatory', async () => {
  const analysis = await analyse({ source_task_text: ARTICLE_TASK });
  const mandatory = conventionTexts(analysis);

  for (const pattern of [/catchy/i, /rhetorical/i, /personal experience/i, /colourful/i, /memorable ending/i]) {
    assert.deepEqual(matches(mandatory, pattern), [], `${pattern} must not be mandatory`);
    assert.equal(matches(recommendedTexts(analysis), pattern).length, 1, `${pattern} must be recommended`);
  }
});

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

test('report: title, purpose introduction, headings and objective organisation follow Doc 01', async () => {
  const analysis = await analyse({
    source_task_text:
      'Your teacher has asked you to write a report describing the sports facilities at your school.',
  });

  assert.equal(analysis.task_type, 'report');
  assert.deepEqual(conventionTexts(analysis), [
    'Include a title.',
    'Open with a clear introduction explaining the purpose of the report.',
    'Use headings.',
    'Organise the content objectively.',
  ]);
});

test('report: recommendations become mandatory only when the task requires them', async () => {
  const withoutRecommendations = await analyse({
    source_task_text:
      'Your teacher has asked you to write a report describing the sports facilities at your school.',
  });
  assert.deepEqual(matches(conventionTexts(withoutRecommendations), /recommendation/i), []);

  const withRecommendations = await analyse({
    source_task_text:
      'Write a report explaining what is good about the food at your college and making recommendations.',
  });
  const promoted = withRecommendations.mandatory_genre_conventions.find((c) =>
    /recommendations or conclusions/i.test(c.convention),
  );
  assert.ok(promoted, 'the wording asks for recommendations, so the convention must be mandatory');
  assert.equal(promoted?.origin, 'task_wording');
  assert.ok(promoted?.evidence_quote, 'a wording-promoted convention must quote the wording');
});

// ---------------------------------------------------------------------------
// Review
// ---------------------------------------------------------------------------

test('review: a recommendation is mandatory only when the exact wording asks for one', async () => {
  const asking = await analyse({
    source_task_text:
      'Write a review of a restaurant you know. Say what the food is like and whether you would recommend it.',
  });
  const judgement = asking.mandatory_genre_conventions.find((c) =>
    /recommendation or final judgement/i.test(c.convention),
  );
  assert.ok(judgement);
  assert.equal(judgement?.origin, 'task_wording');

  const notAsking = await analyse({
    source_task_text:
      'Write a review of a film you saw recently. Describe the plot and say what you thought of the acting.',
  });
  assert.deepEqual(matches(conventionTexts(notAsking), /recommendation|judgement/i), []);
  assert.deepEqual(conventionTexts(notAsking), []);
});

test('review: reader awareness is a core expectation, not a binary mandatory convention', async () => {
  const analysis = await analyse({
    source_task_text: 'Write a review of a café. Would you recommend it to other students?',
  });

  assert.deepEqual(coreExpectationTexts(analysis), ['Keep the target reader in mind throughout.']);
  assert.deepEqual(matches(conventionTexts(analysis), /target reader in mind/i), []);
  assert.equal(analysis.core_genre_expectations[0].binary_completion_check, false);
  // The wording-triggered recommendation is still a real requirement.
  assert.equal(matches(conventionTexts(analysis), /recommendation or final judgement/i).length, 1);
});

// ---------------------------------------------------------------------------
// General invariants
// ---------------------------------------------------------------------------

test('core expectations, mandatory conventions and recommendations cannot silently merge', () => {
  assert.equal(
    coreGenreExpectationSchema.safeParse({
      id: 'ce01',
      expectation: 'Engage the reader.',
      status: 'mandatory',
      binary_completion_check: false,
      primary_criterion: 'communicative_achievement',
    }).success,
    false,
  );
  assert.equal(
    coreGenreExpectationSchema.safeParse({
      id: 'ce01',
      expectation: 'Engage the reader.',
      status: 'core_expectation',
      binary_completion_check: true,
      primary_criterion: 'communicative_achievement',
    }).success,
    false,
  );
  assert.equal(
    coreGenreExpectationSchema.safeParse({
      id: 'ce01',
      expectation: 'Engage the reader.',
      status: 'core_expectation',
      binary_completion_check: false,
      primary_criterion: 'communicative_achievement',
    }).success,
    false,
  );
});

test('a core expectation cannot be restated as a mandatory convention in the contract', async () => {
  const analysis = await analyse({ source_task_text: ARTICLE_TASK });
  const invalid = {
    ...analysis,
    mandatory_genre_conventions: [
      {
        id: 'gc01',
        convention: 'Engage the reader.',
        status: 'mandatory' as const,
        origin: 'task_wording' as const,
        evidence_quote: 'Write an article giving advice and examples.',
      },
    ],
  };
  assert.equal(resolvedTaskAnalysisSchema.safeParse(invalid).success, false);
});

test('mandatory and recommended arrays cannot silently merge', () => {
  assert.equal(
    mandatoryGenreConventionSchema.safeParse({
      id: 'gc01',
      convention: 'Include a title.',
      status: 'recommended',
      origin: 'doc01_genre_rule',
    }).success,
    false,
  );
  assert.equal(
    recommendedGenreFeatureSchema.safeParse({
      id: 'rf01',
      feature: 'Include a title.',
      status: 'mandatory',
    }).success,
    false,
  );
});

test('a Doc 01 recommendation cannot enter the mandatory array without task wording', async () => {
  const analysis = await analyse({ source_task_text: ESSAY_TASK, task_type: 'essay' });
  const invalid = {
    ...analysis,
    mandatory_genre_conventions: [
      ...analysis.mandatory_genre_conventions,
      {
        id: 'gc09',
        convention: 'Include a title.',
        status: 'mandatory' as const,
        origin: 'doc01_genre_rule' as const,
      },
    ],
  };
  assert.equal(resolvedTaskAnalysisSchema.safeParse(invalid).success, false);
});

test('an unverifiable quote cannot promote a recommendation to a requirement', async () => {
  const analysis = await analyse(
    { source_task_text: ESSAY_TASK, task_type: 'essay' },
    llmOutput({
      task_specific_mandatory_conventions: [
        { convention: 'Include a title.', evidence_quote: 'You must give your essay a title.' },
      ],
    }),
  );

  assert.deepEqual(matches(conventionTexts(analysis), /title/i), []);
  assert.ok(
    analysis.ambiguities.some((note) => /supporting quote is not present/i.test(note)),
    'the rejected promotion must be reported honestly',
  );
});

test('the same content point is never duplicated', async () => {
  const analysis = await analyse(
    { source_task_text: ESSAY_TASK, task_type: 'essay' },
    llmOutput({
      mandatory_content_points: [
        { point: 'Health', evidence_quote: null },
        { point: '  health  ', evidence_quote: null },
        { point: 'Price and convenience', evidence_quote: null },
      ],
    }),
  );

  assert.deepEqual(
    analysis.mandatory_content_points.map((p) => p.point),
    ['Health', 'Price and convenience'],
  );
  assert.deepEqual(
    analysis.mandatory_content_points.map((p) => p.id),
    ['cp01', 'cp02'],
  );
});

test('stable ids are deterministic for the same analysis configuration', async () => {
  const request = { source_task_text: ESSAY_TASK, task_type: 'essay' };
  const output = llmOutput({
    mandatory_content_points: [
      { point: 'Health', evidence_quote: null },
      { point: 'Price and convenience', evidence_quote: null },
      { point: 'Your own idea', evidence_quote: null },
    ],
  });

  const first = await analyse(request, output);
  const second = await analyse(request, output);

  assert.deepEqual(
    first.mandatory_content_points.map((p) => p.id),
    second.mandatory_content_points.map((p) => p.id),
  );
  assert.deepEqual(
    first.mandatory_genre_conventions.map((c) => c.id),
    second.mandatory_genre_conventions.map((c) => c.id),
  );
  assert.equal(first.provenance.task_fingerprint, second.provenance.task_fingerprint);
});

test('reordering the model output does not change ids or the resolved analysis', async () => {
  const points = [
    { point: 'Suggest where to eat', evidence_quote: 'try some local food' },
    { point: 'Say where Sam should go', evidence_quote: 'Where should I go' },
    { point: 'Say what Sam should eat', evidence_quote: 'what should I eat' },
  ];
  const functions = [
    { function: 'Recommend places', evidence_quote: 'Where should I go' },
    { function: 'Welcome Sam', evidence_quote: 'I am visiting your town next month' },
  ];

  const inOrder = await analyse(
    { source_task_text: INFORMAL_EMAIL_TASK },
    llmOutput({ mandatory_content_points: points, required_functions: functions }),
  );
  const shuffled = await analyse(
    { source_task_text: INFORMAL_EMAIL_TASK },
    llmOutput({
      mandatory_content_points: [points[2], points[0], points[1]],
      required_functions: [functions[1], functions[0]],
    }),
  );

  assert.deepEqual(
    inOrder.mandatory_content_points.map((p) => `${p.id}:${p.point}`),
    ['cp01:Suggest where to eat', 'cp02:Say where Sam should go', 'cp03:Say what Sam should eat'],
  );
  assert.deepEqual(
    inOrder.required_functions.map((f) => `${f.id}:${f.function}`),
    ['fn01:Welcome Sam', 'fn02:Recommend places'],
  );
  assert.deepEqual(shuffled, inOrder);
});

test('assignStableIds is a pure function of the deduplicated list', () => {
  const items = [{ point: 'A' }, { point: 'a' }, { point: 'B' }];
  const once = assignStableIds(items, 'cp', (item) => item.point);
  const twice = assignStableIds(items, 'cp', (item) => item.point);
  assert.deepEqual(once, twice);
  assert.deepEqual(once.map((i) => i.id), ['cp01', 'cp02']);
});

test('a task analysis contains no scoring, learner history, feedback or colour data', async () => {
  const analysis = await analyse({ source_task_text: ESSAY_TASK, task_type: 'essay' });
  assert.deepEqual(findForbiddenTaskAnalysisKeys(analysis), []);
});

test('Layer 1 never routes a requirement to a Cambridge criterion', async () => {
  const analyses = await Promise.all([
    analyse({ source_task_text: ESSAY_TASK, task_type: 'essay' }),
    analyse({ source_task_text: ARTICLE_TASK }),
    analyse({ source_task_text: 'Write a review of a café. Would you recommend it?' }),
    analyse({ source_task_text: FORMAL_EMAIL_TASK }),
  ]);

  for (const analysis of analyses) {
    assert.deepEqual(findForbiddenTaskAnalysisKeys(analysis), []);
    const serialised = JSON.stringify(analysis);
    for (const key of [
      'primary_criterion',
      'criterion',
      'score_effect',
      'band_effect',
      'deduction',
    ]) {
      assert.equal(
        serialised.includes(`"${key}"`),
        false,
        `task_analysis must not contain a "${key}" field`,
      );
    }
    // `automatic_penalty: false` is the only penalty-shaped key, and it is a guard.
    assert.equal(analysis.word_guidance.automatic_penalty, false);
  }

  for (const key of ['primary_criterion', 'score_effect', 'band_effect', 'deduction', 'penalty']) {
    assert.deepEqual(findForbiddenTaskAnalysisKeys({ [key]: 'x' }), [key]);
  }
});

test('forbidden fields in the model output are rejected instead of absorbed', async () => {
  await assert.rejects(
    () =>
      analyseWritingTask(
        { source_task_text: ESSAY_TASK, task_type: 'essay' },
        { llm: fakeLlm(llmOutput({ score: 4, feedback: 'Well written.' })) },
      ),
    TaskAnalysisValidationError,
  );
});

test('target reader: trusted metadata wins, wording is quoted and absence stays unresolved', async () => {
  const fromMetadata = await analyse({
    source_task_text: ESSAY_TASK,
    task_type: 'essay',
    target_reader: 'The magazine editor',
  });
  assert.equal(fromMetadata.target_reader, 'The magazine editor');
  assert.equal(fromMetadata.target_reader_resolution.source, 'task_metadata');

  const fromWording = await analyse(
    { source_task_text: ARTICLE_TASK },
    llmOutput({
      target_reader: 'Busy students',
      target_reader_evidence_quote: 'students who have little free time',
    }),
  );
  assert.equal(fromWording.target_reader_resolution.source, 'task_wording');
  assert.equal(
    fromWording.target_reader_resolution.evidence_quote,
    'students who have little free time',
  );

  const inferred = await analyse({ source_task_text: ESSAY_TASK, task_type: 'essay' });
  assert.equal(inferred.target_reader_resolution.source, 'inference');
});

test('an unresolved target reader is never invented to complete the schema', async () => {
  const analysis = await analyse(
    { source_task_text: ESSAY_TASK, task_type: 'essay' },
    llmOutput({ target_reader: null, target_reader_evidence_quote: null }),
  );

  assert.equal(analysis.target_reader, null);
  assert.equal(analysis.target_reader_resolution.source, 'unresolved');
  assert.ok(analysis.ambiguities.some((note) => /does not identify a target reader/i.test(note)));

  assert.equal(
    resolvedTaskAnalysisSchema.safeParse({
      ...analysis,
      target_reader: 'An invented reader',
    }).success,
    false,
  );
});

test('email formality inference is visible in provenance and never presented as metadata', async () => {
  const analysis = await analyse({
    source_task_text: INFORMAL_EMAIL_TASK,
    dralo_task_metadata: { writingType: 'email' },
  });
  const resolution = analysis.provenance.task_type_resolution;

  assert.equal(resolution.task_type, 'informal_email');
  assert.equal(resolution.source, 'deterministic_inference');
  assert.equal(resolution.confidence, 'low');
  assert.ok(resolution.notes.some((note) => /not authoritative task metadata/i.test(note)));
});

test('letter is only an input alias and never a canonical output task type', () => {
  assert.equal((B2_FIRST_TASK_TYPES as readonly string[]).includes('letter'), false);
  const normalised = normaliseTaskTypeValue('letter');
  assert.equal(normalised.status, 'ambiguous');

  const resolution = resolveTaskType({
    source_task_text: INFORMAL_EMAIL_TASK,
    task_type: 'letter',
  });
  assert.equal(resolution.task_type, 'informal_email');
});

test('word guidance is contextual only, carries provenance and can never carry an automatic penalty', async () => {
  const analysis = await analyse({
    source_task_text: ESSAY_TASK,
    task_type: 'essay',
    word_min: 140,
    word_max: 190,
  });

  assert.equal(analysis.word_guidance.word_min, 140);
  assert.equal(analysis.word_guidance.word_max, 190);
  assert.equal(analysis.word_guidance.source, 'exam_configuration');
  assert.equal(analysis.word_guidance.automatic_penalty, false);

  const fallback = await analyse({ source_task_text: ESSAY_TASK, task_type: 'essay' });
  assert.equal(fallback.word_guidance.source, 'default_b2_first');
  assert.equal(fallback.word_guidance.word_min, 140);
  assert.equal(fallback.word_guidance.word_max, 190);
  assert.equal(
    resolvedTaskAnalysisSchema.safeParse({
      ...analysis,
      word_guidance: { word_min: 140, word_max: 190, automatic_penalty: true },
    }).success,
    false,
  );
});

test('ambiguous task information is reported rather than invented', async () => {
  const result = await analyseWritingTask(
    {
      source_task_text: 'Write something about your holidays for your teacher.',
      allow_llm_task_type_inference: false,
    },
    {},
  );

  assert.equal(result.status, 'unresolved');
  if (result.status !== 'unresolved') throw new Error('unreachable');
  assert.equal(result.reason, 'task_type_unresolved');
  assert.equal(result.task_type_resolution.task_type, null);
  assert.equal(result.task_type_resolution.confidence, 'unresolved');
});

// ---------------------------------------------------------------------------
// Task-type resolution
// ---------------------------------------------------------------------------

test('an explicit trusted task type wins over the wording', () => {
  const resolution = resolveTaskType({
    source_task_text: 'Write an article about healthy habits.',
    task_type: 'report',
  });
  assert.equal(resolution.task_type, 'report');
  assert.equal(resolution.source, 'explicit_caller');
  assert.equal(resolution.confidence, 'certain');
});

test('DRALO task metadata is used when the caller supplies no explicit type', () => {
  const resolution = resolveTaskType({
    source_task_text: 'Healthy habits for busy students.',
    dralo_task_metadata: { writingType: 'article' },
  });
  assert.equal(resolution.task_type, 'article');
  assert.equal(resolution.source, 'dralo_task_metadata');
});

test('an ambiguous "email" type falls back to heuristic formality detection with low confidence', () => {
  const resolution = resolveTaskType({
    source_task_text: INFORMAL_EMAIL_TASK,
    dralo_task_metadata: { writingType: 'email' },
  });
  assert.equal(resolution.task_type, 'informal_email');
  assert.equal(resolution.source, 'deterministic_inference');
  assert.equal(resolution.confidence, 'low');
  assert.ok(resolution.notes.some((note) => /does not distinguish formal from informal/i.test(note)));
});

test('an email with no formality cue stays unresolved rather than guessed', () => {
  const resolution = resolveTaskType({
    source_task_text: 'Write an email about the trip next week.',
  });
  assert.equal(resolution.task_type, null);
  assert.equal(resolution.confidence, 'unresolved');
  assert.ok(resolution.notes.some((note) => /formality is ambiguous/i.test(note)));
});

test('deterministic inference reads an unambiguous genre cue from the wording', () => {
  const resolution = resolveTaskType({ source_task_text: ESSAY_TASK });
  assert.equal(resolution.task_type, 'essay');
  assert.equal(resolution.source, 'deterministic_inference');
  assert.equal(resolution.confidence, 'high');
});

test('conflicting genre cues stay unresolved instead of guessing', () => {
  const resolution = resolveTaskType({
    source_task_text: 'Write an article or write a review about your favourite restaurant.',
  });
  assert.equal(resolution.task_type, null);
  assert.ok(resolution.notes.some((note) => /matches several genres/i.test(note)));
});

test('out-of-scope genres are rejected rather than mapped into B2 First', () => {
  const resolution = resolveTaskType({
    source_task_text: 'Write a story beginning with this sentence.',
    task_type: 'story',
  });
  assert.equal(resolution.task_type, null);
  assert.ok(resolution.notes.some((note) => /outside Cambridge B2 First v1 scope/i.test(note)));
});

test('last-resort model inference is used only when everything else fails, and is recorded', async () => {
  const llm = fakeLlm([
    llmOutput({ inferred_task_type: 'article' }),
    llmOutput({ mandatory_content_points: [{ point: 'Describe your routine', evidence_quote: null }] }),
  ]);
  const result = await analyseWritingTask(
    { source_task_text: 'Tell our readers about your daily routine.' },
    { llm },
  );

  assert.equal(result.status, 'complete');
  if (result.status !== 'complete') throw new Error('unreachable');
  assert.equal(result.task_analysis.task_type, 'article');
  assert.equal(result.task_analysis.provenance.task_type_resolution.source, 'llm_inference');
  assert.equal(result.task_analysis.provenance.task_type_resolution.confidence, 'low');
  assert.equal(result.task_analysis.provenance.llm_calls, 2);
  assert.equal(llm.calls, 2);
});

test('no LLM client means no silent network fallback', async () => {
  await assert.rejects(
    () => analyseWritingTask({ source_task_text: ESSAY_TASK, task_type: 'essay' }, {}),
    TaskAnalysisConfigurationError,
  );
});

// ---------------------------------------------------------------------------
// Model configuration
// ---------------------------------------------------------------------------

test('the benchmark model is explicit and pinned to a dated snapshot', () => {
  assertPinnedModelConfig(TASK_ANALYSIS_BENCHMARK_MODEL);
  assert.throws(
    () => assertPinnedModelConfig({ model: 'gpt-4o' }),
    TaskAnalysisConfigurationError,
  );
});

// ---------------------------------------------------------------------------
// Versioned fingerprint / cache identity
// ---------------------------------------------------------------------------

const FINGERPRINT_BASE = {
  source_task_text: ESSAY_TASK,
  task_type: 'essay',
  model_config: TASK_ANALYSIS_BENCHMARK_MODEL,
};

test('the same task with the same versions and configuration yields the same fingerprint', () => {
  assert.equal(
    computeTaskFingerprint(FINGERPRINT_BASE),
    computeTaskFingerprint({ ...FINGERPRINT_BASE }),
  );
});

test('whitespace-only differences do not create a second cache entry', () => {
  const reformatted = ESSAY_TASK.replace(/\n/g, '\r\n  ').replace(/ /g, '  ');
  assert.equal(normaliseTaskText(reformatted), normaliseTaskText(ESSAY_TASK));
  assert.equal(
    computeTaskFingerprint({ ...FINGERPRINT_BASE, source_task_text: reformatted }),
    computeTaskFingerprint(FINGERPRINT_BASE),
  );
});

test('a different Document 01 version yields a different fingerprint', () => {
  assert.notEqual(
    computeTaskFingerprint({ ...FINGERPRINT_BASE, task_requirements_version: '1.1' }),
    computeTaskFingerprint(FINGERPRINT_BASE),
  );
});

test('a different task-analysis prompt version yields a different fingerprint', () => {
  assert.notEqual(
    computeTaskFingerprint({ ...FINGERPRINT_BASE, task_analysis_prompt_version: '1.1.0' }),
    computeTaskFingerprint(FINGERPRINT_BASE),
  );
});

test('a different task-analysis schema version yields a different fingerprint', () => {
  assert.notEqual(
    computeTaskFingerprint({ ...FINGERPRINT_BASE, task_analysis_schema_version: '2.0.0' }),
    computeTaskFingerprint(FINGERPRINT_BASE),
  );
});

test('a different model snapshot yields a different fingerprint', () => {
  assert.notEqual(
    computeTaskFingerprint({
      ...FINGERPRINT_BASE,
      model_config: { ...TASK_ANALYSIS_BENCHMARK_MODEL, snapshot_id: 'gpt-4o-2024-11-20' },
    }),
    computeTaskFingerprint(FINGERPRINT_BASE),
  );
});

test('a different task type or a different task yields a different fingerprint', () => {
  assert.notEqual(
    computeTaskFingerprint({ ...FINGERPRINT_BASE, task_type: 'article' }),
    computeTaskFingerprint(FINGERPRINT_BASE),
  );
  assert.notEqual(
    computeTaskFingerprint({ ...FINGERPRINT_BASE, source_task_text: `${ESSAY_TASK} Extra point.` }),
    computeTaskFingerprint(FINGERPRINT_BASE),
  );
});

test('the cache key carries the task type and the fingerprint but is not persisted yet', () => {
  const key = buildTaskAnalysisCacheKey(FINGERPRINT_BASE);
  assert.ok(key.startsWith('writing_task_analysis:essay:'));
  assert.ok(key.endsWith(computeTaskFingerprint(FINGERPRINT_BASE).replace('sha256:', '')));
});

test('provenance records every version that defines the analysis', async () => {
  const analysis = await analyse({ source_task_text: ESSAY_TASK, task_type: 'essay' });
  const { provenance } = analysis;

  assert.equal(provenance.task_requirements_version, SOURCE_DOC_VERSIONS.task_requirements);
  assert.equal(provenance.task_analysis_prompt_version, TASK_ANALYSIS_PROMPT_VERSION);
  assert.equal(provenance.task_analysis_schema_version, TASK_ANALYSIS_SCHEMA_VERSION);
  assert.deepEqual(provenance.doc_versions, SOURCE_DOC_VERSIONS);
  assert.equal(provenance.model_config.model, TASK_ANALYSIS_BENCHMARK_MODEL.model);
  assert.equal(provenance.llm_calls, 1);
});

// ---------------------------------------------------------------------------
// Doc 01 knowledge integrity
// ---------------------------------------------------------------------------

test('the three Doc 01 classifications are disjoint for every v1 genre', () => {
  for (const [taskType, rules] of Object.entries(DOC01_GENRE_RULES)) {
    assert.equal(rules.task_type, taskType);
    const mandatory = rules.mandatory_conventions.map((r) => r.text.toLowerCase());
    const core = rules.core_expectations.map((r) => r.text.toLowerCase());
    const recommended = rules.recommended_features.map((r) => r.text.toLowerCase());
    const all = [...mandatory, ...core, ...recommended];
    assert.equal(
      new Set(all).size,
      all.length,
      `${taskType}: a rule appears in more than one classification`,
    );
  }
});

test('Doc 01 classification matches the approved genre decisions', () => {
  assert.deepEqual(DOC01_GENRE_RULES.essay.mandatory_conventions, []);
  assert.deepEqual(DOC01_GENRE_RULES.essay.core_expectations, []);
  assert.deepEqual(DOC01_GENRE_RULES.article.mandatory_conventions, []);
  assert.deepEqual(
    DOC01_GENRE_RULES.article.core_expectations.map((r) => r.text),
    ['Engage the reader.'],
  );
  assert.deepEqual(DOC01_GENRE_RULES.review.mandatory_conventions, []);
  assert.deepEqual(
    DOC01_GENRE_RULES.review.core_expectations.map((r) => r.text),
    ['Keep the target reader in mind throughout.'],
  );
  assert.deepEqual(
    DOC01_GENRE_RULES.report.mandatory_conventions.map((r) => r.text),
    [
      'Include a title.',
      'Open with a clear introduction explaining the purpose of the report.',
      'Use headings.',
      'Organise the content objectively.',
    ],
  );
  assert.deepEqual(
    DOC01_GENRE_RULES.report.conditional_conventions.map((r) => r.text),
    ['Provide recommendations or conclusions.'],
  );
  assert.deepEqual(
    DOC01_GENRE_RULES.formal_email.conditional_conventions.map((r) => r.text),
    ['Use suitable formal phrases for the request, complaint or enquiry the task asks for.'],
  );
});

test('conditional conventions only fire on wording that actually requests them', () => {
  assert.equal(
    selectWordingTriggeredConventions('review', 'Describe the plot and the acting.').length,
    0,
  );
  assert.equal(
    selectWordingTriggeredConventions('review', 'Would you recommend it to other students?').length,
    1,
  );
});
