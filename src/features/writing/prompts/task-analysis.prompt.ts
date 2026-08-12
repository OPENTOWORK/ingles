/**
 * Task Analysis prompt (Phase 2).
 *
 * The model answers one question only: "What does this task require?".
 * It never sees a candidate answer, never scores, never assigns Cambridge bands
 * and never invents identifiers — IDs, versions and word guidance are assigned
 * deterministically by `task-analysis.service.ts`.
 */
import { z } from 'zod';
import { PROMPT_VERSIONS } from '../domain/engine-version';
import { B2_FIRST_TASK_TYPES, type B2FirstTaskType } from '../domain/task-types';
import { getGenreRules } from './knowledge/doc01-genre-rules';

export const TASK_ANALYSIS_PROMPT_ID = 'writing.task-analysis';
export const TASK_ANALYSIS_PROMPT_VERSION = PROMPT_VERSIONS.task_analysis;

export const taskAnalysisLlmOutputSchema = z
  .object({
    target_reader: z.string().min(1).nullable(),
    target_reader_evidence_quote: z.string().min(1).nullable(),
    communicative_purpose: z.string().min(1),
    register: z.string().min(1),
    tone: z.string().min(1).nullable(),
    mandatory_content_points: z
      .array(
        z
          .object({
            point: z.string().min(1),
            evidence_quote: z.string().min(1).nullable(),
          })
          .strict(),
      )
      .min(1),
    required_functions: z.array(
      z
        .object({
          function: z.string().min(1),
          evidence_quote: z.string().min(1).nullable(),
        })
        .strict(),
    ),
    task_specific_mandatory_conventions: z.array(
      z
        .object({
          convention: z.string().min(1),
          evidence_quote: z.string().min(1),
        })
        .strict(),
    ),
    ambiguities: z.array(z.string().min(1)),
    inferred_task_type: z.enum(B2_FIRST_TASK_TYPES).nullable(),
  })
  .strict();

export type TaskAnalysisLlmOutput = z.infer<typeof taskAnalysisLlmOutputSchema>;

/** JSON Schema for Structured Outputs (`strict: true` requires every key present). */
export const TASK_ANALYSIS_JSON_SCHEMA = {
  name: 'writing_task_analysis',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: [
      'target_reader',
      'target_reader_evidence_quote',
      'communicative_purpose',
      'register',
      'tone',
      'mandatory_content_points',
      'required_functions',
      'task_specific_mandatory_conventions',
      'ambiguities',
      'inferred_task_type',
    ],
    properties: {
      target_reader: { type: ['string', 'null'] },
      target_reader_evidence_quote: { type: ['string', 'null'] },
      communicative_purpose: { type: 'string' },
      register: { type: 'string' },
      tone: { type: ['string', 'null'] },
      mandatory_content_points: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['point', 'evidence_quote'],
          properties: {
            point: { type: 'string' },
            evidence_quote: { type: ['string', 'null'] },
          },
        },
      },
      required_functions: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['function', 'evidence_quote'],
          properties: {
            function: { type: 'string' },
            evidence_quote: { type: ['string', 'null'] },
          },
        },
      },
      task_specific_mandatory_conventions: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['convention', 'evidence_quote'],
          properties: {
            convention: { type: 'string' },
            evidence_quote: { type: 'string' },
          },
        },
      },
      ambiguities: { type: 'array', items: { type: 'string' } },
      inferred_task_type: { type: ['string', 'null'], enum: [...B2_FIRST_TASK_TYPES, null] },
    },
  },
} as const;

export interface TaskAnalysisPromptInput {
  source_task_text: string;
  /** Null when the task type is still unresolved and the model is the last resort. */
  task_type: B2FirstTaskType | null;
  word_min?: number;
  word_max?: number;
}

export function buildTaskAnalysisPrompt(input: TaskAnalysisPromptInput): {
  system: string;
  user: string;
  prompt_id: string;
  prompt_version: string;
} {
  const system = [
    'You analyse Cambridge B2 First Writing tasks.',
    '',
    'You answer exactly one question: what does this task require of the candidate?',
    '',
    'You must NOT:',
    '- score anything or assign any mark, band or grade;',
    '- assess or even imagine a candidate response;',
    '- refer to a learner, their history, their level or their progress;',
    '- give pedagogical advice, feedback or model answers;',
    '- invent identifiers, versions, word counts or colour/UI information;',
    '- add genre requirements that were not given to you below.',
    '',
    'Separate four things carefully:',
    '1. Requirements created explicitly by the wording of this task.',
    '2. Mandatory genre conventions, which are supplied to you and which you must not extend.',
    '3. Core genre expectations, which describe what the genre must achieve rather than a box',
    '   to tick. They are supplied to you and must never be reported as requirements.',
    '4. Recommendations, which are supplied to you and which you must never report as requirements.',
    '',
    'A generic genre habit only becomes a requirement when this specific task asks for it.',
    'Report every content point the task obliges the candidate to cover, without duplicating them,',
    'and quote the wording that creates each one. Where the task is genuinely unclear, say so in',
    '"ambiguities" instead of guessing.',
    '',
    'Never invent a target reader. If the task does not make the reader identifiable, set',
    '"target_reader" and "target_reader_evidence_quote" to null.',
    '',
    'Respond only with JSON matching the supplied schema.',
  ].join('\n');

  const genreBlock = input.task_type
    ? renderGenreBlock(input.task_type)
    : [
        'TASK TYPE: unresolved.',
        'The application could not determine the genre deterministically. Set',
        '"inferred_task_type" to your best supported answer, or null if the task does not',
        'clearly belong to one of: ' + B2_FIRST_TASK_TYPES.join(', ') + '.',
      ].join('\n');

  const lengthBlock =
    input.word_min && input.word_max
      ? `LENGTH GUIDANCE (context only — never treat length as a requirement to report): ${input.word_min}–${input.word_max} words.`
      : 'LENGTH GUIDANCE: not supplied. Do not infer one.';

  const user = [
    genreBlock,
    '',
    lengthBlock,
    '',
    'TASK WORDING (verbatim, authoritative):',
    '"""',
    String(input.source_task_text ?? '').trim(),
    '"""',
    '',
    'Return the JSON analysis.',
  ].join('\n');

  return {
    system,
    user,
    prompt_id: TASK_ANALYSIS_PROMPT_ID,
    prompt_version: TASK_ANALYSIS_PROMPT_VERSION,
  };
}

function renderGenreBlock(taskType: B2FirstTaskType): string {
  const rules = getGenreRules(taskType);
  const lines = [
    `TASK TYPE: ${taskType} (already determined by the application — do not question it).`,
    `EXPECTED REGISTER: ${rules.register_guidance}.`,
    '',
    'MANDATORY GENRE CONVENTIONS (already handled by the application — do not repeat them):',
    ...(rules.mandatory_conventions.length
      ? rules.mandatory_conventions.map((rule) => `- ${rule.text}`)
      : ['- none defined for this genre.']),
    '',
    'CORE GENRE EXPECTATIONS (qualities, not checkboxes — never report these as requirements):',
    ...(rules.core_expectations.length
      ? rules.core_expectations.map((rule) => `- ${rule.text}`)
      : ['- none defined for this genre.']),
    '',
    'RECOMMENDATIONS FOR THIS GENRE (never report these as requirements):',
    ...(rules.recommended_features.length
      ? rules.recommended_features.map((rule) => `- ${rule.text}`)
      : ['- none defined for this genre.']),
  ];

  if (rules.conditional_conventions.length) {
    lines.push(
      '',
      'WORDING-DEPENDENT CONVENTIONS (the application decides whether these apply):',
      ...rules.conditional_conventions.map((rule) => `- ${rule.text} — only when ${rule.condition}.`),
    );
  }

  return lines.join('\n');
}
