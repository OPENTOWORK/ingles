/**
 * Writing Engine v3 orchestrator (Phase 10).
 *
 * Owns the sequence. Individual phases stay modular — this file does not
 * reimplement Task Analysis / Assessment / Feedback; it wires them and persists.
 */
import { createHash } from 'node:crypto';
import {
  PROMPT_VERSIONS,
  SCHEMA_VERSION,
  SOURCE_DOC_VERSIONS,
  WRITING_ENGINE_VERSION,
} from '../../domain/engine-version';
import type {
  AssessmentResult,
  FeedbackPayload,
  LearnerHistoryContext,
  ModelConfigSnapshot,
  ObservationExtractionResult,
  ResolvedTaskAnalysis,
} from '../../domain/types';
import {
  assertWritingV3ModelIsNotLegacyFallback,
  getWritingEngineV3ModelConfig,
} from '../../config/writing-v3-flags';
import {
  analyseWritingTask,
  computeTaskFingerprint,
} from '../analysis/task-analysis.service';
import { extractObservations } from '../observation/observation.service';
import {
  AssessmentValidationError,
  assessWriting,
} from '../assessment/assessment.service';
import {
  FeedbackValidationError,
  composeFeedback,
} from '../feedback/feedback-composer.service';
import {
  buildValidationResult,
  validateAssessment,
  validateFeedbackPayload,
} from '../validation/deterministic-validators';
import type {
  CreateSubmissionInput,
  ExecutionUsage,
  WritingEngineRepository,
} from '../persistence/writing-engine.repository';
import {
  createWritingV3OpenAiClient,
  summariseProviderUsage,
  type WritingV3OpenAiClient,
  type WritingV3Stage,
  type WritingV3UsageRecord,
} from './openai-runtime-client';
import {
  buildTaskPromptSnapshot,
  resolveTrustedTargetReader,
  resolveWritingV3TaskType,
} from './task-type-resolve';
import type OpenAI from 'openai';

export type WritingEngineRunInput = {
  user_id: string;
  candidate_response: string;
  structured_exam_context?: string | null;
  task_context?: Record<string, unknown> | string | null;
  writing_type?: string | null;
  task_type?: string | null;
  target_reader?: string | null;
  submission_source?: CreateSubmissionInput['submission_source'];
  pregunta_id?: string | null;
  examen_id?: string | null;
  parte_numero?: number | null;
  learner_history?: LearnerHistoryContext;
  /** When false, skip DB writes (local E2E / dry-run only). */
  persist?: boolean;
  model_config?: ModelConfigSnapshot;
  execution_label?: string | null;
};

export type WritingEngineRunSuccess = {
  ok: true;
  engine: 'v3';
  submission_id: string | null;
  execution_id: string | null;
  candidate_response: string;
  task_prompt_snapshot: string;
  feedback_payload: FeedbackPayload;
  assessment: AssessmentResult;
  validation_status: 'passed';
  learner_history_applied: boolean;
  usage: WritingV3UsageRecord[];
  usage_summary: ReturnType<typeof summariseProviderUsage>;
  persisted: boolean;
  /** Legacy-compatible numeric shape for progression adapters only — never shown as pass/CEFR. */
  scores: {
    content: number;
    communication: number;
    organisation: number;
    language: number;
    total: number;
    wordCount: number;
  };
};

export type WritingEngineRunFailure = {
  ok: false;
  engine: 'v3';
  error: string;
  code: string;
  status: number;
  submission_id: string | null;
  execution_id: string | null;
  validation_status: 'failed' | 'incomplete' | null;
  diagnostics?: Record<string, unknown>;
  usage: WritingV3UsageRecord[];
  usage_summary: ReturnType<typeof summariseProviderUsage> | null;
  persisted: boolean;
};

export type WritingEngineRunResult = WritingEngineRunSuccess | WritingEngineRunFailure;

export type WritingEngineOrchestratorDeps = {
  openai: OpenAI;
  repository?: WritingEngineRepository | null;
};

function sha256Text(text: string): string {
  return `sha256:${createHash('sha256').update(String(text ?? ''), 'utf8').digest('hex')}`;
}

function wordCount(text: string): number {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function clientFactory(
  openai: OpenAI,
  usageLog: WritingV3UsageRecord[],
  executionId: string | null,
) {
  return {
    forStage(stage: WritingV3Stage, attempt = 1, promptVersion: string | null = null) {
      return createWritingV3OpenAiClient(openai, {
        stage,
        attempt,
        execution_id: executionId,
        prompt_version: promptVersion,
        usageLog,
      });
    },
  };
}

export async function runWritingEngine(
  input: WritingEngineRunInput,
  deps: WritingEngineOrchestratorDeps,
): Promise<WritingEngineRunResult> {
  const usageLog: WritingV3UsageRecord[] = [];
  const persist = input.persist !== false;
  const repo = deps.repository ?? null;
  const candidate_response = String(input.candidate_response || '').trim();
  if (!candidate_response) {
    return {
      ok: false,
      engine: 'v3',
      error: 'candidate_response is required',
      code: 'MISSING_RESPONSE',
      status: 400,
      submission_id: null,
      execution_id: null,
      validation_status: null,
      usage: usageLog,
      usage_summary: null,
      persisted: false,
    };
  }

  let model_config: ModelConfigSnapshot;
  try {
    model_config = input.model_config ?? getWritingEngineV3ModelConfig();
    assertWritingV3ModelIsNotLegacyFallback(model_config);
  } catch (err) {
    return {
      ok: false,
      engine: 'v3',
      error: err instanceof Error ? err.message : String(err),
      code: 'MODEL_CONFIG',
      status: 500,
      submission_id: null,
      execution_id: null,
      validation_status: null,
      usage: usageLog,
      usage_summary: null,
      persisted: false,
    };
  }

  const task_prompt_snapshot = buildTaskPromptSnapshot({
    structuredExamContext: input.structured_exam_context,
    taskContext: input.task_context,
  });
  const task_type = resolveWritingV3TaskType({
    writingType: input.writing_type,
    taskType: input.task_type,
    taskPrompt: task_prompt_snapshot,
  });

  let submission_id: string | null = null;
  let execution_id: string | null = null;
  let failure_stage: string | null = null;

  const fail = async (
    code: string,
    error: string,
    status: number,
    validation_status: WritingEngineRunFailure['validation_status'],
    diagnostics?: Record<string, unknown>,
  ): Promise<WritingEngineRunFailure> => {
    const usage_summary = usageLog.length ? summariseProviderUsage(usageLog) : null;
    if (persist && repo && execution_id) {
      try {
        await repo.finalizeExecution(execution_id, {
          status: 'failed',
          validation_status: 'failed',
          failure_stage: failure_stage,
          incomplete_reason: error.slice(0, 500),
          usage: usage_summary
            ? ({
                ...usage_summary,
                token_source: 'provider_reported',
              } as ExecutionUsage)
            : undefined,
        });
      } catch {
        /* best-effort provenance */
      }
    }
    return {
      ok: false,
      engine: 'v3',
      error,
      code,
      status,
      submission_id,
      execution_id,
      validation_status,
      diagnostics,
      usage: usageLog,
      usage_summary,
      persisted: Boolean(persist && repo && execution_id),
    };
  };

  try {
    if (persist && !repo) {
      return fail(
        'PERSISTENCE_UNAVAILABLE',
        'Writing v3 persistence is not configured (no repository / schema).',
        503,
        null,
      );
    }

    if (persist && repo) {
      const submission = await repo.createSubmission({
        user_id: input.user_id,
        pregunta_id: input.pregunta_id ?? null,
        examen_id: input.examen_id ?? null,
        parte_numero: input.parte_numero ?? null,
        submission_source: input.submission_source ?? 'exam_mode',
        task_type,
        task_prompt_snapshot,
        task_context_snapshot:
          typeof input.task_context === 'object' && input.task_context
            ? input.task_context
            : { structured_exam_context: input.structured_exam_context ?? null },
        candidate_response,
        candidate_response_hash: sha256Text(candidate_response),
        word_count: wordCount(candidate_response),
      });
      submission_id = String(submission.id);
    }

    const trustedReader = resolveTrustedTargetReader({
      taskType: task_type,
      explicitReader: input.target_reader,
      taskPrompt: task_prompt_snapshot,
    });
    failure_stage = 'task_analysis';
    const preFactory = clientFactory(deps.openai, usageLog, null);
    const taskResult = await analyseWritingTask(
      {
        source_task_text: task_prompt_snapshot,
        task_type,
        target_reader: trustedReader,
        model_config,
      },
      { llm: preFactory.forStage('task_analysis', 1, PROMPT_VERSIONS.task_analysis) },
    );
    if (taskResult.status !== 'complete') {
      return fail(
        'TASK_ANALYSIS_UNRESOLVED',
        `task analysis ${taskResult.status}: ${taskResult.reason}`,
        422,
        'incomplete',
        { task_analysis_status: taskResult.status },
      );
    }
    const task_analysis = taskResult.task_analysis as ResolvedTaskAnalysis;
    const task_fingerprint = computeTaskFingerprint({
      source_task_text: task_prompt_snapshot,
      task_type,
      model_config,
    });

    let task_analysis_id: string | null = null;
    let task_analysis_cache_hit = false;
    if (persist && repo) {
      const inserted = await repo.insertTaskAnalysisIfAbsent({
        task_analysis,
        engine_version: WRITING_ENGINE_VERSION,
      });
      task_analysis_id = String(inserted.record.id);
      task_analysis_cache_hit = inserted.cache_hit;

      const execution = await repo.createExecution({
        submission_id: submission_id!,
        execution_label: input.execution_label ?? 'beta_v3',
        engine_version: WRITING_ENGINE_VERSION,
        schema_version: SCHEMA_VERSION,
        doc_versions: { ...SOURCE_DOC_VERSIONS },
        prompt_versions: { ...PROMPT_VERSIONS },
        model_config: { ...model_config },
        engine_config_snapshot: {
          beta: true,
          calibration_status: 'not_calibrated',
          r3_status: 'open',
        },
        task_fingerprint,
        task_analysis_id,
        task_analysis_cache_hit,
      });
      execution_id = String(execution.id);
      for (const row of usageLog) {
        if (!row.execution_id) row.execution_id = execution_id;
      }
    }

    const factory = clientFactory(deps.openai, usageLog, execution_id);

    // --- Observations (advisory; may exhaust retries) ---
    failure_stage = 'observation';
    let observations: ObservationExtractionResult | undefined;
    let observationFailures: string[] = [];
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        observations = await extractObservations(
          { candidate_response, task_analysis, model_config },
          {
            llm: factory.forStage(
              'observation',
              attempt,
              PROMPT_VERSIONS.observation_assessment,
            ),
          },
        );
        observationFailures = [];
        break;
      } catch (err) {
        observationFailures = [err instanceof Error ? err.message : String(err)];
        if (attempt === 3) observations = undefined;
      }
    }
    if (!observations) {
      observations = {
        status: 'incomplete',
        incomplete_reason: observationFailures.join('; ') || 'observation extraction exhausted retries',
        base_correction_strategy: 'comprehensive',
        principal_focus: null,
        strategy_rationale:
          'Observation extraction failed after retries; assessment proceeded without Teacher DNA observations.',
        observations: [],
        pattern_groups: [],
        binding_failures: [],
        provenance: {
          engine_version: WRITING_ENGINE_VERSION,
          schema_version: SCHEMA_VERSION,
          teacher_dna_version: SOURCE_DOC_VERSIONS.teacher_dna,
          task_requirements_version: SOURCE_DOC_VERSIONS.task_requirements,
          observation_prompt_version: PROMPT_VERSIONS.observation_assessment,
          doc_versions: { ...SOURCE_DOC_VERSIONS },
          model_config,
          candidate_response_hash: sha256Text(candidate_response),
          task_fingerprint,
          llm_calls: 3,
          learner_history_available: false,
        },
      };
    } else if (persist && repo && execution_id) {
      await repo.persistObservations(execution_id, observations);
    }

    // --- Assessment (+ generation_feedback retries) ---
    failure_stage = 'assessment';
    let assessment: AssessmentResult | null = null;
    let generationFeedback: string | null = null;
    let assessmentError: string | null = null;
    let lastAssessmentClient: WritingV3OpenAiClient | null = null;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const assessClient = factory.forStage(
          'assessment',
          attempt,
          PROMPT_VERSIONS.cambridge_assessment,
        );
        lastAssessmentClient = assessClient;
        assessment = await assessWriting(
          {
            candidate_response,
            task_analysis,
            observations,
            model_config,
            generation_feedback: generationFeedback,
          },
          { llm: assessClient },
        );
        if (assessment.assessment_record.status === 'incomplete') {
          assessmentError =
            assessment.assessment_record.incomplete_reason ?? 'assessment incomplete';
          if (!assessment.assessment_record.criteria) break;
        }
        assessmentError = null;
        break;
      } catch (err) {
        assessmentError = err instanceof Error ? err.message : String(err);
        generationFeedback =
          err instanceof AssessmentValidationError && err.failures.length
            ? err.failures.join('\n')
            : assessmentError;
      }
    }

    if (!assessment || assessment.assessment_record.status !== 'complete') {
      if (persist && repo && execution_id && assessment) {
        try {
          await repo.persistAssessment(execution_id, assessment);
        } catch {
          /* incomplete may refuse four-criteria commit — expected */
        }
      }
      return fail(
        'ASSESSMENT_INCOMPLETE',
        assessmentError ?? 'assessment incomplete — no invented score',
        422,
        'incomplete',
        {
          assessment_status: assessment?.assessment_record.status ?? 'missing',
          raw_payload_present: Boolean(lastAssessmentClient?.lastPayload),
          observation_failures: observationFailures,
        },
      );
    }

    const assessmentFailures = validateAssessment({
      assessment_record: assessment.assessment_record,
      candidate_response,
      task_analysis,
    });
    const assessmentValidation = buildValidationResult(assessmentFailures, {
      stage: 'assessment',
      attempt: 1,
    });
    if (persist && repo && execution_id) {
      await repo.persistValidationResult(execution_id, assessmentValidation);
    }
    if (assessmentValidation.validation_status !== 'passed') {
      return fail(
        'ASSESSMENT_VALIDATION_FAILED',
        assessmentFailures.map((f) => `${f.rule_id}: ${f.message}`).join('; '),
        422,
        'failed',
        { failed_rules: assessmentFailures },
      );
    }

    if (persist && repo && execution_id) {
      await repo.persistAssessment(execution_id, assessment);
    }

    // History overlay AFTER marks are frozen — never changes marks.
    failure_stage = 'feedback_composition';
    let feedback_payload: FeedbackPayload | null = null;
    let feedbackError: string | null = null;
    let history_applied = false;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const composed = await composeFeedback(
          {
            candidate_response,
            task_analysis,
            observations,
            assessment,
            learner_history: input.learner_history,
            model_config,
          },
          {
            llm: factory.forStage(
              'feedback_composition',
              attempt,
              PROMPT_VERSIONS.feedback_composition,
            ),
          },
        );

        const feedbackFailures = validateFeedbackPayload({
          feedback_payload: composed.feedback_payload,
          assessment_record: assessment.assessment_record,
          candidate_response,
          observations,
        });
        const feedbackValidation = buildValidationResult(feedbackFailures, {
          stage: 'feedback',
          attempt,
        });
        if (persist && repo && execution_id) {
          await repo.persistValidationResult(execution_id, feedbackValidation);
        }
        if (feedbackValidation.validation_status !== 'passed') {
          throw new FeedbackValidationError(
            'composed feedback failed deterministic validation',
            feedbackFailures.map((f) => `${f.rule_id}: ${f.message}`),
          );
        }

        feedback_payload = composed.feedback_payload;
        history_applied = composed.history_applied;
        feedbackError = null;
        break;
      } catch (err) {
        feedback_payload = null;
        feedbackError =
          err instanceof FeedbackValidationError
            ? err.failures.join('; ') || err.message
            : err instanceof Error
              ? err.message
              : String(err);
      }
    }

    if (!feedback_payload) {
      return fail(
        'FEEDBACK_COMPOSITION_FAILED',
        feedbackError ?? 'feedback composition failed',
        422,
        'failed',
      );
    }

    // Marks frozen: history must not rewrite assessment totals.
    if (
      feedback_payload.global_result.raw_total !== assessment.assessment_record.raw_total
    ) {
      return fail(
        'HISTORY_MARK_DRIFT',
        'feedback raw_total diverged from frozen assessment — refusing display',
        500,
        'failed',
      );
    }

    if (persist && repo && execution_id) {
      await repo.persistFeedback(execution_id, feedback_payload, {
        history_overlay: history_applied ? input.learner_history : undefined,
      });
    }

    const usage_summary = summariseProviderUsage(usageLog);
    if (persist && repo && execution_id) {
      await repo.finalizeExecution(execution_id, {
        status: 'completed',
        validation_status: 'passed',
        retry_count: usageLog.filter((u) => u.retry).length,
        usage: {
          token_source: 'provider_reported',
          input_tokens: usage_summary.input_tokens,
          output_tokens: usage_summary.output_tokens,
          total_tokens: usage_summary.total_tokens,
          actual_models: usage_summary.actual_models,
          usage_by_stage: usage_summary.usage_by_stage,
          latency_ms: usage_summary.latency_ms,
          latency_by_stage: usage_summary.latency_by_stage,
          cost_usd: usage_summary.cost_usd,
          cost_basis: usage_summary.cost_basis,
        },
      });
    }

    const criteria = assessment.assessment_record.criteria!;
    return {
      ok: true,
      engine: 'v3',
      submission_id,
      execution_id,
      candidate_response,
      task_prompt_snapshot,
      feedback_payload,
      assessment,
      validation_status: 'passed',
      learner_history_applied: history_applied,
      usage: usageLog,
      usage_summary,
      persisted: Boolean(persist && repo && execution_id),
      scores: {
        content: criteria.content.mark,
        communication: criteria.communicative_achievement.mark,
        organisation: criteria.organisation.mark,
        language: criteria.language.mark,
        total: assessment.assessment_record.raw_total!,
        wordCount: wordCount(candidate_response),
      },
    };
  } catch (err) {
    return fail(
      'ENGINE_ERROR',
      err instanceof Error ? err.message : String(err),
      500,
      'failed',
      { failure_stage },
    );
  }
}
