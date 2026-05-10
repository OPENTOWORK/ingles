import type { CefrLevel, CambridgeExam, SpeakingMode, SpeakingTaskType } from '@prisma/client';

export type { CefrLevel, CambridgeExam, SpeakingMode, SpeakingTaskType };

export const CEFR_LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CefrSlug = (typeof CEFR_LEVELS)[number];

export type ExamPartDefinition = {
  part: number;
  name: string;
  taskType: SpeakingTaskType;
  instructions: string;
  suggestedTimeSec: number;
};

export type ExamBlueprint = {
  cefr: CefrLevel;
  exam: CambridgeExam;
  parts: ExamPartDefinition[];
};

export type MicroFeedback = {
  grammarCorrection: string;
  vocabularyImprovement: string;
  naturalAlternative: string;
  estimatedCefrFit: string;
  /** When pronunciation cannot be measured from audio */
  pronunciationNote?: string;
};

export type CriterionScore = {
  score: number;
  comment: string;
};

export type SpeakingErrorItem = {
  excerpt: string;
  issue: string;
  suggestion: string;
};

export type CorrectionCriterion = {
  criterion:
    | 'taskAchievement'
    | 'grammar'
    | 'vocabulary'
    | 'fluency'
    | 'pronunciation'
    | string;
  score: number;
  errors: SpeakingErrorItem[];
};

export type CorrectionReport = {
  criteria: CorrectionCriterion[];
  correctedVersion: string;
  modelAnswer: string;
  shortExplanation: string;
  pronunciation: {
    score: number;
    feedback: string;
    isEstimated: boolean;
  };
};

export type ExamStateJson = {
  currentPartIndex: number;
  phase: 'intro' | 'question' | 'transition' | 'finished';
  questionIndex: number;
  partStartedAtIso: string;
};
