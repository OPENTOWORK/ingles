/**
 * Phase 7 — persistence and provenance.
 *
 * Two kinds of assertion live here, on purpose:
 *
 *  - Repository behaviour, against an in-memory double that mirrors the unique
 *    constraints, CHECK constraints and append-only triggers of the migration.
 *  - Static assertions against `scripts/sql/writing_engine_schema.sql`, for the
 *    guarantees that only the database can make.
 *
 * Nothing here connects to Supabase. The migration has not been applied, so the
 * database-level guarantees are verified as SQL text, not as behaviour, and R5
 * stays open until they run against a real database.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { SCHEMA_VERSION, SOURCE_DOC_VERSIONS, WRITING_ENGINE_VERSION } from '../domain/engine-version';
import { CAMBRIDGE_CRITERION_KEYS } from '../domain/schemas';
import type {
  AssessmentResult,
  FeedbackPayload,
  ObservationExtractionResult,
  ResolvedTaskAnalysis,
} from '../domain/types';
import {
  analyseWritingTask,
  computeTaskFingerprint,
} from '../services/analysis/task-analysis.service';
import { extractObservations } from '../services/observation/observation.service';
import { composeFeedback } from '../services/feedback/feedback-composer.service';
import { buildHistoryOverlay } from '../services/feedback/learner-history-enrichment.service';
import { buildValidationResult } from '../services/validation/deterministic-validators';
import {
  ImmutableRecordError,
  PROTECTED_LEGACY_TABLES,
  PersistenceValidationError,
  type Row,
  WRITING_ENGINE_TABLES,
  WRITING_ENGINE_TABLE_NAMES,
  WritingEngineRepository,
  type WritingEngineDb,
  type WritingEngineTable,
} from '../services/persistence/writing-engine.repository';

// ---------------------------------------------------------------------------
// The migration, read as text
// ---------------------------------------------------------------------------

const SQL = fs.readFileSync(
  path.join(process.cwd(), 'scripts', 'sql', 'writing_engine_schema.sql'),
  'utf8',
);

/** The migration without its comments, so prose about rollback is not read as DDL. */
const SQL_CODE = SQL.replace(/^\s*--.*$/gm, '').replace(/\s--[^\n]*$/gm, '');

// ---------------------------------------------------------------------------
// In-memory database double
// ---------------------------------------------------------------------------

const UNIQUE: Partial<Record<WritingEngineTable, string[][]>> = {
  writing_task_analyses: [['task_fingerprint']],
  writing_observations: [['execution_id', 'observation_id']],
  writing_assessments: [['execution_id']],
  writing_assessment_criteria: [['execution_id', 'criterion']],
  writing_feedback_payloads: [['execution_id']],
  writing_validation_results: [['execution_id', 'stage', 'attempt']],
};

/** Columns the schema deliberately does not have. A row carrying one is a bug. */
const FORBIDDEN_COLUMNS = [
  'cefr',
  'cefr_result',
  'passed',
  'aprobado',
  'readiness',
  'pass_fail',
  'colour',
  'color',
  'css_class',
];

const CHECKS: Partial<Record<WritingEngineTable, (row: Row) => string | null>> = {
  writing_assessments(row) {
    if (row.max_total !== 20) return 'max_total must be 20';
    if (row.single_task_scale_claim_allowed) return 'single_task_scale_claim_allowed must be false';
    if (row.word_count_penalty_applied) return 'word_count_penalty_applied must be false';
    if (row.calibration_status !== 'not_calibrated') return 'calibration_status must be not_calibrated';
    if (row.status === 'incomplete' && row.raw_total !== null) {
      return 'an incomplete assessment must not carry a total';
    }
    if (row.status === 'complete' && row.raw_total === null) {
      return 'a complete assessment must carry its total';
    }
    if (row.status === 'incomplete' && !row.incomplete_reason) {
      return 'an incomplete assessment must record its reason';
    }
    return null;
  },
  writing_assessment_criteria(row) {
    if (!(CAMBRIDGE_CRITERION_KEYS as readonly string[]).includes(String(row.criterion))) {
      return `criterion ${String(row.criterion)} is not one of the four Cambridge criteria`;
    }
    const mark = row.mark;
    if (typeof mark !== 'number' || !Number.isInteger(mark) || mark < 0 || mark > 5) {
      return `mark ${String(mark)} is outside 0–5`;
    }
    if (row.band_ceiling_reached !== (mark === 5)) return 'band_ceiling_reached must follow the mark';
    if (row.band_floor_reached !== (mark === 0)) return 'band_floor_reached must follow the mark';
    if (mark === 0 && row.why_not_lower) return 'band 0 has no lower band';
    if (mark > 0 && !row.why_not_lower) return 'marks 1–5 require why_not_lower';
    return null;
  },
  writing_observations(row) {
    if (row.renderable_locally && row.binding_status !== 'bound') {
      return 'only a bound observation is renderable locally';
    }
    if (row.meaning_blocking !== (row.communicative_impact === 'blocked')) {
      return 'meaning_blocking must follow communicative_impact';
    }
    return null;
  },
  writing_feedback_payloads(row) {
    const strengths = Number(row.opening_strength_count);
    if (strengths < 0 || strengths > 3) return 'opening_strength_count is outside 0–3';
    if (row.learner_history_applied && !row.history_overlay) {
      return 'applied history must be persisted with its overlay';
    }
    return null;
  },
  writing_validation_results(row) {
    const retrying = row.validation_status === 'retry_required';
    if (retrying && (!row.retry_target || !row.retry_reason)) {
      return 'a retry must record its target and reason';
    }
    if (!retrying && (row.retry_target || row.retry_reason)) {
      return 'retry metadata belongs to a retry only';
    }
    return null;
  },
};

class UniqueViolation extends Error {}
class CheckViolation extends Error {}
class AppendOnlyViolation extends Error {}

/**
 * Mirrors the migration closely enough to be worth trusting: unique constraints,
 * the CHECK constraints that protect the marks, the append-only triggers and the
 * deferred four-criteria integrity check (exposed as `commit()`).
 */
class FakeDb implements WritingEngineDb {
  readonly tables = new Map<string, Row[]>();
  private sequence = 0;

  private rows(table: string): Row[] {
    if (!this.tables.has(table)) this.tables.set(table, []);
    return this.tables.get(table)!;
  }

  all(table: WritingEngineTable): Row[] {
    return this.rows(table).map((row) => ({ ...row }));
  }

  async insert(table: WritingEngineTable, rows: Row[]): Promise<Row[]> {
    const inserted: Row[] = [];
    for (const row of rows) {
      const stored: Row = {
        id: row.id ?? `${table}_${(this.sequence += 1)}`,
        created_at: new Date().toISOString(),
        ...row,
      };

      for (const key of Object.keys(stored)) {
        if (FORBIDDEN_COLUMNS.includes(key)) {
          throw new CheckViolation(`${table} has no column ${key}`);
        }
      }
      const check = CHECKS[table]?.(stored);
      if (check) throw new CheckViolation(`${table}: ${check}`);

      for (const columns of UNIQUE[table] ?? []) {
        const clash = this.rows(table).some((existing) =>
          columns.every((column) => existing[column] === stored[column]),
        );
        if (clash) {
          throw new UniqueViolation(`${table} already has a row for ${columns.join(', ')}`);
        }
      }

      this.rows(table).push(stored);
      inserted.push({ ...stored });
    }
    return inserted;
  }

  async select(
    table: WritingEngineTable,
    match: Row,
    options?: { orderBy?: string; ascending?: boolean },
  ): Promise<Row[]> {
    let found = this.rows(table).filter((row) =>
      Object.entries(match).every(([key, value]) => row[key] === value),
    );
    if (options?.orderBy) {
      const key = options.orderBy;
      const direction = options.ascending === false ? -1 : 1;
      found = [...found].sort((a, b) => (String(a[key]) < String(b[key]) ? -direction : direction));
    }
    return found.map((row) => ({ ...row }));
  }

  async update(table: WritingEngineTable, match: Row, patch: Row): Promise<Row[]> {
    // The migration installs an append-only trigger on every artefact table; only
    // the execution lifecycle may be updated at all.
    if (table !== WRITING_ENGINE_TABLES.executions) {
      throw new AppendOnlyViolation(`writing engine artefacts are append-only: ${table}`);
    }
    const updated: Row[] = [];
    for (const row of this.rows(table)) {
      const matches = Object.entries(match).every(([key, value]) => row[key] === value);
      if (!matches) continue;
      if (row.status !== 'running') {
        throw new AppendOnlyViolation(`execution ${String(row.id)} is already ${String(row.status)}`);
      }
      Object.assign(row, patch);
      updated.push({ ...row });
    }
    return updated;
  }

  /** The deferred constraint trigger: checked once, at the end of the transaction. */
  commit(): void {
    for (const assessment of this.rows(WRITING_ENGINE_TABLES.assessments)) {
      const criteria = this.rows(WRITING_ENGINE_TABLES.assessmentCriteria).filter(
        (row) => row.execution_id === assessment.execution_id,
      );
      const distinct = new Set(criteria.map((row) => row.criterion));
      if (assessment.status === 'complete') {
        if (distinct.size !== 4) {
          throw new CheckViolation(
            `a complete assessment requires exactly the four Cambridge criteria (execution ${String(assessment.execution_id)} has ${distinct.size})`,
          );
        }
        const sum = criteria.reduce((total, row) => total + Number(row.mark), 0);
        if (sum !== assessment.raw_total) {
          throw new CheckViolation(
            `raw_total ${String(assessment.raw_total)} must equal the sum of the four criterion marks (${sum})`,
          );
        }
      } else if (distinct.size > 0) {
        throw new CheckViolation('an incomplete assessment must not carry criterion marks');
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CANDIDATE = [
  'Fast food is very popular today. Many people eat it every day because it is cheap and quick.',
  'However, I believe it is harmful for our health. My friend eat fast food three times a week and he feels tired.',
  'In conclusion, we should reduce fast food and cook at home more often.',
].join('\n');

const ESSAY_TASK =
  'Write an essay in 140–190 words.\nSome people say that fast food is always a bad thing to eat. Do you agree?\nYou should write about: health, price and convenience, your own idea.';

const MODEL = {
  model: 'gpt-4o-2024-08-06',
  snapshot_id: 'gpt-4o-2024-08-06',
  temperature: 0,
  response_format: 'json_schema' as const,
};

const USAGE = {
  token_source: 'provider_reported' as const,
  input_tokens: 3120,
  output_tokens: 940,
  total_tokens: 4060,
  actual_models: {
    observations: 'gpt-4o-2024-08-06',
    assessment: 'gpt-4o-2024-08-06',
    feedback: 'gpt-4o-2024-08-06',
  },
  usage_by_stage: {
    observations: { input_tokens: 1400, output_tokens: 400, total_tokens: 1800 },
    assessment: { input_tokens: 1000, output_tokens: 300, total_tokens: 1300 },
    feedback: { input_tokens: 720, output_tokens: 240, total_tokens: 960 },
  },
  latency_ms: 8400,
  latency_by_stage: { observations: 3100, assessment: 2900, feedback: 2400 },
  cost_usd: 0.0421,
  cost_eur: 0.039,
  cost_basis: { pricing_table: 'openai-2024-08', unit: 'per_1m_tokens' },
};

let TASK_ANALYSIS: ResolvedTaskAnalysis;
let OBSERVATIONS: ObservationExtractionResult;
let FEEDBACK: FeedbackPayload;
let GRAMMAR_ID = '';
let STRENGTH_ID = '';

function observationItem(overrides: Record<string, unknown> = {}) {
  return {
    domain: 'grammar',
    observation_type: 'accuracy_error',
    polarity: 'negative',
    scope: 'local',
    text_quote: 'My friend eat fast food',
    occurrence_index: 0,
    supporting_quotes: [],
    intended_meaning: 'My friend eats fast food.',
    diagnosis: 'The third-person singular -s is missing.',
    suggested_change: 'My friend eats fast food',
    voice_preservation: {
      preserves_stance: true,
      preserves_central_meaning: true,
      register_is_the_target: false,
    },
    communicative_impact: 'minor',
    within_script_frequency: 'isolated',
    knowledge_status: 'likely_lapse',
    foundational_importance: 'basic_expected_form',
    transferability: 'across_writing_and_use_of_english',
    pedagogical_priority: 'high',
    confidence: 'high',
    ambitious_attempt: false,
    learning_opportunity: null,
    teacher_dna_rule_ids: ['R17'],
    pattern_key: null,
    ...overrides,
  };
}

function evidence(quote: string) {
  const start = CANDIDATE.indexOf(quote);
  if (start < 0) throw new Error(`fixture quote not found: ${quote}`);
  return [{ quote, occurrence_index: 0, span_start: start, span_end: start + quote.length, bound_text: quote }];
}

const CRITERION_EVIDENCE: Record<string, string> = {
  content: 'it is cheap and quick',
  communicative_achievement: 'However, I believe it is harmful for our health',
  organisation: 'In conclusion,',
  language: 'he feels tired',
};

const CRITERION_RULE: Record<string, string> = {
  content: 'C03',
  communicative_achievement: 'CA03',
  organisation: 'O01',
  language: 'L01',
};

function decision(criterion: string, mark: number) {
  const mixed = mark === 2 || mark === 4;
  return {
    criterion,
    mark,
    band_anchor: `${criterion} band ${mark} descriptor`,
    positive_evidence: [`The response shows ${criterion} strength at band ${mark}.`],
    limiting_evidence: mark <= 4 ? [`The response is limited in ${criterion} at band ${mark}.`] : [],
    text_evidence: evidence(CRITERION_EVIDENCE[criterion]!),
    why_not_higher:
      mark === 5
        ? 'Band 5 is the highest available band and its descriptor is met.'
        : `The next band is not reached because the ${criterion} descriptor is not sustained.`,
    ...(mark >= 1
      ? { why_not_lower: `The lower band is exceeded because ${criterion} performance is stronger.` }
      : {}),
    ...(mixed
      ? {
          adjacent_band_evidence: {
            lower_band_reference: `${criterion}.band_${mark - 1}`,
            lower_band_evidence: `Concrete band ${mark - 1} feature observed for ${criterion}.`,
            higher_band_reference: `${criterion}.band_${mark + 1}`,
            higher_band_evidence: `Concrete band ${mark + 1} feature observed for ${criterion}.`,
          },
        }
      : {}),
    band_ceiling_reached: mark === 5,
    band_floor_reached: mark === 0,
    confidence: 'high',
    source_rule_ids: [CRITERION_RULE[criterion]!],
    evidence_observation_ids: [],
  };
}

function assessment(marks: [number, number, number, number] = [4, 3, 3, 3]): AssessmentResult {
  return {
    assessment_record: {
      status: 'complete',
      criteria: {
        content: decision('content', marks[0]),
        communicative_achievement: decision('communicative_achievement', marks[1]),
        organisation: decision('organisation', marks[2]),
        language: decision('language', marks[3]),
      },
      raw_total: marks[0] + marks[1] + marks[2] + marks[3],
      max_total: 20,
      single_task_scale_claim_allowed: false,
      overall_confidence: 'high',
      word_count: 62,
      word_count_penalty_applied: false,
    },
    provenance: {
      engine_version: WRITING_ENGINE_VERSION,
      schema_version: SCHEMA_VERSION,
      cambridge_assessment_version: SOURCE_DOC_VERSIONS.cambridge_assessment,
      task_requirements_version: SOURCE_DOC_VERSIONS.task_requirements,
      assessment_prompt_version: '1.0.0',
      doc_versions: { ...SOURCE_DOC_VERSIONS },
      model_config: MODEL,
      candidate_response_hash: 'sha256:candidate',
      task_fingerprint: 'sha256:fingerprint',
      llm_calls: 1,
      learner_history_available: false,
      observation_evidence_index_size: 2,
      calibration_status: 'not_calibrated',
    },
  } as unknown as AssessmentResult;
}

function incompleteAssessment(): AssessmentResult {
  const complete = assessment();
  return {
    assessment_record: {
      status: 'incomplete',
      incomplete_reason: 'The response is off-task, so no Cambridge profile can be justified.',
      max_total: 20,
      single_task_scale_claim_allowed: false,
      word_count: 12,
      word_count_penalty_applied: false,
    },
    provenance: complete.provenance,
  } as unknown as AssessmentResult;
}

function submissionInput(overrides: Record<string, unknown> = {}) {
  return {
    user_id: '11111111-1111-1111-1111-111111111111',
    pregunta_id: '22222222-2222-2222-2222-222222222222',
    examen_id: '33333333-3333-3333-3333-333333333333',
    parte_numero: 1,
    submission_source: 'exam_mode' as const,
    task_type: 'essay' as const,
    task_prompt_snapshot: ESSAY_TASK,
    task_context_snapshot: { level: 'b2', part_label: 'Writing Part 1' },
    candidate_response: CANDIDATE,
    candidate_response_hash: 'sha256:candidate',
    word_count: 62,
    ...overrides,
  };
}

function executionInput(overrides: Record<string, unknown> = {}) {
  return {
    submission_id: 'unset',
    engine_version: WRITING_ENGINE_VERSION,
    schema_version: SCHEMA_VERSION,
    doc_versions: { ...SOURCE_DOC_VERSIONS },
    prompt_versions: {
      task_analysis: '1.0.0',
      observation_assessment: '1.0.0',
      cambridge_assessment: '1.0.0',
      feedback_composition: '1.0.0',
    },
    model_config: MODEL,
    ...overrides,
  };
}

function repo(): { repository: WritingEngineRepository; db: FakeDb } {
  const db = new FakeDb();
  return { repository: new WritingEngineRepository(db), db };
}

/** A submission plus a running execution, which is where every artefact attaches. */
async function openExecution(
  repository: WritingEngineRepository,
  overrides: Record<string, unknown> = {},
) {
  const submission = await repository.createSubmission(submissionInput());
  const execution = await repository.createExecution(
    executionInput({ submission_id: String(submission.id), ...overrides }) as never,
  );
  return { submission, execution };
}

test('setup: Phase 2, 3 and 6 fixtures', async () => {
  const analysis = await analyseWritingTask(
    { source_task_text: ESSAY_TASK, task_type: 'essay' },
    {
      llm: {
        async generate() {
          return {
            target_reader: 'Your English teacher',
            target_reader_evidence_quote: null,
            communicative_purpose: 'Discuss the topic and give a clear opinion',
            register: 'neutral',
            tone: null,
            mandatory_content_points: [
              { point: 'Health', evidence_quote: null },
              { point: 'Price and convenience', evidence_quote: null },
            ],
            required_functions: [],
            task_specific_mandatory_conventions: [],
            ambiguities: [],
            inferred_task_type: null,
          };
        },
      },
    },
  );
  if (analysis.status !== 'complete') throw new Error('task analysis fixture failed');
  TASK_ANALYSIS = analysis.task_analysis;

  OBSERVATIONS = await extractObservations(
    { candidate_response: CANDIDATE, task_analysis: TASK_ANALYSIS },
    {
      llm: {
        async generate() {
          return {
            base_correction_strategy: 'focused',
            principal_focus: 'grammar',
            strategy_rationale: 'Grammar deserves the main attention on this script.',
            observations: [
              observationItem(),
              observationItem({
                domain: 'strength',
                observation_type: 'strength',
                polarity: 'positive',
                text_quote: 'However, I believe it is harmful for our health',
                intended_meaning: 'The writer states a clear position.',
                diagnosis: 'The contrast marker moves cleanly from the general view to the opinion.',
                suggested_change: null,
                voice_preservation: null,
                communicative_impact: 'none',
                knowledge_status: 'uncertain',
                foundational_importance: 'not_applicable',
                pedagogical_priority: 'low',
                teacher_dna_rule_ids: ['R21'],
              }),
            ],
          };
        },
      },
    },
  );

  for (const observation of OBSERVATIONS.observations) {
    if (observation.domain === 'grammar') GRAMMAR_ID = observation.observation_id;
    if (observation.domain === 'strength') STRENGTH_ID = observation.observation_id;
  }
  assert.ok(GRAMMAR_ID && STRENGTH_ID);

  const composed = await composeFeedback(
    {
      candidate_response: CANDIDATE,
      task_analysis: TASK_ANALYSIS,
      observations: OBSERVATIONS,
      assessment: assessment(),
    } as never,
    {
      llm: {
        async generate() {
          return {
            opening_strengths: [
              {
                observation_id: STRENGTH_ID,
                headline: 'Your contrast lands clearly.',
                explanation:
                  '"However" moves the reader from the common view to your own position in one step.',
              },
            ],
            annotations: [
              {
                observation_id: GRAMMAR_ID,
                feedback_kind: 'correction',
                local_explanation: 'Third person singular needs -s.',
                suggested_change: 'My friend eats fast food',
                teaching_prompt: null,
              },
            ],
            criterion_feedback: CAMBRIDGE_CRITERION_KEYS.map((criterion) => ({
              criterion,
              summary: `Your ${criterion} does the job with room to grow.`,
              what_worked: `You cover what the task asks for in ${criterion}.`,
              what_limited_the_band: `Development stays general in ${criterion}.`,
              evidence_indices: [0],
              next_focus: `Practise finishing each ${criterion} point with one concrete example the reader can picture.`,
            })),
            review_next: [
              {
                concept: 'Third person singular -s',
                reason: 'It slipped once and it is worth a quick check before you submit.',
                source: 'observation',
                source_ids: [GRAMMAR_ID],
              },
            ],
          };
        },
      },
    },
  );
  FEEDBACK = composed.feedback_payload;
});

// ---------------------------------------------------------------------------
// A — the eight-table design
// ---------------------------------------------------------------------------

test('A — the design is exactly eight writing_* tables, and no existing table', () => {
  assert.equal(WRITING_ENGINE_TABLE_NAMES.length, 8);
  assert.deepEqual(
    [...WRITING_ENGINE_TABLE_NAMES].sort(),
    [
      'writing_assessment_criteria',
      'writing_assessments',
      'writing_engine_executions',
      'writing_feedback_payloads',
      'writing_observations',
      'writing_submissions',
      'writing_task_analyses',
      'writing_validation_results',
    ],
  );

  for (const table of WRITING_ENGINE_TABLE_NAMES) {
    assert.ok(
      SQL_CODE.includes(`create table if not exists public.${table} (`),
      `${table} must be created by the migration`,
    );
  }
  const created = [...SQL_CODE.matchAll(/create table if not exists public\.(\w+)/g)].map(
    (match) => match[1]!,
  );
  assert.equal(created.length, 8, 'the migration creates eight tables and no more');

  for (const legacy of PROTECTED_LEGACY_TABLES) {
    assert.ok(
      !WRITING_ENGINE_TABLE_NAMES.includes(legacy as never),
      `${legacy} is not owned by this feature`,
    );
  }
});

// ---------------------------------------------------------------------------
// B — snapshots
// ---------------------------------------------------------------------------

test('B — the submitted task and response are stored as snapshots', async () => {
  const { repository, db } = repo();
  const submission = await repository.createSubmission(submissionInput());

  const stored = db.all(WRITING_ENGINE_TABLES.submissions)[0]!;
  assert.equal(stored.task_prompt_snapshot, ESSAY_TASK);
  assert.equal(stored.candidate_response, CANDIDATE);
  assert.equal(stored.word_count, 62);
  assert.deepEqual(stored.task_context_snapshot, { level: 'b2', part_label: 'Writing Part 1' });

  // Editing the exam question later cannot reach the stored snapshot, because the
  // snapshot is a copy and the row cannot be updated at all.
  await assert.rejects(
    () => db.update(WRITING_ENGINE_TABLES.submissions, { id: submission.id }, { task_prompt_snapshot: 'edited' }),
    /append-only/,
  );
  assert.equal(db.all(WRITING_ENGINE_TABLES.submissions)[0]!.task_prompt_snapshot, ESSAY_TASK);

  // The snapshot is also not a foreign key to levels_preguntas.
  assert.ok(!/references public\.levels_preguntas/.test(SQL_CODE));
});

// ---------------------------------------------------------------------------
// C, D, Q — executions and re-evaluation
// ---------------------------------------------------------------------------

test('C — two executions can reference the same submission', async () => {
  const { repository } = repo();
  const { submission, execution } = await openExecution(repository);
  await repository.finalizeExecution(String(execution.id), {
    status: 'completed',
    validation_status: 'passed',
    usage: USAGE,
  });

  const second = await repository.createExecution(
    executionInput({
      submission_id: String(submission.id),
      previous_execution_id: String(execution.id),
      execution_label: 're-evaluation',
    }) as never,
  );

  const executions = await repository.listExecutionsForSubmission(String(submission.id));
  assert.equal(executions.length, 2);
  assert.equal(second.previous_execution_id, execution.id);
});

test('D — a re-evaluation does not overwrite the previous execution', async () => {
  const { repository, db } = repo();
  const { submission, execution } = await openExecution(repository);
  await repository.persistAssessment(String(execution.id), assessment([4, 3, 3, 3]));
  await repository.finalizeExecution(String(execution.id), {
    status: 'completed',
    validation_status: 'passed',
    usage: USAGE,
  });

  const second = await repository.createExecution(
    executionInput({
      submission_id: String(submission.id),
      previous_execution_id: String(execution.id),
    }) as never,
  );
  await repository.persistAssessment(String(second.id), assessment([5, 4, 4, 4]));

  const assessments = db.all(WRITING_ENGINE_TABLES.assessments);
  assert.equal(assessments.length, 2);
  assert.equal(assessments.find((row) => row.execution_id === execution.id)!.raw_total, 13);
  assert.equal(assessments.find((row) => row.execution_id === second.id)!.raw_total, 17);

  // And the closed execution refuses new artefacts outright.
  await assert.rejects(
    () => repository.persistAssessment(String(execution.id), assessment([5, 5, 5, 5])),
    ImmutableRecordError,
  );
});

test('Q — historical engine versions stay distinguishable', async () => {
  const { repository } = repo();
  const submission = await repository.createSubmission(submissionInput());
  const old = await repository.createExecution(
    executionInput({ submission_id: String(submission.id), engine_version: '3.0.0' }) as never,
  );
  await repository.finalizeExecution(String(old.id), { status: 'completed', usage: USAGE });
  const fresh = await repository.createExecution(
    executionInput({
      submission_id: String(submission.id),
      engine_version: '3.1.0',
      previous_execution_id: String(old.id),
    }) as never,
  );

  const oldBundle = await repository.getExecutionBundle(String(old.id));
  const freshBundle = await repository.getExecutionBundle(String(fresh.id));
  assert.equal(oldBundle.execution.engine_version, '3.0.0');
  assert.equal(freshBundle.execution.engine_version, '3.1.0');
  assert.equal(oldBundle.submission.id, freshBundle.submission.id);
});

// ---------------------------------------------------------------------------
// E, F, X — task-analysis cache
// ---------------------------------------------------------------------------

test('E — the fingerprint cache lookup is version-sensitive', async () => {
  const { repository, db } = repo();

  const first = await repository.insertTaskAnalysisIfAbsent({
    task_analysis: TASK_ANALYSIS,
    engine_version: WRITING_ENGINE_VERSION,
  });
  assert.equal(first.cache_hit, false);

  const hit = await repository.insertTaskAnalysisIfAbsent({
    task_analysis: TASK_ANALYSIS,
    engine_version: WRITING_ENGINE_VERSION,
  });
  assert.equal(hit.cache_hit, true);
  assert.equal(db.all(WRITING_ENGINE_TABLES.taskAnalyses).length, 1);

  // A newer prompt version is a different fingerprint, so it is a different row —
  // never an overwrite of the analysis that produced older corrections.
  const newerPrompt = structuredClone(TASK_ANALYSIS) as ResolvedTaskAnalysis;
  newerPrompt.provenance.task_analysis_prompt_version = '2.0.0';
  newerPrompt.provenance.task_fingerprint = computeTaskFingerprint({
    source_task_text: newerPrompt.source_task_text,
    task_type: newerPrompt.task_type,
    model_config: newerPrompt.provenance.model_config,
    task_analysis_prompt_version: '2.0.0',
  });
  assert.notEqual(
    newerPrompt.provenance.task_fingerprint,
    TASK_ANALYSIS.provenance.task_fingerprint,
  );

  const second = await repository.insertTaskAnalysisIfAbsent({
    task_analysis: newerPrompt,
    engine_version: WRITING_ENGINE_VERSION,
  });
  assert.equal(second.cache_hit, false);
  assert.equal(db.all(WRITING_ENGINE_TABLES.taskAnalyses).length, 2);

  const original = await repository.getTaskAnalysisByFingerprint(
    TASK_ANALYSIS.provenance.task_fingerprint,
  );
  assert.equal(
    (original!.task_analysis as ResolvedTaskAnalysis).provenance.task_analysis_prompt_version,
    TASK_ANALYSIS.provenance.task_analysis_prompt_version,
  );
});

test('F — one fingerprint cannot hold two conflicting cache entries', async () => {
  const { repository, db } = repo();
  await repository.insertTaskAnalysisIfAbsent({
    task_analysis: TASK_ANALYSIS,
    engine_version: WRITING_ENGINE_VERSION,
  });

  // Same fingerprint, different payload: the stored analysis wins and nothing is
  // written, because the fingerprint IS the identity.
  const tampered = structuredClone(TASK_ANALYSIS) as ResolvedTaskAnalysis;
  tampered.communicative_purpose = 'A different purpose entirely';
  const result = await repository.insertTaskAnalysisIfAbsent({
    task_analysis: tampered,
    engine_version: WRITING_ENGINE_VERSION,
  });
  assert.equal(result.cache_hit, true);
  assert.equal(db.all(WRITING_ENGINE_TABLES.taskAnalyses).length, 1);
  assert.notEqual(
    (result.record.task_analysis as ResolvedTaskAnalysis).communicative_purpose,
    'A different purpose entirely',
  );

  // A direct duplicate insert is refused by the unique constraint.
  await assert.rejects(
    () =>
      db.insert(WRITING_ENGINE_TABLES.taskAnalyses, [
        { task_fingerprint: TASK_ANALYSIS.provenance.task_fingerprint, task_analysis: {} },
      ]),
    /already has a row/,
  );
});

test('X — the task-analysis cache has no client write path', () => {
  assert.ok(!/create policy writing_task_analyses/.test(SQL_CODE));
  assert.ok(!/grant [^;]*on public\.writing_task_analyses to /.test(SQL_CODE));
  assert.ok(/revoke all on public\.writing_task_analyses from anon, authenticated/.test(SQL_CODE));
  assert.ok(
    /alter table public\.writing_task_analyses enable row level security/.test(SQL_CODE),
    'RLS with no policy is a closed door, which is the intent',
  );
});

// ---------------------------------------------------------------------------
// G — observations
// ---------------------------------------------------------------------------

test('G — an observation id is unique within its execution', async () => {
  const { repository, db } = repo();
  const { submission, execution } = await openExecution(repository);

  const rows = await repository.persistObservations(String(execution.id), OBSERVATIONS);
  assert.equal(rows.length, OBSERVATIONS.observations.length);

  await assert.rejects(
    () => repository.persistObservations(String(execution.id), OBSERVATIONS),
    /already has a row/,
  );

  // The same ids under a different execution are a different attempt, not a clash.
  const second = await repository.createExecution(
    executionInput({ submission_id: String(submission.id) }) as never,
  );
  const again = await repository.persistObservations(String(second.id), OBSERVATIONS);
  assert.equal(again.length, OBSERVATIONS.observations.length);

  const stored = db.all(WRITING_ENGINE_TABLES.observations)[0]!;
  assert.ok(!('mark' in stored));
  assert.ok(!('category_key' in stored));
  assert.ok(!('colour' in stored));
});

// ---------------------------------------------------------------------------
// H, I, J, K, L, Y — assessment integrity
// ---------------------------------------------------------------------------

test('H — only the four canonical criteria are accepted', async () => {
  const { repository, db } = repo();
  const { execution } = await openExecution(repository);
  await repository.persistAssessment(String(execution.id), assessment());

  const stored = db.all(WRITING_ENGINE_TABLES.assessmentCriteria);
  assert.deepEqual(
    stored.map((row) => row.criterion).sort(),
    ['communicative_achievement', 'content', 'language', 'organisation'],
  );

  await assert.rejects(
    () =>
      db.insert(WRITING_ENGINE_TABLES.assessmentCriteria, [
        {
          execution_id: execution.id,
          criterion: 'vocabulary',
          mark: 3,
          band_ceiling_reached: false,
          band_floor_reached: false,
          why_not_lower: 'x',
        },
      ]),
    /not one of the four Cambridge criteria/,
  );
  assert.ok(
    /criterion in \('content', 'communicative_achievement', 'organisation', 'language'\)/.test(
      SQL_CODE,
    ),
  );
});

test('I — a mark outside 0–5 cannot be stored', async () => {
  const { repository, db } = repo();
  const { execution } = await openExecution(repository);
  await repository.persistAssessment(String(execution.id), assessment());

  for (const mark of [-1, 6, 2.5]) {
    await assert.rejects(
      () =>
        db.insert(WRITING_ENGINE_TABLES.assessmentCriteria, [
          {
            execution_id: execution.id,
            criterion: 'content',
            mark,
            band_ceiling_reached: false,
            band_floor_reached: false,
            why_not_lower: 'x',
          },
        ]),
      /outside 0–5|already has a row/,
    );
  }
  assert.ok(/mark smallint not null check \(mark >= 0 and mark <= 5\)/.test(SQL_CODE));
});

test('J — a complete assessment needs all four criteria at the end of the transaction', async () => {
  const { repository, db } = repo();
  const { execution } = await openExecution(repository);

  // Rows 1–3 do not fail on their own: the check is deferred to the commit.
  await db.insert(WRITING_ENGINE_TABLES.assessments, [
    {
      execution_id: execution.id,
      status: 'complete',
      raw_total: 13,
      max_total: 20,
      single_task_scale_claim_allowed: false,
      word_count_penalty_applied: false,
      calibration_status: 'not_calibrated',
    },
  ]);
  for (const criterion of ['content', 'communicative_achievement', 'organisation']) {
    await db.insert(WRITING_ENGINE_TABLES.assessmentCriteria, [
      {
        execution_id: execution.id,
        criterion,
        mark: 3,
        band_ceiling_reached: false,
        band_floor_reached: false,
        why_not_lower: 'The lower band is exceeded.',
      },
    ]);
  }
  assert.throws(() => db.commit(), /exactly the four Cambridge criteria/);

  await db.insert(WRITING_ENGINE_TABLES.assessmentCriteria, [
    {
      execution_id: execution.id,
      criterion: 'language',
      mark: 4,
      band_ceiling_reached: false,
      band_floor_reached: false,
      why_not_lower: 'The lower band is exceeded.',
    },
  ]);
  db.commit();

  assert.ok(/deferrable initially deferred/.test(SQL_CODE));
  assert.ok(/after insert or update or delete on public\.writing_assessment_criteria/.test(SQL_CODE));
});

test('K — raw_total must equal the four marks when the transaction closes', async () => {
  const { repository, db } = repo();
  const { execution } = await openExecution(repository);
  await repository.persistAssessment(String(execution.id), assessment([4, 3, 3, 3]));
  db.commit();

  const stored = db.all(WRITING_ENGINE_TABLES.assessments)[0]!;
  const sum = db
    .all(WRITING_ENGINE_TABLES.assessmentCriteria)
    .reduce((total, row) => total + Number(row.mark), 0);
  assert.equal(stored.raw_total, sum);

  // A tampered header is caught at commit, and the marks are not "corrected".
  const tables = db.tables.get(WRITING_ENGINE_TABLES.assessments)!;
  tables[0]!.raw_total = 20;
  assert.throws(() => db.commit(), /must equal the sum of the four criterion marks/);
  assert.equal(
    db.all(WRITING_ENGINE_TABLES.assessmentCriteria).reduce((t, r) => t + Number(r.mark), 0),
    13,
  );
});

test('L — an incomplete assessment stores no total at all, never 0/20', async () => {
  const { repository, db } = repo();
  const { execution } = await openExecution(repository);
  await repository.persistAssessment(String(execution.id), incompleteAssessment());

  const stored = db.all(WRITING_ENGINE_TABLES.assessments)[0]!;
  assert.equal(stored.status, 'incomplete');
  assert.equal(stored.raw_total, null);
  assert.notEqual(stored.raw_total, 0);
  assert.match(String(stored.incomplete_reason), /off-task/);
  assert.equal(db.all(WRITING_ENGINE_TABLES.assessmentCriteria).length, 0);
  db.commit();

  assert.ok(/status <> 'incomplete' or raw_total is null/.test(SQL_CODE));
});

test('Y — no persistence operation recalculates a Cambridge mark', async () => {
  const { repository, db } = repo();
  const { execution } = await openExecution(repository);

  const tampered = assessment([4, 3, 3, 3]);
  (tampered.assessment_record as { raw_total: number }).raw_total = 15;

  await assert.rejects(
    () => repository.persistAssessment(String(execution.id), tampered),
    (error: Error) =>
      error instanceof PersistenceValidationError &&
      /raw_total/.test([error.message, ...error.failures].join(' ')),
  );
  // Rejected, not repaired: nothing was written.
  assert.equal(db.all(WRITING_ENGINE_TABLES.assessments).length, 0);
  assert.equal(db.all(WRITING_ENGINE_TABLES.assessmentCriteria).length, 0);

  await repository.persistAssessment(String(execution.id), assessment([4, 3, 3, 3]));
  const marks = db
    .all(WRITING_ENGINE_TABLES.assessmentCriteria)
    .map((row) => [row.criterion, row.mark]);
  assert.deepEqual(new Map(marks as [string, number][]), new Map([
    ['content', 4],
    ['communicative_achievement', 3],
    ['organisation', 3],
    ['language', 3],
  ]));

  assert.ok(!/set\s+mark\s*=/i.test(SQL_CODE), 'no SQL statement assigns a mark');
  assert.ok(!/set\s+raw_total\s*=/i.test(SQL_CODE), 'no SQL statement assigns a raw total');
});

// ---------------------------------------------------------------------------
// M — no learner verdict anywhere in the schema
// ---------------------------------------------------------------------------

test('M — the schema introduces no CEFR, pass/fail or readiness contract', async () => {
  const { repository, db } = repo();
  const { execution } = await openExecution(repository);
  await repository.persistAssessment(String(execution.id), assessment());
  await repository.persistFeedback(String(execution.id), FEEDBACK);

  const keys = new Set<string>();
  for (const table of WRITING_ENGINE_TABLE_NAMES) {
    for (const row of db.all(table as WritingEngineTable)) {
      for (const key of Object.keys(row)) keys.add(key);
    }
  }
  for (const forbidden of ['cefr', 'cefr_result', 'passed', 'aprobado', 'readiness', 'pass_fail']) {
    assert.ok(!keys.has(forbidden), `${forbidden} must not be a persisted column`);
  }

  assert.ok(!/\bpassed\s+boolean\b/.test(SQL_CODE), 'validation success is not called passed');
  assert.ok(!/\b(cefr_result|nivel_cefr|readiness)\b/i.test(SQL_CODE));
  assert.ok(/validation_status text not null check/.test(SQL_CODE));
});

// ---------------------------------------------------------------------------
// N, P — feedback and the history overlay
// ---------------------------------------------------------------------------

test('N — the feedback payload is stored as produced', async () => {
  const { repository, db } = repo();
  const { execution } = await openExecution(repository);
  await repository.persistAssessment(String(execution.id), assessment());
  await repository.persistFeedback(String(execution.id), FEEDBACK);

  const stored = db.all(WRITING_ENGINE_TABLES.feedbackPayloads)[0]!;
  assert.deepEqual(stored.payload, FEEDBACK);
  assert.equal(stored.raw_total, FEEDBACK.global_result.raw_total);
  assert.equal(stored.annotation_count, FEEDBACK.annotations.length);
  assert.equal(stored.feedback_prompt_version, FEEDBACK.provenance.prompt_versions.feedback_composition);

  // A historical read returns the stored payload; it does not recompose it.
  const bundle = await repository.getExecutionBundle(String(execution.id));
  assert.deepEqual(bundle.feedback!.payload, FEEDBACK);
});

test('P — a history overlay is persisted without touching the assessment', async () => {
  const { repository, db } = repo();
  const { execution } = await openExecution(repository);
  await repository.persistAssessment(String(execution.id), assessment());
  const assessmentBefore = structuredClone(db.all(WRITING_ENGINE_TABLES.assessments)[0]!);

  const overlay = buildHistoryOverlay(
    OBSERVATIONS.observations,
    {
      learner_reference: 'learner-1',
      entries: [
        {
          observation_id: GRAMMAR_ID,
          confirmed_historical_recurrence: true,
          previously_taught: true,
          improvement_signal: 'unchanged',
          history_evidence_ids: ['exec_earlier_1'],
        },
      ],
    },
    assessment().assessment_record,
  );

  const payload = structuredClone(FEEDBACK) as FeedbackPayload;
  (payload as { learner_history_applied: boolean }).learner_history_applied = true;

  await repository.persistFeedback(String(execution.id), payload, {
    history_overlay: { learner_reference: 'learner-1', entries: [...overlay.entries.values()] },
  });

  const feedback = db.all(WRITING_ENGINE_TABLES.feedbackPayloads)[0]!;
  assert.equal(feedback.learner_history_applied, true);
  assert.ok(feedback.history_overlay);
  assert.deepEqual(feedback.history_evidence_ids, ['exec_earlier_1']);

  // The frozen assessment row is byte-identical, and carries no history field.
  assert.deepEqual(db.all(WRITING_ENGINE_TABLES.assessments)[0], assessmentBefore);
  const recordKeys = Object.keys(assessmentBefore.assessment_record as Row);
  for (const key of recordKeys) {
    assert.ok(!/histor|previously_taught|recurrence/i.test(key), `${key} has no place in a mark`);
  }

  // Claiming applied history without an overlay to persist is refused.
  const { repository: other } = repo();
  const second = await openExecution(other);
  await assert.rejects(
    () => other.persistFeedback(String(second.execution.id), payload),
    PersistenceValidationError,
  );
});

// ---------------------------------------------------------------------------
// O, R — validation attempts and provider usage
// ---------------------------------------------------------------------------

test('O — every validation attempt stays individually auditable', async () => {
  const { repository, db } = repo();
  const { execution } = await openExecution(repository);

  const failed = buildValidationResult(
    [
      {
        rule_id: 'V-FB-07',
        stage: 'feedback',
        severity: 'retryable_generation_failure',
        message: 'four opening strengths were selected from three eligible',
      },
    ],
    { stage: 'feedback', attempt: 1 },
  );
  const passed = buildValidationResult([], { stage: 'feedback', attempt: 2 });

  await repository.persistValidationResult(String(execution.id), failed);
  await repository.persistValidationResult(String(execution.id), passed);

  const rows = db.all(WRITING_ENGINE_TABLES.validationResults);
  assert.equal(rows.length, 2);
  const first = rows.find((row) => row.attempt === 1)!;
  assert.equal(first.validation_status, 'retry_required');
  assert.equal(first.retry_target, 'feedback');
  assert.equal((first.failed_rules as unknown[]).length, 1);
  assert.equal(rows.find((row) => row.attempt === 2)!.validation_status, 'passed');
  assert.equal(first.validation_mode, 'current_generation');

  // A historical read is recorded as such, so an old artefact is never judged by
  // today's version expectations.
  await repository.persistValidationResult(
    String(execution.id),
    buildValidationResult([], { stage: 'engine_output', attempt: 1 }),
    { validation_mode: 'historical_read' },
  );
  assert.equal(
    db.all(WRITING_ENGINE_TABLES.validationResults).find((row) => row.stage === 'engine_output')!
      .validation_mode,
    'historical_read',
  );

  // The same stage and attempt cannot be written twice.
  await assert.rejects(
    () => repository.persistValidationResult(String(execution.id), failed),
    /already has a row/,
  );
});

test('R — usage provenance is provider-reported, never estimated', async () => {
  const { repository, db } = repo();
  const { execution } = await openExecution(repository);
  await repository.finalizeExecution(String(execution.id), {
    status: 'completed',
    validation_status: 'passed',
    usage: USAGE,
  });

  const stored = db.all(WRITING_ENGINE_TABLES.executions)[0]!;
  assert.equal(stored.token_source, 'provider_reported');
  assert.equal(stored.input_tokens, 3120);
  assert.equal(stored.output_tokens, 940);
  assert.equal(stored.total_tokens, 4060);
  assert.deepEqual(stored.actual_models, USAGE.actual_models);
  assert.equal(stored.latency_ms, 8400);
  assert.equal(stored.cost_usd, 0.0421);
  assert.deepEqual(stored.cost_basis, USAGE.cost_basis);

  // A length-based estimate cannot satisfy the contract.
  const { repository: other } = repo();
  const second = await openExecution(other);
  await assert.rejects(
    () =>
      other.finalizeExecution(String(second.execution.id), {
        status: 'completed',
        usage: { ...USAGE, token_source: 'estimated_from_text_length' } as never,
      }),
    PersistenceValidationError,
  );
  await assert.rejects(
    () =>
      other.finalizeExecution(String(second.execution.id), {
        status: 'completed',
        usage: { ...USAGE, total_tokens: 99 } as never,
      }),
    PersistenceValidationError,
  );
});

// ---------------------------------------------------------------------------
// S, T — contracts and immutability at the repository boundary
// ---------------------------------------------------------------------------

test('S — an invalid domain object is refused before it reaches the database', async () => {
  const { repository, db } = repo();
  const { execution } = await openExecution(repository);

  const brokenObservations = structuredClone(OBSERVATIONS) as Row;
  (brokenObservations.observations as Row[])[0]!.domain = 'handwriting';
  await assert.rejects(
    () => repository.persistObservations(String(execution.id), brokenObservations),
    PersistenceValidationError,
  );

  const brokenFeedback = structuredClone(FEEDBACK) as Row;
  delete brokenFeedback.final_cta;
  await assert.rejects(
    () => repository.persistFeedback(String(execution.id), brokenFeedback),
    PersistenceValidationError,
  );

  await assert.rejects(
    () => repository.createSubmission({ ...submissionInput(), word_count: -3 } as never),
    PersistenceValidationError,
  );

  await assert.rejects(
    () => repository.persistValidationResult(String(execution.id), { validation_status: 'ok' }),
    PersistenceValidationError,
  );

  assert.equal(db.all(WRITING_ENGINE_TABLES.observations).length, 0);
  assert.equal(db.all(WRITING_ENGINE_TABLES.feedbackPayloads).length, 0);
});

test('T — a finalised artefact cannot be silently overwritten through the repository', async () => {
  const { repository, db } = repo();
  const { execution } = await openExecution(repository);
  await repository.persistObservations(String(execution.id), OBSERVATIONS);
  await repository.persistAssessment(String(execution.id), assessment());
  await repository.persistFeedback(String(execution.id), FEEDBACK);
  await repository.finalizeExecution(String(execution.id), {
    status: 'completed',
    validation_status: 'passed',
    usage: USAGE,
  });

  // No repository method exists to rewrite an artefact.
  const api = Object.getOwnPropertyNames(WritingEngineRepository.prototype);
  for (const method of api) {
    assert.ok(
      !/^(updateAssessment|updateFeedback|updateObservations?|upsert|deleteExecution|overwrite)/.test(
        method,
      ),
      `${method} would allow history to be rewritten`,
    );
  }

  await assert.rejects(
    () => repository.finalizeExecution(String(execution.id), { status: 'failed' }),
    ImmutableRecordError,
  );
  for (const attempt of [
    () => repository.persistObservations(String(execution.id), OBSERVATIONS),
    () => repository.persistAssessment(String(execution.id), assessment([5, 5, 5, 5])),
    () => repository.persistFeedback(String(execution.id), FEEDBACK),
  ]) {
    await assert.rejects(attempt, ImmutableRecordError);
  }

  const bundle = await repository.getExecutionBundle(String(execution.id));
  assert.equal(bundle.assessment!.raw_total, 13);
  assert.equal(bundle.observations.length, OBSERVATIONS.observations.length);
  assert.deepEqual(bundle.feedback!.payload, FEEDBACK);
  assert.equal(db.all(WRITING_ENGINE_TABLES.assessments).length, 1);
});

// ---------------------------------------------------------------------------
// U, V, W — drafts, existing tables and RLS coverage
// ---------------------------------------------------------------------------

test('U — the localStorage draft system is untouched: only submissions are persisted', () => {
  assert.ok(!/draft/i.test(SQL_CODE), 'the migration creates no draft table or column');
  const api = Object.getOwnPropertyNames(WritingEngineRepository.prototype);
  assert.ok(!api.some((method) => /draft|autosave/i.test(method)));
  assert.ok(WRITING_ENGINE_TABLE_NAMES.every((table) => !/draft/.test(table)));
});

test('V — the migration modifies no existing table', () => {
  for (const table of PROTECTED_LEGACY_TABLES) {
    const pattern = new RegExp(
      `(alter|drop)\\s+table\\s+(if exists\\s+)?(public\\.)?"?${table}"?`,
      'i',
    );
    assert.ok(!pattern.test(SQL_CODE), `${table} must not be altered or dropped`);
    assert.ok(
      !new RegExp(`references public\\."?${table}"?`, 'i').test(SQL_CODE),
      `${table} must not gain a foreign-key dependency`,
    );
  }
  const altered = [...SQL_CODE.matchAll(/alter table (?:if exists )?public\.(\w+)/gi)].map(
    (match) => match[1]!,
  );
  assert.deepEqual(
    [...new Set(altered)].filter((table) => !WRITING_ENGINE_TABLE_NAMES.includes(table as never)),
    [],
  );
  assert.ok(!/drop table/i.test(SQL_CODE));
  assert.ok(!/truncate/i.test(SQL_CODE));
  assert.ok(/^begin;$/m.test(SQL_CODE) && /^commit;$/m.test(SQL_CODE));
});

test('W — every student-data table has RLS and an own-rows read policy', () => {
  const studentTables = WRITING_ENGINE_TABLE_NAMES.filter(
    (table) => table !== WRITING_ENGINE_TABLES.taskAnalyses,
  );
  for (const table of WRITING_ENGINE_TABLE_NAMES) {
    assert.ok(
      new RegExp(`alter table public\\.${table} enable row level security`).test(SQL_CODE),
      `RLS must be enabled on ${table}`,
    );
  }
  for (const table of studentTables) {
    assert.ok(
      new RegExp(`create policy ${table}_select_own[\\s\\S]*?for select[\\s\\S]*?to authenticated`).test(
        SQL_CODE,
      ),
      `${table} needs an own-rows select policy`,
    );
    assert.ok(
      new RegExp(`revoke all on public\\.${table} from anon, authenticated`).test(SQL_CODE),
      `${table} must not keep default client privileges`,
    );
  }

  // No client may write engine data at all: no insert, update or delete policy.
  assert.ok(
    !/create policy \w+\s+on public\.writing_\w+\s+for (insert|update|delete)/.test(SQL_CODE),
  );
  // Child tables resolve ownership through the chain rather than a copied user_id.
  const executionsBody = SQL_CODE.slice(
    SQL_CODE.indexOf('create table if not exists public.writing_engine_executions'),
  );
  assert.ok(!/^\s*user_id/m.test(executionsBody.slice(0, executionsBody.indexOf(');'))));
  assert.ok(/join public\.writing_submissions s on s\.id = e\.submission_id/.test(SQL_CODE));
});
