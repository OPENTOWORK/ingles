import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import {
  AI_ACTIONS,
  getDailyUsageSnapshot,
} from '@/lib/aiUsage';
import {
  PLAN_USAGE_KEYS,
  getPlanUsageSnapshot,
  getStudentPlanContext,
  shouldApplyPlanUsageLimits,
} from '@/lib/planAccess';

export const dynamic = 'force-dynamic';

/** GET writing/speaking usage for UI (plan-based for students, daily alpha for staff). */
export async function GET(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user?.id) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  }

  const userId = auth.user.id;
  const userEmail = auth.user.email ?? '';
  const limitOpts = { userEmail, accessToken: auth.accessToken };

  const applyPlan = await shouldApplyPlanUsageLimits(userId, userEmail);

  if (applyPlan) {
    const ctx = await getStudentPlanContext(userId, userEmail, auth.user.user_metadata);
    const [writing, speaking] = await Promise.all([
      getPlanUsageSnapshot(userId, PLAN_USAGE_KEYS.WRITING_CORRECTION, ctx.planSlug),
      getPlanUsageSnapshot(userId, PLAN_USAGE_KEYS.SPEAKING_CORRECTION, ctx.planSlug),
    ]);
    return NextResponse.json(
      { writing, speaking, planSlug: ctx.planSlug, periodType: 'month' },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
    );
  }

  const [writing, speaking] = await Promise.all([
    getDailyUsageSnapshot(userId, AI_ACTIONS.EXAM_WRITING_CORRECTION, limitOpts),
    getDailyUsageSnapshot(userId, AI_ACTIONS.EXAM_SPEAKING_FEEDBACK, limitOpts),
  ]);

  return NextResponse.json(
    { writing, speaking, periodType: 'day' },
    { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } },
  );
}
