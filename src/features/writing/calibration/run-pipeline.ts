/**
 * Calibration pipeline — Task Analysis → Observation → Assessment → validation.
 * No production routes, no persistence, no feedback composition.
 */

import {
  PROMPT_VERSIONS,
  SCHEMA_VERSION,
  WRITING_ENGINE_VERSION,
} from '../domain/engine-version';
import type { AssessmentResult } from '../domain/types';
import type { GoldenExpectedMarks } from './calibration-types';
import {
  TASK_ANALYSIS_BENCHMARK_MODEL,
  analyseWritingTask,
} from '../services/analysis/task-analysis.service';
import { extractObservations } from '../services/observation/observation.service';
import { assessWriting } from '../services/assessment/assessment.service';
import { validateAssessment } from '../services/validation/deterministic-validators';
import type { GoldenCase, CalibrationCaseResult, CalibrationMismatchDiagnostic } from './calibration-types';
import { compareGoldenProfiles } from './compare';
import { assertNoGoldenLeakage } from './leakage-guard';
import { isGoldenCaseRunnable } from './golden-cases';
import { extractMarksFromAssessmentPayload } from './openai-client';
import type { CalibrationOpenAiClient } from './openai-client';
import { buildTaskAnalysisPrompt } from '../prompts/task-analysis.prompt';
import { buildObservationExtractionPrompt } from '../prompts/observation-extraction.prompt';
import { buildAssessmentPrompt } from '../prompts/assessment.prompt';
import { AssessmentValidationError } from '../services/assessment/assessment.service';
import { inspectAssessmentEvidenceBindings } from '../services/validation/evidence-binding-diagnostics';
import type { CalibrationBindingAttemptDiagnostic } from './calibration-types';

export const CALIBRATION_BASELINE_MODEL = TASK_ANALYSIS_BENCHMARK_MODEL;

export function extractActualMarks(result: AssessmentResult): GoldenExpectedMarks | null {
  const criteria = result.assessment_record.criteria;
  if (!criteria) return null;
  return {
    content: criteria.content.mark,
    communicative_achievement: criteria.communicative_achievement.mark,
    organisation: criteria.organisation.mark,
    language: criteria.language.mark,
  };
}

function classifyMismatchOrigin(
  criterion: keyof GoldenExpectedMarks,
  expected: number,
  actual: number,
): CalibrationMismatchDiagnostic['mismatch_origin'] {
  if (actual > expected) return 'boundary_decision';
  if (criterion === 'content' || criterion === 'communicative_achievement') {
    return 'task_interpretation';
  }
  if (criterion === 'organisation' || criterion === 'language') {
    return 'descriptor_application';
  }
  return 'unknown';
}

function buildMismatchDiagnostics(
  goldenCase: GoldenCase,
  assessment: AssessmentResult,
  comparison: ReturnType<typeof compareGoldenProfiles>,
): CalibrationMismatchDiagnostic[] {
  const diagnostics: CalibrationMismatchDiagnostic[] = [];
  const criteria = assessment.assessment_record.criteria;
  if (!criteria) return diagnostics;

  for (const row of comparison.criterion_comparisons) {
    if (row.match || row.actual === null) continue;
    const record = criteria[row.criterion];
    diagnostics.push({
      case_id: goldenCase.case_id,
      criterion: row.criterion,
      expected_mark: row.expected,
      actual_mark: row.actual,
      positive_evidence: [...record.positive_evidence],
      limiting_evidence: [...record.limiting_evidence],
      why_not_higher: record.why_not_higher,
      why_not_lower: record.why_not_lower ?? '',
      source_rule_ids: [...record.source_rule_ids],
      evidence_quotes: record.text_evidence.map((e) => e.quote),
      task_analysis_appears_correct: null,
      mismatch_origin: classifyMismatchOrigin(row.criterion, row.expected, row.actual),
    });
  }
  return diagnostics;
}

export interface CalibrationClientFactory {
  forStage(
    stage: 'task_analysis' | 'observation' | 'assessment',
    attempt?: number,
  ): CalibrationOpenAiClient;
  usageLog: CalibrationCaseResult['usage'];
  lastAssessmentClient?: CalibrationOpenAiClient | null;
}

function resolveTrustedTargetReader(goldenCase: GoldenCase): string | null {
  // Doc 01 / exam configuration facts — not scoring labels.
  if (goldenCase.task_type === 'essay') {
    return 'your English teacher';
  }
  if (goldenCase.task_type === 'informal_email') {
    return 'David (English-speaking friend)';
  }
  if (goldenCase.task_type === 'article') {
    return 'readers of an English-language website';
  }
  if (goldenCase.task_type === 'review') {
    return goldenCase.case_id === 'G-04'
      ? 'readers of the college English-language magazine'
      : 'readers of next month’s magazine';
  }
  if (goldenCase.task_type === 'report') {
    return 'the group leader of the visiting British teachers';
  }
  return null;
}

export async function runCalibrationCase(
  goldenCase: GoldenCase,
  factory: CalibrationClientFactory,
  attempt = 1,
): Promise<CalibrationCaseResult> {
  const usage = factory.usageLog;
  const start = Date.now();

  if (!isGoldenCaseRunnable(goldenCase)) {
    return {
      case_id: goldenCase.case_id,
      label: goldenCase.label,
      runnable: false,
      source_verification: goldenCase.source_verification,
      comparison: null,
      validation_status: 'not_run',
      validation_failures: [],
      assessment_confidence: null,
      retries: 0,
      latency_ms: 0,
      usage,
      diagnostics: [],
      error: 'GOLDEN_SOURCE_MISSING — task_prompt or candidate_response not verified',
    };
  }

  const task_prompt = goldenCase.task_prompt!;
  const candidate_response = goldenCase.candidate_response!;
  const modelConfig = CALIBRATION_BASELINE_MODEL;
  const trustedReader = resolveTrustedTargetReader(goldenCase);

  // Leakage scan before any model call
  const taPrompt = buildTaskAnalysisPrompt({
    source_task_text: task_prompt,
    task_type: goldenCase.task_type,
  });
  assertNoGoldenLeakage(taPrompt.system, taPrompt.user, goldenCase);

  const taskResult = await analyseWritingTask(
    {
      source_task_text: task_prompt,
      task_type: goldenCase.task_type,
      target_reader: trustedReader,
      model_config: modelConfig,
    },
    { llm: factory.forStage('task_analysis') },
  );

  if (taskResult.status !== 'complete') {
    return {
      case_id: goldenCase.case_id,
      label: goldenCase.label,
      runnable: true,
      source_verification: goldenCase.source_verification,
      comparison: null,
      validation_status: 'failed',
      validation_failures: [`task_analysis_${taskResult.status}`],
      assessment_confidence: null,
      retries: 0,
      latency_ms: Date.now() - start,
      usage,
      diagnostics: [],
      error: `task analysis unresolved: ${taskResult.reason}`,
      task_analysis_status: taskResult.status,
    };
  }

  const task_analysis = taskResult.task_analysis;

  const obsPrompt = buildObservationExtractionPrompt({
    candidate_response,
    task_analysis,
  });
  assertNoGoldenLeakage(obsPrompt.system, obsPrompt.user, goldenCase);

  let observations = undefined as Awaited<ReturnType<typeof extractObservations>> | undefined;
  let observationFailures: string[] = [];
  let retries = 0;
  const maxObservationAttempts = 3;
  for (let obsAttempt = 1; obsAttempt <= maxObservationAttempts; obsAttempt += 1) {
    try {
      observations = await extractObservations(
        { candidate_response, task_analysis, model_config: modelConfig },
        { llm: factory.forStage('observation', obsAttempt) },
      );
      observationFailures = [];
      break;
    } catch (error) {
      retries += 1;
      observationFailures = [
        error instanceof Error ? error.message : String(error),
      ];
      if (obsAttempt === maxObservationAttempts) {
        // Observations are advisory for assessment; proceed without them after retries.
        observations = undefined;
      }
    }
  }

  const assessPrompt = buildAssessmentPrompt({
    candidate_response,
    task_analysis,
    word_count: candidate_response.trim().split(/\s+/).length,
    evidence_hints: [],
  });
  assertNoGoldenLeakage(assessPrompt.system, assessPrompt.user, goldenCase);

  let assessment: AssessmentResult | null = null;
  let assessmentError: string | null = null;
  let rawAssessmentMarks: GoldenExpectedMarks | null = null;
  const bindingDiagnostics: CalibrationBindingAttemptDiagnostic[] = [];
  let generationFeedback: string | null = null;
  const maxAssessmentAttempts = 3;
  for (let assessAttempt = 1; assessAttempt <= maxAssessmentAttempts; assessAttempt += 1) {
    try {
      const assessClient = factory.forStage('assessment', assessAttempt);
      factory.lastAssessmentClient = assessClient;
      if (generationFeedback) {
        const feedbackPrompt = buildAssessmentPrompt({
          candidate_response,
          task_analysis,
          word_count: candidate_response.trim().split(/\s+/).length,
          evidence_hints: [],
          generation_feedback: generationFeedback,
        });
        assertNoGoldenLeakage(feedbackPrompt.system, feedbackPrompt.user, goldenCase);
      }
      assessment = await assessWriting(
        {
          candidate_response,
          task_analysis,
          observations,
          model_config: modelConfig,
          generation_feedback: generationFeedback,
        },
        { llm: assessClient },
      );
      if (assessment.assessment_record.status === 'incomplete') {
        assessmentError =
          assessment.assessment_record.incomplete_reason ?? 'assessment incomplete';
        rawAssessmentMarks = extractMarksFromAssessmentPayload(assessClient.lastPayload);
        if (!assessment.assessment_record.criteria) {
          break;
        }
      }
      assessmentError = null;
      break;
    } catch (error) {
      retries += 1;
      assessmentError = error instanceof Error ? error.message : String(error);
      const payload = factory.lastAssessmentClient?.lastPayload ?? null;
      rawAssessmentMarks = extractMarksFromAssessmentPayload(payload);

      const evidence_bindings = payload
        ? inspectAssessmentEvidenceBindings(candidate_response, payload)
        : error instanceof AssessmentValidationError
          ? error.bindingFailures
          : [];
      const firstFailed = evidence_bindings.find((row) => row.binding_status === 'failed');
      const contractFailures =
        error instanceof AssessmentValidationError ? [...error.failures] : [];
      bindingDiagnostics.push({
        attempt: assessAttempt,
        criterion_of_first_failure: firstFailed?.criterion ?? null,
        first_failure_reason: firstFailed?.binding_reason ?? null,
        evidence_bindings,
        raw_assessment_payload: payload,
        contract_failures: contractFailures,
      });
      if (contractFailures.length && !firstFailed) {
        assessmentError = `${assessmentError}: ${contractFailures.join('; ')}`;
      }
      // Feed precise structural diagnostics into the next generation. Never alter marks in code.
      generationFeedback =
        error instanceof AssessmentValidationError && error.failures.length
          ? error.failures.join('\n')
          : assessmentError;
    }
  }

  if (!assessment || !assessment.assessment_record.criteria) {
    const comparison = compareGoldenProfiles(
      goldenCase.case_id,
      goldenCase.expected_marks,
      rawAssessmentMarks,
    );
    return {
      case_id: goldenCase.case_id,
      label: goldenCase.label,
      runnable: true,
      source_verification: goldenCase.source_verification,
      comparison,
      validation_status: 'failed',
      validation_failures: [
        ...observationFailures.map((f) => `observation: ${f}`),
        `assessment: ${assessmentError ?? 'incomplete'}`,
      ],
      assessment_confidence: null,
      retries,
      latency_ms: Date.now() - start,
      usage,
      diagnostics: comparison.exact_profile_match
        ? []
        : comparison.criterion_comparisons
            .filter((row) => !row.match && row.actual !== null)
            .map((row) => ({
              case_id: goldenCase.case_id,
              criterion: row.criterion,
              expected_mark: row.expected,
              actual_mark: row.actual as number,
              positive_evidence: [],
              limiting_evidence: [],
              why_not_higher: '(raw model marks; assessment record failed validation)',
              why_not_lower: '(raw model marks; assessment record failed validation)',
              source_rule_ids: [],
              evidence_quotes: [],
              task_analysis_appears_correct: null,
              mismatch_origin: 'unknown' as const,
            })),
      binding_diagnostics: bindingDiagnostics,
      error: assessmentError ?? 'assessment incomplete',
      task_analysis_status: 'complete',
      assessment_status: assessment?.assessment_record.status ?? 'incomplete',
    };
  }

  const validationFailures = validateAssessment({
    assessment_record: assessment.assessment_record,
    candidate_response,
    task_analysis,
  }).map((f) => `${f.rule_id}: ${f.message}`);

  const notes = observationFailures.map((f) => `observation_retry_exhausted: ${f}`);

  const actualMarks = extractActualMarks(assessment);
  const comparison = compareGoldenProfiles(
    goldenCase.case_id,
    goldenCase.expected_marks,
    actualMarks,
  );

  const diagnostics =
    comparison.exact_profile_match
      ? []
      : buildMismatchDiagnostics(goldenCase, assessment, comparison);

  return {
    case_id: goldenCase.case_id,
    label: goldenCase.label,
    runnable: true,
    source_verification: goldenCase.source_verification,
    comparison,
    validation_status: validationFailures.length ? 'failed' : 'passed',
    validation_failures: [...notes, ...validationFailures],
    assessment_confidence: assessment.assessment_record.overall_confidence ?? null,
    retries,
    latency_ms: Date.now() - start,
    usage,
    diagnostics,
    task_analysis_status: 'complete',
    assessment_status: assessment.assessment_record.status,
  };
}

export function buildBaselineModelMetadata() {
  return {
    engine_version: WRITING_ENGINE_VERSION,
    schema_version: SCHEMA_VERSION,
    prompt_versions: { ...PROMPT_VERSIONS },
    model_config: {
      model: CALIBRATION_BASELINE_MODEL.model,
      snapshot_id: CALIBRATION_BASELINE_MODEL.snapshot_id ?? CALIBRATION_BASELINE_MODEL.model,
      temperature: CALIBRATION_BASELINE_MODEL.temperature ?? 0,
      response_format: CALIBRATION_BASELINE_MODEL.response_format ?? 'json_schema',
    },
  };
}

