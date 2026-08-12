/**
 * Task Analysis service (Phase 2).
 *
 * Converts a Cambridge B2 First Writing task into the canonical `task_analysis`
 * contract. It answers "what does this task require?" and nothing else: no
 * candidate response, no Teacher DNA, no bands, no feedback, no learner history.
 *
 * Split of responsibilities:
 *  - LLM: reads the natural-language wording (target reader, purpose, content
 *    points, required functions, wording-created requirements, ambiguities).
 *  - Code: task-type resolution, stable IDs, Doc 01 genre rules, word guidance,
 *    `automatic_penalty: false`, versions, fingerprint and every safeguard.
 *
 * Cache identity is computed here but deliberately not persisted — the
 * `writing_task_analyses` table is wired up in the Persistence phase.
 */
import { createHash } from 'node:crypto';
import {
  SCHEMA_VERSION,
  SOURCE_DOC_VERSIONS,
  TASK_ANALYSIS_SCHEMA_VERSION,
  WRITING_ENGINE_VERSION,
} from '../../domain/engine-version';
import {
  WORD_GUIDANCE_SOURCES,
  findForbiddenTaskAnalysisKeys,
  normaliseRequirementText,
  resolvedTaskAnalysisSchema,
} from '../../domain/schemas';
import {
  B2_FIRST_TASK_TYPES,
  type B2FirstTaskType,
  normaliseTaskTypeValue,
} from '../../domain/task-types';
import type {
  CoreGenreExpectation,
  MandatoryContentPoint,
  MandatoryGenreConvention,
  ModelConfigSnapshot,
  RecommendedGenreFeature,
  RequiredFunction,
  ResolvedTaskAnalysis,
  TargetReaderResolution,
  TaskTypeResolution,
} from '../../domain/types';
import {
  B2_FIRST_WORD_MAX,
  B2_FIRST_WORD_MIN,
  getGenreRules,
  selectWordingTriggeredConventions,
} from '../../prompts/knowledge/doc01-genre-rules';
import {
  TASK_ANALYSIS_PROMPT_VERSION,
  TASK_ANALYSIS_JSON_SCHEMA,
  type TaskAnalysisLlmOutput,
  buildTaskAnalysisPrompt,
  taskAnalysisLlmOutputSchema,
} from '../../prompts/task-analysis.prompt';

// ---------------------------------------------------------------------------
// Model configuration
// ---------------------------------------------------------------------------

/**
 * Benchmark model for Phase 2 development only. It is explicit, pinned to a
 * dated snapshot and recorded in both provenance and the fingerprint. It does
 * NOT approve this model for Cambridge Assessment — R3/R7 decide that.
 */
export const TASK_ANALYSIS_BENCHMARK_MODEL: ModelConfigSnapshot = {
  model: 'gpt-4o-2024-08-06',
  snapshot_id: 'gpt-4o-2024-08-06',
  temperature: 0,
  response_format: 'json_schema',
};

const PINNED_SNAPSHOT_PATTERN = /-\d{4}-\d{2}-\d{2}$/;

export class TaskAnalysisConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskAnalysisConfigurationError';
  }
}

export class TaskAnalysisValidationError extends Error {
  readonly failures: string[];

  constructor(message: string, failures: string[] = []) {
    super(message);
    this.name = 'TaskAnalysisValidationError';
    this.failures = failures;
  }
}

/** No unpinned fallback is allowed: the snapshot must be a dated model id. */
export function assertPinnedModelConfig(config: ModelConfigSnapshot): void {
  const snapshot = config.snapshot_id ?? config.model;
  if (!snapshot || !PINNED_SNAPSHOT_PATTERN.test(snapshot)) {
    throw new TaskAnalysisConfigurationError(
      `Task Analysis requires a pinned dated model snapshot; received "${snapshot || '(empty)'}"`,
    );
  }
}

// ---------------------------------------------------------------------------
// Fingerprint / cache identity
// ---------------------------------------------------------------------------

/** Whitespace-only differences must not create a second cache entry. Case is preserved. */
export function normaliseTaskText(text: string): string {
  return String(text ?? '')
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[\t ]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`;
}

export function hashTaskText(text: string): string {
  return `sha256:${sha256(normaliseTaskText(text))}`;
}

export interface TaskFingerprintInput {
  source_task_text: string;
  task_type: string;
  model_config: ModelConfigSnapshot;
  task_requirements_version?: string;
  task_analysis_prompt_version?: string;
  task_analysis_schema_version?: string;
}

/**
 * Any change to the task, its type, Doc 01, the prompt, the schema or the model
 * configuration must produce a different fingerprint.
 */
export function computeTaskFingerprint(input: TaskFingerprintInput): string {
  const identity = {
    task_content_hash: hashTaskText(input.source_task_text),
    task_type: input.task_type,
    task_requirements_version:
      input.task_requirements_version ?? SOURCE_DOC_VERSIONS.task_requirements,
    task_analysis_prompt_version:
      input.task_analysis_prompt_version ?? TASK_ANALYSIS_PROMPT_VERSION,
    task_analysis_schema_version:
      input.task_analysis_schema_version ?? TASK_ANALYSIS_SCHEMA_VERSION,
    model_config: input.model_config,
  };
  return `sha256:${sha256(stableStringify(identity))}`;
}

export function buildTaskAnalysisCacheKey(input: TaskFingerprintInput): string {
  const fingerprint = computeTaskFingerprint(input).replace(/^sha256:/, '');
  return `writing_task_analysis:${input.task_type}:${fingerprint}`;
}

// ---------------------------------------------------------------------------
// Task-type resolution
// ---------------------------------------------------------------------------

const GENRE_CUES: Array<{ task_type: B2FirstTaskType | 'email_family'; pattern: RegExp }> = [
  { task_type: 'essay', pattern: /\bwrite (an|your) essay\b|\bessays? wanted\b/i },
  { task_type: 'article', pattern: /\bwrite (an|your) article\b|\barticles? wanted\b/i },
  { task_type: 'report', pattern: /\bwrite (a|your) report\b|\breports? wanted\b/i },
  { task_type: 'review', pattern: /\bwrite (a|your) review\b|\breviews? wanted\b/i },
  {
    task_type: 'email_family',
    pattern: /\bwrite (an|a|your) (email|letter)\b|\breply to (the|this) (email|letter)\b/i,
  },
];

const INFORMAL_EMAIL_CUES = [
  /\bDear\s+[A-Z][a-z]+\b/,
  /\b(hi|hey)\b\s*[A-Z]?/i,
  /\byour\s+(english[- ]speaking\s+)?(friend|penfriend|classmate|cousin)\b/i,
];

const FORMAL_EMAIL_CUES = [
  /\bDear\s+(Sir|Madam|Sir or Madam|Mr|Mrs|Ms|Dr)\b/i,
  /\b(manager|director|principal|head teacher|organiser|customer service|company|editor)\b/i,
  /\b(complaint|apply|application|formal)\b/i,
];

/**
 * Fallback only. Formality read from the wording is a heuristic, never
 * authoritative metadata, so it resolves with low confidence and an explicit
 * provenance note. Ambiguous wording stays unresolved rather than guessed.
 */
function detectEmailFormality(
  text: string,
): { task_type: B2FirstTaskType; note: string } | null {
  const informal = INFORMAL_EMAIL_CUES.some((cue) => cue.test(text));
  const formal = FORMAL_EMAIL_CUES.some((cue) => cue.test(text));
  if (informal && !formal) {
    return {
      task_type: 'informal_email',
      note: 'email formality inferred heuristically from informal cues in the wording; not authoritative task metadata',
    };
  }
  if (formal && !informal) {
    return {
      task_type: 'formal_email',
      note: 'email formality inferred heuristically from formal cues in the wording; not authoritative task metadata',
    };
  }
  return null;
}

export interface TaskTypeResolutionRequest {
  source_task_text: string;
  task_type?: string | null;
  dralo_task_metadata?: { writingType?: string | null } | null;
}

/**
 * Fallback order: explicit caller → DRALO task metadata → deterministic
 * inference → (caller may then use the LLM) → unresolved. Every step is
 * recorded so the inference is observable in provenance.
 */
export function resolveTaskType(request: TaskTypeResolutionRequest): TaskTypeResolution {
  const text = String(request.source_task_text ?? '');
  const notes: string[] = [];

  for (const candidate of [
    { value: request.task_type, source: 'explicit_caller' as const },
    { value: request.dralo_task_metadata?.writingType, source: 'dralo_task_metadata' as const },
  ]) {
    if (!candidate.value) continue;
    const normalised = normaliseTaskTypeValue(candidate.value);

    if (normalised.status === 'resolved') {
      return {
        task_type: normalised.task_type,
        source: candidate.source,
        confidence: 'certain',
        notes,
      };
    }
    if (normalised.status === 'ambiguous') {
      notes.push(
        `${candidate.source} supplied "${candidate.value}", which does not distinguish formal from informal email`,
      );
      const formality = detectEmailFormality(text);
      if (formality) {
        notes.push(formality.note);
        return {
          task_type: formality.task_type,
          source: 'deterministic_inference',
          confidence: 'low',
          notes,
        };
      }
      return {
        task_type: null,
        source: 'unresolved',
        confidence: 'unresolved',
        notes: [...notes, 'email formality could not be determined from the wording'],
      };
    }
    if (normalised.status === 'out_of_scope') {
      return {
        task_type: null,
        source: 'unresolved',
        confidence: 'unresolved',
        notes: [
          ...notes,
          `"${normalised.value}" is outside Cambridge B2 First v1 scope (${B2_FIRST_TASK_TYPES.join(', ')})`,
        ],
      };
    }
    notes.push(`${candidate.source} supplied an unrecognised task type "${candidate.value}"`);
  }

  const matched = GENRE_CUES.filter((cue) => cue.pattern.test(text));
  const distinct = new Set(matched.map((cue) => cue.task_type));

  if (distinct.size === 1) {
    const [only] = [...distinct];
    if (only === 'email_family') {
      const formality = detectEmailFormality(text);
      if (formality) {
        return {
          task_type: formality.task_type,
          source: 'deterministic_inference',
          confidence: 'low',
          notes: [...notes, 'email genre inferred from the task wording', formality.note],
        };
      }
      return {
        task_type: null,
        source: 'unresolved',
        confidence: 'unresolved',
        notes: [...notes, 'email genre inferred but formality is ambiguous'],
      };
    }
    return {
      task_type: only,
      source: 'deterministic_inference',
      confidence: 'high',
      notes: [...notes, 'task type inferred unambiguously from the task wording'],
    };
  }

  if (distinct.size > 1) {
    notes.push(`the wording matches several genres (${[...distinct].join(', ')})`);
  } else {
    notes.push('the wording contains no unambiguous genre cue');
  }

  return { task_type: null, source: 'unresolved', confidence: 'unresolved', notes };
}

// ---------------------------------------------------------------------------
// Stable identifiers
// ---------------------------------------------------------------------------

export function formatStableId(prefix: string, index: number): string {
  return `${prefix}${String(index + 1).padStart(2, '0')}`;
}

/**
 * Requirements are bound to their position in the task wording before they get
 * an identifier, so the order the model happened to emit them in cannot change
 * the result. Items with no verifiable position fall to the end and are ordered
 * by normalised text.
 */
export function orderByEvidencePosition<T>(
  items: T[],
  sourceText: string,
  textOf: (item: T) => string,
  evidenceOf: (item: T) => string | null | undefined,
): T[] {
  const haystack = normaliseRequirementText(sourceText);
  const unpositioned = Number.MAX_SAFE_INTEGER;

  return items
    .map((item, index) => {
      const text = normaliseRequirementText(textOf(item));
      const evidence = normaliseRequirementText(evidenceOf(item) ?? '');
      let position = evidence ? haystack.indexOf(evidence) : -1;
      if (position < 0 && text) position = haystack.indexOf(text);
      return { item, index, text, position: position < 0 ? unpositioned : position };
    })
    .sort((a, b) => {
      if (a.position !== b.position) return a.position - b.position;
      if (a.text !== b.text) return a.text < b.text ? -1 : 1;
      return a.index - b.index;
    })
    .map((entry) => entry.item);
}

/**
 * Deterministic IDs assigned by code, never by the model. Entries are
 * de-duplicated on normalised text first, so the same analysis always yields the
 * same identifiers.
 */
export function assignStableIds<T>(
  items: T[],
  prefix: string,
  textOf: (item: T) => string,
): Array<T & { id: string }> {
  const seen = new Set<string>();
  const output: Array<T & { id: string }> = [];
  for (const item of items) {
    const key = normaliseRequirementText(textOf(item));
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push({ ...item, id: formatStableId(prefix, output.length) });
  }
  return output;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface TaskAnalysisLlmRequest {
  system: string;
  user: string;
  model_config: ModelConfigSnapshot;
  json_schema: typeof TASK_ANALYSIS_JSON_SCHEMA;
}

export interface TaskAnalysisLlmClient {
  generate(request: TaskAnalysisLlmRequest): Promise<unknown>;
}

export interface TaskAnalysisRequest {
  source_task_text: string;
  /** Explicit trusted task type, e.g. `writingType` from `src/data/b2WritingTasks.js`. */
  task_type?: string | null;
  dralo_task_metadata?: {
    writingType?: string | null;
    wordMin?: number | null;
    wordMax?: number | null;
  } | null;
  word_min?: number;
  word_max?: number;
  /** Trusted structured metadata. Takes priority over anything read from the wording. */
  target_reader?: string | null;
  model_config?: ModelConfigSnapshot;
  /** Last-resort LLM task-type inference. Enabled by default, always recorded. */
  allow_llm_task_type_inference?: boolean;
}

interface ResolvedWordGuidance {
  word_min?: number;
  word_max?: number;
  source: (typeof WORD_GUIDANCE_SOURCES)[number];
}

function resolveWordGuidance(request: TaskAnalysisRequest): ResolvedWordGuidance {
  if (request.word_min != null || request.word_max != null) {
    return {
      word_min: request.word_min ?? undefined,
      word_max: request.word_max ?? undefined,
      source: 'exam_configuration',
    };
  }
  const metadataMin = request.dralo_task_metadata?.wordMin;
  const metadataMax = request.dralo_task_metadata?.wordMax;
  if (metadataMin != null || metadataMax != null) {
    return {
      word_min: metadataMin ?? undefined,
      word_max: metadataMax ?? undefined,
      source: 'task_metadata',
    };
  }
  return {
    word_min: B2_FIRST_WORD_MIN,
    word_max: B2_FIRST_WORD_MAX,
    source: 'default_b2_first',
  };
}

export type TaskAnalysisServiceResult =
  | { status: 'complete'; task_analysis: ResolvedTaskAnalysis }
  | {
      status: 'unresolved';
      reason: string;
      task_type_resolution: TaskTypeResolution;
      task_content_hash: string;
    };

export async function analyseWritingTask(
  request: TaskAnalysisRequest,
  deps: { llm?: TaskAnalysisLlmClient } = {},
): Promise<TaskAnalysisServiceResult> {
  const sourceText = normaliseTaskText(request.source_task_text);
  const modelConfig = request.model_config ?? TASK_ANALYSIS_BENCHMARK_MODEL;
  assertPinnedModelConfig(modelConfig);

  if (!sourceText) {
    return {
      status: 'unresolved',
      reason: 'empty_task_text',
      task_type_resolution: {
        task_type: null,
        source: 'unresolved',
        confidence: 'unresolved',
        notes: ['no task wording was supplied'],
      },
      task_content_hash: hashTaskText(''),
    };
  }

  let resolution = resolveTaskType({
    source_task_text: sourceText,
    task_type: request.task_type,
    dralo_task_metadata: request.dralo_task_metadata,
  });
  let llmCalls = 0;

  if (!resolution.task_type && request.allow_llm_task_type_inference !== false) {
    const inference = await inferTaskTypeWithLlm(sourceText, modelConfig, deps.llm, request);
    llmCalls += inference.llm_calls;
    resolution = inference.resolution;
  }

  if (!resolution.task_type) {
    return {
      status: 'unresolved',
      reason: 'task_type_unresolved',
      task_type_resolution: resolution,
      task_content_hash: hashTaskText(sourceText),
    };
  }

  const taskType = resolution.task_type as B2FirstTaskType;
  const wordGuidance = resolveWordGuidance(request);

  const prompt = buildTaskAnalysisPrompt({
    source_task_text: sourceText,
    task_type: taskType,
    word_min: wordGuidance.word_min,
    word_max: wordGuidance.word_max,
  });

  const llm = requireLlmClient(deps.llm);
  const raw = await llm.generate({
    system: prompt.system,
    user: prompt.user,
    model_config: modelConfig,
    json_schema: TASK_ANALYSIS_JSON_SCHEMA,
  });
  llmCalls += 1;

  const forbidden = findForbiddenTaskAnalysisKeys(raw);
  if (forbidden.length) {
    throw new TaskAnalysisValidationError(
      'the task-analysis model returned forbidden fields',
      forbidden,
    );
  }

  const parsed = taskAnalysisLlmOutputSchema.safeParse(raw);
  if (!parsed.success) {
    throw new TaskAnalysisValidationError(
      'the task-analysis model output does not match the task-analysis schema',
      parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }

  const analysis = assembleTaskAnalysis({
    llmOutput: parsed.data,
    taskType,
    sourceText,
    wordGuidance,
    requestTargetReader: request.target_reader ?? null,
    modelConfig,
    resolution,
    llmCalls,
  });

  return { status: 'complete', task_analysis: analysis };
}

function requireLlmClient(llm?: TaskAnalysisLlmClient): TaskAnalysisLlmClient {
  if (!llm) {
    throw new TaskAnalysisConfigurationError(
      'Task Analysis requires an explicit LLM client; there is no implicit default',
    );
  }
  return llm;
}

async function inferTaskTypeWithLlm(
  sourceText: string,
  modelConfig: ModelConfigSnapshot,
  llm: TaskAnalysisLlmClient | undefined,
  request: TaskAnalysisRequest,
): Promise<{ resolution: TaskTypeResolution; llm_calls: number }> {
  const baseNotes = resolveTaskType({
    source_task_text: sourceText,
    task_type: request.task_type,
    dralo_task_metadata: request.dralo_task_metadata,
  }).notes;

  if (!llm) {
    return {
      resolution: {
        task_type: null,
        source: 'unresolved',
        confidence: 'unresolved',
        notes: [...baseNotes, 'no LLM client was supplied for last-resort task-type inference'],
      },
      llm_calls: 0,
    };
  }

  const prompt = buildTaskAnalysisPrompt({ source_task_text: sourceText, task_type: null });
  const raw = await llm.generate({
    system: prompt.system,
    user: prompt.user,
    model_config: modelConfig,
    json_schema: TASK_ANALYSIS_JSON_SCHEMA,
  });
  const parsed = taskAnalysisLlmOutputSchema.safeParse(raw);
  const inferred = parsed.success ? parsed.data.inferred_task_type : null;

  if (!inferred) {
    return {
      resolution: {
        task_type: null,
        source: 'unresolved',
        confidence: 'unresolved',
        notes: [...baseNotes, 'last-resort model inference could not identify the genre either'],
      },
      llm_calls: 1,
    };
  }

  return {
    resolution: {
      task_type: inferred,
      source: 'llm_inference',
      confidence: 'low',
      notes: [...baseNotes, 'task type identified by last-resort model inference'],
    },
    llm_calls: 1,
  };
}

interface AssembleInput {
  llmOutput: TaskAnalysisLlmOutput;
  taskType: B2FirstTaskType;
  sourceText: string;
  wordGuidance: ResolvedWordGuidance;
  requestTargetReader: string | null;
  modelConfig: ModelConfigSnapshot;
  resolution: TaskTypeResolution;
  llmCalls: number;
}

function resolveTargetReader(input: AssembleInput): {
  target_reader: string | null;
  resolution: TargetReaderResolution;
} {
  const trusted = input.requestTargetReader?.trim();
  if (trusted) {
    return {
      target_reader: trusted,
      resolution: { source: 'task_metadata', notes: [] },
    };
  }

  const reader = input.llmOutput.target_reader?.trim();
  if (!reader) {
    return {
      target_reader: null,
      resolution: {
        source: 'unresolved',
        notes: ['the task does not identify a reader and none was supplied by task metadata'],
      },
    };
  }

  const quote = input.llmOutput.target_reader_evidence_quote;
  if (quoteAppearsInTask(quote, input.sourceText)) {
    return {
      target_reader: reader,
      resolution: { source: 'task_wording', evidence_quote: quote as string, notes: [] },
    };
  }

  return {
    target_reader: reader,
    resolution: {
      source: 'inference',
      notes: ['the reader is not stated verbatim in the task wording and was inferred from it'],
    },
  };
}

function assembleTaskAnalysis(input: AssembleInput): ResolvedTaskAnalysis {
  const rules = getGenreRules(input.taskType);
  const ambiguities = [...input.llmOutput.ambiguities];

  const recommendedFeatures: RecommendedGenreFeature[] = assignStableIds(
    rules.recommended_features.map((rule) => ({
      feature: rule.text,
      status: 'recommended' as const,
      doc01_reference: rule.doc01_reference,
    })),
    'rf',
    (item) => item.feature,
  );

  const coreExpectations: CoreGenreExpectation[] = assignStableIds(
    rules.core_expectations.map((rule) => ({
      expectation: rule.text,
      status: 'core_expectation' as const,
      // A quality the writing should achieve, never a task-completion checkbox.
      // Criterion relevance is decided in Layer 3, not pre-assigned here.
      binary_completion_check: false as const,
      doc01_reference: rule.doc01_reference,
    })),
    'ce',
    (item) => item.expectation,
  );

  const recommendedKeys = new Set(
    recommendedFeatures.map((feature) => normaliseRequirementText(feature.feature)),
  );
  const coreExpectationKeys = new Set(
    coreExpectations.map((item) => normaliseRequirementText(item.expectation)),
  );

  // Doc 01 conventions keep their document order; wording-derived ones are
  // ordered by where they appear in the task.
  const doc01Conventions: Array<Omit<MandatoryGenreConvention, 'id'>> =
    rules.mandatory_conventions.map((rule) => ({
      convention: rule.text,
      status: 'mandatory' as const,
      origin: 'doc01_genre_rule' as const,
      doc01_reference: rule.doc01_reference,
    }));

  const wordingConventions: Array<Omit<MandatoryGenreConvention, 'id'>> =
    selectWordingTriggeredConventions(input.taskType, input.sourceText).map(
      ({ rule, evidence_quote }) => ({
        convention: rule.text,
        status: 'mandatory' as const,
        origin: 'task_wording' as const,
        doc01_reference: rule.doc01_reference,
        evidence_quote,
      }),
    );

  for (const candidate of input.llmOutput.task_specific_mandatory_conventions) {
    if (!quoteAppearsInTask(candidate.evidence_quote, input.sourceText)) {
      ambiguities.push(
        `A task-specific requirement ("${candidate.convention}") was proposed but its supporting quote is not present in the task wording, so it was not treated as mandatory.`,
      );
      continue;
    }
    if (coreExpectationKeys.has(normaliseRequirementText(candidate.convention))) {
      // A core expectation is a quality, not a checkbox: wording cannot make it binary.
      ambiguities.push(
        `"${candidate.convention}" is a core expectation of this genre and stays a quality judgement rather than a task-completion requirement.`,
      );
      continue;
    }
    if (recommendedKeys.has(normaliseRequirementText(candidate.convention))) {
      // A Doc 01 recommendation may only be promoted by verified task wording.
      ambiguities.push(
        `"${candidate.convention}" is normally a recommendation for this genre; it is treated as mandatory here because the task states: "${candidate.evidence_quote}".`,
      );
    }
    wordingConventions.push({
      convention: candidate.convention,
      status: 'mandatory',
      origin: 'task_wording',
      evidence_quote: candidate.evidence_quote,
    });
  }

  const mandatoryConventions: MandatoryGenreConvention[] = assignStableIds(
    [
      ...doc01Conventions,
      ...orderByEvidencePosition(
        wordingConventions,
        input.sourceText,
        (item) => item.convention,
        (item) => item.evidence_quote,
      ),
    ],
    'gc',
    (item) => item.convention,
  );

  const contentPoints: MandatoryContentPoint[] = assignStableIds(
    orderByEvidencePosition(
      input.llmOutput.mandatory_content_points.map((point) => ({
        point: point.point,
        origin: 'task_wording' as const,
        evidence_quote: quoteAppearsInTask(point.evidence_quote, input.sourceText)
          ? (point.evidence_quote as string)
          : undefined,
      })),
      input.sourceText,
      (item) => item.point,
      (item) => item.evidence_quote,
    ),
    'cp',
    (item) => item.point,
  );

  const requiredFunctions: RequiredFunction[] = assignStableIds(
    orderByEvidencePosition(
      input.llmOutput.required_functions.map((fn) => ({
        function: fn.function,
        origin: 'task_wording' as const,
        evidence_quote: quoteAppearsInTask(fn.evidence_quote, input.sourceText)
          ? (fn.evidence_quote as string)
          : undefined,
      })),
      input.sourceText,
      (item) => item.function,
      (item) => item.evidence_quote,
    ),
    'fn',
    (item) => item.function,
  );

  const formalityConflict = detectFormalityConflict(input.taskType, input.llmOutput.register);
  if (formalityConflict) ambiguities.push(formalityConflict);

  const targetReader = resolveTargetReader(input);
  if (targetReader.resolution.source === 'unresolved') {
    ambiguities.push('The task does not identify a target reader.');
  }

  const taskFingerprintInput: TaskFingerprintInput = {
    source_task_text: input.sourceText,
    task_type: input.taskType,
    model_config: input.modelConfig,
  };

  const analysis = {
    task_type: input.taskType,
    genre: input.taskType,
    source_task_text: input.sourceText,
    target_reader: targetReader.target_reader,
    target_reader_resolution: targetReader.resolution,
    communicative_purpose: input.llmOutput.communicative_purpose,
    // Register is a Doc 01 genre convention, not a model judgement.
    register: rules.register_guidance,
    tone: input.llmOutput.tone ?? undefined,
    mandatory_content_points: contentPoints,
    required_functions: requiredFunctions,
    mandatory_genre_conventions: mandatoryConventions,
    core_genre_expectations: coreExpectations,
    recommended_genre_features: recommendedFeatures,
    recommendations_not_requirements: recommendedFeatures.map((feature) => feature.feature),
    ambiguities,
    word_guidance: {
      word_min: input.wordGuidance.word_min,
      word_max: input.wordGuidance.word_max,
      source: input.wordGuidance.source,
      // Length is contextual guidance only — never a deduction, cap or pass/fail rule.
      automatic_penalty: false as const,
    },
    task_analysis_schema_version: TASK_ANALYSIS_SCHEMA_VERSION,
    provenance: {
      engine_version: WRITING_ENGINE_VERSION,
      schema_version: SCHEMA_VERSION,
      task_analysis_schema_version: TASK_ANALYSIS_SCHEMA_VERSION,
      task_requirements_version: SOURCE_DOC_VERSIONS.task_requirements,
      task_analysis_prompt_version: TASK_ANALYSIS_PROMPT_VERSION,
      doc_versions: { ...SOURCE_DOC_VERSIONS },
      model_config: input.modelConfig,
      task_content_hash: hashTaskText(input.sourceText),
      task_fingerprint: computeTaskFingerprint(taskFingerprintInput),
      cache_key: buildTaskAnalysisCacheKey(taskFingerprintInput),
      task_type_resolution: input.resolution,
      llm_calls: input.llmCalls,
    },
  };

  const parsed = resolvedTaskAnalysisSchema.safeParse(analysis);
  if (!parsed.success) {
    throw new TaskAnalysisValidationError(
      'the assembled task analysis does not satisfy the task-analysis contract',
      parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`),
    );
  }
  return parsed.data;
}

function quoteAppearsInTask(quote: string | null | undefined, sourceText: string): boolean {
  if (!quote) return false;
  const needle = normaliseRequirementText(quote);
  if (!needle) return false;
  return normaliseRequirementText(sourceText).includes(needle);
}

function detectFormalityConflict(
  taskType: B2FirstTaskType,
  modelRegister: string,
): string | null {
  const register = String(modelRegister ?? '').toLowerCase();
  if (taskType === 'informal_email' && /\bformal\b/.test(register) && !/\binformal\b/.test(register)) {
    return 'The task was classified as an informal email but the wording reads as formal; confirm the intended register.';
  }
  if (taskType === 'formal_email' && /\binformal\b/.test(register)) {
    return 'The task was classified as a formal email but the wording reads as informal; confirm the intended register.';
  }
  return null;
}
