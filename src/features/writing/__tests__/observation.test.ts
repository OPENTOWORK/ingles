import test from 'node:test';
import assert from 'node:assert/strict';
import { SOURCE_DOC_VERSIONS } from '../domain/engine-version';
import {
  FORBIDDEN_OBSERVATION_KEYS,
  findHistoryClaims,
  findScoringLeakage,
  observationSchema,
} from '../domain/schemas';
import type { ObservationExtractionResult, ResolvedTaskAnalysis } from '../domain/types';
import {
  TEACHER_DNA_RULES,
  LEARNER_CONTEXT_RULE_IDS,
  HISTORY_FREE_RULE_IDS,
} from '../prompts/knowledge/doc02-teacher-dna-rules';
import { buildObservationExtractionPrompt } from '../prompts/observation-extraction.prompt';
import {
  TASK_ANALYSIS_BENCHMARK_MODEL,
  analyseWritingTask,
} from '../services/analysis/task-analysis.service';
import {
  ObservationConfigurationError,
  ObservationValidationError,
  computeObservationId,
  extractObservations,
  type ObservationLlmClient,
} from '../services/observation/observation.service';
import { bindQuote, countQuoteOccurrences, verifyBinding } from '../services/validation/evidence-binding';
import { checkIntentPreservation } from '../services/validation/intent-preservation';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CANDIDATE = [
  'Fast food is very populer today. Many people eats it every day because it is cheap and fast.',
  'However, I completely agree that it is bad for our health. My friend eat fast food three times a week and he feel tired.',
  'In conclusion, we should to reduce fast food.',
].join('\n');

const ESSAY_TASK =
  'Write an essay in 140–190 words.\nSome people say that fast food is always a bad thing to eat. Do you agree?\nYou should write about: health, price and convenience, your own idea.';

async function buildTaskAnalysis(
  sourceText = ESSAY_TASK,
  taskType = 'essay',
): Promise<ResolvedTaskAnalysis> {
  const result = await analyseWritingTask(
    { source_task_text: sourceText, task_type: taskType },
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
  if (result.status !== 'complete') throw new Error('task analysis fixture failed');
  return result.task_analysis;
}

let TASK_ANALYSIS: ResolvedTaskAnalysis;

type LlmItem = Record<string, unknown>;

function item(overrides: LlmItem = {}): LlmItem {
  return {
    domain: 'grammar',
    observation_type: 'accuracy_error',
    polarity: 'negative',
    scope: 'local',
    text_quote: 'people eats',
    occurrence_index: 0,
    supporting_quotes: [],
    intended_meaning: 'Many people eat it every day.',
    diagnosis: 'Plural subject with a singular verb form.',
    suggested_change: 'people eat',
    voice_preservation: {
      preserves_stance: true,
      preserves_central_meaning: true,
      register_is_the_target: false,
    },
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

function output(observations: LlmItem[], overrides: Record<string, unknown> = {}) {
  return {
    base_correction_strategy: 'focused',
    principal_focus: 'grammar',
    strategy_rationale: 'Several substantial categories compete, so grammar is treated thoroughly.',
    observations,
    ...overrides,
  };
}

function fakeLlm(payload: unknown): ObservationLlmClient & { calls: number } {
  const client = {
    calls: 0,
    async generate() {
      client.calls += 1;
      return payload;
    },
  };
  return client;
}

async function run(
  payload: unknown,
  candidate = CANDIDATE,
): Promise<ObservationExtractionResult> {
  return extractObservations(
    { candidate_response: candidate, task_analysis: TASK_ANALYSIS },
    { llm: fakeLlm(payload) },
  );
}

test('setup: build the task analysis fixture', async () => {
  TASK_ANALYSIS = await buildTaskAnalysis();
  assert.equal(TASK_ANALYSIS.task_type, 'essay');
});

// ---------------------------------------------------------------------------
// Doc 02 scenario matrix
// ---------------------------------------------------------------------------

test('A — a narrow spelling and punctuation script may be treated comprehensively', async () => {
  const result = await run(
    output(
      [
        item({
          domain: 'spelling',
          text_quote: 'populer',
          diagnosis: 'Misspelling of a common adjective.',
          suggested_change: 'popular',
          foundational_importance: 'target_level_control',
          teacher_dna_rule_ids: ['R34'],
        }),
      ],
      {
        base_correction_strategy: 'comprehensive',
        principal_focus: null,
        strategy_rationale: 'The issues are limited to one short, low-explanation category.',
      },
    ),
  );

  assert.equal(result.base_correction_strategy, 'comprehensive');
  assert.equal(result.principal_focus, null);
  assert.equal(result.observations.length, 1);
});

test('B — a mixed high-error script selects a focus and keeps meaning failures outside it', async () => {
  const result = await run(
    output([
      item(),
      item({
        domain: 'vocabulary_collocation',
        observation_type: 'clarity_issue',
        text_quote: 'should to reduce',
        diagnosis: 'The modal is followed by "to", so the intended action is unclear.',
        suggested_change: 'should reduce',
        communicative_impact: 'blocked',
        teacher_dna_rule_ids: ['R18', 'R36'],
      }),
      item({
        domain: 'spelling',
        text_quote: 'populer',
        diagnosis: 'Misspelling of a common adjective.',
        suggested_change: 'popular',
        communicative_impact: 'minor',
      }),
    ]),
  );

  assert.equal(result.base_correction_strategy, 'focused');
  assert.equal(result.principal_focus, 'grammar');
  assert.equal(result.observations.length, 3);

  const blocking = result.observations.filter((o) => o.meaning_blocking);
  assert.equal(blocking.length, 1);
  assert.notEqual(blocking[0].domain, result.principal_focus);
});

test('C — an isolated lapse is recorded briefly, with no forced grammar lesson', async () => {
  const result = await run(
    output([
      item({
        text_quote: 'he feel tired',
        diagnosis: 'Third-person singular -s is missing on the verb.',
        suggested_change: 'he feels tired',
        knowledge_status: 'likely_lapse',
        within_script_frequency: 'isolated',
        learning_opportunity: null,
      }),
    ]),
  );

  const [observation] = result.observations;
  assert.equal(observation.knowledge_status, 'likely_lapse');
  assert.equal(observation.learning_opportunity, undefined);
});

test('D — a repeated current-script error is repeated_in_script, never a learner-history claim', async () => {
  const result = await run(
    output([
      item({
        text_quote: 'people eats',
        diagnosis: 'Subject–verb agreement slips on a plural subject.',
        suggested_change: 'people eat',
        within_script_frequency: 'systematic_in_script',
        pattern_key: 'grammar:subject_verb_agreement',
      }),
      item({
        text_quote: 'My friend eat',
        diagnosis: 'Subject–verb agreement slips on a singular subject.',
        suggested_change: 'My friend eats',
        within_script_frequency: 'systematic_in_script',
        pattern_key: 'grammar:subject_verb_agreement',
      }),
      item({
        text_quote: 'he feel tired',
        diagnosis: 'Third-person singular -s is missing.',
        suggested_change: 'he feels tired',
        within_script_frequency: 'systematic_in_script',
        pattern_key: 'grammar:subject_verb_agreement',
      }),
    ]),
  );

  assert.equal(result.observations.length, 3);
  assert.equal(result.pattern_groups.length, 1);
  assert.equal(result.pattern_groups[0].observation_ids.length, 3);
  assert.ok(result.observations.every((o) => o.within_script_frequency === 'systematic_in_script'));
  assert.deepEqual(findHistoryClaims(result), []);
});

test('D2 — a longitudinal claim is rejected outright', async () => {
  await assert.rejects(
    () =>
      run(
        output([
          item({
            diagnosis: 'This is a recurring learner error that was previously taught.',
          }),
        ]),
      ),
    ObservationValidationError,
  );
});

test('E — an abstract repeated claim becomes a development observation, not an invented example', async () => {
  const result = await run(
    output([
      item({
        domain: 'content_development',
        observation_type: 'development_opportunity',
        scope: 'local',
        text_quote: 'it is bad for our health',
        diagnosis: 'The claim is restated rather than grounded in a concrete case.',
        suggested_change: null,
        voice_preservation: null,
        intended_meaning: 'Fast food damages health.',
        learning_opportunity: {
          transferable_point: 'Ground a claim with one concrete layer: an example, a cause or a consequence.',
          teaching_prompt: 'What would this look like in practice?',
        },
        teacher_dna_rule_ids: ['R14', 'R15'],
      }),
    ]),
  );

  const [observation] = result.observations;
  assert.equal(observation.observation_type, 'development_opportunity');
  assert.equal(observation.suggested_change, undefined);
  assert.equal(observation.learning_opportunity?.teaching_prompt, 'What would this look like in practice?');
});

test('F — an appropriate rhetorical device in an informal genre can be a genuine strength', async () => {
  const result = await run(
    output([
      item({
        domain: 'organisation_cohesion',
        observation_type: 'strength',
        polarity: 'positive',
        text_quote: 'However,',
        diagnosis: 'Effective contrast: it clearly shifts from the general claim to the writer’s position.',
        suggested_change: null,
        voice_preservation: null,
        communicative_impact: 'none',
        teacher_dna_rule_ids: ['R26', 'R46'],
      }),
    ]),
  );

  const [observation] = result.observations;
  assert.equal(observation.polarity, 'positive');
  assert.equal(observation.observation_type, 'strength');
  assert.ok(observation.renderable_locally);
});

test('G — the same device in the wrong genre is a register mismatch, not a strength', async () => {
  const reportAnalysis = await buildTaskAnalysis(
    'Your teacher has asked you to write a report describing the sports facilities at your school.',
  );
  const result = await extractObservations(
    { candidate_response: CANDIDATE, task_analysis: reportAnalysis },
    {
      llm: fakeLlm(
        output([
          item({
            domain: 'communicative_appropriacy',
            observation_type: 'appropriacy_issue',
            text_quote: 'I completely agree',
            diagnosis: 'A personal, conversational stance conflicts with the objective register the task requires.',
            suggested_change: 'The evidence suggests',
            voice_preservation: {
              preserves_stance: true,
              preserves_central_meaning: true,
              register_is_the_target: true,
            },
            teacher_dna_rule_ids: ['R60'],
          }),
        ]),
      ),
    },
  );

  const [observation] = result.observations;
  assert.equal(observation.observation_type, 'appropriacy_issue');
  assert.notEqual(observation.polarity, 'positive');
  assert.equal(observation.voice_preservation?.register_is_the_target, true);
});

test('H — an unusual but defensible phrase is not normalised automatically', async () => {
  const result = await run(
    output([
      item({
        domain: 'naturalness',
        observation_type: 'naturalness_issue',
        polarity: 'neutral',
        text_quote: 'very populer today',
        diagnosis: 'The phrasing is unusual but defensible; the meaning and register hold.',
        suggested_change: null,
        voice_preservation: null,
        communicative_impact: 'none',
        teacher_dna_rule_ids: ['R20', 'R22'],
      }),
    ]),
  );

  assert.equal(result.observations[0].suggested_change, undefined);
  assert.equal(result.observations[0].polarity, 'neutral');
});

test('I — mechanical connectors are diagnosed as a relationship problem, never as a count', async () => {
  const result = await run(
    output([
      item({
        domain: 'organisation_cohesion',
        observation_type: 'organisation_issue',
        scope: 'global',
        text_quote: null,
        supporting_quotes: [
          { quote: 'However,', occurrence_index: 0 },
          { quote: 'In conclusion,', occurrence_index: 0 },
        ],
        diagnosis: 'The connectors signal relationships the sentences do not actually express.',
        suggested_change: null,
        voice_preservation: null,
        teacher_dna_rule_ids: ['R26'],
      }),
    ]),
  );

  const [observation] = result.observations;
  assert.equal(observation.supporting_evidence.length, 2);
  assert.equal('count' in observation, false);
  assert.equal('connector_count' in observation, false);
});

test('J — an ambitious attempt is recognised without any reward or penalty', async () => {
  const result = await run(
    output([
      item({
        text_quote: 'because it is cheap and fast',
        diagnosis: 'A two-part reason is attempted; the coordination is not yet controlled.',
        suggested_change: 'because it is cheap and quick to buy',
        ambitious_attempt: true,
        teacher_dna_rule_ids: ['R05', 'R06'],
      }),
    ]),
  );

  assert.equal(result.observations[0].ambitious_attempt, true);
  assert.deepEqual(findScoringLeakage(result), []);
});

test('K — a genuine strength names the specific effective choice', async () => {
  const result = await run(
    output([
      item({
        domain: 'vocabulary_collocation',
        observation_type: 'strength',
        polarity: 'positive',
        text_quote: 'three times a week',
        diagnosis: 'Precise frequency expression that makes the example concrete.',
        suggested_change: null,
        voice_preservation: null,
        communicative_impact: 'none',
        teacher_dna_rule_ids: ['R46'],
      }),
    ]),
  );

  assert.equal(result.observations[0].polarity, 'positive');
  assert.ok(result.observations[0].diagnosis.length > 20);
});

test('L — basic correctness produces no manufactured praise and no quota', async () => {
  const result = await run(
    output([], {
      base_correction_strategy: 'comprehensive',
      principal_focus: null,
      strategy_rationale: 'The script offers no issue worth teaching and no genuine strength.',
    }),
  );

  assert.equal(result.observations.length, 0);
  assert.equal(result.observations.filter((o) => o.polarity === 'positive').length, 0);
  assert.equal(result.status, 'complete');
});

test('M — a suggestion that reverses the learner’s opinion is rejected', async () => {
  await assert.rejects(
    () =>
      run(
        output([
          item({
            text_quote: 'it is bad for our health',
            diagnosis: 'Rephrasing proposal.',
            suggested_change: 'it is good for our health',
          }),
        ]),
      ),
    ObservationValidationError,
  );
});

test('M2 — a suggestion that flips a negation is rejected, but a legitimate rephrasing is not', () => {
  const preservation = {
    preserves_stance: true,
    preserves_central_meaning: true,
  };
  assert.ok(
    checkIntentPreservation({
      text_quote: 'Fast food is not healthy',
      suggested_change: 'Fast food is healthy',
      voice_preservation: preservation,
    }).includes('negation_flipped'),
  );
  assert.ok(
    checkIntentPreservation({
      text_quote: 'reading books is a good habit',
      suggested_change: 'reading books is a bad habit',
      voice_preservation: preservation,
    }).includes('stance_reversed'),
  );
  assert.deepEqual(
    checkIntentPreservation({
      text_quote: 'I do not agree with this idea',
      suggested_change: 'I disagree with this idea',
      voice_preservation: preservation,
    }),
    [],
  );
  assert.deepEqual(
    checkIntentPreservation({
      text_quote: 'people eats',
      suggested_change: 'people eat',
      voice_preservation: undefined,
    }),
    ['missing_voice_preservation'],
  );
});

test('N — a meaning-blocking observation survives every post-processing step', async () => {
  const result = await run(
    output([
      item({
        text_quote: 'should to reduce',
        diagnosis: 'The intended action cannot be recovered reliably.',
        suggested_change: 'should reduce',
        communicative_impact: 'blocked',
      }),
      item({
        domain: 'spelling',
        text_quote: 'populer',
        diagnosis: 'Misspelling.',
        suggested_change: 'popular',
      }),
    ]),
  );

  assert.equal(result.observations.filter((o) => o.meaning_blocking).length, 1);
});

test('O — many low-impact issues are all recorded, with no truncation and no overload rule', async () => {
  const quotes = ['Fast food', 'today', 'cheap', 'fast', 'health', 'tired', 'week'];
  const result = await run(
    output(
      quotes.map((quote, index) =>
        item({
          domain: 'punctuation',
          text_quote: quote,
          occurrence_index: 0,
          diagnosis: `Minor issue ${index + 1} affecting readability only.`,
          suggested_change: null,
          voice_preservation: null,
          communicative_impact: 'none',
          pedagogical_priority: 'low',
        }),
      ),
    ),
  );

  assert.equal(result.observations.length, quotes.length);
});

test('P — with no learner history, no previously-taught or improvement claim can be made', async () => {
  for (const diagnosis of [
    'The student already knows this form.',
    'This has improved since the previous writing.',
    'This pattern was previously taught.',
  ]) {
    await assert.rejects(() => run(output([item({ diagnosis })])), ObservationValidationError);
  }
});

test('Q — a quote that is not in the response fails binding instead of getting fake offsets', async () => {
  const result = await run(
    output([
      item({
        text_quote: 'a sentence the student never wrote',
        diagnosis: 'Hallucinated evidence.',
        suggested_change: null,
        voice_preservation: null,
      }),
    ]),
  );

  const [observation] = result.observations;
  assert.equal(observation.binding_status, 'unbindable');
  assert.equal(observation.renderable_locally, false);
  assert.equal(observation.span_start, undefined);
  assert.equal(observation.span_end, undefined);
  assert.equal(result.binding_failures.length, 1);
  assert.equal(result.binding_failures[0].reason, 'quote_not_found');
});

test('R — occurrence_index resolves the intended occurrence of a repeated phrase', async () => {
  assert.equal(countQuoteOccurrences(CANDIDATE, 'fast food'), 3);

  const result = await run(
    output([
      item({
        text_quote: 'fast food',
        occurrence_index: 1,
        domain: 'vocabulary_collocation',
        diagnosis: 'Second mention could be replaced by a pronoun to avoid repetition.',
        suggested_change: null,
        voice_preservation: null,
      }),
    ]),
  );

  const [observation] = result.observations;
  // Occurrence 0 is the capitalised "Fast food" that opens the script.
  const lower = CANDIDATE.toLowerCase();
  const expectedStart = lower.indexOf('fast food', lower.indexOf('fast food') + 1);
  assert.equal(observation.span_start, expectedStart);
  assert.equal(observation.bound_text, 'fast food');
  assert.ok(verifyBinding(CANDIDATE, observation.span_start!, observation.span_end!, 'fast food'));
});

test('S — a genuinely global observation exists without pretending to occupy one span', async () => {
  const result = await run(
    output([
      item({
        domain: 'organisation_cohesion',
        observation_type: 'organisation_issue',
        scope: 'global',
        text_quote: null,
        supporting_quotes: [{ quote: 'In conclusion,', occurrence_index: 0 }],
        diagnosis: 'The argument reaches its conclusion before the second reason is developed.',
        suggested_change: null,
        voice_preservation: null,
      }),
    ]),
  );

  const [observation] = result.observations;
  assert.equal(observation.binding_status, 'global_no_local_span');
  assert.equal(observation.renderable_locally, false);
  assert.equal(observation.span_start, undefined);
  assert.equal(observation.supporting_evidence.length, 1);
  assert.equal(result.binding_failures.length, 0);
});

test('T — a legitimate variety of English is not corrected as an error', async () => {
  const result = await run(
    output([
      item({
        domain: 'naturalness',
        observation_type: 'naturalness_issue',
        polarity: 'neutral',
        text_quote: 'three times a week',
        diagnosis: 'A consistent, appropriate and understandable variant; no change is needed.',
        suggested_change: null,
        voice_preservation: null,
        communicative_impact: 'none',
        teacher_dna_rule_ids: ['R22'],
      }),
    ]),
  );

  assert.equal(result.observations[0].suggested_change, undefined);
});

// ---------------------------------------------------------------------------
// Score-free and history-free regressions
// ---------------------------------------------------------------------------

test('the observation result contains no scoring or Cambridge criterion routing', async () => {
  const result = await run(output([item(), item({ domain: 'spelling', text_quote: 'populer', diagnosis: 'Misspelling.', suggested_change: 'popular' })]));

  assert.deepEqual(findScoringLeakage(result), []);
  const serialised = JSON.stringify(result);
  for (const key of FORBIDDEN_OBSERVATION_KEYS) {
    assert.equal(serialised.includes(`"${key}":`), false, `result must not contain a "${key}" field`);
  }
});

test('scoring content in the model output is rejected rather than absorbed', async () => {
  await assert.rejects(
    () => run(output([item({ diagnosis: 'This costs the candidate a band 2 outcome.' })])),
    ObservationValidationError,
  );
  await assert.rejects(
    () => run(output([item({ diagnosis: 'CEFR level is affected here.' })])),
    ObservationValidationError,
  );
});

test('learner history cannot be passed into observation extraction', async () => {
  await assert.rejects(
    () =>
      extractObservations(
        {
          candidate_response: CANDIDATE,
          task_analysis: TASK_ANALYSIS,
          learner_history: { prior_scores: [12] },
        } as never,
        { llm: fakeLlm(output([item()])) },
      ),
    ObservationConfigurationError,
  );
});

test('provenance records that the call ran without learner history', async () => {
  const result = await run(output([item()]));

  assert.equal(result.provenance.learner_history_available, false);
  assert.equal(result.provenance.teacher_dna_version, SOURCE_DOC_VERSIONS.teacher_dna);
  assert.equal(result.provenance.llm_calls, 1);
  assert.equal(result.provenance.task_fingerprint, TASK_ANALYSIS.provenance.task_fingerprint);
});

test('the prompt withholds every rule that needs learner context', () => {
  const prompt = buildObservationExtractionPrompt({
    candidate_response: CANDIDATE,
    task_analysis: TASK_ANALYSIS,
  });

  assert.ok(LEARNER_CONTEXT_RULE_IDS.length > 0);
  for (const ruleId of LEARNER_CONTEXT_RULE_IDS) {
    const rule = TEACHER_DNA_RULES.find((r) => r.id === ruleId);
    assert.equal(
      prompt.system.includes(`${ruleId}. ${rule?.rule}`),
      false,
      `${ruleId} needs learner context and must not be in force`,
    );
  }
  assert.ok(prompt.system.includes('R01.'));
  assert.equal(HISTORY_FREE_RULE_IDS.length + LEARNER_CONTEXT_RULE_IDS.length, 60);
  assert.ok(prompt.system.includes('Do not score.'));
  assert.ok(prompt.system.includes('Do not decide which Cambridge criterion'));
});

// ---------------------------------------------------------------------------
// Deterministic identity, deduplication and ordering
// ---------------------------------------------------------------------------

test('observation ids are stable and independent of the model’s array order', async () => {
  const a = item({ text_quote: 'populer', domain: 'spelling', diagnosis: 'Misspelling.', suggested_change: 'popular' });
  const b = item({ text_quote: 'he feel tired', diagnosis: 'Missing third-person -s.', suggested_change: 'he feels tired' });

  const first = await run(output([a, b]));
  const second = await run(output([b, a]));

  assert.deepEqual(
    first.observations.map((o) => o.observation_id),
    second.observations.map((o) => o.observation_id),
  );
  assert.deepEqual(first.observations, second.observations);
});

test('observations are ordered by their position in the script, globals last', async () => {
  const result = await run(
    output([
      item({
        scope: 'global',
        text_quote: null,
        supporting_quotes: [],
        domain: 'content_development',
        observation_type: 'development_opportunity',
        diagnosis: 'The second reason is asserted rather than developed.',
        suggested_change: null,
        voice_preservation: null,
      }),
      item({ text_quote: 'he feel tired', diagnosis: 'Missing third-person -s.', suggested_change: 'he feels tired' }),
      item({ domain: 'spelling', text_quote: 'populer', diagnosis: 'Misspelling.', suggested_change: 'popular' }),
    ]),
  );

  const spans = result.observations.map((o) => o.span_start ?? Number.MAX_SAFE_INTEGER);
  assert.deepEqual(spans, [...spans].sort((x, y) => x - y));
  assert.equal(result.observations[result.observations.length - 1].scope, 'global');
});

test('the same problem described twice collapses, but distinct occurrences survive', async () => {
  const duplicate = item({ text_quote: 'populer', domain: 'spelling', diagnosis: 'Misspelling.', suggested_change: 'popular' });
  const result = await run(
    output([
      duplicate,
      { ...duplicate },
      item({ text_quote: 'he feel tired', diagnosis: 'Missing third-person -s.', suggested_change: 'he feels tired' }),
    ]),
  );

  assert.equal(result.observations.length, 2);
});

test('computeObservationId depends on semantics and versions, not on order', () => {
  const base = {
    candidate_response_hash: 'sha256:abc',
    task_fingerprint: 'sha256:def',
    prompt_version: '1.0.0',
    schema_version: '1.0.0',
    model_snapshot: 'gpt-4o-2024-08-06',
    domain: 'grammar',
    observation_type: 'accuracy_error',
    polarity: 'negative',
    evidence_key: 'span:10:20',
    diagnosis: 'Missing third-person -s.',
  };

  assert.equal(computeObservationId(base), computeObservationId({ ...base }));
  assert.notEqual(computeObservationId(base), computeObservationId({ ...base, evidence_key: 'span:30:40' }));
  assert.notEqual(computeObservationId(base), computeObservationId({ ...base, prompt_version: '1.1.0' }));
  assert.notEqual(
    computeObservationId(base),
    computeObservationId({ ...base, model_snapshot: 'gpt-4o-2024-11-20' }),
  );
});

// ---------------------------------------------------------------------------
// Evidence binding unit tests
// ---------------------------------------------------------------------------

test('binding tolerates curly apostrophes, collapsed whitespace and case', () => {
  const text = "The teacher's\n  advice   was clear.";

  const apostrophe = bindQuote(text, 'The teacher’s advice');
  assert.equal(apostrophe.status, 'bound');
  if (apostrophe.status !== 'bound') throw new Error('unreachable');
  assert.equal(apostrophe.bound_text, "The teacher's\n  advice");
  assert.ok(verifyBinding(text, apostrophe.span_start, apostrophe.span_end, apostrophe.bound_text));

  const casing = bindQuote(text, 'ADVICE WAS CLEAR');
  assert.equal(casing.status, 'bound');
  if (casing.status !== 'bound') throw new Error('unreachable');
  assert.equal(casing.bound_text, 'advice   was clear');
});

test('binding never invents offsets and reports why it failed', () => {
  const missing = bindQuote(CANDIDATE, 'a phrase that is absent');
  assert.equal(missing.status, 'failed');
  if (missing.status !== 'failed') throw new Error('unreachable');
  assert.equal(missing.reason, 'quote_not_found');

  const outOfRange = bindQuote(CANDIDATE, 'fast food', 9);
  assert.equal(outOfRange.status, 'failed');
  if (outOfRange.status !== 'failed') throw new Error('unreachable');
  assert.equal(outOfRange.reason, 'occurrence_out_of_range');
  assert.equal(outOfRange.occurrences_found, 3);
});

test('every occurrence of a repeated identical phrase binds to its own span', () => {
  const spans = [0, 1, 2].map((index) => bindQuote(CANDIDATE, 'fast food', index));
  const starts = spans.map((span) => (span.status === 'bound' ? span.span_start : -1));

  assert.equal(new Set(starts).size, 3);
  assert.ok(starts.every((start) => start >= 0));
  for (const span of spans) {
    if (span.status !== 'bound') throw new Error('unreachable');
    assert.equal(CANDIDATE.slice(span.span_start, span.span_end).toLowerCase(), 'fast food');
  }
});

// ---------------------------------------------------------------------------
// Contract-level guards
// ---------------------------------------------------------------------------

test('the observation contract rejects fabricated local rendering and derived flags', () => {
  const base = {
    observation_id: 'obs_1',
    domain: 'grammar' as const,
    observation_type: 'accuracy_error' as const,
    polarity: 'negative' as const,
    scope: 'local' as const,
    text_quote: 'people eats',
    binding_status: 'unbindable' as const,
    renderable_locally: false,
    supporting_evidence: [],
    diagnosis: 'Agreement slip.',
    communicative_impact: 'minor' as const,
    meaning_blocking: false,
    within_script_frequency: 'isolated' as const,
    knowledge_status: 'uncertain' as const,
    foundational_importance: 'basic_expected_form' as const,
    transferability: 'similar_tasks' as const,
    pedagogical_priority: 'high' as const,
    confidence: 'high' as const,
    ambitious_attempt: false,
    teacher_dna_rule_ids: ['R17'],
  };

  assert.equal(observationSchema.safeParse(base).success, true);
  assert.equal(
    observationSchema.safeParse({ ...base, renderable_locally: true }).success,
    false,
  );
  assert.equal(
    observationSchema.safeParse({ ...base, meaning_blocking: true }).success,
    false,
  );
  assert.equal(
    observationSchema.safeParse({ ...base, suggested_change: 'people eat' }).success,
    false,
  );
  assert.equal(
    observationSchema.safeParse({ ...base, polarity: 'positive' }).success,
    false,
  );
  assert.equal(
    observationSchema.safeParse({ ...base, teacher_dna_rule_ids: ['R99'] }).success,
    false,
  );
  assert.equal(
    observationSchema.safeParse({ ...base, criterion: 'content' }).success,
    false,
  );
});

test('the service refuses to run without an explicit pinned model and client', async () => {
  await assert.rejects(
    () => extractObservations({ candidate_response: CANDIDATE, task_analysis: TASK_ANALYSIS }, {}),
    ObservationConfigurationError,
  );
  await assert.rejects(
    () =>
      extractObservations(
        {
          candidate_response: CANDIDATE,
          task_analysis: TASK_ANALYSIS,
          model_config: { model: 'gpt-4o' },
        },
        { llm: fakeLlm(output([item()])) },
      ),
    Error,
  );
  await assert.rejects(
    () =>
      extractObservations(
        { candidate_response: '   ', task_analysis: TASK_ANALYSIS },
        { llm: fakeLlm(output([item()])) },
      ),
    ObservationConfigurationError,
  );
});

test('a focused strategy must name its focus and a comprehensive one must not', async () => {
  await assert.rejects(
    () => run(output([item()], { base_correction_strategy: 'focused', principal_focus: null })),
    ObservationValidationError,
  );
});

test('the model config used by Phase 3 is the pinned benchmark snapshot', async () => {
  const result = await run(output([item()]));
  assert.equal(result.provenance.model_config.model, TASK_ANALYSIS_BENCHMARK_MODEL.model);
  assert.equal(result.provenance.model_config.temperature, 0);
});
