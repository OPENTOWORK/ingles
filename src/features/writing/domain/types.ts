import type { z } from 'zod';
import type {
  adjacentBandEvidenceSchema,
  assessmentCriteriaSchema,
  assessmentProvenanceSchema,
  assessmentRecordInputSchema,
  assessmentRecordSchema,
  assessmentResultSchema,
  criterionDecisionRecordSchema,
  criterionFeedbackSchema,
  engineExecutionSchema,
  feedbackPayloadSchema,
  globalResultSchema,
  coreGenreExpectationSchema,
  mandatoryContentPointSchema,
  mandatoryGenreConventionSchema,
  targetReaderResolutionSchema,
  modelConfigSnapshotSchema,
  recommendedGenreFeatureSchema,
  requiredFunctionSchema,
  resolvedTaskAnalysisSchema,
  taskAnalysisProvenanceSchema,
  taskTypeResolutionSchema,
  bindingFailureSchema,
  boundQuoteSchema,
  learningOpportunitySchema,
  observationExtractionResultSchema,
  observationProvenanceSchema,
  observationSchema,
  openingStrengthSchema,
  patternGroupSchema,
  voicePreservationSchema,
  reviewNextItemSchema,
  taskAnalysisCacheIdentitySchema,
  taskAnalysisSchema,
  annotationFeedbackKindSchema,
  criterionExpandedFeedbackSchema,
  historyOverlayEntrySchema,
  improvementSignalSchema,
  learnerHistoryContextSchema,
  observationDomainSchema,
  pedagogicalPrioritySchema,
  validationResultSchema,
  validationRuleFailureSchema,
  validationSeveritySchema,
  validationStageSchema,
  versionProvenanceSchema,
  wordGuidanceSchema,
  writingAnnotationSchema,
} from './schemas';

export type { CambridgeCriterionKey, AssessmentCriteria } from './schemas';
export type { WritingCategoryKey } from './categories';
export type { SourceDocKey, PromptVersionKey } from './engine-version';
export type { B2FirstTaskType, TaskTypeNormalisation } from './task-types';

export type MandatoryContentPoint = z.infer<typeof mandatoryContentPointSchema>;
export type RequiredFunction = z.infer<typeof requiredFunctionSchema>;
export type MandatoryGenreConvention = z.infer<typeof mandatoryGenreConventionSchema>;
export type CoreGenreExpectation = z.infer<typeof coreGenreExpectationSchema>;
export type TargetReaderResolution = z.infer<typeof targetReaderResolutionSchema>;
export type RecommendedGenreFeature = z.infer<typeof recommendedGenreFeatureSchema>;
export type WordGuidance = z.infer<typeof wordGuidanceSchema>;
export type TaskAnalysis = z.infer<typeof taskAnalysisSchema>;
export type ResolvedTaskAnalysis = z.infer<typeof resolvedTaskAnalysisSchema>;
export type TaskAnalysisProvenance = z.infer<typeof taskAnalysisProvenanceSchema>;
export type TaskTypeResolution = z.infer<typeof taskTypeResolutionSchema>;
export type TaskAnalysisCacheIdentity = z.infer<typeof taskAnalysisCacheIdentitySchema>;
export type Observation = z.infer<typeof observationSchema>;
export type AssessmentProvenance = z.infer<typeof assessmentProvenanceSchema>;
export type AssessmentResult = z.infer<typeof assessmentResultSchema>;
export type BoundQuote = z.infer<typeof boundQuoteSchema>;
export type VoicePreservation = z.infer<typeof voicePreservationSchema>;
export type LearningOpportunity = z.infer<typeof learningOpportunitySchema>;
export type PatternGroup = z.infer<typeof patternGroupSchema>;
export type BindingFailure = z.infer<typeof bindingFailureSchema>;
export type ObservationProvenance = z.infer<typeof observationProvenanceSchema>;
export type ObservationExtractionResult = z.infer<typeof observationExtractionResultSchema>;
export type AdjacentBandEvidence = z.infer<typeof adjacentBandEvidenceSchema>;
export type CriterionDecisionRecord = z.infer<typeof criterionDecisionRecordSchema>;
export type AssessmentRecordInput = z.infer<typeof assessmentRecordInputSchema>;
export type AssessmentRecord = z.infer<typeof assessmentRecordSchema>;
export type WritingAnnotation = z.infer<typeof writingAnnotationSchema>;
export type OpeningStrength = z.infer<typeof openingStrengthSchema>;
export type CriterionFeedback = z.infer<typeof criterionFeedbackSchema>;
export type ReviewNextItem = z.infer<typeof reviewNextItemSchema>;
export type GlobalResult = z.infer<typeof globalResultSchema>;
export type FeedbackPayload = z.infer<typeof feedbackPayloadSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;
export type ValidationRuleFailure = z.infer<typeof validationRuleFailureSchema>;
export type AnnotationFeedbackKind = z.infer<typeof annotationFeedbackKindSchema>;
export type CriterionExpandedFeedback = z.infer<typeof criterionExpandedFeedbackSchema>;
export type HistoryOverlayEntry = z.infer<typeof historyOverlayEntrySchema>;
export type ImprovementSignal = z.infer<typeof improvementSignalSchema>;
export type LearnerHistoryContext = z.infer<typeof learnerHistoryContextSchema>;
export type PedagogicalPriority = z.infer<typeof pedagogicalPrioritySchema>;
export type ObservationDomain = z.infer<typeof observationDomainSchema>;
export type ValidationStage = z.infer<typeof validationStageSchema>;
export type ValidationSeverity = z.infer<typeof validationSeveritySchema>;
export type EngineExecution = z.infer<typeof engineExecutionSchema>;
export type ModelConfigSnapshot = z.infer<typeof modelConfigSnapshotSchema>;
export type VersionProvenance = z.infer<typeof versionProvenanceSchema>;
