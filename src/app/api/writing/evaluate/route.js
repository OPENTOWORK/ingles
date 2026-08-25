import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { AI_ACTIONS } from '@/lib/aiUsage';
import {
  aiErrorJson,
  aiSuccessJson,
  runAiPreflight,
  recordAiUsageFailure,
  recordAiUsageSuccess,
} from '@/lib/aiUsageRouteHelpers';
import {
  logWritingV3FlagBootOnce,
  isWritingEngineV3FlagEnabled,
} from '@/features/writing/config/writing-v3-flags';
import { resolveWritingV3AccessForUser } from '@/features/writing/services/orchestration/writing-v3-access.server';
import { evaluateWritingV3 } from '@/features/writing/services/orchestration/evaluate-writing-v3.server';

/**
 * Writing Engine v3 evaluate endpoint (global rollout).
 * Kill switch: DRALO_WRITING_ENGINE_V3_ENABLED=false → 403 (use /api/dralo-ai legacy).
 * Client cannot force engine choice.
 */
export async function POST(req) {
  logWritingV3FlagBootOnce();

  const auth = await getSupabaseUserFromRequest(req);
  const userId = auth?.user?.id ?? null;
  const userEmail = auth?.user?.email ?? '';
  const aiCtx = { userEmail, accessToken: auth?.accessToken ?? null };

  if (!userId) {
    return aiErrorJson('AUTH_REQUIRED', 'Please log in to use this feature.', {}, 401);
  }

  if (!isWritingEngineV3FlagEnabled()) {
    return aiErrorJson(
      'WRITING_V3_DISABLED',
      'Writing Engine v3 is temporarily disabled (emergency kill switch).',
      { engine: 'v3', flag: false },
      403,
    );
  }

  const access = await resolveWritingV3AccessForUser({ userId, email: userEmail });
  if (!access.allowed) {
    return aiErrorJson(
      'WRITING_V3_FORBIDDEN',
      access.reason === 'plan_requires_plus'
        ? 'Advanced writing correction requires a Plus or Premium plan.'
        : 'Writing Engine v3 is not available for this account.',
      { engine: 'v3', reason: access.reason },
      403,
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return aiErrorJson('INVALID_BODY', 'Invalid JSON body.');
  }

  const essay = String(body.essay || body.candidate_response || '').trim();
  if (!essay) {
    return aiErrorJson('INVALID_BODY', 'essay is required');
  }

  const preflight = await runAiPreflight(userId, AI_ACTIONS.EXAM_WRITING_CORRECTION, {
    ...aiCtx,
    deferredExamMode: body.deferredExamMode === true,
  });
  if (!preflight.ok) return preflight.response;

  const out = await evaluateWritingV3({
    user_id: userId,
    candidate_response: essay,
    structured_exam_context: body.structuredExamContext ?? null,
    task_context: body.taskContext ?? null,
    writing_type: body.writingType ?? body.task_type ?? null,
    submission_source: body.submission_source || 'exam_mode',
    pregunta_id: body.pregunta_id ?? null,
    examen_id: body.examen_id ?? null,
    parte_numero: body.parte_numero ?? null,
  });

  if (!out.ok) {
    await recordAiUsageFailure({
      userId,
      action: AI_ACTIONS.EXAM_WRITING_CORRECTION,
      model: out.usage_summary?.actual_models?.assessment || 'gpt-4o-2024-08-06',
      errorCode: out.code || 'WRITING_V3_FAILED',
      metadata: {
        engine: 'v3',
        execution_id: out.execution_id,
        validation_status: out.validation_status,
      },
    });
    return aiErrorJson(
      out.code || 'WRITING_V3_FAILED',
      out.error,
      {
        engine: 'v3',
        diagnostics: out.diagnostics,
        execution_id: out.execution_id,
        submission_id: out.submission_id,
      },
      out.status || 500,
    );
  }

  const usage = out.usage_summary;
  await recordAiUsageSuccess({
    userId,
    userEmail,
    accessToken: aiCtx.accessToken,
    action: AI_ACTIONS.EXAM_WRITING_CORRECTION,
    planBased: Boolean(preflight.daily?.planBased),
    model: usage?.actual_models?.assessment || 'gpt-4o-2024-08-06',
    usage: usage
      ? {
          model: usage.actual_models.assessment || 'gpt-4o-2024-08-06',
          input_tokens: usage.input_tokens,
          output_tokens: usage.output_tokens,
          total_tokens: usage.total_tokens,
        }
      : undefined,
    metadata: {
      engine: 'v3',
      execution_id: out.execution_id,
      submission_id: out.submission_id,
      persistence_mode: out.persistence_mode,
      token_source: 'provider_reported',
      cost_usd: usage?.cost_usd,
      latency_ms: usage?.latency_ms,
    },
  });

  return aiSuccessJson({
    engine: 'v3',
    feedback: '',
    scores: out.scores,
    feedback_payload: out.feedback_payload,
    candidate_response: out.candidate_response,
    task_prompt_snapshot: out.task_prompt_snapshot,
    submission_id: out.submission_id,
    execution_id: out.execution_id,
    learner_history_applied: out.learner_history_applied,
  });
}
