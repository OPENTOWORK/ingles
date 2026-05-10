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
});

export type CorrectionReportPayload = z.infer<typeof correctionReportSchema>;
