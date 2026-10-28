import { AI_ACTIONS, checkDailyAiLimit, checkMonthlyBudget } from '@/lib/aiUsage';
import { aiErrorJson, runAiPreflight } from '@/lib/aiUsageRouteHelpers';
import {
  PLAN_USAGE_KEYS,
  checkPlanUsage,
  resolveUserPlanSlug,
  shouldApplyPlanUsageLimits,
} from '@/lib/planAccess';

function speakingLimitMessage() {
  return 'You have used all your speaking corrections for now.';
}

/**
 * Check speaking_correction / daily speaking feedback without consuming.
 * Consumption happens only after a successful evaluation via chargeSpeakingCorrectionQuota.
 */
export async function checkSpeakingCorrectionQuota(userId, options = {}) {
  const userEmail = options.userEmail || '';
  const applyPlanLimits = await shouldApplyPlanUsageLimits(userId, userEmail);

  if (applyPlanLimits) {
    const planSlug = await resolveUserPlanSlug(userId, options.userMetadata ?? null);
    const planResult = await checkPlanUsage(userId, PLAN_USAGE_KEYS.SPEAKING_CORRECTION, planSlug);
    if (!planResult.allowed) {
      return {
        ok: false,
        response: aiErrorJson(
          planResult.code || 'PLAN_LIMIT_REACHED',
          speakingLimitMessage(),
          {
            limit: planResult.limit,
            used: planResult.used,
            usage: {
              unlimited: false,
              limit: planResult.limit,
              used: planResult.used,
              remaining:
                planResult.limit != null && planResult.used != null
                  ? Math.max(0, planResult.limit - planResult.used)
                  : null,
              atLimit: true,
              periodType: planResult.periodType || 'month',
              action: AI_ACTIONS.EXAM_SPEAKING_FEEDBACK,
            },
          },
          429,
        ),
      };
    }
  } else {
    const daily = await checkDailyAiLimit(userId, AI_ACTIONS.EXAM_SPEAKING_FEEDBACK, options);
    if (!daily.allowed) {
      return {
        ok: false,
        response: aiErrorJson(
          daily.code || 'DAILY_LIMIT_REACHED',
          speakingLimitMessage(),
          { limit: daily.limit, used: daily.used },
          daily.code === 'AUTH_REQUIRED' ? 401 : 429,
        ),
      };
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

  return { ok: true };
}

export async function chargeSpeakingCorrectionQuota(userId, options = {}) {
  return runAiPreflight(userId, AI_ACTIONS.EXAM_SPEAKING_FEEDBACK, options);
}

/**
 * Resolves how to charge one Speaking session using the existing commercial rules.
 * Students: speaking_correction / plan_usage_counters.
 * Staff (non-admin): exam_speaking_feedback daily cap.
 * Admins: no per-user cap.
 */
export async function resolveSpeakingB2QuotaChargeArgs(userId, options = {}) {
  const userEmail = options.userEmail || '';
  const applyPlanLimits = await shouldApplyPlanUsageLimits(userId, userEmail);
  if (applyPlanLimits) {
    const planSlug = await resolveUserPlanSlug(userId, options.userMetadata ?? null);
    const planResult = await checkPlanUsage(userId, PLAN_USAGE_KEYS.SPEAKING_CORRECTION, planSlug);
    if (!planResult.allowed) {
      return { ok: false, status: 429, body: { code: planResult.code || 'PLAN_LIMIT_REACHED' } };
    }
    if (planResult.unlimited) {
      return { ok: true, mode: 'plan_unlimited', limit: null, dailyLimit: null };
    }
    return {
      ok: true,
      mode: 'plan',
      limit: planResult.limit,
      periodType: planResult.periodType || 'month',
      periodKey: planResult.periodKey,
      dailyLimit: null,
    };
  }

  const daily = await checkDailyAiLimit(userId, AI_ACTIONS.EXAM_SPEAKING_FEEDBACK, options);
  if (!daily.allowed) {
    return {
      ok: false,
      status: daily.code === 'AUTH_REQUIRED' ? 401 : 429,
      body: { code: daily.code || 'DAILY_LIMIT_REACHED' },
    };
  }
  if (daily.unlimited) {
    return { ok: true, mode: 'staff_exempt', limit: null, dailyLimit: null };
  }
  return {
    ok: true,
    mode: 'staff_daily',
    limit: null,
    dailyAction: AI_ACTIONS.EXAM_SPEAKING_FEEDBACK,
    dailyDate: new Date().toISOString().slice(0, 10),
    dailyLimit: daily.limit,
  };
}
