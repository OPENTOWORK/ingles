/**
 * Observation extraction prompt (Layer 2 — Teacher DNA).
 *
 * The model reads the candidate response against an already validated task
 * analysis and produces evidence-bound, score-free pedagogical observations.
 * It never scores, never routes anything to a Cambridge criterion, never
 * receives learner history, never emits character offsets and never invents
 * identifiers — code owns all of those.
 */
import { z } from 'zod';
import { PROMPT_VERSIONS } from '../domain/engine-version';
import type { ResolvedTaskAnalysis } from '../domain/types';
import {
  CORRECTION_STRATEGY_RULES,
  HISTORY_FREE_PRIORITY_FACTORS,
  HISTORY_FREE_RULE_IDS,
  STRENGTH_QUALITY_RULES,
  TEACHER_DNA_READING_SEQUENCE,
  TEACHER_DNA_RULES,
  TEACHER_DNA_SAFEGUARDS,
} from './knowledge/doc02-teacher-dna-rules';

export const OBSERVATION_PROMPT_ID = 'writing.observation-extraction';
export const OBSERVATION_PROMPT_VERSION = PROMPT_VERSIONS.observation_assessment;

const OBSERVATION_DOMAINS = [
  'grammar',
  'punctuation',
  'vocabulary_collocation',
  'spelling',
  'organisation_cohesion',
  'content_development',
  'communicative_appropriacy',
  'naturalness',
  'strength',
] as const;

const OBSERVATION_TYPES = [
  'accuracy_error',
  'clarity_issue',
  'naturalness_issue',
  'appropriacy_issue',
  'organisation_issue',
  'development_opportunity',
  'strength',
] as const;

export const observationLlmItemSchema = z
  .object({
    domain: z.enum(OBSERVATION_DOMAINS),
    observation_type: z.enum(OBSERVATION_TYPES),
    polarity: z.enum(['positive', 'negative', 'neutral']),
    scope: z.enum(['local', 'global']),
    text_quote: z.string().min(1).nullable(),
    occurrence_index: z.number().int().min(0),
    supporting_quotes: z.array(
      z
        .object({
          quote: z.string().min(1),
          occurrence_index: z.number().int().min(0),
        })
        .strict(),
    ),
    intended_meaning: z.string().min(1).nullable(),
    diagnosis: z.string().min(1),
    suggested_change: z.string().min(1).nullable(),
    voice_preservation: z
      .object({
        preserves_stance: z.boolean(),
        preserves_central_meaning: z.boolean(),
        register_is_the_target: z.boolean(),
      })
      .strict()
      .nullable(),
    communicative_impact: z.enum(['blocked', 'unreliable', 'impaired', 'minor', 'none']),
    within_script_frequency: z.enum([
      'isolated',
      'repeated_in_script',
      'systematic_in_script',
      'not_applicable',
    ]),
    knowledge_status: z.enum(['likely_lapse', 'likely_knowledge_gap', 'uncertain']),
    foundational_importance: z.enum([
      'minor_refinement',
      'target_level_control',
      'basic_expected_form',
      'not_applicable',
    ]),
    transferability: z.enum([
      'very_local',
      'similar_tasks',
      'across_writing_and_use_of_english',
    ]),
    pedagogical_priority: z.enum(['high', 'medium', 'low']),
    confidence: z.enum(['high', 'medium', 'low']),
    ambitious_attempt: z.boolean(),
    learning_opportunity: z
      .object({
        transferable_point: z.string().min(1),
        teaching_prompt: z.string().min(1).nullable(),
      })
      .strict()
      .nullable(),
    teacher_dna_rule_ids: z.array(z.string().min(1)),
    pattern_key: z.string().min(1).nullable(),
  })
  .strict();

export const observationLlmOutputSchema = z
  .object({
    base_correction_strategy: z.enum(['comprehensive', 'focused']),
    principal_focus: z.enum(OBSERVATION_DOMAINS).nullable(),
    strategy_rationale: z.string().min(1),
    observations: z.array(observationLlmItemSchema),
  })
  .strict();

export type ObservationLlmOutput = z.infer<typeof observationLlmOutputSchema>;
export type ObservationLlmItem = z.infer<typeof observationLlmItemSchema>;

const nullableString = { type: ['string', 'null'] } as const;

/** JSON Schema for Structured Outputs (`strict: true` requires every key present). */
export const OBSERVATION_JSON_SCHEMA = {
  name: 'writing_observations',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['base_correction_strategy', 'principal_focus', 'strategy_rationale', 'observations'],
    properties: {
      base_correction_strategy: { type: 'string', enum: ['comprehensive', 'focused'] },
      principal_focus: { type: ['string', 'null'], enum: [...OBSERVATION_DOMAINS, null] },
      strategy_rationale: { type: 'string' },
      observations: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'domain',
            'observation_type',
            'polarity',
            'scope',
            'text_quote',
            'occurrence_index',
            'supporting_quotes',
            'intended_meaning',
            'diagnosis',
            'suggested_change',
            'voice_preservation',
            'communicative_impact',
            'within_script_frequency',
            'knowledge_status',
            'foundational_importance',
            'transferability',
            'pedagogical_priority',
            'confidence',
            'ambitious_attempt',
            'learning_opportunity',
            'teacher_dna_rule_ids',
            'pattern_key',
          ],
          properties: {
            domain: { type: 'string', enum: [...OBSERVATION_DOMAINS] },
            observation_type: { type: 'string', enum: [...OBSERVATION_TYPES] },
            polarity: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
            scope: { type: 'string', enum: ['local', 'global'] },
            text_quote: nullableString,
            occurrence_index: { type: 'integer', minimum: 0 },
            supporting_quotes: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['quote', 'occurrence_index'],
                properties: {
                  quote: { type: 'string' },
                  occurrence_index: { type: 'integer', minimum: 0 },
                },
              },
            },
            intended_meaning: nullableString,
            diagnosis: { type: 'string' },
            suggested_change: nullableString,
            voice_preservation: {
              type: ['object', 'null'],
              additionalProperties: false,
              required: ['preserves_stance', 'preserves_central_meaning', 'register_is_the_target'],
              properties: {
                preserves_stance: { type: 'boolean' },
                preserves_central_meaning: { type: 'boolean' },
                register_is_the_target: { type: 'boolean' },
              },
            },
            communicative_impact: {
              type: 'string',
              enum: ['blocked', 'unreliable', 'impaired', 'minor', 'none'],
            },
            within_script_frequency: {
              type: 'string',
              enum: ['isolated', 'repeated_in_script', 'systematic_in_script', 'not_applicable'],
            },
            knowledge_status: {
              type: 'string',
              enum: ['likely_lapse', 'likely_knowledge_gap', 'uncertain'],
            },
            foundational_importance: {
              type: 'string',
              enum: [
                'minor_refinement',
                'target_level_control',
                'basic_expected_form',
                'not_applicable',
              ],
            },
            transferability: {
              type: 'string',
              enum: ['very_local', 'similar_tasks', 'across_writing_and_use_of_english'],
            },
            pedagogical_priority: { type: 'string', enum: ['high', 'medium', 'low'] },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
            ambitious_attempt: { type: 'boolean' },
            learning_opportunity: {
              type: ['object', 'null'],
              additionalProperties: false,
              required: ['transferable_point', 'teaching_prompt'],
              properties: {
                transferable_point: { type: 'string' },
                teaching_prompt: nullableString,
              },
            },
            teacher_dna_rule_ids: { type: 'array', items: { type: 'string' } },
            pattern_key: nullableString,
          },
        },
      },
    },
  },
} as const;

export interface ObservationPromptInput {
  candidate_response: string;
  task_analysis: ResolvedTaskAnalysis;
}

export function buildObservationExtractionPrompt(input: ObservationPromptInput): {
  system: string;
  user: string;
  prompt_id: string;
  prompt_version: string;
} {
  const historyFreeRules = TEACHER_DNA_RULES.filter((rule) => !rule.requires_learner_context);

  const system = [
    'You are the pedagogical reading layer of a Cambridge B2 First writing engine.',
    '',
    'You answer one question: what is happening in this student\'s writing, and what is',
    'pedagogically important about it? You produce evidence, not an assessment result.',
    '',
    'ABSOLUTE PROHIBITIONS',
    '- Do not score. No marks, bands, totals, percentages, CEFR levels or pass judgements.',
    '- Do not decide which Cambridge criterion an observation belongs to. That is a later layer.',
    '- Do not refer to the learner\'s history. You have none, and you must not imply you do:',
    '  never say an error is recurring for the learner, previously taught, already known,',
    '  not yet learned, or improved since earlier work.',
    '- Do not emit character offsets or identifiers. Quote the text and give an occurrence index.',
    '- Do not impose a number of observations, a number of strengths, or a mix of categories.',
    '',
    'READING SEQUENCE',
    ...TEACHER_DNA_READING_SEQUENCE.map((step, index) => `${index + 1}. ${step}`),
    '',
    'COMMUNICATIVE INTENTION',
    'Reconstruct what the student was trying to say before you suggest anything. A suggestion',
    'must preserve their stance, their opinion, their factual content and their personal',
    'experience, and must preserve register unless register itself is the issue. Do not',
    'normalise an unusual phrase merely because a safer phrase exists.',
    '',
    'AMBITION',
    'An ambitious attempt with imperfect control is different from a basic uncontrolled form,',
    'and both differ from simple but effective language. Mark ambition with `ambitious_attempt`',
    'when the text supports it. This is pedagogical information only: it carries no reward and',
    'no penalty of any kind.',
    '',
    'STRENGTHS',
    ...STRENGTH_QUALITY_RULES.map((rule) => `- ${rule}`),
    '',
    'CORRECTION STRATEGY',
    ...CORRECTION_STRATEGY_RULES.map((rule) => `- ${rule}`),
    '',
    'PRIORITY FACTORS AVAILABLE TO YOU',
    ...HISTORY_FREE_PRIORITY_FACTORS.map((factor) => `- ${factor}`),
    'Course stage is NOT available. Do not invent one.',
    '',
    'MISTAKE VERSUS ERROR',
    'Within this script you may say an issue is isolated, repeated or systematic. You may',
    'classify it cautiously as likely_lapse, likely_knowledge_gap or uncertain. You may never',
    'turn "appears several times in this script" into a claim about the learner\'s knowledge.',
    '',
    'SCOPE',
    'A local observation must quote the exact wording it refers to, so the application can bind',
    'it to a span. A genuinely global observation (organisation, overall development, register',
    'across the text) may set scope to "global", leave text_quote null and list several',
    'supporting quotes instead of pretending to occupy one span.',
    '',
    'PATTERNS',
    'When the same underlying issue occurs several times, record each occurrence separately and',
    'give them the same `pattern_key`, so they are taught once rather than as unrelated lessons.',
    'This is not an error count.',
    '',
    'TEACHER DNA RULES IN FORCE',
    ...historyFreeRules.map((rule) => `${rule.id}. ${rule.rule}`),
    '',
    'SAFEGUARDS',
    ...TEACHER_DNA_SAFEGUARDS.map((rule) => `- ${rule}`),
    '',
    `Cite the rules you applied in teacher_dna_rule_ids, using only: ${HISTORY_FREE_RULE_IDS.join(', ')}.`,
    '',
    'Respond only with JSON matching the supplied schema.',
  ].join('\n');

  const user = [
    'TASK ANALYSIS (already validated — treat as authoritative):',
    JSON.stringify(renderTaskAnalysisForPrompt(input.task_analysis), null, 2),
    '',
    'CANDIDATE RESPONSE (verbatim — quote from this text exactly):',
    '"""',
    input.candidate_response,
    '"""',
    '',
    'Return the JSON observations.',
  ].join('\n');

  return {
    system,
    user,
    prompt_id: OBSERVATION_PROMPT_ID,
    prompt_version: OBSERVATION_PROMPT_VERSION,
  };
}

/** Only the task facts Layer 2 needs — no provenance, no fingerprints, no versions. */
function renderTaskAnalysisForPrompt(analysis: ResolvedTaskAnalysis) {
  return {
    task_type: analysis.task_type,
    target_reader: analysis.target_reader,
    communicative_purpose: analysis.communicative_purpose,
    register: analysis.register,
    tone: analysis.tone ?? null,
    mandatory_content_points: analysis.mandatory_content_points.map((point) => ({
      id: point.id,
      point: point.point,
    })),
    required_functions: analysis.required_functions.map((fn) => ({
      id: fn.id,
      function: fn.function,
    })),
    mandatory_genre_conventions: analysis.mandatory_genre_conventions.map((convention) => ({
      id: convention.id,
      convention: convention.convention,
    })),
    core_genre_expectations: analysis.core_genre_expectations.map((expectation) => ({
      id: expectation.id,
      expectation: expectation.expectation,
      note: 'A quality to achieve, not a checkbox.',
    })),
    recommended_genre_features: analysis.recommended_genre_features.map((feature) => ({
      id: feature.id,
      feature: feature.feature,
      note: 'Optional. Never treat as a requirement.',
    })),
    word_guidance: {
      word_min: analysis.word_guidance.word_min ?? null,
      word_max: analysis.word_guidance.word_max ?? null,
      note: 'Contextual guidance only. Length carries no penalty.',
    },
    ambiguities: analysis.ambiguities,
  };
}
