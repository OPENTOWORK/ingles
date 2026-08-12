/**
 * Cambridge assessment prompt (Layer 3 — Doc 03).
 *
 * The model receives the validated task analysis, the complete candidate
 * response and, optionally, a re-verified index of Phase-3 evidence locations.
 * It assigns four independent whole bands with evidence and boundary reasoning.
 *
 * It never receives learner history, never receives Phase-3 pedagogical
 * weighting, never owns the raw total and never emits character offsets.
 */
import { z } from 'zod';
import { PROMPT_VERSIONS } from '../domain/engine-version';
import type { ResolvedTaskAnalysis } from '../domain/types';
import {
  CAMBRIDGE_CRITERIA,
  CRITERION_DESCRIPTORS,
} from './knowledge/doc03-cambridge-descriptors';
import {
  CRITERION_RULEBOOKS,
  FORBIDDEN_IMPLEMENTATION_BEHAVIOURS,
  SHARED_RULES,
  WORD_COUNT_ROUTING,
} from './knowledge/doc03-assessment-rules';

export const ASSESSMENT_PROMPT_ID = 'writing.cambridge-assessment';
export const ASSESSMENT_PROMPT_VERSION = PROMPT_VERSIONS.cambridge_assessment;

const criterionEvidenceItemSchema = z
  .object({
    quote: z.string().min(1),
    occurrence_index: z.number().int().min(0),
  })
  .strict();

const criterionLlmDecisionSchema = z
  .object({
    criterion: z.enum(CAMBRIDGE_CRITERIA),
    mark: z.number().int().min(0).max(5),
    band_anchor: z.string().min(1),
    positive_evidence: z.array(z.string().min(1)),
    limiting_evidence: z.array(z.string().min(1)),
    text_evidence: z.array(criterionEvidenceItemSchema).min(1),
    why_not_higher: z.string().min(1),
    why_not_lower: z.string().min(1).nullable(),
    adjacent_band_evidence: z
      .object({
        lower_band_reference: z.string().min(1),
        lower_band_evidence: z.string().min(1),
        higher_band_reference: z.string().min(1),
        higher_band_evidence: z.string().min(1),
      })
      .strict()
      .nullable(),
    confidence: z.enum(['high', 'medium', 'low']),
    confidence_reason: z.string().min(1).nullable(),
    source_rule_ids: z.array(z.string().min(1)).min(1),
    evidence_observation_ids: z.array(z.string().min(1)),
  });

/**
 * Deliberately not `.strict()`. A model that volunteers its own total, or any
 * other unrequested field, has it stripped here and never read — Doc 03 S02
 * requires the total to be discarded, not reconciled.
 */
export const assessmentLlmOutputSchema = z.object({
  /** The model may report that the task context is unusable. */
  assessable: z.boolean(),
  unassessable_reason: z.string().min(1).nullable(),
  criteria: z.array(criterionLlmDecisionSchema),
  overall_confidence: z.enum(['high', 'medium', 'low']),
});

export type AssessmentLlmOutput = z.infer<typeof assessmentLlmOutputSchema>;
export type CriterionLlmDecision = z.infer<typeof criterionLlmDecisionSchema>;

const nullableString = { type: ['string', 'null'] } as const;

export const ASSESSMENT_JSON_SCHEMA = {
  name: 'cambridge_writing_assessment',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['assessable', 'unassessable_reason', 'criteria', 'overall_confidence'],
    properties: {
      assessable: { type: 'boolean' },
      unassessable_reason: nullableString,
      overall_confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      criteria: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: [
            'criterion',
            'mark',
            'band_anchor',
            'positive_evidence',
            'limiting_evidence',
            'text_evidence',
            'why_not_higher',
            'why_not_lower',
            'adjacent_band_evidence',
            'confidence',
            'confidence_reason',
            'source_rule_ids',
            'evidence_observation_ids',
          ],
          properties: {
            criterion: { type: 'string', enum: [...CAMBRIDGE_CRITERIA] },
            mark: { type: 'integer', minimum: 0, maximum: 5 },
            band_anchor: { type: 'string' },
            positive_evidence: { type: 'array', items: { type: 'string' } },
            limiting_evidence: { type: 'array', items: { type: 'string' } },
            text_evidence: {
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
            why_not_higher: { type: 'string' },
            why_not_lower: nullableString,
            adjacent_band_evidence: {
              type: ['object', 'null'],
              additionalProperties: false,
              required: [
                'lower_band_reference',
                'lower_band_evidence',
                'higher_band_reference',
                'higher_band_evidence',
              ],
              properties: {
                lower_band_reference: { type: 'string' },
                lower_band_evidence: { type: 'string' },
                higher_band_reference: { type: 'string' },
                higher_band_evidence: { type: 'string' },
              },
            },
            confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
            confidence_reason: nullableString,
            source_rule_ids: { type: 'array', items: { type: 'string' } },
            evidence_observation_ids: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  },
} as const;

/** A Phase-3 location whose quote was independently re-bound to the response. */
export interface VerifiedEvidenceHint {
  observation_id: string;
  domain: string;
  quote: string;
  span_start: number;
  span_end: number;
  diagnosis: string;
  communicative_impact: string;
}

export interface AssessmentPromptInput {
  candidate_response: string;
  task_analysis: ResolvedTaskAnalysis;
  word_count: number;
  evidence_hints: VerifiedEvidenceHint[];
  /** Precise structural retry feedback from a prior failed generation. Never scoring labels. */
  generation_feedback?: string | null;
}

export function buildAssessmentPrompt(input: AssessmentPromptInput): {
  system: string;
  user: string;
  prompt_id: string;
  prompt_version: string;
} {
  const system = [
    'You are a trained Cambridge B2 First Writing examiner.',
    '',
    'You answer one question: how should THIS candidate response be scored under the',
    'official B2 First Writing Assessment Scale? You award four independent whole-number',
    'marks from 0 to 5 and justify each one against the band above and the band below.',
    '',
    'ABSOLUTE PROHIBITIONS',
    ...FORBIDDEN_IMPLEMENTATION_BEHAVIOURS.map((behaviour) => `- ${behaviour}`),
    '- Do not output a total. The application computes it from your four marks.',
    '- Do not output a CEFR level, a Cambridge English Scale score, a pass/fail judgement',
    '  or any readiness claim from a single response.',
    '- Do not use fractional marks or hidden sub-points.',
    '- You have no learner history, and there is none to have. Never refer to previous work.',
    '',
    'ASSESSMENT SEQUENCE',
    '1. Read the task analysis and build the requirement map.',
    '2. Read the complete candidate response once for global meaning. Do not score sentence by sentence.',
    '3. Build a Content fulfilment profile against the mandatory points and required functions.',
    '4. Gather Communicative Achievement evidence: genre, format, register, function, reader relationship.',
    '5. Gather Organisation evidence: whole text, paragraph, sentence sequence, cohesion and reference.',
    '6. Gather Language evidence: vocabulary range and appropriacy, grammatical range, control, flexibility, error impact.',
    '7. Assign each provisional whole band independently.',
    '8. Test each provisional mark against the band immediately above.',
    '9. Test it against the band immediately below.',
    '10. Check criterion independence without changing any mark for the sake of consistency.',
    '',
    'BAND BOUNDARIES',
    'Bands 1, 3 and 5 have explicit official descriptors. Bands 2 and 4 are mixed profiles:',
    'a band 2 needs concrete band-1-like AND band-3-like evidence; a band 4 needs concrete',
    'band-3-like AND band-5-like evidence. Band 4 is not "band 5 with one mistake", and band 2',
    'is not a midpoint or a percentage. For a band 5, why_not_higher must state that band 5 is',
    'the top of the scale and the descriptor is met — never invent a band 6. For a band 0,',
    'leave why_not_lower null: there is no lower band.',
    '',
    'ADJACENT_BAND_EVIDENCE FIELD (STRUCTURAL — NOT OPTIONAL WORDING)',
    'This field is a generation contract, not decorative commentary:',
    '- If mark is 2 or 4: adjacent_band_evidence MUST be a non-null object with concrete',
    '  lower_band_reference, lower_band_evidence, higher_band_reference and higher_band_evidence',
    '  from BOTH neighbouring bands.',
    '- If mark is 0, 1, 3 or 5: adjacent_band_evidence MUST be null. Do not emit the object.',
    '- Never put adjacent_band_evidence on a band-3 decision. Boundary prose belongs in',
    '  why_not_higher / why_not_lower for non-mixed bands.',
    '- Never change a mark merely to satisfy or avoid this field.',
    '',
    'CRITERION INDEPENDENCE',
    'The four marks are independent and may be highly asymmetric. A profile such as',
    'Content 5, Communicative Achievement 2, Organisation 2, Language 2 is an official',
    'calibrated profile, not a suspicious one. Never smooth the marks, never cascade a low',
    'mark into another criterion, and never let strong language repair missing task content.',
    'The same textual feature may support two criteria only when each rationale names a',
    'different construct consequence.',
    '',
    'WORD COUNT',
    'Length carries no penalty of any kind. It matters only through observable consequences:',
    ...WORD_COUNT_ROUTING.map((route) => `- ${route.observation} → ${route.criterion}`),
    '',
    'EVIDENCE',
    'Quote the candidate response exactly and give the occurrence index of each quote. Do not',
    'produce character offsets: the application resolves them. Every quote you cite must exist',
    'verbatim in the response. Never cite a phrase you have paraphrased.',
    '',
    'CONFIDENCE',
    'Confidence is an internal safeguard, not a fifth mark and not a fractional band. Low',
    'confidence never means a low mark; it means the decision is less secure. Give the reason',
    'whenever confidence is not high.',
    '',
    'IF THE TASK CONTEXT IS UNUSABLE',
    'Set assessable to false with a reason and return an empty criteria array. Content and',
    'Communicative Achievement cannot be scored without the real task. Never guess a profile,',
    'and never express an unassessable response as 0/20.',
    '',
    buildDescriptorBlock(),
    '',
    'SHARED RULES',
    ...SHARED_RULES.map((rule) => `${rule.id}. ${rule.rule}`),
    '',
    buildCriterionRuleBlock(),
    '',
    'Cite the Document 03 rule ids you applied in source_rule_ids. Never cite a Teacher DNA',
    'rule id as the authority for a mark.',
    '',
    'Respond only with JSON matching the supplied schema, with exactly one decision per criterion.',
  ].join('\n');

  const user = [
    'TASK ANALYSIS (already validated — treat as authoritative):',
    JSON.stringify(renderTaskAnalysisForAssessment(input.task_analysis), null, 2),
    '',
    `WORD COUNT: ${input.word_count} (contextual only — no penalty)`,
    '',
    'CANDIDATE RESPONSE (complete and authoritative — quote from this text exactly):',
    '"""',
    input.candidate_response,
    '"""',
    '',
    ...renderEvidenceHints(input.evidence_hints),
    '',
    ...(input.generation_feedback?.trim()
      ? [
          'GENERATION CONTRACT FEEDBACK (fix the structural problem; do not change marks to dodge it):',
          input.generation_feedback.trim(),
          '',
        ]
      : []),
    'Return the JSON assessment.',
  ].join('\n');

  return {
    system,
    user,
    prompt_id: ASSESSMENT_PROMPT_ID,
    prompt_version: ASSESSMENT_PROMPT_VERSION,
  };
}

function buildDescriptorBlock(): string {
  const lines: string[] = ['OFFICIAL BAND DESCRIPTORS'];
  for (const criterion of CAMBRIDGE_CRITERIA) {
    const set = CRITERION_DESCRIPTORS[criterion];
    lines.push('', `${set.label} — ${set.core_question}`);
    lines.push(`Must not be replaced by: ${set.must_not_be_replaced_by}`);
    for (const anchor of set.bands) {
      lines.push(`  Band ${anchor.band}: ${anchor.official} | ${anchor.operational}`);
    }
    lines.push(`  Invalid rationale: ${set.invalid_rationale.join(' ')}`);
  }
  return lines.join('\n');
}

function buildCriterionRuleBlock(): string {
  const lines: string[] = ['CRITERION RULES'];
  for (const criterion of CAMBRIDGE_CRITERIA) {
    lines.push('', `${CRITERION_DESCRIPTORS[criterion].label}:`);
    for (const rule of CRITERION_RULEBOOKS[criterion]) {
      lines.push(`${rule.id}. ${rule.rule}`);
    }
  }
  return lines.join('\n');
}

/**
 * Phase-3 hints are an index of places worth looking, nothing more. They are
 * explicitly framed as non-exhaustive so pedagogical selectivity cannot become
 * scoring selectivity.
 */
function renderEvidenceHints(hints: VerifiedEvidenceHint[]): string[] {
  if (!hints.length) {
    return [
      'EVIDENCE INDEX: none supplied. Find all criterion evidence in the response above.',
    ];
  }
  return [
    'EVIDENCE INDEX (optional aid, NOT a scoring input):',
    'These locations were noticed by a separate pedagogical pass. That pass is deliberately',
    'selective, so this list is incomplete by design and carries no weighting. Verify anything',
    'you use, ignore anything that is not relevant to a Cambridge construct, and look for',
    'criterion evidence the list does not mention.',
    ...hints.map(
      (hint) =>
        `- [${hint.observation_id}] ${hint.domain} @${hint.span_start}-${hint.span_end}: "${hint.quote}" — ${hint.diagnosis} (impact: ${hint.communicative_impact})`,
    ),
  ];
}

/** Task facts only. No provenance, no versions, no fingerprints. */
function renderTaskAnalysisForAssessment(analysis: ResolvedTaskAnalysis) {
  return {
    task_type: analysis.task_type,
    source_task_text: analysis.source_task_text,
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
      note: 'A quality to achieve. Never a binary Content completion item.',
    })),
    recommended_genre_features: analysis.recommended_genre_features.map((feature) => ({
      id: feature.id,
      feature: feature.feature,
      note: 'Optional. Its absence is never a mark reduction.',
    })),
    word_guidance: {
      word_min: analysis.word_guidance.word_min ?? null,
      word_max: analysis.word_guidance.word_max ?? null,
      note: 'Guidance only. No automatic penalty in either direction.',
    },
    ambiguities: analysis.ambiguities,
  };
}
