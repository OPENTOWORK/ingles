import { NextResponse } from 'next/server';
import {
  AI_ACTIONS,
  buildDailyUsageStatus,
  checkMonthlyBudget,
  consumeDailyAiLimit,
  getDailyLimit,
  incrementDailyAiUsage,
  logAiUsage,
  getProductArea,
} from '@/lib/aiUsage';
import { estimateTokensFromText, estimateAiCost } from '@/lib/aiPricing';
import { draloChatCompletionFull } from '@/lib/ai/draloAiEngine';
import { LIMIT_REACHED } from '@/lib/aiUsageLimitCopy';
import {
  PLAN_USAGE_KEYS,
  consumePlanUsage,
  resolveUserPlanSlug,
  shouldApplyPlanUsageLimits,
} from '@/lib/planAccess';

const ACTION_TO_PLAN_USAGE = {
  [AI_ACTIONS.EXAM_WRITING_CORRECTION]: PLAN_USAGE_KEYS.WRITING_CORRECTION,
  [AI_ACTIONS.EXAM_SPEAKING_FEEDBACK]: PLAN_USAGE_KEYS.SPEAKING_CORRECTION,
};

function planLimitMessage(action) {
  if (action === AI_ACTIONS.EXAM_WRITING_CORRECTION) return LIMIT_REACHED.writing.en;
  if (action === AI_ACTIONS.EXAM_SPEAKING_FEEDBACK) return LIMIT_REACHED.speaking.en;
  return LIMIT_REACHED.generic.en;
}

function buildPlanUsageStatus(planResult, action) {
  return {
    unlimited: false,
    limit: planResult.limit,
    used: planResult.used,
    remaining: planResult.limit != null && planResult.used != null
      ? Math.max(0, planResult.limit - planResult.used)
      : null,
    atLimit: planResult.code === 'PLAN_LIMIT_REACHED',
    periodType: planResult.periodType || 'month',
    action,
  };
}

/**
 * Standard AI API error JSON (spec format).
 */
export function aiErrorJson(code, message, extra = {}, status = 400) {
  return NextResponse.json({ error: true, code, message, ...extra }, { status });
}

export function aiSuccessJson(payload) {
  return NextResponse.json({ success: true, ...payload });
}

/**
 * Run pre-flight gates for a paid OpenAI action.
 * @returns {Promise<{ ok: true } | { ok: false, response: Response }>}
 */
export async function runAiPreflight(userId, action, options = {}) {
  const skipDailyLimit =
    options.deferredExamMode === true && action === AI_ACTIONS.EXAM_WRITING_CORRECTION;

  let daily = skipDailyLimit ? { allowed: true, deferredExamMode: true } : null;
  const userEmail = options.userEmail ?? '';
  const planUsageKey = ACTION_TO_PLAN_USAGE[action];
  const applyPlanLimits =
    planUsageKey && (await shouldApplyPlanUsageLimits(userId, userEmail));

  if (!skipDailyLimit) {
    if (applyPlanLimits) {
      const planSlug = await resolveUserPlanSlug(userId, options.userMetadata ?? null);
      const planResult = await consumePlanUsage(userId, planUsageKey, planSlug);
      if (!planResult.allowed) {
        return {
          ok: false,
          response: aiErrorJson(
            planResult.code || 'PLAN_LIMIT_REACHED',
            planLimitMessage(action),
            {
              limit: planResult.limit,
              used: planResult.used,
              usage: buildPlanUsageStatus(planResult, action),
            },
            429,
          ),
        };
      }
      daily = { allowed: true, planUsage: planResult, planBased: true };
    } else {
      daily = await consumeDailyAiLimit(userId, action, options);
      if (!daily.allowed) {
        const message = planLimitMessage(action);

        return {
          ok: false,
          response: aiErrorJson(
            daily.code === 'DAILY_LIMIT_REACHED' ? 'DAILY_LIMIT_REACHED' : daily.code || 'DAILY_LIMIT_REACHED',
            message,
            {
              limit: daily.limit,
              used: daily.used,
              usage: buildDailyUsageStatus(daily, action),
            },
            429,
          ),
        };
      }
    }
  }

  const budget = await checkMonthlyBudget();
  if (!budget.allowed) {
    return {
      ok: false,
      response: aiErrorJson(
        'MONTHLY_AI_BUDGET_REACHED',
        'AI usage is temporarily limited. Please try again later.',
        { spendEur: budget.spendEur, budgetEur: budget.budgetEur },
        503,
      ),
    };
  }

  return { ok: true, daily };
}

/**
 * Log usage + increment daily counter after successful OpenAI call.
 */
export async function recordAiUsageSuccess({
  userId,
  userEmail,
  accessToken,
  action,
  model,
  usage,
  metadata = {},
  planBased = false,
}) {
  const input_tokens = usage?.input_tokens ?? 0;
  const output_tokens = usage?.output_tokens ?? 0;
  const total_tokens = usage?.total_tokens ?? input_tokens + output_tokens;
  const { costUsd, costEur } = estimateAiCost(model, input_tokens, output_tokens);

  await logAiUsage({
    user_id: userId,
    accessToken,
    action,
    product_area: getProductArea(action),
    model,
    input_tokens,
    output_tokens,
    total_tokens,
    estimated_cost_usd: costUsd,
    estimated_cost_eur: costEur,
    success: true,
    metadata,
  });

  if (getDailyLimit(action) == null) {
    await incrementDailyAiUsage(userId, action, { userEmail });
  } else if (!planBased) {
    await incrementDailyAiUsage(userId, action, {
      userEmail,
      skipIfPreflightConsumed: true,
    });
  }
}

export async function recordAiUsageFailure({
  userId,
  action,
  model,
  errorCode,
  usage = {},
  metadata = {},
}) {
  await logAiUsage({
    user_id: userId,
    action,
    product_area: getProductArea(action),
    model: model || null,
    input_tokens: usage.input_tokens ?? 0,
    output_tokens: usage.output_tokens ?? 0,
    total_tokens: usage.total_tokens ?? 0,
    success: false,
    error_code: errorCode || 'OPENAI_ERROR',
    metadata,
  });
}

/**
 * OpenAI chat with usage metadata for logging.
 */
export async function chatWithUsage(options) {
  return draloChatCompletionFull(options);
}

/** Estimate tokens when only text lengths are known (multi-step essay correction). */
export function usageFromTextEstimate(model, inputText, outputText) {
  const input_tokens = estimateTokensFromText(inputText);
  const output_tokens = estimateTokensFromText(outputText);
  return {
    model,
    input_tokens,
    output_tokens,
    total_tokens: input_tokens + output_tokens,
  };
}

export { AI_ACTIONS };
