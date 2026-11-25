/**
 * Spending ledger for the standalone semantic evaluation.
 * It does not open a B1 motor session and it does not retry.
 */
import { estimateAiCost } from '../../src/lib/aiPricing.js';
import { conservativeTokenEstimate } from '../../src/lib/b1ReadingMotorGuard.js';
import { examCoachPrompt } from '../../src/lib/ai/prompts/examCoachPrompt.js';

export const EVAL_BUDGET_USD = 0.65;
export const EVAL_MAX_CALLS = 14;
export const EVAL_MODEL = 'gpt-4o';

export class EvaluationStop extends Error {
  constructor(code, detail) {
    super(detail);
    this.name = 'EvaluationStop';
    this.code = code;
  }
}

function roundUsd(value) {
  return Math.round((Number(value) || 0) * 1_000_000) / 1_000_000;
}

/** Chat Completions prepends the exam-coach prompt. The estimate includes it. */
export function billedInputText(options = {}) {
  const task = String(options.system || '');
  const system = `${examCoachPrompt}\n\n---\n\n${task}`;
  const messages = (Array.isArray(options.messages) ? options.messages : [])
    .map((message) => String(message?.content || ''));
  return [system, ...messages].join('\n');
}

export function conservativeCallEstimate(options = {}, model = EVAL_MODEL) {
  const tokens = conservativeTokenEstimate(
    billedInputText(options),
    options.max_tokens || options.maxOutputTokens || 4096,
  );
  const cost = estimateAiCost(model, tokens.inputTokens, tokens.outputTokens);
  return { model, ...tokens, costUsd: cost.costUsd };
}

function actualTokenUsage(result) {
  const usage = result?.usage;
  const input = Number(usage?.input_tokens);
  const output = Number(usage?.output_tokens);
  const inputKnown = usage && usage.input_tokens != null && Number.isFinite(input);
  const outputKnown = usage && usage.output_tokens != null && Number.isFinite(output);
  if (!inputKnown || !outputKnown) return null;
  if (input <= 0 && output <= 0) return null;
  return { inputTokens: input, outputTokens: output };
}

export function createEvaluationLedger({
  budgetUsd = EVAL_BUDGET_USD,
  maxCalls = EVAL_MAX_CALLS,
  model = EVAL_MODEL,
} = {}) {
  const state = {
    budgetUsd,
    maxCalls,
    model,
    spentUsd: 0,
    paidCalls: 0,
    actualInputTokens: 0,
    actualOutputTokens: 0,
    estimatedInputTokens: 0,
    estimatedOutputTokens: 0,
    records: [],
    stopped: null,
  };

  function stop(code, detail) {
    state.stopped = { code, detail, spentUsd: state.spentUsd, paidCalls: state.paidCalls };
    return new EvaluationStop(code, detail);
  }

  function charge(estimate, usage, source, extra = {}) {
    const cost = source === 'actual'
      ? estimateAiCost(extra.model || model, usage.inputTokens, usage.outputTokens).costUsd
      : estimate.costUsd;
    state.spentUsd = roundUsd(state.spentUsd + cost);
    if (source === 'actual') {
      state.actualInputTokens += usage.inputTokens;
      state.actualOutputTokens += usage.outputTokens;
    } else {
      state.estimatedInputTokens += estimate.inputTokens;
      state.estimatedOutputTokens += estimate.outputTokens;
    }
    state.records.push({
      ...extra,
      source,
      model: extra.model || model,
      estimateUsd: estimate.costUsd,
      chargedUsd: cost,
      inputTokens: source === 'actual' ? usage.inputTokens : estimate.inputTokens,
      outputTokens: source === 'actual' ? usage.outputTokens : estimate.outputTokens,
      spentUsd: state.spentUsd,
      paidCalls: state.paidCalls,
    });
  }

  return {
    state,
    snapshot() {
      return {
        budgetUsd: state.budgetUsd,
        maxCalls: state.maxCalls,
        spentUsd: state.spentUsd,
        paidCalls: state.paidCalls,
        actualInputTokens: state.actualInputTokens,
        actualOutputTokens: state.actualOutputTokens,
        estimatedInputTokens: state.estimatedInputTokens,
        estimatedOutputTokens: state.estimatedOutputTokens,
        stopped: state.stopped,
        records: state.records.map((row) => ({ ...row })),
      };
    },
    /**
     * Refuses the call before execute() when the cap or the next estimate would be exceeded.
     * execute() is invoked at most once.
     */
    async guardedCall(options, execute, meta = {}) {
      if (state.stopped) throw stop(state.stopped.code, state.stopped.detail);
      if (state.paidCalls >= maxCalls) {
        throw stop(
          'call_limit',
          `Paid call ${state.paidCalls + 1} would exceed the ${maxCalls}-call limit.`,
        );
      }
      const estimate = conservativeCallEstimate(options, model);
      if (roundUsd(state.spentUsd + estimate.costUsd) > budgetUsd) {
        throw stop(
          'budget',
          `The next call is estimated at USD ${estimate.costUsd.toFixed(6)}, and USD ${state.spentUsd.toFixed(6)} is already counted toward the USD ${budgetUsd} cap.`,
        );
      }
      state.paidCalls += 1;
      let result;
      try {
        result = await execute();
      } catch (error) {
        charge(estimate, null, 'estimate', { ...meta, error: String(error?.message || error).slice(0, 300) });
        throw error;
      }
      const usage = actualTokenUsage(result);
      charge(estimate, usage, usage ? 'actual' : 'estimate', {
        ...meta,
        model: result?.model || model,
      });
      return result;
    },
  };
}
