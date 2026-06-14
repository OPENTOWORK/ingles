import { NextResponse } from 'next/server';
import { isOpenAIConfigured, getDefaultModel } from '@/lib/ai/draloAiEngine';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import {
  AI_ACTIONS,
  AI_ACTION_VALUES,
  isValidAiAction,
  requiresAuth,
  isDraloAiHiddenAction,
  isDraloAiFeatureEnabled,
  getDailyLimit,
} from '@/lib/aiUsage';
import { aiErrorJson, aiSuccessJson, runAiPreflight } from '@/lib/aiUsageRouteHelpers';
import {
  normalizeAction,
  handleExamWritingCorrection,
  handleExamSpeakingFeedback,
  handleExtractErrors,
  handleGenerateErrorExercises,
  handleExplainMistakeFromDb,
  handleDraloAiSpeakingMission,
  handleDraloAiWritingCoach,
  handleAdminGenerateExamLog,
  handleLegacyAssistantRequest,
} from '@/lib/aiActionHandlers';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 60;

/** @type {Map<string, { n: number, reset: number }>} */
const ipBuckets = new Map();

function clientIp(req) {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim().slice(0, 64) || 'unknown';
  return req.headers.get('x-real-ip')?.trim().slice(0, 64) || 'unknown';
}

function tryConsumeRate(ip) {
  const now = Date.now();
  let b = ipBuckets.get(ip);
  if (!b || now > b.reset) {
    b = { n: 0, reset: now + WINDOW_MS };
    ipBuckets.set(ip, b);
  }
  if (b.n >= MAX_PER_IP) return false;
  b.n += 1;
  return true;
}

const OPENAI_ACTIONS = new Set([
  AI_ACTIONS.EXAM_WRITING_CORRECTION,
  AI_ACTIONS.EXAM_SPEAKING_FEEDBACK,
  AI_ACTIONS.DRALO_AI_SPEAKING_MISSION,
  AI_ACTIONS.DRALO_AI_WRITING_COACH,
  AI_ACTIONS.EXTRACT_ERRORS,
  AI_ACTIONS.GENERATE_ERROR_EXERCISES,
  AI_ACTIONS.ADMIN_GENERATE_EXAM,
]);

export async function GET() {
  return NextResponse.json({
    ok: true,
    openaiConfigured: isOpenAIConfigured(),
    model: getDefaultModel(),
    actions: [...AI_ACTION_VALUES],
    dailyLimits: {
      exam_writing_correction: getDailyLimit(AI_ACTIONS.EXAM_WRITING_CORRECTION),
      exam_speaking_feedback: getDailyLimit(AI_ACTIONS.EXAM_SPEAKING_FEEDBACK),
      extract_errors: getDailyLimit(AI_ACTIONS.EXTRACT_ERRORS),
      generate_error_exercises: getDailyLimit(AI_ACTIONS.GENERATE_ERROR_EXERCISES),
    },
  });
}

export async function POST(request) {
  const ip = clientIp(request);
  if (!tryConsumeRate(ip)) {
    return aiErrorJson('RATE_LIMIT', 'Too many requests. Please wait a moment.', {}, 429);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return aiErrorJson('INVALID_BODY', 'Invalid JSON body.');
  }

  const rawAction = body?.action;
  const action = rawAction ? normalizeAction(rawAction) : null;

  if (!action && (body?.assistantType || body?.taskType)) {
    return handleLegacyFlow(request, body);
  }

  if (!action || !isValidAiAction(action)) {
    return aiErrorJson('INVALID_AI_ACTION', 'Invalid AI action.');
  }

  const auth = await getSupabaseUserFromRequest(request);
  const userId = auth?.user?.id ?? null;
  const userEmail = auth?.user?.email ?? '';
  const aiCtx = { userEmail, accessToken: auth?.accessToken ?? null };

  if (requiresAuth(action) && !userId) {
    return aiErrorJson(
      'AUTH_REQUIRED',
      'Please log in to use this feature.',
      {},
      401,
    );
  }

  if (isDraloAiHiddenAction(action)) {
    const adminAuth = await authenticateAdminRequest(request);
    const allowed = isDraloAiFeatureEnabled() || !adminAuth.error;
    if (!allowed) {
      return aiErrorJson(
        'FEATURE_NOT_AVAILABLE',
        'This feature is not available yet.',
        {},
        403,
      );
    }
  }

  if (action === AI_ACTIONS.ADMIN_GENERATE_EXAM) {
    const adminAuth = await authenticateAdminRequest(request);
    if (adminAuth.error) {
      return aiErrorJson(
        'ADMIN_ONLY',
        'This action is only available for admins.',
        {},
        403,
      );
    }
  }

  if (action === AI_ACTIONS.EXPLAIN_MISTAKE_FROM_DB) {
    try {
      const out = await handleExplainMistakeFromDb(userId, body);
      return aiSuccessJson({ action, result: out.result });
    } catch (err) {
      return aiErrorJson('DB_ERROR', err?.message || 'Could not load explanation.', {}, 500);
    }
  }

  if (OPENAI_ACTIONS.has(action) && !isOpenAIConfigured()) {
    return aiErrorJson(
      'OPENAI_NOT_CONFIGURED',
      'OPENAI_API_KEY is not configured on the server.',
      {},
      503,
    );
  }

  if (OPENAI_ACTIONS.has(action) && action !== AI_ACTIONS.ADMIN_GENERATE_EXAM) {
    const preflight = await runAiPreflight(userId, action, aiCtx);
    if (!preflight.ok) return preflight.response;
  }

  try {
    let out;

    switch (action) {
      case AI_ACTIONS.EXAM_WRITING_CORRECTION:
        out = await handleExamWritingCorrection(userId, body, aiCtx);
        break;
      case AI_ACTIONS.EXAM_SPEAKING_FEEDBACK:
        out = await handleExamSpeakingFeedback(userId, body, aiCtx);
        break;
      case AI_ACTIONS.EXTRACT_ERRORS:
        out = await handleExtractErrors(userId, body, aiCtx);
        break;
      case AI_ACTIONS.GENERATE_ERROR_EXERCISES:
        out = await handleGenerateErrorExercises(userId, body, aiCtx);
        break;
      case AI_ACTIONS.DRALO_AI_SPEAKING_MISSION:
        out = await handleDraloAiSpeakingMission(userId, body, aiCtx);
        break;
      case AI_ACTIONS.DRALO_AI_WRITING_COACH:
        out = await handleDraloAiWritingCoach(userId, body, aiCtx);
        break;
      case AI_ACTIONS.ADMIN_GENERATE_EXAM:
        out = await handleAdminGenerateExamLog(userId, body);
        break;
      default:
        return aiErrorJson('INVALID_AI_ACTION', 'Invalid AI action.');
    }

    if (!out.ok) {
      return aiErrorJson('ACTION_FAILED', out.error || 'Request failed.', {}, out.status || 500);
    }

    return aiSuccessJson({ action, result: out.result, legacy: out.legacy || false });
  } catch (err) {
    console.error('[dralo-ai]', action, err?.message || err);
    return aiErrorJson('OPENAI_ERROR', err?.message || 'AI request failed.', {}, 500);
  }
}

async function handleLegacyFlow(request, body) {
  if (!isOpenAIConfigured()) {
    return aiErrorJson(
      'OPENAI_NOT_CONFIGURED',
      'OPENAI_API_KEY is not configured on the server.',
      {},
      503,
    );
  }

  const auth = await getSupabaseUserFromRequest(request);
  const userId = auth?.user?.id ?? null;
  const adminAuth = await authenticateAdminRequest(request);
  const isAdmin = !adminAuth.error;

  if (!isDraloAiFeatureEnabled() && !isAdmin) {
    return aiErrorJson(
      'FEATURE_NOT_AVAILABLE',
      'This feature is not available yet.',
      {},
      403,
    );
  }

  if (!userId) {
    return aiErrorJson('AUTH_REQUIRED', 'Please log in to use this feature.', {}, 401);
  }

  const userEmail = auth?.user?.email ?? '';
  const aiCtx = { userEmail, accessToken: auth?.accessToken ?? null };

  const preflight = await runAiPreflight(userId, AI_ACTIONS.DRALO_AI_WRITING_COACH, aiCtx);
  if (!preflight.ok) return preflight.response;

  try {
    const out = await handleLegacyAssistantRequest(userId, body, isAdmin, aiCtx);
    if (!out.ok) {
      return aiErrorJson('ACTION_FAILED', out.error || 'Request failed.', {}, out.status || 500);
    }
    return aiSuccessJson({
      success: true,
      assistantType: body.assistantType,
      taskType: body.taskType,
      level: body.level,
      result: out.result,
    });
  } catch (err) {
    return aiErrorJson('OPENAI_ERROR', err?.message || 'AI request failed.', {}, 500);
  }
}
