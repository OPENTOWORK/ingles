import { evaluateCambridgeEssay } from '@/lib/cambridgeEssayFeedback';
import { AI_ACTIONS, checkMonthlyBudget } from '@/lib/aiUsage';
import { aiErrorJson, aiSuccessJson } from '@/lib/aiUsageRouteHelpers';
import { GUEST_WRITING_COOKIE } from '@/lib/guestPreviewAccess';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

export function guestWritingAlreadyUsed(request) {
  return request.cookies.get(GUEST_WRITING_COOKIE)?.value === '1';
}

/** Una corrección de Writing para quien no tiene cuenta. La cookie impide la segunda. */
export async function handleGuestWritingPreview(body) {
  const budget = await checkMonthlyBudget();
  if (!budget.allowed) {
    return aiErrorJson(
      'MONTHLY_AI_BUDGET_REACHED',
      'AI usage is temporarily limited. Please try again later.',
      {},
      503,
    );
  }

  const result = await evaluateCambridgeEssay({
    essay: body.essay,
    level: body.level,
    taskContext: body.taskContext,
    structuredExamContext: body.structuredExamContext,
    wordMin: body.wordMin,
    wordMax: body.wordMax,
  });

  if (!result.ok) {
    return aiErrorJson('ESSAY_EVAL_FAILED', result.error || 'Could not check this writing.', {}, result.status || 500);
  }

  const response = aiSuccessJson({
    action: AI_ACTIONS.EXAM_WRITING_CORRECTION,
    result: {
      engine: 'legacy',
      feedback: result.feedback,
      scores: result.scores,
      guestPreview: true,
    },
  });
  response.cookies.set(GUEST_WRITING_COOKIE, '1', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}
