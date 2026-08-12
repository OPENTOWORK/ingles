#!/usr/bin/env node
/**
 * Genera las fixtures de feedback v3 que usa la vista de previsualización (Fase 8).
 *
 * No llama a OpenAI: ejecuta la tubería real de las fases 2, 3 y 6 con clientes
 * deterministas, de forma que el payload resultante es un `feedback_payload`
 * VALIDADO por los contratos reales, no un JSON escrito a mano.
 *
 * Uso:
 *   npm run writing:fixtures
 *
 * Salida:
 *   src/features/writing/__tests__/fixtures/ui/<nombre>.json
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { analyseWritingTask } from '../src/features/writing/services/analysis/task-analysis.service.ts';
import { extractObservations } from '../src/features/writing/services/observation/observation.service.ts';
import {
  composeFeedback,
  selectAnnotatable,
  selectEligibleStrengths,
} from '../src/features/writing/services/feedback/feedback-composer.service.ts';
import {
  SCHEMA_VERSION,
  SOURCE_DOC_VERSIONS,
  WRITING_ENGINE_VERSION,
} from '../src/features/writing/domain/engine-version.ts';
import { feedbackPayloadSchema } from '../src/features/writing/domain/schemas.ts';

const OUT_DIR = path.join(
  process.cwd(),
  'src',
  'features',
  'writing',
  '__tests__',
  'fixtures',
  'ui',
);

const MODEL = {
  model: 'gpt-4o-2024-08-06',
  snapshot_id: 'gpt-4o-2024-08-06',
  temperature: 0,
  response_format: 'json_schema',
};

const ESSAY_TASK = [
  'In your English class you have been talking about food and health.',
  'Your teacher has asked you to write an essay.',
  '',
  'Write an essay using all the notes and give reasons for your point of view.',
  '',
  'Some people say that fast food is always a bad thing to eat. Do you agree?',
  '',
  'Notes:',
  '- health',
  '- price and convenience',
  '- your own idea',
  '',
  'Write your essay in 140–190 words.',
].join('\n');

const CANDIDATE = [
  'Nowadays, fast food is more popular than ever, especially among young people who live in big cities. Some people claim that it is always a bad thing to eat, but I do not completely agree with this opinion.',
  '',
  'Firstly, it is true that eating fast food every day is harmful for our health. My friend eat hamburgers three times a week and he always feels tired in the afternoon. Doctors say that too much salt and sugar can cause serious problems.',
  '',
  'However, we must also considerate the price and the convenience. For a student who works and studies, a cheap meal that arrives in ten minutes is sometimes the only realistic option.',
  '',
  'In my opinion, the problem is not fast food itself but how often we eat it. If we cook at home during the week and enjoy a burger ocassionally, we can have a balanced life without giving up the things we like.',
].join('\n');

// ---------------------------------------------------------------------------
// Fase 2 y 3
// ---------------------------------------------------------------------------

const taskLlm = {
  async generate() {
    return {
      target_reader: 'Your English teacher',
      target_reader_evidence_quote: 'Your teacher has asked you to write an essay.',
      communicative_purpose: 'Discuss whether fast food is always bad and give a clear opinion',
      register: 'neutral',
      tone: null,
      mandatory_content_points: [
        { point: 'Health', evidence_quote: '- health' },
        { point: 'Price and convenience', evidence_quote: '- price and convenience' },
        { point: 'Your own idea', evidence_quote: '- your own idea' },
      ],
      required_functions: [
        { function: 'Give and justify an opinion', evidence_quote: 'give reasons for your point of view' },
      ],
      task_specific_mandatory_conventions: [],
      ambiguities: [],
      inferred_task_type: null,
    };
  },
};

function observation(overrides) {
  return {
    domain: 'grammar',
    observation_type: 'accuracy_error',
    polarity: 'negative',
    scope: 'local',
    text_quote: null,
    occurrence_index: 0,
    supporting_quotes: [],
    intended_meaning: 'Unchanged.',
    diagnosis: 'Diagnosis.',
    suggested_change: null,
    voice_preservation: null,
    communicative_impact: 'minor',
    within_script_frequency: 'isolated',
    knowledge_status: 'uncertain',
    foundational_importance: 'target_level_control',
    transferability: 'similar_tasks',
    pedagogical_priority: 'medium',
    confidence: 'high',
    ambitious_attempt: false,
    learning_opportunity: null,
    teacher_dna_rule_ids: ['R17'],
    pattern_key: null,
    ...overrides,
  };
}

const preserved = {
  preserves_stance: true,
  preserves_central_meaning: true,
  register_is_the_target: false,
};

/** Las observaciones base: errores reales del texto, más dos fortalezas genuinas. */
const BASE_OBSERVATIONS = [
  observation({
    domain: 'grammar',
    observation_type: 'accuracy_error',
    text_quote: 'My friend eat hamburgers',
    intended_meaning: 'My friend eats hamburgers.',
    diagnosis:
      'The third-person singular -s is missing on the verb after a singular subject.',
    suggested_change: 'My friend eats hamburgers',
    voice_preservation: preserved,
    knowledge_status: 'likely_lapse',
    foundational_importance: 'basic_expected_form',
    transferability: 'across_writing_and_use_of_english',
    pedagogical_priority: 'high',
  }),
  observation({
    domain: 'vocabulary_collocation',
    observation_type: 'accuracy_error',
    text_quote: 'we must also considerate',
    intended_meaning: 'We must also consider.',
    diagnosis:
      '"Considerate" is an adjective meaning kind; the verb the sentence needs is "consider".',
    suggested_change: 'we must also consider',
    voice_preservation: preserved,
    knowledge_status: 'likely_knowledge_gap',
    pedagogical_priority: 'high',
    teacher_dna_rule_ids: ['R25'],
  }),
  observation({
    domain: 'spelling',
    observation_type: 'accuracy_error',
    text_quote: 'ocassionally',
    intended_meaning: 'occasionally',
    diagnosis: 'The double letters are swapped: "occasionally" has cc and one s.',
    suggested_change: 'occasionally',
    voice_preservation: preserved,
    knowledge_status: 'likely_lapse',
    communicative_impact: 'none',
    pedagogical_priority: 'low',
    teacher_dna_rule_ids: ['R19'],
  }),
  observation({
    domain: 'organisation_cohesion',
    observation_type: 'organisation_issue',
    text_quote: 'Firstly,',
    intended_meaning: 'The writer opens a sequence of arguments.',
    diagnosis:
      '"Firstly" opens a sequence that the next paragraph never continues, so the reader waits for a "secondly" that does not arrive.',
    suggested_change: null,
    voice_preservation: null,
    pedagogical_priority: 'medium',
    teacher_dna_rule_ids: ['R30'],
  }),
  observation({
    domain: 'content_development',
    observation_type: 'development_opportunity',
    text_quote: 'Doctors say that too much salt and sugar can cause serious problems',
    intended_meaning: 'Medical opinion supports the health argument.',
    diagnosis:
      'The claim is attributed to doctors but not developed: no consequence, example or timescale follows it.',
    suggested_change: null,
    voice_preservation: null,
    pedagogical_priority: 'medium',
    teacher_dna_rule_ids: ['R22'],
  }),
  // Puntuación: local y vinculable, pero sin categoría del mapa en v1. Debe
  // quedarse global y no producir marca local.
  observation({
    domain: 'punctuation',
    observation_type: 'clarity_issue',
    text_quote: 'For a student who works and studies, a cheap meal',
    intended_meaning: 'The writer frames a specific reader.',
    diagnosis:
      'The introductory clause is punctuated correctly here, but the same pattern is unpunctuated elsewhere in the script.',
    suggested_change: null,
    voice_preservation: null,
    communicative_impact: 'none',
    pedagogical_priority: 'low',
    teacher_dna_rule_ids: ['R18'],
  }),
  // Registro: global por construcción.
  observation({
    domain: 'communicative_appropriacy',
    observation_type: 'appropriacy_issue',
    scope: 'global',
    text_quote: null,
    supporting_quotes: [{ quote: 'the things we like', occurrence_index: 0 }],
    intended_meaning: 'The writer closes on a shared, friendly note.',
    diagnosis:
      'The closing sentence drifts towards the conversational, which sits slightly below the neutral essay register the task sets.',
    suggested_change: null,
    voice_preservation: null,
    pedagogical_priority: 'medium',
    teacher_dna_rule_ids: ['R30'],
  }),
];

const STRENGTHS = [
  observation({
    domain: 'strength',
    observation_type: 'strength',
    polarity: 'positive',
    text_quote: 'but I do not completely agree with this opinion',
    intended_meaning: 'The writer states a qualified position.',
    diagnosis:
      'The position is stated with a qualification rather than a flat yes or no, which is exactly what the task asks for.',
    suggested_change: null,
    voice_preservation: null,
    communicative_impact: 'none',
    foundational_importance: 'not_applicable',
    pedagogical_priority: 'low',
    teacher_dna_rule_ids: ['R21'],
  }),
  observation({
    domain: 'strength',
    observation_type: 'strength',
    polarity: 'positive',
    text_quote: 'the problem is not fast food itself but how often we eat it',
    intended_meaning: 'The writer offers an own idea that reframes the question.',
    diagnosis:
      'The own idea reframes the question instead of repeating the notes, and the contrast structure carries it cleanly.',
    suggested_change: null,
    voice_preservation: null,
    communicative_impact: 'none',
    foundational_importance: 'not_applicable',
    pedagogical_priority: 'low',
    teacher_dna_rule_ids: ['R21'],
  }),
];

/** Solapamiento deliberado con "My friend eat hamburgers" para la fixture densa. */
const OVERLAPPING = [
  observation({
    domain: 'vocabulary_collocation',
    observation_type: 'naturalness_issue',
    text_quote: 'eat hamburgers three times a week',
    intended_meaning: 'The writer states how often his friend eats fast food.',
    diagnosis:
      'The frequency phrase is correct but flat; "has hamburgers three times a week" reads more naturally in English.',
    suggested_change: 'has hamburgers three times a week',
    voice_preservation: preserved,
    pedagogical_priority: 'low',
    teacher_dna_rule_ids: ['R26'],
  }),
  observation({
    domain: 'grammar',
    observation_type: 'accuracy_error',
    text_quote: 'a cheap meal that arrives in ten minutes',
    intended_meaning: 'A meal that arrives quickly.',
    diagnosis: 'The relative clause is fine; the article choice before "cheap meal" is the weak point.',
    suggested_change: 'a cheap meal that arrives within ten minutes',
    voice_preservation: preserved,
    pedagogical_priority: 'low',
  }),
  observation({
    domain: 'content_development',
    observation_type: 'development_opportunity',
    text_quote: 'we can have a balanced life',
    intended_meaning: 'Balance is the writer’s conclusion.',
    diagnosis: 'The conclusion names balance but does not show what a balanced week looks like.',
    suggested_change: null,
    voice_preservation: null,
    pedagogical_priority: 'medium',
    teacher_dna_rule_ids: ['R22'],
  }),
];

function observationLlm(items) {
  return {
    async generate() {
      return {
        base_correction_strategy: 'comprehensive',
        principal_focus: null,
        strategy_rationale:
          'The script is controlled enough that no single domain needs to absorb all the attention.',
        observations: items,
      };
    },
  };
}

// ---------------------------------------------------------------------------
// Fase 4 (registro de evaluación determinista, sin llamada al modelo)
// ---------------------------------------------------------------------------

const CRITERION_EVIDENCE = {
  content: 'Doctors say that too much salt and sugar can cause serious problems',
  communicative_achievement: 'but I do not completely agree with this opinion',
  organisation: 'Firstly,',
  language: 'My friend eat hamburgers',
};

const CRITERION_RULE = {
  content: 'C03',
  communicative_achievement: 'CA03',
  organisation: 'O01',
  language: 'L01',
};

function evidence(quote) {
  const start = CANDIDATE.indexOf(quote);
  if (start < 0) throw new Error(`fixture quote not found: ${quote}`);
  return [{ quote, occurrence_index: 0, span_start: start, span_end: start + quote.length, bound_text: quote }];
}

const CRITERION_PROSE = {
  content: {
    summary: 'You cover everything the task asks for; the health point needs a concrete consequence.',
    positive: 'All three notes are addressed and the own idea is genuinely the writer’s own.',
    limiting: 'The health argument is asserted rather than developed with a concrete consequence.',
    next_focus:
      'Develop important claims with a specific consequence or example so the reader sees why they matter.',
  },
  communicative_achievement: {
    summary: 'Your opinion is clear from the start, but the closing drifts below essay register.',
    positive: 'The essay register is held and the opinion is signalled early and clearly.',
    limiting: 'The closing sentence slips towards the conversational.',
    next_focus: 'Keep closing lines in the same neutral essay register you use in the body.',
  },
  organisation: {
    summary: 'The essay shape is easy to follow, but one sequencing signpost is left unfinished.',
    positive: 'Paragraphing is clear and the conclusion returns to the question.',
    limiting: 'A sequencing marker is opened and never completed.',
    next_focus:
      'When you open a sequence like "Firstly", name the next step clearly in the following paragraph.',
  },
  language: {
    summary: 'You try useful B2 structures, but agreement, word form and spelling slips still show.',
    positive: 'A good range of structures for the level, including a conditional in the conclusion.',
    limiting: 'Slips in verb agreement, word form and spelling remain visible.',
    next_focus:
      'Before submitting, read once for subject-verb agreement, word form and spelling slips.',
  },
};

function decision(criterion, mark) {
  const mixed = mark === 2 || mark === 4;
  const prose = CRITERION_PROSE[criterion];
  return {
    criterion,
    mark,
    band_anchor: `Official B2 First ${criterion} band ${mark} descriptor`,
    positive_evidence: [prose.positive],
    limiting_evidence: mark <= 4 ? [prose.limiting] : [],
    text_evidence: evidence(CRITERION_EVIDENCE[criterion]),
    why_not_higher:
      mark === 5
        ? 'Band 5 is the highest available band and its descriptor is met.'
        : `The next band is not reached because the ${criterion} descriptor is not sustained across the whole response.`,
    ...(mark >= 1
      ? { why_not_lower: `The lower band is exceeded because ${criterion} performance is consistent.` }
      : {}),
    ...(mixed
      ? {
          adjacent_band_evidence: {
            lower_band_reference: `${criterion}.band_${mark - 1}`,
            lower_band_evidence: `A band ${mark - 1} feature is observable for ${criterion}.`,
            higher_band_reference: `${criterion}.band_${mark + 1}`,
            higher_band_evidence: `A band ${mark + 1} feature is also observable for ${criterion}.`,
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

function assessment(marks) {
  const [content, communicative, organisation, language] = marks;
  return {
    assessment_record: {
      status: 'complete',
      criteria: {
        content: decision('content', content),
        communicative_achievement: decision('communicative_achievement', communicative),
        organisation: decision('organisation', organisation),
        language: decision('language', language),
      },
      raw_total: content + communicative + organisation + language,
      max_total: 20,
      single_task_scale_claim_allowed: false,
      overall_confidence: 'high',
      word_count: CANDIDATE.trim().split(/\s+/).length,
      word_count_penalty_applied: false,
    },
    provenance: {
      engine_version: WRITING_ENGINE_VERSION,
      schema_version: SCHEMA_VERSION,
      cambridge_assessment_version: SOURCE_DOC_VERSIONS.cambridge_assessment,
      task_requirements_version: SOURCE_DOC_VERSIONS.task_requirements,
      assessment_prompt_version: '1.0.0',
      doc_versions: { ...SOURCE_DOC_VERSIONS },
      model_config: MODEL,
      candidate_response_hash: 'sha256:fixture-candidate',
      task_fingerprint: 'sha256:fixture-task',
      llm_calls: 1,
      learner_history_available: false,
      observation_evidence_index_size: 0,
      calibration_status: 'not_calibrated',
    },
  };
}

// ---------------------------------------------------------------------------
// Fase 6: cliente de composición determinista
// ---------------------------------------------------------------------------

/** Voz de profesor por defecto cuando la observación no tiene texto propio. */
const ANNOTATION_PROSE = {
  grammar: { kind: 'explanation' },
  vocabulary: { kind: 'suggestion' },
  spelling: { kind: 'correction' },
  organisation: { kind: 'teaching_prompt' },
  content: { kind: 'teaching_prompt' },
  strength: { kind: 'strength' },
};

/** Explicación escrita para las citas principales, indexada por la cita exacta. */
const KNOWN_EXPLANATIONS = {
  'My friend eat hamburgers':
    'After a singular subject the present simple takes -s. You use this form correctly elsewhere, so this is a slip worth a final check.',
  'we must also considerate':
    '"Considerate" describes a kind person. The verb you need here is "consider", and the rest of the sentence already works.',
  ocassionally: 'Two c’s and one s: occasionally. The word is right, only the letters slipped.',
  'Firstly,':
    'You open a sequence here. Reading your next paragraph, where does the reader expect the second step to appear?',
  'Doctors say that too much salt and sugar can cause serious problems':
    'You bring doctors in to support the argument. What single consequence could you add so the reader feels why it matters?',
  'eat hamburgers three times a week':
    '"Has hamburgers three times a week" is what a British reader would expect here. Your version is correct, just less idiomatic.',
  'but I do not completely agree with this opinion':
    'This is the move the task is asking for: a position that answers the question without flattening it.',
  'the problem is not fast food itself but how often we eat it':
    'The contrast structure carries a genuinely original point, and it lands in one sentence.',
};

function composerLlm({ candidate, observations, record }) {
  const { annotatable } = selectAnnotatable(observations.observations, candidate);
  const eligible = selectEligibleStrengths(annotatable, observations.observations);
  const eligibleIds = new Set(eligible.map((item) => item.observation_id));
  const strengths = eligible.slice(0, eligible.length >= 2 ? 2 : eligible.length);

  const annotations = annotatable.map((item) => {
    const prose = ANNOTATION_PROSE[item.category_key] ?? ANNOTATION_PROSE.content;
    const isStrength = eligibleIds.has(item.observation_id);
    const kind = isStrength ? 'strength' : item.suggested_change ? 'correction' : prose.kind;
    // Each annotation explains ITS OWN observation: reusing one paragraph per
    // category would make the overlap fixture read like a bug in the interface.
    const explanation = KNOWN_EXPLANATIONS[item.quote] ?? item.diagnosis;
    return {
      observation_id: item.observation_id,
      feedback_kind: kind,
      local_explanation: explanation,
      suggested_change: kind === 'correction' ? item.suggested_change ?? null : null,
      teaching_prompt:
        kind === 'teaching_prompt'
          ? 'Reread this sentence and decide what the reader still needs to know.'
          : null,
    };
  });

  const criterionFeedback = ['content', 'communicative_achievement', 'organisation', 'language'].map(
    (criterion) => {
      const mark = record.criteria[criterion].mark;
      const prose = CRITERION_PROSE[criterion];
      return {
        criterion,
        summary:
          mark === 5
            ? `${prose.summary.split(';')[0].replace(/[.,]\s*$/, '')}, and it holds right through the response.`
            : prose.summary,
        what_worked: prose.positive,
        what_limited_the_band:
          mark === 5
            ? 'Nothing meaningful limits this criterion in this response.'
            : prose.limiting,
        evidence_indices: [0],
        next_focus:
          mark === 5
            ? 'Keep consolidating this: the aim now is to produce it as reliably under exam time pressure.'
            : prose.next_focus,
      };
    },
  );

  const reviewSources = annotatable
    .filter((item) => item.polarity !== 'positive')
    .slice(0, 3);

  const REVIEW_REASONS = {
    grammar:
      'Third-person -s is a small form that examiners notice quickly when it slips in a controlled script.',
    vocabulary:
      'Choosing the right word family keeps your meaning precise without sounding forced.',
    spelling:
      'Spelling slips in common adverbs are easy to miss on a quick read but stand out to an examiner.',
    organisation:
      'An unfinished sequence leaves the reader waiting for a step you promised to give.',
    content:
      'Claims that name a problem without showing its effect read thinner than fully developed arguments.',
  };

  const reviewNext = reviewSources.map((item) => ({
    concept:
      item.category_key === 'grammar'
        ? 'Present simple: third person -s'
        : item.category_key === 'vocabulary'
          ? 'Word families: consider / considerate'
          : item.category_key === 'spelling'
            ? 'Double letters in adverbs'
            : item.category_key === 'organisation'
              ? 'Completing a sequence you have opened'
              : 'Developing a claim with one consequence',
    reason: REVIEW_REASONS[item.category_key] ?? REVIEW_REASONS.content,
    source: 'observation',
    source_ids: [item.observation_id],
  }));

  return {
    async generate() {
      return {
        opening_strengths: strengths.map((item, index) => ({
          observation_id: item.observation_id,
          headline:
            index === 0
              ? 'Your opinion is clear and qualified.'
              : 'Your own idea reframes the question.',
          explanation:
            index === 0
              ? '"I do not completely agree" answers the question and leaves room for the argument you then build.'
              : 'Saying the problem is frequency rather than the food itself gives the essay a position of its own.',
        })),
        annotations,
        criterion_feedback: criterionFeedback,
        review_next: reviewNext,
      };
    },
  };
}

// ---------------------------------------------------------------------------

async function buildFixture({ name, description, observationItems, marks }) {
  const analysis = await analyseWritingTask(
    { source_task_text: ESSAY_TASK, task_type: 'essay' },
    { llm: taskLlm },
  );
  if (analysis.status !== 'complete') throw new Error(`${name}: task analysis failed`);

  const observations = await extractObservations(
    { candidate_response: CANDIDATE, task_analysis: analysis.task_analysis },
    { llm: observationLlm(observationItems) },
  );

  const assessmentResult = assessment(marks);
  const composed = await composeFeedback(
    {
      candidate_response: CANDIDATE,
      task_analysis: analysis.task_analysis,
      observations,
      assessment: assessmentResult,
    },
    {
      llm: composerLlm({
        candidate: CANDIDATE,
        observations,
        record: assessmentResult.assessment_record,
      }),
    },
  );

  // Se valida otra vez aquí: la fixture que llega a la UI es un payload legal.
  const payload = feedbackPayloadSchema.parse(composed.feedback_payload);

  return {
    fixture_name: name,
    description,
    candidate_response: CANDIDATE,
    task_prompt: ESSAY_TASK,
    word_count: CANDIDATE.trim().split(/\s+/).length,
    feedback_payload: payload,
  };
}

const FIXTURES = [
  {
    name: 'standard',
    description:
      'Realistic B2 essay, 13/20, two genuine strengths, five local annotations, one global register issue and one punctuation observation with no local mark.',
    observationItems: [...BASE_OBSERVATIONS, ...STRENGTHS],
    marks: [4, 3, 3, 3],
  },
  {
    name: 'zero-strengths',
    description: 'The same response with no eligible strength: the opening must render nothing at all.',
    observationItems: BASE_OBSERVATIONS,
    marks: [3, 3, 2, 3],
  },
  {
    name: 'dense-overlap',
    description:
      'Many annotations including two overlapping spans, to exercise the segmentation and overlap policy.',
    observationItems: [...BASE_OBSERVATIONS, ...OVERLAPPING, ...STRENGTHS],
    marks: [4, 3, 3, 2],
  },
  {
    name: 'band-five',
    description: 'Band 5 in two criteria: the card must consolidate and never invent a band 6.',
    observationItems: [...BASE_OBSERVATIONS, ...STRENGTHS],
    marks: [5, 5, 4, 4],
  },
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const spec of FIXTURES) {
    const fixture = await buildFixture(spec);
    const file = path.join(OUT_DIR, `${spec.name}.json`);
    fs.writeFileSync(file, `${JSON.stringify(fixture, null, 2)}\n`, 'utf8');
    console.log(
      `ok  ${spec.name}: ${fixture.feedback_payload.annotations.length} annotations, ` +
        `${fixture.feedback_payload.opening_strengths.length} strengths, ` +
        `${fixture.feedback_payload.global_result.raw_total}/20 → ${path.relative(process.cwd(), file)}`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
