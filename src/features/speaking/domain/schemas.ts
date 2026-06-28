import { z } from 'zod';

export const microFeedbackSchema = z.object({
  grammarCorrection: z.string(),
  vocabularyImprovement: z.string(),
  naturalAlternative: z.string(),
  estimatedCefrFit: z.string(),
  pronunciationNote: z.string().optional(),
});

export const speakingErrorItemSchema = z.object({
  excerpt: z.string(),
  issue: z.string(),
  suggestion: z.string(),
});

export const correctionCriterionSchema = z.object({
  criterion: z.enum([
    'taskAchievement',
    'grammar',
    'vocabulary',
    'fluency',
    'pronunciation',
  ]),
  score: z.number().min(1).max(5),
  errors: z.array(speakingErrorItemSchema),
});

export const b2SpeakingCriterionSchema = z.object({
  key: z.enum([
    'grammar_vocabulary',
    'discourse_management',
    'pronunciation',
    'interactive_communication',
    'global_achievement',
  ]),
  label: z.string(),
  score: z.number().min(0).max(5),
  max: z.literal(5),
  multiplier: z.number(),
});

export const b2SpeakingScoreReportSchema = z.object({
  criteria: z.array(b2SpeakingCriterionSchema).length(5),
  total: z.number().min(0).max(60),
  maxTotal: z.literal(60),
  estimatedLevel: z.string(),
  partFeedback: z
    .array(
      z.object({
        part: z.string(),
        note: z.string(),
      }),
    )
    .optional(),
});

export const correctionReportSchema = z.object({
  criteria: z.array(correctionCriterionSchema).length(5),
  correctedVersion: z.string(),
  modelAnswer: z.string(),
  shortExplanation: z.string(),
  pronunciation: z.object({
    score: z.number().min(1).max(5),
    feedback: z.string(),
    isEstimated: z.boolean(),
  }),
  b2Speaking: b2SpeakingScoreReportSchema.optional(),
  strengths: z.array(z.string()).optional(),
  mainErrors: z.array(z.string()).optional(),
  improvedPhrases: z
    .array(
      z.object({
        original: z.string(),
        improved: z.string(),
        note: z.string().optional(),
      }),
    )
    .optional(),
  recommendations: z.array(z.string()).optional(),
  practicePlan: z.array(z.string()).optional(),
  isPartialEvaluation: z.boolean().optional(),
  partialEvaluationNote: z.string().optional(),
});

export type B2SpeakingScoreReportPayload = z.infer<typeof b2SpeakingScoreReportSchema>;

export type CorrectionReportPayload = z.infer<typeof correctionReportSchema>;
