/**
 * Fail-safe controls for the isolated B1 Preliminary Reading development motor.
 * Inactive unless a session is open. Live exams and B2 generation do not open one.
 * Spend figures are approximate local estimates, not an exact OpenAI invoice.
 */
import fs from 'node:fs';
import path from 'node:path';
import { AsyncLocalStorage } from 'node:async_hooks';
import { estimateAiCost } from '@/lib/aiPricing';
import {
  b1FailureItemsFromMessages,
  b1ItemSignatureImproved,
  stripB1FailurePrefix,
} from '@/lib/b1ReadingRules';

const storage = new AsyncLocalStorage();

export const B1_MOTOR_DEFAULTS = {
  maxAttemptsPerPart: 4,
  spendCapUsd: 1,
  maxElapsedMs: 15 * 60 * 1000,
  maxConsecutiveNoProgress: 3,
  sameCategoryLimit: 2,
  maxTransientRetries: 2,
  backoffBaseMs: 400,
  backoffMaxMs: 8000,
};

const FAILURE_RULES = [
  [/above b1|above normal b1|above-level|too_high|lexical-level/i, 'above_b1_level'],
  [/british english|british spelling/i, 'british_english'],
  [/blind-solve|disagreed on/i, 'semantic_disagreement'],
  [/unsupported requirement|limited to adults|does not state an age|leave-by-noon|closes or locks at noon/i, 'unsupported_requirement'],
  [/weak distractor/i, 'weak_distractor'],
  [/ambiguit|more than one|multiple ordinary|alternative key|near-synonym|double key|defensible/i, 'ambiguity'],
  [/cohesion|multifit|mechanical|repeated phrase|two-word phrase|sequence issue|whole-text|labelled|signal is missing/i, 'cohesion'],
  [/grammar target|must test|targetType|content vocabulary|open cloze|exactly one word|six different/i, 'grammar_target'],
  [/literal|word spotting|repeats wording|copying wording|solvable by copying|explicit statement/i, 'literal_overlap'],
  [/number must be|duplicate question number|no example gap|is missing question \d/i, 'numbering'],
  [/answer must be one of|answer key must|missing answer\b/i, 'answer_key'],
  [/\b\d+ words?\b|too short|too long|word count/i, 'word_count'],
  [/invalid json|parse error|unexpected token|generation\/parse/i, 'json_parse'],
  [/insufficient quota|exceeded your current quota|quota exhausted|project quota/i, 'quota_exhausted'],
  [/no credits remaining|insufficient credits|payment required|billing/i, 'insufficient_credits'],
  [/invalid api key|incorrect api key|authentication|unauthorized|invalid_api_key/i, 'invalid_credentials'],
  [/does not exist|unsupported model|invalid model|model_not_found/i, 'unsupported_model'],
  [/rate limit|too many requests/i, 'rate_limit'],
  [/overloaded|server error|bad gateway|econnreset|etimedout|network/i, 'server_error'],
  [/review evidence is missing/i, 'review_evidence'],
  [/missing question\/prompt|missing short real-world|missing person|missing passage|must have exactly|needs exactly|missing questions or model|incomplete/i, 'part_shape'],
];

const SEVERITY = [
  'insufficient_credits',
  'invalid_credentials',
  'unsupported_model',
  'quota_exhausted',
  'rate_limit',
  'server_error',
  'non_retryable_api',
  'above_b1_level',
  'ambiguity',
  'semantic_disagreement',
  'cohesion',
  'grammar_target',
  'literal_overlap',
  'unsupported_requirement',
  'weak_distractor',
  'review_evidence',
  'british_english',
  'numbering',
  'answer_key',
  'word_count',
  'part_shape',
  'json_parse',
  'generation_error',
  'unknown_failure',
];

const SENSITIVE_KEY = /(api[-_]?key|authorization|secret|password|service[-_]?role|credential|access[-_]?token|refresh[-_]?token)/i;

function pickNumber(override, envName, fallback, { allowZero = false } = {}) {
  const accept = (value) => {
    const n = Number(value);
    return Number.isFinite(n) && (allowZero ? n >= 0 : n > 0);
  };
  if (override != null && override !== '' && accept(override)) return Number(override);
  const raw = process.env[envName];
  if (raw != null && String(raw).trim() !== '' && accept(raw)) return Number(raw);
  return fallback;
}

function pickBool(override, envName, fallback) {
  if (typeof override === 'boolean') return override;
  const raw = String(process.env[envName] || '').trim().toLowerCase();
  if (raw === '1' || raw === 'true') return true;
  if (raw === '0' || raw === 'false') return false;
  return fallback;
}

export function resolveB1MotorConfig(overrides = {}) {
  return {
    maxAttemptsPerPart: pickNumber(overrides.maxAttemptsPerPart, 'B1_MOTOR_MAX_ATTEMPTS', B1_MOTOR_DEFAULTS.maxAttemptsPerPart),
    spendCapUsd: pickNumber(overrides.spendCapUsd, 'B1_MOTOR_SPEND_CAP_USD', B1_MOTOR_DEFAULTS.spendCapUsd, { allowZero: true }),
    maxElapsedMs: pickNumber(overrides.maxElapsedMs, 'B1_MOTOR_MAX_ELAPSED_MS', B1_MOTOR_DEFAULTS.maxElapsedMs),
    maxConsecutiveNoProgress: pickNumber(overrides.maxConsecutiveNoProgress, 'B1_MOTOR_MAX_NO_PROGRESS', B1_MOTOR_DEFAULTS.maxConsecutiveNoProgress),
    sameCategoryLimit: pickNumber(overrides.sameCategoryLimit, 'B1_MOTOR_SAME_CATEGORY_LIMIT', B1_MOTOR_DEFAULTS.sameCategoryLimit),
    maxTransientRetries: pickNumber(overrides.maxTransientRetries, 'B1_MOTOR_MAX_TRANSIENT_RETRIES', B1_MOTOR_DEFAULTS.maxTransientRetries, { allowZero: true }),
    backoffBaseMs: pickNumber(overrides.backoffBaseMs, 'B1_MOTOR_BACKOFF_BASE_MS', B1_MOTOR_DEFAULTS.backoffBaseMs),
    backoffMaxMs: pickNumber(overrides.backoffMaxMs, 'B1_MOTOR_BACKOFF_MAX_MS', B1_MOTOR_DEFAULTS.backoffMaxMs),
    dryRun: pickBool(overrides.dryRun, 'B1_MOTOR_DRY_RUN', false),
    // Optional fixed pre-call estimate for local drills. Leave unset in real runs.
    callEstimateUsd: overrides.callEstimateUsd == null || overrides.callEstimateUsd === ''
      ? null
      : Number(overrides.callEstimateUsd),
  };
}

/**
 * Attempt budget used by the shared generator.
 * A motor session supplies the development cap. Without one, the historical limits stay.
 */
export function resolveGenerationAttemptLimit({
  mode,
  isB2Ruoe = false,
  isB1Reading = false,
  partNumber = 0,
  motor = null,
} = {}) {
  if (motor) return Math.max(1, Number(motor.config?.maxAttemptsPerPart) || B1_MOTOR_DEFAULTS.maxAttemptsPerPart);
  if (mode === 'listening') return 5;
  if (isB2Ruoe) return 8;
  if (isB1Reading && Number(partNumber) === 4) return 10;
  if (isB1Reading && [3, 5, 6].includes(Number(partNumber))) return 8;
  if (isB1Reading) return 5;
  return 3;
}

export function normaliseFailureMessage(message) {
  const text = stripB1FailurePrefix(String(message || '').trim());
  if (!text) return 'unknown_failure';
  for (const [pattern, code] of FAILURE_RULES) {
    if (pattern.test(text)) return code;
  }
  return 'unknown_failure';
}

export function normaliseFailureCodes(messages = []) {
  const codes = [];
  for (const message of messages) {
    const code = normaliseFailureMessage(message);
    if (!codes.includes(code)) codes.push(code);
  }
  return codes.length ? codes : ['unknown_failure'];
}

export function primaryFailureCode(codes = []) {
  const ranked = [...codes].sort((a, b) => {
    const ia = SEVERITY.indexOf(a);
    const ib = SEVERITY.indexOf(b);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib) || String(a).localeCompare(String(b));
  });
  return ranked[0] || 'unknown_failure';
}

export function hasMeaningfulProgress(previous, next) {
  if (!previous || !next) return false;
  const resolved = previous.codes.filter((code) => !next.codes.includes(code));
  if (resolved.length > 0) return true;
  if (next.count < previous.count) return true;
  const previousItems = b1FailureItemsFromMessages(previous.messages);
  const nextItems = b1FailureItemsFromMessages(next.messages);
  if (b1ItemSignatureImproved(previousItems, nextItems)) return true;
  return false;
}

export function classifyApiError(error) {
  const status = Number(error?.status || error?.statusCode || error?.response?.status || 0);
  const code = String(error?.code || error?.error?.code || error?.error?.type || '').toLowerCase();
  const message = String(error?.message || error?.error?.message || error || '');
  const blob = `${message} ${code}`.toLowerCase();

  if (status === 401 || /invalid api key|incorrect api key|invalid_api_key|authentication|unauthorized/.test(blob)) {
    return { code: 'invalid_credentials', retryable: false };
  }
  if (status === 403 && /permission|access denied|not allowed/.test(blob)) {
    return { code: 'invalid_credentials', retryable: false };
  }
  if (/insufficient_quota|exceeded your current quota|quota exhausted|project quota|billing hard limit/.test(blob)) {
    return { code: 'quota_exhausted', retryable: false };
  }
  if (status === 402 || /no credits remaining|insufficient credits|insufficient_funds|payment required/.test(blob)) {
    return { code: 'insufficient_credits', retryable: false };
  }
  if (/billing/.test(blob) && /credit|quota|insufficient|payment|hard limit/.test(blob)) {
    return { code: 'insufficient_credits', retryable: false };
  }
  if (
    /model.*(not found|does not exist|unsupported)|unsupported model|invalid model|model_not_found/.test(blob)
    || (status === 404 && /model/.test(blob))
  ) {
    return { code: 'unsupported_model', retryable: false };
  }
  if (status === 429 || /rate limit|too many requests|rate_limit/.test(blob)) {
    return { code: 'rate_limit', retryable: true };
  }
  if ([500, 502, 503, 504].includes(status) || /overloaded|server error|bad gateway|gateway timeout|econnreset|etimedout|network/.test(blob)) {
    return { code: 'server_error', retryable: true };
  }
  if (status >= 400 && status < 500) {
    return { code: 'non_retryable_api', retryable: false };
  }
  return { code: 'generation_error', retryable: false };
}

export function backoffDelayMs(retryIndex, config) {
  const base = Number(config?.backoffBaseMs) || B1_MOTOR_DEFAULTS.backoffBaseMs;
  const max = Number(config?.backoffMaxMs) || B1_MOTOR_DEFAULTS.backoffMaxMs;
  return Math.min(max, base * (2 ** Math.max(0, Number(retryIndex) || 0)));
}

export function conservativeTokenEstimate(inputText, maxOutputTokens) {
  const inputTokens = Math.max(1, Math.ceil(String(inputText || '').length / 3 * 1.2));
  const outputTokens = Math.max(1, Math.ceil((Number(maxOutputTokens) || 1024) * 1.1));
  return { inputTokens, outputTokens };
}

export function resolveCallModel(options = {}) {
  const explicit = String(options.model || '').trim();
  if (explicit) return explicit;
  return String(
    process.env.OPENAI_MODEL_CAMBRIDGE
    || process.env.DRALO_OPENAI_MODEL_CAMBRIDGE
    || process.env.DRALO_OPENAI_MODEL_VALIDATOR
    || process.env.DRALO_OPENAI_MODEL
    || process.env.OPENAI_MODEL
    || 'gpt-4o',
  ).trim() || 'gpt-4o';
}

function collectInputText(options = {}) {
  const parts = [options.system, options.userMessage];
  const messages = Array.isArray(options.messages) ? options.messages : [];
  for (const message of messages) parts.push(message?.content);
  return parts.filter(Boolean).join('\n');
}

export function scrubString(value) {
  return String(value ?? '')
    .replace(/sk-[A-Za-z0-9_\-]{8,}/g, '[redacted]')
    .replace(/eyJ[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g, '[redacted]')
    .replace(/\bBearer\s+[A-Za-z0-9._\-]{8,}/gi, 'Bearer [redacted]');
}

export function scrubReport(value, seen = new WeakSet()) {
  if (typeof value === 'string') return scrubString(value);
  if (typeof value === 'number' || typeof value === 'boolean' || value == null) return value;
  if (typeof value !== 'object') return undefined;
  if (seen.has(value)) return undefined;
  seen.add(value);
  if (Array.isArray(value)) return value.map((item) => scrubReport(item, seen));
  const out = {};
  for (const [key, item] of Object.entries(value)) {
    if (SENSITIVE_KEY.test(key)) {
      out[key] = '[redacted]';
      continue;
    }
    out[key] = scrubReport(item, seen);
  }
  return out;
}

export function recommendedAction(reason, failureCategory) {
  const category = failureCategory || reason || 'unknown_failure';
  switch (reason) {
    case 'repeated_failure':
      return `Stop regenerating this part. Failure category "${category}" occurred on two consecutive attempts without measurable progress. Revise the prompt or construction rule for that category, then run the part again. Validated parts remain in the isolated development cache.`;
    case 'no_progress':
      return `Stop this exam run. Several consecutive attempts made no measurable progress. Inspect category "${category}" and change the generator input before trying again. Validated parts remain in the isolated development cache.`;
    case 'attempt_limit':
      return `The development attempt limit for this part was reached. Category "${category}" is still failing. Raise the limit only after the underlying item defect is fixed. Semantic validation was not waived.`;
    case 'spend_cap':
      return 'The local approximate spend cap was reached before another model call. This figure is an approximation for local cost control, not an exact OpenAI invoice. Reuse cached parts, or raise B1_MOTOR_SPEND_CAP_USD only if further estimated spend is acceptable.';
    case 'time_limit':
      return 'The elapsed-time limit was reached. Increase B1_MOTOR_MAX_ELAPSED_MS or generate fewer parts in the next run. Validated parts remain in the isolated development cache.';
    case 'insufficient_credits':
      return 'OpenAI credits are unavailable. Restore billing, then start a new run. Do not keep retrying this exam.';
    case 'invalid_credentials':
      return 'The API rejected the credential. Update the local key outside this report, then run again. This report does not contain the key.';
    case 'unsupported_model':
      return 'The configured model is not available to this API project. Choose a supported model in the local environment, then run again.';
    case 'quota_exhausted':
      return 'The project quota is exhausted. Wait until the quota window resets, then run again. Validated parts remain in the isolated development cache.';
    case 'rate_limit':
      return 'Transient rate-limit retries were exhausted. Wait before running again. The backoff is bounded and does not continue in the background.';
    case 'server_error':
      return 'Repeated server or network errors exhausted the bounded retry budget. Run again later. Validated parts remain in the isolated development cache.';
    case 'non_retryable_api':
      return `The API returned a non-retryable error (${category}). Fix the request setup before running again.`;
    default:
      return `The isolated B1 motor stopped (${category}). Review the diagnostic category before starting another paid run. Validated parts remain in the isolated development cache.`;
  }
}

export class B1MotorStopError extends Error {
  constructor(report) {
    super(`B1 reading motor stopped (${report?.reason || 'stopped'}).`);
    this.name = 'B1MotorStopError';
    this.report = report;
    this.reason = report?.reason;
  }
}

export function isB1MotorStopError(error) {
  return error instanceof B1MotorStopError || error?.name === 'B1MotorStopError';
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function roundUsd(value) {
  return Math.round((Number(value) || 0) * 1_000_000) / 1_000_000;
}

function normaliseCompletion(result) {
  if (result && typeof result === 'object' && typeof result.text === 'string') return result;
  return { text: String(result ?? ''), usage: null, model: null };
}

export class B1ReadingMotorSession {
  constructor(config, hooks = {}) {
    this.config = config;
    this.sleep = hooks.sleep || delay;
    this.now = hooks.now || Date.now;
    this.mockModel = hooks.mockModel || null;
    this.startedAt = this.now();
    this.examSlot = null;
    this.motorVersion = null;
    this.currentPart = null;
    this.partAttemptCount = 0;
    this.attemptRecorded = false;
    this.sameCategoryStreak = 0;
    this.noProgressStreak = 0;
    this.lastFailure = null;
    this.attemptHistory = [];
    this.spentUsd = 0;
    this.actualInputTokens = 0;
    this.actualOutputTokens = 0;
    this.estimatedInputTokens = 0;
    this.estimatedOutputTokens = 0;
    this.sawActualUsage = false;
    this.sawEstimatedUsage = false;
    this.modelCalls = 0;
    this.paidApiCalls = 0;
    this.transientRetries = 0;
    this.backoffDelays = [];
    this.pendingEstimate = null;
    this.stopError = null;
    this.preservedPartNumbers = [];
    this.teacherDraftPartNumbers = [];
    this.unusableDraft = null;
  }

  elapsedMs() {
    return Math.max(0, this.now() - this.startedAt);
  }

  notePreservedPart(partNumber) {
    const n = Number(partNumber);
    if (!this.preservedPartNumbers.includes(n)) this.preservedPartNumbers.push(n);
  }

  noteTeacherReviewDraft(partNumber) {
    const n = Number(partNumber);
    if (!this.teacherDraftPartNumbers.includes(n)) this.teacherDraftPartNumbers.push(n);
  }

  beginAttempt(partNumber) {
    const part = Number(partNumber);
    if (this.currentPart !== part) {
      this.currentPart = part;
      this.partAttemptCount = 0;
      this.sameCategoryStreak = 0;
      this.noProgressStreak = 0;
      this.lastFailure = null;
      this.attemptHistory = [];
    }
    this.attemptRecorded = false;
    if (this.elapsedMs() > this.config.maxElapsedMs) {
      throw this.createStopError({
        reason: 'time_limit',
        failureCategory: 'time_limit',
        detail: `Elapsed ${this.elapsedMs()}ms exceeds the ${this.config.maxElapsedMs}ms limit.`,
      });
    }
    if (this.spentUsd >= this.config.spendCapUsd) {
      throw this.createStopError({
        reason: 'spend_cap',
        failureCategory: 'spend_cap',
        detail: 'Estimated spend has reached the configured local cap.',
      });
    }
  }

  noteUnrecordedAttempt() {
    if (this.attemptRecorded) return;
    this.partAttemptCount += 1;
    this.attemptRecorded = true;
  }

  recordAttemptSuccess(partNumber) {
    this.noteUnrecordedAttempt();
    this.currentPart = Number(partNumber);
    this.sameCategoryStreak = 0;
    this.noProgressStreak = 0;
    this.lastFailure = null;
  }

  recordAttemptFailure(partNumber, messages = []) {
    this.currentPart = Number(partNumber);
    this.noteUnrecordedAttempt();
    const list = (Array.isArray(messages) ? messages : [messages]).map((item) => String(item || '')).filter(Boolean);
    const codes = normaliseFailureCodes(list);
    const snapshot = {
      codes,
      count: list.length,
      primary: primaryFailureCode(codes),
      messages: list.slice(0, 12),
    };
    const progress = this.lastFailure ? hasMeaningfulProgress(this.lastFailure, snapshot) : false;
    if (!this.lastFailure) {
      this.sameCategoryStreak = 1;
      this.noProgressStreak = 1;
    } else if (progress) {
      this.sameCategoryStreak = 1;
      this.noProgressStreak = 0;
    } else {
      this.noProgressStreak += 1;
      this.sameCategoryStreak = snapshot.primary === this.lastFailure.primary
        ? this.sameCategoryStreak + 1
        : 1;
    }
    this.lastFailure = snapshot;
    this.attemptHistory.push({
      partNumber: this.currentPart,
      codes,
      primary: snapshot.primary,
      progress,
      messageCount: list.length,
    });
    if (this.sameCategoryStreak >= this.config.sameCategoryLimit) {
      return { stop: true, reason: 'repeated_failure', failureCategory: snapshot.primary };
    }
    if (this.noProgressStreak >= this.config.maxConsecutiveNoProgress) {
      return { stop: true, reason: 'no_progress', failureCategory: snapshot.primary };
    }
    return { stop: false, reason: null, failureCategory: snapshot.primary };
  }

  estimateCall(options = {}) {
    const model = resolveCallModel(options);
    if (Number.isFinite(this.config.callEstimateUsd) && this.config.callEstimateUsd >= 0) {
      return {
        model,
        inputTokens: 1,
        outputTokens: 1,
        costUsd: this.config.callEstimateUsd,
        fixed: true,
      };
    }
    const tokens = conservativeTokenEstimate(collectInputText(options), options.max_tokens || options.maxOutputTokens || 4096);
    const cost = estimateAiCost(model, tokens.inputTokens, tokens.outputTokens);
    return { model, ...tokens, costUsd: cost.costUsd, fixed: false };
  }

  assertWithinLimits(options) {
    if (this.elapsedMs() > this.config.maxElapsedMs) {
      throw this.createStopError({
        reason: 'time_limit',
        failureCategory: 'time_limit',
        detail: `Elapsed ${this.elapsedMs()}ms exceeds the ${this.config.maxElapsedMs}ms limit.`,
      });
    }
    const estimate = this.estimateCall(options);
    this.pendingEstimate = estimate;
    if (this.spentUsd + estimate.costUsd > this.config.spendCapUsd) {
      throw this.createStopError({
        reason: 'spend_cap',
        failureCategory: 'spend_cap',
        detail: `The next model call is estimated at USD ${estimate.costUsd.toFixed(6)}, with about USD ${this.spentUsd.toFixed(6)} already counted toward the USD ${this.config.spendCapUsd} local cap.`,
      });
    }
  }

  recordUsage(result) {
    const usage = result?.usage;
    const hasActual = usage && (
      Number.isFinite(Number(usage.input_tokens))
      || Number.isFinite(Number(usage.output_tokens))
      || Number.isFinite(Number(usage.total_tokens))
    ) && (
      usage.input_tokens != null
      || usage.output_tokens != null
      || usage.total_tokens != null
    );
    if (hasActual && (usage.input_tokens != null || usage.output_tokens != null)) {
      const model = result?.model || this.pendingEstimate?.model || 'gpt-4o';
      const input = Math.max(0, Number(usage.input_tokens) || 0);
      const output = Math.max(0, Number(usage.output_tokens) || 0);
      const cost = estimateAiCost(model, input, output);
      this.spentUsd = roundUsd(this.spentUsd + cost.costUsd);
      this.actualInputTokens += input;
      this.actualOutputTokens += output;
      this.sawActualUsage = true;
      return;
    }
    const estimate = this.pendingEstimate;
    if (!estimate) return;
    this.spentUsd = roundUsd(this.spentUsd + estimate.costUsd);
    this.estimatedInputTokens += estimate.inputTokens;
    this.estimatedOutputTokens += estimate.outputTokens;
    this.sawEstimatedUsage = true;
  }

  usageSource() {
    if (this.sawActualUsage && this.sawEstimatedUsage) return 'mixed';
    if (this.sawActualUsage) return 'actual';
    if (this.sawEstimatedUsage) return 'estimate';
    return 'none';
  }

  async dispatchModel(options, execute) {
    this.modelCalls += 1;
    if (this.config.dryRun) return normaliseCompletion(this.dryRunResult());
    if (this.mockModel) return normaliseCompletion(await this.mockModel(options));
    this.paidApiCalls += 1;
    return normaliseCompletion(await execute());
  }

  dryRunResult() {
    return {
      text: JSON.stringify({ questions: [], modelAnswers: [], directions: 'dry-run' }),
      model: 'b1-motor-dry-run',
      usage: { input_tokens: 16, output_tokens: 8, total_tokens: 24 },
      dryRun: true,
    };
  }

  async guardModelCall(options, execute) {
    let transient = 0;
    while (true) {
      this.assertWithinLimits(options);
      this.noteUnrecordedAttempt();
      try {
        const result = await this.dispatchModel(options, execute);
        this.recordUsage(result);
        return result;
      } catch (error) {
        if (isB1MotorStopError(error)) throw error;
        const classified = classifyApiError(error);
        const canRetry = classified.retryable && transient < this.config.maxTransientRetries;
        if (!canRetry) {
          throw this.createStopError({
            reason: classified.code,
            failureCategory: classified.code,
            detail: classified.retryable
              ? 'Transient retries were exhausted.'
              : String(error?.message || error || ''),
          });
        }
        const wait = backoffDelayMs(transient, this.config);
        this.backoffDelays.push(wait);
        this.transientRetries += 1;
        transient += 1;
        await this.sleep(wait);
      }
    }
  }

  buildReport(fields = {}) {
    const reason = fields.reason || 'stopped';
    const failureCategory = fields.failureCategory || this.lastFailure?.primary || reason;
    const source = this.usageSource();
    return {
      scope: 'isolated-b1-preliminary-reading-motor',
      stopped: reason !== 'completed',
      reason,
      examSlot: this.examSlot,
      motorVersion: this.motorVersion,
      partNumber: this.currentPart,
      attempts: this.partAttemptCount,
      failureCategory,
      failureCodes: this.lastFailure?.codes || [failureCategory],
      diagnosticMessages: (this.lastFailure?.messages || fields.messages || []).slice(0, 12).map((item) => scrubString(item).slice(0, 400)),
      detail: fields.detail ? scrubString(fields.detail).slice(0, 400) : null,
      approximateCostUsd: roundUsd(this.spentUsd),
      billingNote: 'Approximate spend from conservative token estimates and usage reported by the API. This figure is for local cost control, not an exact OpenAI invoice.',
      tokens: {
        input: this.actualInputTokens,
        output: this.actualOutputTokens,
        total: this.actualInputTokens + this.actualOutputTokens,
        estimatedInput: this.estimatedInputTokens,
        estimatedOutput: this.estimatedOutputTokens,
        source,
      },
      elapsedMs: this.elapsedMs(),
      modelCalls: this.modelCalls,
      paidApiCalls: this.paidApiCalls,
      transientRetries: this.transientRetries,
      backoffDelaysMs: [...this.backoffDelays],
      dryRun: Boolean(this.config.dryRun),
      preservedPartNumbers: [...this.preservedPartNumbers],
      teacherDraftPartNumbers: [...this.teacherDraftPartNumbers],
      attemptHistory: this.attemptHistory.map((row) => ({ ...row, codes: [...row.codes] })),
      recommendedAction: reason === 'completed'
        ? (this.teacherDraftPartNumbers.length
          ? 'Saved for teacher review. Automated validation did not approve every part, and a teacher has not approved this exam.'
          : 'All requested parts passed validation and were stored in the isolated development cache.')
        : recommendedAction(reason, failureCategory),
      limits: {
        maxAttemptsPerPart: this.config.maxAttemptsPerPart,
        spendCapUsd: this.config.spendCapUsd,
        maxElapsedMs: this.config.maxElapsedMs,
        maxConsecutiveNoProgress: this.config.maxConsecutiveNoProgress,
        sameCategoryLimit: this.config.sameCategoryLimit,
        maxTransientRetries: this.config.maxTransientRetries,
      },
    };
  }

  createStopError(fields = {}) {
    if (this.stopError) return this.stopError;
    const messages = this.lastFailure ? [] : [];
    const report = scrubReport(this.buildReport({ ...fields, messages }));
    this.stopError = new B1MotorStopError(report);
    return this.stopError;
  }
}

export function getB1ReadingMotorSession() {
  return storage.getStore() || null;
}

export function runWithB1ReadingMotorSession(session, fn) {
  return storage.run(session, fn);
}

export function writeB1MotorDiagnosticReport(report, reportDir) {
  const clean = scrubReport(report);
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const part = clean?.partNumber == null ? 'none' : String(clean.partNumber);
  const filePath = path.join(reportDir, `exam-${clean?.examSlot ?? 'na'}-part-${part}-${stamp}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(clean, null, 2)}\n`, 'utf8');
  return filePath;
}
