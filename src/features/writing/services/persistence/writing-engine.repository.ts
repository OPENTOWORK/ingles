/**
 * Writing Engine v3 persistence (Phase 7).
 *
 * This layer stores what the engine already decided. It is the one place in the
 * feature that touches the database, and it is deliberately boring:
 *
 *  - it never recomputes a Cambridge mark;
 *  - it never regenerates feedback;
 *  - it never rewrites a finalised artefact;
 *  - it validates against the Phase 1–6 zod contracts before writing.
 *
 * A re-evaluation is a NEW execution row. Nothing that has been finalised is
 * updated to match a newer engine, so a correction shown to a student a year ago
 * stays readable exactly as it was generated.
 *
 * The SQL lives in `scripts/sql/writing_engine_schema.sql`. Nothing here is wired
 * into an API route yet.
 */
import {
  assessmentResultSchema,
  CAMBRIDGE_CRITERION_KEYS,
  feedbackPayloadSchema,
  learnerHistoryContextSchema,
  observationExtractionResultSchema,
  resolvedTaskAnalysisSchema,
  sumCriterionMarks,
  validationResultSchema,
} from '../../domain/schemas';
import type {
  AssessmentResult,
  CambridgeCriterionKey,
  FeedbackPayload,
  LearnerHistoryContext,
  ObservationExtractionResult,
  ResolvedTaskAnalysis,
  ValidationResult,
} from '../../domain/types';
import type { ValidationMode } from '../validation/deterministic-validators';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

/** The eight Writing v3 tables. No existing DRALO table belongs in this list. */
export const WRITING_ENGINE_TABLES = {
  submissions: 'writing_submissions',
  executions: 'writing_engine_executions',
  taskAnalyses: 'writing_task_analyses',
  observations: 'writing_observations',
  assessments: 'writing_assessments',
  assessmentCriteria: 'writing_assessment_criteria',
  feedbackPayloads: 'writing_feedback_payloads',
  validationResults: 'writing_validation_results',
} as const;

export type WritingEngineTable =
  typeof WRITING_ENGINE_TABLES[keyof typeof WRITING_ENGINE_TABLES];

export const WRITING_ENGINE_TABLE_NAMES = Object.values(WRITING_ENGINE_TABLES);

/** Touching any of these from this feature is a bug, not a feature. */
export const PROTECTED_LEGACY_TABLES = [
  'levels_puntuaciones',
  'Levels_stars',
  'levels_estadisticas',
  'user_error_tracker',
  'levels_preguntas',
  'ai_usage_logs',
] as const;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class PersistenceValidationError extends Error {
  readonly failures: string[];

  constructor(message: string, failures: string[] = []) {
    super(message);
    this.name = 'PersistenceValidationError';
    this.failures = failures;
  }
}

/** Raised when a caller tries to change history instead of adding to it. */
export class ImmutableRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImmutableRecordError';
  }
}

export class PersistenceError extends Error {
  readonly detail: unknown;

  constructor(message: string, detail?: unknown) {
    super(message);
    this.name = 'PersistenceError';
    this.detail = detail;
  }
}

// ---------------------------------------------------------------------------
// Database port
// ---------------------------------------------------------------------------

export type Row = Record<string, unknown>;

/**
 * A narrow port instead of the Supabase client type. Two reasons: the repository
 * stays unit-testable without a database, and the set of operations it is allowed
 * to perform is visible at a glance — there is no `delete`, and `update` exists
 * only for the execution lifecycle.
 */
export interface WritingEngineDb {
  insert(table: WritingEngineTable, rows: Row[]): Promise<Row[]>;
  select(
    table: WritingEngineTable,
    match: Row,
    options?: { orderBy?: string; ascending?: boolean },
  ): Promise<Row[]>;
  update(table: WritingEngineTable, match: Row, patch: Row): Promise<Row[]>;
  /**
   * Optional transactional RPC (Supabase). Required for complete assessments
   * because the deferred four-criteria integrity trigger must see header +
   * criteria in one Postgres transaction — PostgREST single-row inserts cannot.
   */
  rpc?(fn: string, args: Record<string, unknown>): Promise<unknown>;
}

/**
 * Adapter over a Supabase client (service-role on the server). Kept here so the
 * feature has exactly one persistence technology, as recorded in Document 07:
 * Supabase SQL migration plus Supabase server client. No Prisma.
 */
export interface SupabaseLikeClient {
  from(table: string): {
    insert(rows: Row[]): { select(): PromiseLike<{ data: Row[] | null; error: unknown }> };
    select(columns: string): {
      match(match: Row): {
        order(
          column: string,
          options: { ascending: boolean },
        ): PromiseLike<{ data: Row[] | null; error: unknown }>;
      } & PromiseLike<{ data: Row[] | null; error: unknown }>;
    };
    update(patch: Row): {
      match(match: Row): { select(): PromiseLike<{ data: Row[] | null; error: unknown }> };
    };
  };
  rpc?(
    fn: string,
    args?: Record<string, unknown>,
  ): PromiseLike<{ data: unknown; error: unknown }>;
}

export function createSupabaseWritingEngineDb(client: SupabaseLikeClient): WritingEngineDb {
  const unwrap = (result: { data: Row[] | null; error: unknown }, action: string): Row[] => {
    if (result.error) throw new PersistenceError(`${action} failed`, result.error);
    return result.data ?? [];
  };

  return {
    async insert(table, rows) {
      return unwrap(await client.from(table).insert(rows).select(), `insert into ${table}`);
    },
    async select(table, match, options) {
      const query = client.from(table).select('*').match(match);
      const result = options?.orderBy
        ? await query.order(options.orderBy, { ascending: options.ascending ?? true })
        : await query;
      return unwrap(result, `select from ${table}`);
    },
    async update(table, match, patch) {
      return unwrap(
        await client.from(table).update(patch).match(match).select(),
        `update ${table}`,
      );
    },
    async rpc(fn, args) {
      if (!client.rpc) {
        throw new PersistenceError(`rpc ${fn} is not available on this Supabase client`);
      }
      const result = await client.rpc(fn, args);
      if (result.error) {
        const detail =
          typeof result.error === 'object'
            ? JSON.stringify(result.error)
            : String(result.error);
        throw new PersistenceError(`rpc ${fn} failed: ${detail}`, result.error);
      }
      return result.data;
    },
  };
}

// ---------------------------------------------------------------------------
// Input contracts
// ---------------------------------------------------------------------------

const SUBMISSION_SOURCES = [
  'skill_practice',
  'exam_mode',
  'full_exam',
  'free_practice',
  'dralo_ai',
] as const;

const TASK_TYPES = [
  'essay',
  'informal_email',
  'formal_email',
  'article',
  'report',
  'review',
] as const;

export const createSubmissionInputSchema = z
  .object({
    user_id: z.string().min(1),
    pregunta_id: z.string().min(1).nullish(),
    examen_id: z.string().min(1).nullish(),
    parte_numero: z.number().int().positive().nullish(),
    submission_source: z.enum(SUBMISSION_SOURCES),
    task_type: z.enum(TASK_TYPES),
    task_prompt_snapshot: z.string().min(1),
    task_context_snapshot: z.record(z.unknown()).default({}),
    candidate_response: z.string().min(1),
    candidate_response_hash: z.string().min(1),
    word_count: z.number().int().min(0),
    submitted_at: z.string().min(1).optional(),
  })
  .strict();

export type CreateSubmissionInput = z.infer<typeof createSubmissionInputSchema>;

export const createExecutionInputSchema = z
  .object({
    submission_id: z.string().min(1),
    previous_execution_id: z.string().min(1).nullish(),
    execution_label: z.string().min(1).nullish(),
    engine_version: z.string().min(1),
    schema_version: z.string().min(1),
    doc_versions: z.record(z.string()),
    prompt_versions: z.record(z.string()),
    model_config: z.record(z.unknown()),
    engine_config_snapshot: z.record(z.unknown()).default({}),
    task_fingerprint: z.string().min(1).nullish(),
    task_analysis_id: z.string().min(1).nullish(),
    task_analysis_cache_hit: z.boolean().default(false),
    started_at: z.string().min(1).optional(),
  })
  .strict();

export type CreateExecutionInput = z.infer<typeof createExecutionInputSchema>;

/**
 * Provenance must come from the provider, never from a text-length estimate, so
 * `token_source` is a literal rather than a free string. A caller that only has
 * an estimate cannot satisfy this contract, which is the point.
 */
export const executionUsageSchema = z
  .object({
    token_source: z.literal('provider_reported'),
    input_tokens: z.number().int().min(0),
    output_tokens: z.number().int().min(0),
    total_tokens: z.number().int().min(0),
    /** Provider-reported model identity per stage — what actually answered. */
    actual_models: z.record(z.string().min(1)),
    usage_by_stage: z.record(z.unknown()).default({}),
    latency_ms: z.number().int().min(0).optional(),
    latency_by_stage: z.record(z.number()).default({}),
    cost_usd: z.number().min(0).optional(),
    cost_eur: z.number().min(0).optional(),
    cost_basis: z.record(z.unknown()).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.total_tokens !== data.input_tokens + data.output_tokens) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'total_tokens must equal input_tokens + output_tokens',
        path: ['total_tokens'],
      });
    }
  });

export type ExecutionUsage = z.infer<typeof executionUsageSchema>;

export const persistTaskAnalysisInputSchema = z
  .object({
    task_analysis: z.unknown(),
    engine_version: z.string().min(1),
  })
  .passthrough();

export interface FinalizeExecutionInput {
  status: 'completed' | 'failed';
  validation_status?: ValidationResult['validation_status'];
  retry_count?: number;
  failure_stage?: string | null;
  incomplete_reason?: string | null;
  usage?: ExecutionUsage;
  completed_at?: string;
}

export interface ExecutionBundle {
  execution: Row;
  submission: Row;
  task_analysis: Row | null;
  observations: Row[];
  assessment: Row | null;
  assessment_criteria: Row[];
  feedback: Row | null;
  validation_results: Row[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown, what: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new PersistenceValidationError(
      `${what} does not satisfy its contract and was not persisted`,
      result.error.issues.map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`),
    );
  }
  return result.data;
}

function nowIso(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class WritingEngineRepository {
  private readonly db: WritingEngineDb;

  constructor(db: WritingEngineDb) {
    this.db = db;
  }

  // -- submissions ----------------------------------------------------------

  async createSubmission(input: CreateSubmissionInput): Promise<Row> {
    const parsed = parseOrThrow(createSubmissionInputSchema, input, 'submission');
    const rows = await this.db.insert(WRITING_ENGINE_TABLES.submissions, [
      {
        user_id: parsed.user_id,
        pregunta_id: parsed.pregunta_id ?? null,
        examen_id: parsed.examen_id ?? null,
        parte_numero: parsed.parte_numero ?? null,
        submission_source: parsed.submission_source,
        cefr_level: 'b2',
        task_type: parsed.task_type,
        task_prompt_snapshot: parsed.task_prompt_snapshot,
        task_context_snapshot: parsed.task_context_snapshot,
        candidate_response: parsed.candidate_response,
        candidate_response_hash: parsed.candidate_response_hash,
        word_count: parsed.word_count,
        submitted_at: parsed.submitted_at ?? nowIso(),
      },
    ]);
    return this.first(rows, 'submission');
  }

  async getSubmission(submissionId: string): Promise<Row | null> {
    const rows = await this.db.select(WRITING_ENGINE_TABLES.submissions, { id: submissionId });
    return rows[0] ?? null;
  }

  // -- executions -----------------------------------------------------------

  async createExecution(input: CreateExecutionInput): Promise<Row> {
    const parsed = parseOrThrow(createExecutionInputSchema, input, 'execution');
    const rows = await this.db.insert(WRITING_ENGINE_TABLES.executions, [
      {
        submission_id: parsed.submission_id,
        previous_execution_id: parsed.previous_execution_id ?? null,
        execution_label: parsed.execution_label ?? null,
        status: 'running',
        engine_version: parsed.engine_version,
        schema_version: parsed.schema_version,
        doc_versions: parsed.doc_versions,
        prompt_versions: parsed.prompt_versions,
        model_config: parsed.model_config,
        engine_config_snapshot: parsed.engine_config_snapshot,
        task_fingerprint: parsed.task_fingerprint ?? null,
        task_analysis_id: parsed.task_analysis_id ?? null,
        task_analysis_cache_hit: parsed.task_analysis_cache_hit,
        retry_count: 0,
        started_at: parsed.started_at ?? nowIso(),
        completed_at: null,
      },
    ]);
    return this.first(rows, 'execution');
  }

  async getExecution(executionId: string): Promise<Row | null> {
    const rows = await this.db.select(WRITING_ENGINE_TABLES.executions, { id: executionId });
    return rows[0] ?? null;
  }

  /** Every execution of one submission, oldest first: the audit trail of re-evaluations. */
  async listExecutionsForSubmission(submissionId: string): Promise<Row[]> {
    return this.db.select(
      WRITING_ENGINE_TABLES.executions,
      { submission_id: submissionId },
      { orderBy: 'started_at', ascending: true },
    );
  }

  /**
   * The only update this repository performs. It moves a running execution to a
   * terminal state and refuses to touch one that already reached it, so a second
   * evaluation has to be a second execution.
   */
  async finalizeExecution(executionId: string, input: FinalizeExecutionInput): Promise<Row> {
    const execution = await this.requireRunningExecution(executionId, 'finalise');
    const usage = input.usage
      ? parseOrThrow(executionUsageSchema, input.usage, 'execution usage')
      : undefined;

    const patch: Row = {
      status: input.status,
      completed_at: input.completed_at ?? nowIso(),
      validation_status: input.validation_status ?? execution.validation_status ?? null,
      failure_stage: input.status === 'failed' ? input.failure_stage ?? null : null,
      incomplete_reason: input.incomplete_reason ?? null,
    };
    if (typeof input.retry_count === 'number') patch.retry_count = input.retry_count;
    if (usage) {
      patch.token_source = usage.token_source;
      patch.input_tokens = usage.input_tokens;
      patch.output_tokens = usage.output_tokens;
      patch.total_tokens = usage.total_tokens;
      patch.actual_models = usage.actual_models;
      patch.usage_by_stage = usage.usage_by_stage;
      patch.latency_by_stage = usage.latency_by_stage;
      if (usage.latency_ms !== undefined) patch.latency_ms = usage.latency_ms;
      if (usage.cost_usd !== undefined) patch.cost_usd = usage.cost_usd;
      if (usage.cost_eur !== undefined) patch.cost_eur = usage.cost_eur;
      if (usage.cost_basis !== undefined) patch.cost_basis = usage.cost_basis;
    }

    const rows = await this.db.update(
      WRITING_ENGINE_TABLES.executions,
      { id: executionId, status: 'running' },
      patch,
    );
    if (!rows.length) {
      throw new ImmutableRecordError(
        `execution ${executionId} was finalised concurrently and cannot be finalised again`,
      );
    }
    return rows[0]!;
  }

  // -- task-analysis cache --------------------------------------------------

  async getTaskAnalysisByFingerprint(taskFingerprint: string): Promise<Row | null> {
    const rows = await this.db.select(WRITING_ENGINE_TABLES.taskAnalyses, {
      task_fingerprint: taskFingerprint,
    });
    return rows[0] ?? null;
  }

  /**
   * Cache identity is the Phase-2 fingerprint, which already covers the task, its
   * type, Document 01, the prompt version, the schema version and the model
   * configuration. So a hit is a genuine hit: if a row exists, the stored analysis
   * is returned untouched and the new one is discarded. Changing any rule, prompt
   * or model produces a different fingerprint and therefore a different row —
   * never an overwrite of the old one.
   */
  async insertTaskAnalysisIfAbsent(input: {
    task_analysis: ResolvedTaskAnalysis | unknown;
    engine_version: string;
  }): Promise<{ record: Row; cache_hit: boolean }> {
    const analysis = parseOrThrow(
      resolvedTaskAnalysisSchema,
      input.task_analysis,
      'task analysis',
    ) as ResolvedTaskAnalysis;
    const provenance = analysis.provenance;

    const existing = await this.getTaskAnalysisByFingerprint(provenance.task_fingerprint);
    if (existing) return { record: existing, cache_hit: true };

    const rows = await this.db.insert(WRITING_ENGINE_TABLES.taskAnalyses, [
      {
        task_fingerprint: provenance.task_fingerprint,
        task_type: analysis.task_type,
        source_task_hash: provenance.task_content_hash,
        task_analysis: analysis,
        task_requirements_version: provenance.task_requirements_version,
        task_analysis_schema_version: provenance.task_analysis_schema_version,
        task_analysis_prompt_version: provenance.task_analysis_prompt_version,
        engine_version: input.engine_version,
        model_config: provenance.model_config,
      },
    ]);
    return { record: this.first(rows, 'task analysis'), cache_hit: false };
  }

  // -- observations ---------------------------------------------------------

  async persistObservations(
    executionId: string,
    result: ObservationExtractionResult | unknown,
  ): Promise<Row[]> {
    await this.requireRunningExecution(executionId, 'persist observations for');
    const parsed = parseOrThrow(
      observationExtractionResultSchema,
      result,
      'observation extraction result',
    ) as ObservationExtractionResult;

    if (!parsed.observations.length) return [];

    return this.db.insert(
      WRITING_ENGINE_TABLES.observations,
      parsed.observations.map((observation) => ({
        execution_id: executionId,
        observation_id: observation.observation_id,
        domain: observation.domain,
        observation_type: observation.observation_type,
        polarity: observation.polarity,
        scope: observation.scope,
        span_start: observation.span_start ?? null,
        span_end: observation.span_end ?? null,
        binding_status: observation.binding_status,
        renderable_locally: observation.renderable_locally,
        communicative_impact: observation.communicative_impact,
        meaning_blocking: observation.meaning_blocking,
        pedagogical_priority: observation.pedagogical_priority,
        confidence: observation.confidence,
        pattern_key: observation.pattern_key ?? null,
        pattern_group_id: observation.pattern_group_id ?? null,
        observation,
      })),
    );
  }

  // -- assessment -----------------------------------------------------------

  /**
   * Writes the frozen assessment header and its four criterion rows.
   *
   * The marks arrive already decided. This method verifies that `raw_total` still
   * equals the sum of the four marks and REFUSES the write when it does not —
   * it does not "fix" the total, because a persistence layer that recalculates a
   * Cambridge mark is a persistence layer that can silently change a result.
   */
  async persistAssessment(
    executionId: string,
    assessmentResult: AssessmentResult | unknown,
  ): Promise<{ assessment: Row; criteria: Row[] }> {
    await this.requireRunningExecution(executionId, 'persist an assessment for');
    const parsed = parseOrThrow(
      assessmentResultSchema,
      assessmentResult,
      'assessment result',
    ) as AssessmentResult;
    const record = parsed.assessment_record;

    if (record.status === 'complete') {
      if (!record.criteria) {
        throw new PersistenceValidationError(
          'a complete assessment must carry its four criterion decisions',
        );
      }
      const sum = sumCriterionMarks(record.criteria);
      if (record.raw_total !== sum) {
        throw new PersistenceValidationError(
          `raw_total ${record.raw_total} does not match the four criterion marks (${sum}); the assessment was not persisted`,
        );
      }
    }

    const assessmentRow: Row = {
      execution_id: executionId,
      status: record.status,
      incomplete_reason: record.incomplete_reason ?? null,
      raw_total: record.status === 'complete' ? record.raw_total ?? null : null,
      max_total: 20,
      overall_confidence: record.overall_confidence ?? null,
      single_task_scale_claim_allowed: false,
      word_count: record.word_count ?? null,
      word_count_penalty_applied: false,
      calibration_status: parsed.provenance.calibration_status,
      assessment_record: record,
      provenance: parsed.provenance,
      engine_version: parsed.provenance.engine_version,
      schema_version: parsed.provenance.schema_version,
      cambridge_assessment_version: parsed.provenance.cambridge_assessment_version,
      assessment_prompt_version: parsed.provenance.assessment_prompt_version,
    };

    const criteriaRowsInput =
      record.criteria
        ? CAMBRIDGE_CRITERION_KEYS.map((key: CambridgeCriterionKey) => {
            const decision = record.criteria![key];
            return {
              execution_id: executionId,
              criterion: decision.criterion,
              mark: decision.mark,
              band_anchor: decision.band_anchor,
              why_not_higher: decision.why_not_higher,
              why_not_lower: decision.why_not_lower ?? null,
              confidence: decision.confidence,
              confidence_reason: decision.confidence_reason ?? null,
              band_ceiling_reached: decision.band_ceiling_reached,
              band_floor_reached: decision.band_floor_reached,
              decision_record: decision,
            };
          })
        : [];

    // Complete assessments must land in one DB transaction (deferred integrity).
    if (record.status === 'complete' && typeof this.db.rpc === 'function') {
      await this.db.rpc('writing_engine_persist_assessment_bundle', {
        p_assessment: assessmentRow,
        p_criteria: criteriaRowsInput,
      });
      const assessment = (await this.db.select(WRITING_ENGINE_TABLES.assessments, {
        execution_id: executionId,
      }))[0];
      const criteria = await this.db.select(WRITING_ENGINE_TABLES.assessmentCriteria, {
        execution_id: executionId,
      });
      if (!assessment) {
        throw new PersistenceError('assessment bundle rpc returned no assessment row');
      }
      return { assessment, criteria };
    }

    const assessmentRows = await this.db.insert(WRITING_ENGINE_TABLES.assessments, [
      assessmentRow,
    ]);

    if (!criteriaRowsInput.length) {
      return { assessment: this.first(assessmentRows, 'assessment'), criteria: [] };
    }

    const criteriaRows = await this.db.insert(
      WRITING_ENGINE_TABLES.assessmentCriteria,
      criteriaRowsInput,
    );

    return {
      assessment: this.first(assessmentRows, 'assessment'),
      criteria: criteriaRows,
    };
  }

  // -- feedback -------------------------------------------------------------

  /**
   * Stores the payload exactly as composed, plus the history overlay when one was
   * applied. The overlay is a sibling column, never a mutation of the assessment:
   * that is what keeps "you did this again" out of the marks.
   */
  async persistFeedback(
    executionId: string,
    payload: FeedbackPayload | unknown,
    options: { history_overlay?: LearnerHistoryContext | unknown } = {},
  ): Promise<Row> {
    await this.requireRunningExecution(executionId, 'persist feedback for');
    const parsed = parseOrThrow(feedbackPayloadSchema, payload, 'feedback payload') as FeedbackPayload;

    let overlay: LearnerHistoryContext | null = null;
    if (options.history_overlay !== undefined && options.history_overlay !== null) {
      overlay = parseOrThrow(
        learnerHistoryContextSchema,
        options.history_overlay,
        'learner history overlay',
      ) as LearnerHistoryContext;
    }
    if (parsed.learner_history_applied && !overlay) {
      throw new PersistenceValidationError(
        'feedback claims learner history was applied but no overlay was supplied to persist',
      );
    }

    const historyEvidenceIds = overlay
      ? Array.from(new Set(overlay.entries.flatMap((entry) => entry.history_evidence_ids)))
      : [];

    const rows = await this.db.insert(WRITING_ENGINE_TABLES.feedbackPayloads, [
      {
        execution_id: executionId,
        payload: parsed,
        raw_total: parsed.global_result.raw_total,
        annotation_count: parsed.annotations.length,
        opening_strength_count: parsed.opening_strengths.length,
        learner_history_applied: parsed.learner_history_applied,
        history_overlay: overlay,
        history_evidence_ids: historyEvidenceIds,
        feedback_prompt_version: parsed.provenance.prompt_versions.feedback_composition,
        feedback_schema_version: parsed.schema_version,
        engine_version: parsed.engine_version,
      },
    ]);
    return this.first(rows, 'feedback payload');
  }

  // -- validation -----------------------------------------------------------

  /**
   * Every attempt is its own row, including the ones that failed. A retried
   * generation stays auditable: the failure is not replaced by the success that
   * followed it.
   */
  async persistValidationResult(
    executionId: string,
    result: ValidationResult | unknown,
    options: { validation_mode?: ValidationMode } = {},
  ): Promise<Row> {
    const parsed = parseOrThrow(
      validationResultSchema,
      result,
      'validation result',
    ) as ValidationResult;

    const rows = await this.db.insert(WRITING_ENGINE_TABLES.validationResults, [
      {
        execution_id: executionId,
        stage: parsed.stage,
        attempt: parsed.attempt,
        validation_status: parsed.validation_status,
        validation_mode: options.validation_mode ?? 'current_generation',
        failed_rules: parsed.failed_rules,
        warnings: parsed.warnings,
        retry_target: parsed.retry_target ?? null,
        retry_reason: parsed.retry_reason ?? null,
        validator_version: parsed.validator_version,
        engine_version: parsed.engine_version,
        schema_version: parsed.schema_version,
        validated_at: parsed.validated_at,
      },
    ]);
    return this.first(rows, 'validation result');
  }

  // -- reads ----------------------------------------------------------------

  /**
   * Everything needed to render one historical correction as it was generated:
   * the submitted snapshots, the stored feedback and the versions that produced
   * them. Nothing here reruns a model or a prompt.
   */
  async getExecutionBundle(executionId: string): Promise<ExecutionBundle> {
    const execution = await this.getExecution(executionId);
    if (!execution) throw new PersistenceError(`execution ${executionId} was not found`);

    const submission = await this.getSubmission(String(execution.submission_id));
    if (!submission) {
      throw new PersistenceError(`submission ${execution.submission_id} was not found`);
    }

    const [observations, assessments, criteria, feedback, validationResults] = await Promise.all([
      this.db.select(WRITING_ENGINE_TABLES.observations, { execution_id: executionId }),
      this.db.select(WRITING_ENGINE_TABLES.assessments, { execution_id: executionId }),
      this.db.select(WRITING_ENGINE_TABLES.assessmentCriteria, { execution_id: executionId }),
      this.db.select(WRITING_ENGINE_TABLES.feedbackPayloads, { execution_id: executionId }),
      this.db.select(
        WRITING_ENGINE_TABLES.validationResults,
        { execution_id: executionId },
        { orderBy: 'attempt', ascending: true },
      ),
    ]);

    const taskAnalysis = execution.task_analysis_id
      ? (await this.db.select(WRITING_ENGINE_TABLES.taskAnalyses, {
          id: execution.task_analysis_id,
        }))[0] ?? null
      : execution.task_fingerprint
        ? await this.getTaskAnalysisByFingerprint(String(execution.task_fingerprint))
        : null;

    return {
      execution,
      submission,
      task_analysis: taskAnalysis,
      observations,
      assessment: assessments[0] ?? null,
      assessment_criteria: criteria,
      feedback: feedback[0] ?? null,
      validation_results: validationResults,
    };
  }

  // -- internals ------------------------------------------------------------

  /**
   * Artefacts may only be attached to an execution that is still running. Once an
   * execution is completed or failed its bundle is closed, and the way to record
   * a different outcome is a new execution.
   */
  private async requireRunningExecution(executionId: string, action: string): Promise<Row> {
    const execution = await this.getExecution(executionId);
    if (!execution) {
      throw new PersistenceError(`execution ${executionId} was not found`);
    }
    if (execution.status !== 'running') {
      throw new ImmutableRecordError(
        `execution ${executionId} is already ${execution.status}; cannot ${action} it. ` +
          'Create a new execution instead.',
      );
    }
    return execution;
  }

  private first(rows: Row[], what: string): Row {
    const row = rows[0];
    if (!row) throw new PersistenceError(`the database returned no ${what} row after insert`);
    return row;
  }
}

export function createWritingEngineRepository(db: WritingEngineDb): WritingEngineRepository {
  return new WritingEngineRepository(db);
}
