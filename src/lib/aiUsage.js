import { createClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseUrl, getSupabaseServiceRoleKey } from '@/lib/supabaseEnv';
import { estimateAiCost } from '@/lib/aiPricing';
import { ADMIN_EMAIL, normalizeEmail, normalizeRoleName, isAdminRole } from '@/utils/authRoles';
import { getUserRoleNameServer } from '@/lib/userRoleServer';

export const AI_ACTIONS = {
  EXAM_WRITING_CORRECTION: 'exam_writing_correction',
  EXAM_SPEAKING_FEEDBACK: 'exam_speaking_feedback',
  /** Internal cost tracking only — no daily limit shown to students. */
  EXAM_SPEAKING_TRANSCRIPTION: 'exam_speaking_transcription',
  DRALO_AI_SPEAKING_MISSION: 'dralo_ai_speaking_mission',
  DRALO_AI_WRITING_COACH: 'dralo_ai_writing_coach',
  EXTRACT_ERRORS: 'extract_errors',
  GENERATE_ERROR_EXERCISES: 'generate_error_exercises',
  EXPLAIN_MISTAKE_FROM_DB: 'explain_mistake_from_db',
  ADMIN_GENERATE_EXAM: 'admin_generate_exam',
};

export const AI_ACTION_VALUES = new Set(Object.values(AI_ACTIONS));

const DAILY_LIMITS = {
  [AI_ACTIONS.EXAM_WRITING_CORRECTION]: 3,
  [AI_ACTIONS.EXAM_SPEAKING_FEEDBACK]: 3,
  [AI_ACTIONS.EXTRACT_ERRORS]: 5,
  [AI_ACTIONS.GENERATE_ERROR_EXERCISES]: 3,
};

const PRODUCT_AREA_BY_ACTION = {
  [AI_ACTIONS.EXAM_WRITING_CORRECTION]: 'exam_practice',
  [AI_ACTIONS.EXAM_SPEAKING_FEEDBACK]: 'exam_practice',
  [AI_ACTIONS.EXAM_SPEAKING_TRANSCRIPTION]: 'exam_practice',
  [AI_ACTIONS.DRALO_AI_SPEAKING_MISSION]: 'dralo_ai',
  [AI_ACTIONS.DRALO_AI_WRITING_COACH]: 'dralo_ai',
  [AI_ACTIONS.EXTRACT_ERRORS]: 'internal',
  [AI_ACTIONS.GENERATE_ERROR_EXERCISES]: 'internal',
  [AI_ACTIONS.EXPLAIN_MISTAKE_FROM_DB]: 'db',
  [AI_ACTIONS.ADMIN_GENERATE_EXAM]: 'admin',
};

const AUTH_REQUIRED_ACTIONS = new Set([
  AI_ACTIONS.EXAM_WRITING_CORRECTION,
  AI_ACTIONS.EXAM_SPEAKING_FEEDBACK,
  AI_ACTIONS.EXTRACT_ERRORS,
  AI_ACTIONS.GENERATE_ERROR_EXERCISES,
]);

const DRALO_AI_HIDDEN_ACTIONS = new Set([
  AI_ACTIONS.DRALO_AI_SPEAKING_MISSION,
  AI_ACTIONS.DRALO_AI_WRITING_COACH,
]);

let adminClient = null;

export function getSupabaseAdmin() {
  const key = getSupabaseServiceRoleKey();
  if (!key) return null;
  if (!adminClient) {
    adminClient = createClient(getSupabaseUrl(), key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}

/** Service role when available; otherwise user JWT for RLS-backed writes. */
function getAiUsageDb(options = {}) {
  const admin = getSupabaseAdmin();
  if (admin) return admin;

  const token = options.accessToken;
  if (!token) return null;

  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

export function isValidAiAction(action) {
  return AI_ACTION_VALUES.has(String(action || '').trim());
}

export function requiresAuth(action) {
  return AUTH_REQUIRED_ACTIONS.has(action);
}

export function isDraloAiHiddenAction(action) {
  return DRALO_AI_HIDDEN_ACTIONS.has(action);
}

export function isDraloAiFeatureEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_DRALO_AI === 'true';
}

export function getProductArea(action) {
  return PRODUCT_AREA_BY_ACTION[action] || 'internal';
}

export function getDailyLimit(action) {
  const limit = DAILY_LIMITS[action];
  return limit == null ? null : limit;
}

function todayUtcDateString() {
  return new Date().toISOString().slice(0, 10);
}

function nextUtcDateString(dateString) {
  const d = new Date(`${dateString}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function limitInfrastructureFailure(limit, used = null) {
  return {
    allowed: false,
    code: 'LIMIT_CHECK_FAILED',
    limit,
    used,
  };
}

/** Normaliza respuesta de uso diario para APIs y UI. */
export function buildDailyUsageStatus(check, action) {
  if (check.unlimited) {
    return {
      action,
      limit: null,
      used: null,
      remaining: null,
      unlimited: true,
      atLimit: false,
      role: check.role ?? null,
    };
  }

  const limit = getDailyLimit(action);

  if (!check.allowed && check.code === 'LIMIT_CHECK_FAILED') {
    return {
      action,
      limit,
      used: check.used ?? null,
      remaining: null,
      unlimited: false,
      atLimit: false,
      unavailable: true,
      role: check.role ?? null,
    };
  }

  const used = check.used ?? 0;
  const atLimit =
    limit != null &&
    (used >= limit || (!check.allowed && check.code === 'DAILY_LIMIT_REACHED'));
  const remaining = limit != null ? (atLimit ? 0 : Math.max(0, limit - used)) : null;

  return {
    action,
    limit,
    used,
    remaining,
    unlimited: false,
    atLimit,
    role: check.role ?? null,
  };
}

/** Snapshot for UI/API — same counters as preflight, without consuming. */
export async function getDailyUsageSnapshot(userId, action, options = {}) {
  const check = await checkDailyAiLimit(userId, action, options);
  return buildDailyUsageStatus(check, action);
}

async function readDailyUsageCount(db, userId, action, usageDate) {
  let fromLimits = 0;
  const { data, error } = await db
    .from('ai_usage_daily_limits')
    .select('count')
    .eq('user_id', userId)
    .eq('action', action)
    .eq('usage_date', usageDate)
    .maybeSingle();

  if (!error && data?.count != null) {
    fromLimits = Number(data.count) || 0;
  } else if (error) {
    console.warn('[aiUsage] readDailyUsageCount daily_limits', error.message);
  }

  const dayStart = `${usageDate}T00:00:00.000Z`;
  const dayEnd = `${nextUtcDateString(usageDate)}T00:00:00.000Z`;
  const { data: logRows, error: logError } = await db
    .from('ai_usage_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('action', action)
    .eq('success', true)
    .gte('created_at', dayStart)
    .lt('created_at', dayEnd);

  if (logError) {
    console.warn('[aiUsage] readDailyUsageCount logs', logError.message);
    return fromLimits;
  }

  return Math.max(fromLimits, logRows?.length ?? 0);
}

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Daily AI limits apply to students and teachers (and other non-admin roles).
 * Only platform admins are exempt from per-user daily caps.
 */
export async function resolveAiLimitPolicy(userId, userEmail = '') {
  if (!userId) {
    return { appliesDailyLimits: false, role: null, reason: 'anonymous' };
  }

  if (normalizeEmail(userEmail) === normalizeEmail(ADMIN_EMAIL)) {
    return { appliesDailyLimits: false, role: 'admin', reason: 'admin_email' };
  }

  const db = getSupabaseAdmin();
  if (!db) {
    return { appliesDailyLimits: true, role: 'unknown', reason: 'no_service_role' };
  }

  const roleName = await getUserRoleNameServer(userId, db);
  if (isAdminRole(roleName)) {
    return { appliesDailyLimits: false, role: roleName, reason: 'admin_role' };
  }

  const normalized = normalizeRoleName(roleName);
  const reason =
    normalized === 'student' || normalized === 'alumno'
      ? 'student'
      : normalized === 'teacher' || normalized === 'profesor'
        ? 'teacher'
        : 'authenticated';

  return { appliesDailyLimits: true, role: roleName, reason };
}

export async function checkDailyAiLimit(userId, action, options = {}) {
  const limit = getDailyLimit(action);
  if (limit == null) {
    return { allowed: true, limit: null, used: null, unlimited: true };
  }
  if (!userId) {
    return { allowed: false, code: 'AUTH_REQUIRED', limit, used: 0 };
  }

  const limitPolicy =
    options.limitPolicy ?? (await resolveAiLimitPolicy(userId, options.userEmail));
  if (!limitPolicy.appliesDailyLimits) {
    return {
      allowed: true,
      limit: null,
      used: null,
      unlimited: true,
      exempt: true,
      role: limitPolicy.role,
    };
  }

  const db = getAiUsageDb(options);
  if (!db) {
    return limitInfrastructureFailure(limit);
  }

  const usageDate = todayUtcDateString();
  try {
    const used = await readDailyUsageCount(db, userId, action, usageDate);
    if (used >= limit) {
      return { allowed: false, code: 'DAILY_LIMIT_REACHED', limit, used, role: limitPolicy.role };
    }
    return { allowed: true, limit, used, role: limitPolicy.role };
  } catch (err) {
    console.error('[aiUsage] checkDailyAiLimit', err?.message || err);
    return limitInfrastructureFailure(limit);
  }
}

/**
 * Reserva un uso diario antes de llamar a OpenAI (evita carreras y desincronización).
 * Debe usarse en preflight; no volver a incrementar en recordAiUsageSuccess.
 */
export async function consumeDailyAiLimit(userId, action, options = {}) {
  const check = await checkDailyAiLimit(userId, action, options);
  if (!check.allowed || check.unlimited) {
    return check;
  }

  const limit = check.limit;
  const db = getAiUsageDb(options);
  if (!db) {
    return limitInfrastructureFailure(limit, check.used);
  }

  const usageDate = todayUtcDateString();
  const now = new Date().toISOString();
  const maxAttempts = 4;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let used;
    try {
      used = await readDailyUsageCount(db, userId, action, usageDate);
    } catch (err) {
      console.error('[aiUsage] consumeDailyAiLimit read', err?.message || err);
      return limitInfrastructureFailure(limit, check.used);
    }

    if (used >= limit) {
      return {
        allowed: false,
        code: 'DAILY_LIMIT_REACHED',
        limit,
        used,
        role: check.role,
      };
    }

    const { data: existing, error: selectError } = await db
      .from('ai_usage_daily_limits')
      .select('id, count')
      .eq('user_id', userId)
      .eq('action', action)
      .eq('usage_date', usageDate)
      .maybeSingle();

    if (selectError) {
      console.error('[aiUsage] consumeDailyAiLimit select', selectError.message);
      return limitInfrastructureFailure(limit, used);
    }

    if (existing?.id) {
      const rowCount = Number(existing.count) || 0;
      if (rowCount >= limit) {
        return {
          allowed: false,
          code: 'DAILY_LIMIT_REACHED',
          limit,
          used: rowCount,
          role: check.role,
        };
      }

      const nextCount = rowCount + 1;
      const { data: updated, error: updateError } = await db
        .from('ai_usage_daily_limits')
        .update({ count: nextCount, updated_at: now })
        .eq('id', existing.id)
        .eq('count', rowCount)
        .select('count')
        .maybeSingle();

      if (!updateError && updated) {
        return {
          allowed: true,
          limit,
          used: updated.count,
          role: check.role,
          consumed: true,
        };
      }

      if (updateError) {
        console.error('[aiUsage] consumeDailyAiLimit update', updateError.message);
      }
      continue;
    }

    const nextCount = used + 1;
    if (nextCount > limit) {
      return {
        allowed: false,
        code: 'DAILY_LIMIT_REACHED',
        limit,
        used,
        role: check.role,
      };
    }

    const { data: inserted, error: insertError } = await db
      .from('ai_usage_daily_limits')
      .insert({
        user_id: userId,
        action,
        usage_date: usageDate,
        count: nextCount,
        updated_at: now,
      })
      .select('count')
      .maybeSingle();

    if (!insertError && inserted) {
      return {
        allowed: true,
        limit,
        used: inserted.count,
        role: check.role,
        consumed: true,
      };
    }

    if (insertError?.code !== '23505') {
      console.error('[aiUsage] consumeDailyAiLimit insert', insertError?.message);
      return limitInfrastructureFailure(limit, used);
    }
  }

  return limitInfrastructureFailure(limit, check.used);
}

export async function incrementDailyAiUsage(userId, action, options = {}) {
  const limit = getDailyLimit(action);
  if (limit == null || !userId) return;

  const limitPolicy =
    options.limitPolicy ?? (await resolveAiLimitPolicy(userId, options.userEmail));
  if (!limitPolicy.appliesDailyLimits) return;

  // Los contadores diarios se reservan en consumeDailyAiLimit (preflight).
  if (options.skipIfPreflightConsumed) return;

  const db = getSupabaseAdmin();
  if (!db) return;

  const usageDate = todayUtcDateString();
  const now = new Date().toISOString();

  const { data: existing, error: selectError } = await db
    .from('ai_usage_daily_limits')
    .select('id, count')
    .eq('user_id', userId)
    .eq('action', action)
    .eq('usage_date', usageDate)
    .maybeSingle();

  if (selectError) {
    console.error('[aiUsage] incrementDailyAiUsage select', selectError.message);
    return;
  }

  if (existing?.id) {
    const { error: updateError } = await db
      .from('ai_usage_daily_limits')
      .update({ count: (existing.count || 0) + 1, updated_at: now })
      .eq('id', existing.id);
    if (updateError) {
      console.error('[aiUsage] incrementDailyAiUsage update', updateError.message);
    }
    return;
  }

  const { error: insertError } = await db.from('ai_usage_daily_limits').insert({
    user_id: userId,
    action,
    usage_date: usageDate,
    count: 1,
    updated_at: now,
  });
  if (insertError) {
    console.error('[aiUsage] incrementDailyAiUsage insert', insertError.message);
  }
}

/**
 * @param {object} data
 */
export async function logAiUsage(data) {
  const db = getAiUsageDb({ accessToken: data.accessToken });
  if (!db) {
    console.warn('[aiUsage] logAiUsage skipped — no database client');
    return null;
  }

  const inputTokens = Number(data.input_tokens) || 0;
  const outputTokens = Number(data.output_tokens) || 0;
  const totalTokens =
    Number(data.total_tokens) || inputTokens + outputTokens;
  const model = data.model || null;
  const costs =
    data.estimated_cost_usd != null && data.estimated_cost_eur != null
      ? {
          costUsd: Number(data.estimated_cost_usd),
          costEur: Number(data.estimated_cost_eur),
        }
      : estimateAiCost(model, inputTokens, outputTokens);

  const row = {
    user_id: data.user_id || null,
    action: data.action,
    product_area: data.product_area || getProductArea(data.action),
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: totalTokens,
    estimated_cost_usd: costs.costUsd,
    estimated_cost_eur: costs.costEur,
    success: data.success !== false,
    error_code: data.error_code || null,
    metadata: data.metadata || {},
  };

  const { data: inserted, error } = await db.from('ai_usage_logs').insert(row).select('id').single();
  if (error) {
    console.error('[aiUsage] logAiUsage', error.message);
    return null;
  }
  return inserted?.id ?? null;
}

export async function getMonthlyAiSpend(monthKey = currentMonthKey()) {
  const db = getSupabaseAdmin();
  if (!db) {
    return { monthKey, totalEur: 0, totalUsd: 0, callCount: 0, warning: 'no_service_role' };
  }

  const start = `${monthKey}-01T00:00:00.000Z`;
  const [y, m] = monthKey.split('-').map(Number);
  const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
  const end = `${nextMonth}-01T00:00:00.000Z`;

  const { data, error } = await db
    .from('ai_usage_logs')
    .select('estimated_cost_eur, estimated_cost_usd')
    .gte('created_at', start)
    .lt('created_at', end);

  if (error) {
    console.error('[aiUsage] getMonthlyAiSpend', error.message);
    return { monthKey, totalEur: 0, totalUsd: 0, callCount: 0, error: error.message };
  }

  const rows = data || [];
  const totalEur = rows.reduce((s, r) => s + Number(r.estimated_cost_eur || 0), 0);
  const totalUsd = rows.reduce((s, r) => s + Number(r.estimated_cost_usd || 0), 0);
  return {
    monthKey,
    totalEur: Math.round(totalEur * 100) / 100,
    totalUsd: Math.round(totalUsd * 100) / 100,
    callCount: rows.length,
  };
}

export async function checkMonthlyBudget(monthKey = currentMonthKey()) {
  const db = getSupabaseAdmin();
  const spend = await getMonthlyAiSpend(monthKey);

  if (!db) {
    return {
      allowed: true,
      monthKey,
      spendEur: spend.totalEur,
      budgetEur: null,
      hardStop: false,
      warning: 'no_service_role',
    };
  }

  const { data: settings } = await db
    .from('ai_budget_settings')
    .select('monthly_budget_eur, hard_stop_enabled, warning_threshold_eur')
    .eq('month_key', monthKey)
    .maybeSingle();

  const budgetEur = Number(settings?.monthly_budget_eur ?? 150);
  const hardStop = settings?.hard_stop_enabled !== false;
  const warningThreshold = Number(settings?.warning_threshold_eur ?? 100);

  const overBudget = spend.totalEur >= budgetEur;
  const nearBudget = spend.totalEur >= warningThreshold;

  return {
    allowed: !(hardStop && overBudget),
    monthKey,
    spendEur: spend.totalEur,
    budgetEur,
    hardStop,
    warningThreshold,
    nearBudget,
    code: hardStop && overBudget ? 'MONTHLY_AI_BUDGET_REACHED' : null,
  };
}

export async function getAiUsageSummary(monthKey = currentMonthKey()) {
  const db = getSupabaseAdmin();
  if (!db) {
    return { monthKey, empty: true, warning: 'no_service_role' };
  }

  const start = `${monthKey}-01T00:00:00.000Z`;
  const [y, m] = monthKey.split('-').map(Number);
  const nextMonth = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
  const end = `${nextMonth}-01T00:00:00.000Z`;

  const { data: logs, error } = await db
    .from('ai_usage_logs')
    .select(
      'user_id, action, product_area, model, input_tokens, output_tokens, total_tokens, estimated_cost_eur, success, error_code',
    )
    .gte('created_at', start)
    .lt('created_at', end);

  if (error) {
    return { monthKey, error: error.message };
  }

  const rows = logs || [];
  const byAction = {};
  const byProductArea = {};
  const byModel = {};
  const byUser = {};
  let totalInput = 0;
  let totalOutput = 0;
  let totalEur = 0;
  let errorCount = 0;

  for (const row of rows) {
    const action = row.action || 'unknown';
    const area = row.product_area || 'unknown';
    const model = row.model || 'unknown';
    const uid = row.user_id || 'anonymous';
    const eur = Number(row.estimated_cost_eur || 0);

    byAction[action] = (byAction[action] || 0) + eur;
    byProductArea[area] = (byProductArea[area] || 0) + eur;
    byModel[model] = (byModel[model] || 0) + eur;
    byUser[uid] = (byUser[uid] || 0) + eur;
    totalInput += Number(row.input_tokens || 0);
    totalOutput += Number(row.output_tokens || 0);
    totalEur += eur;
    if (row.success === false) errorCount += 1;
  }

  const topUsers = Object.entries(byUser)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([userId, costEur]) => ({ userId, costEur: Math.round(costEur * 100) / 100 }));

  return {
    monthKey,
    totalCalls: rows.length,
    totalInputTokens: totalInput,
    totalOutputTokens: totalOutput,
    totalCostEur: Math.round(totalEur * 100) / 100,
    errorCount,
    byAction,
    byProductArea,
    byModel,
    topUsers,
  };
}

export async function findQuestionExplanation({ questionId, wrongAnswer }) {
  const db = getSupabaseAdmin();
  if (!db || !questionId) return null;

  let query = db
    .from('question_explanations')
    .select('*')
    .eq('question_id', questionId);

  if (wrongAnswer != null && String(wrongAnswer).trim() !== '') {
    query = query.eq('wrong_answer', String(wrongAnswer).trim());
  }

  const { data, error } = await query.limit(1).maybeSingle();
  if (error) {
    console.error('[aiUsage] findQuestionExplanation', error.message);
    return null;
  }
  if (data) return data;

  if (!questionId && wrongAnswer != null && String(wrongAnswer).trim() !== '') {
    const { data: byWrong, error: err2 } = await db
      .from('question_explanations')
      .select('*')
      .eq('wrong_answer', String(wrongAnswer).trim())
      .limit(1)
      .maybeSingle();
    if (err2) {
      console.error('[aiUsage] findQuestionExplanation fallback', err2.message);
      return null;
    }
    return byWrong;
  }

  return null;
}

export { DAILY_LIMITS, AUTH_REQUIRED_ACTIONS, DRALO_AI_HIDDEN_ACTIONS };
