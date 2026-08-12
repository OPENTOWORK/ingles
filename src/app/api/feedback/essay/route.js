import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { AI_ACTIONS } from '@/lib/aiUsage';
import { aiErrorJson, aiSuccessJson, runAiPreflight } from '@/lib/aiUsageRouteHelpers';
import { handleExamWritingCorrection } from '@/lib/aiActionHandlers';

/** Legacy essay feedback route — same limits as /api/dralo-ai exam_writing_correction. */
export async function POST(req) {
  const auth = await getSupabaseUserFromRequest(req);
  const userId = auth?.user?.id ?? null;
  const userEmail = auth?.user?.email ?? '';
  const aiCtx = { userEmail, accessToken: auth?.accessToken ?? null };

  if (!userId) {
    return aiErrorJson('AUTH_REQUIRED', 'Please log in to use this feature.', {}, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return aiErrorJson('INVALID_BODY', 'Invalid JSON body.');
  }

  const preflight = await runAiPreflight(userId, AI_ACTIONS.EXAM_WRITING_CORRECTION, {
    ...aiCtx,
    deferredExamMode: body.deferredExamMode === true,
  });
  if (!preflight.ok) return preflight.response;

  const out = await handleExamWritingCorrection(userId, body, aiCtx);
  if (!out.ok) {
    return aiErrorJson('ACTION_FAILED', out.error || 'Request failed.', {}, out.status || 500);
  }

  return aiSuccessJson({
    feedback: out.result.feedback,
    scores: out.result.scores,
    engine: out.result.engine || 'legacy',
    feedback_payload: out.result.feedback_payload,
    candidate_response: out.result.candidate_response,
    task_prompt_snapshot: out.result.task_prompt_snapshot,
    submission_id: out.result.submission_id,
    execution_id: out.result.execution_id,
    learner_history_applied: out.result.learner_history_applied,
  });
}
