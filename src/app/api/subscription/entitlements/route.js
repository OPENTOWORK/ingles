import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import {
  getStudentPlanContext,
  getStudentPlanUsageBundle,
} from '@/lib/planAccess';

export const dynamic = 'force-dynamic';

/** Plan activo + cuotas restantes (estudiantes). Staff recibe applyLimits=false. */
export async function GET(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user?.id) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  }

  const ctx = await getStudentPlanContext(
    auth.user.id,
    auth.user.email ?? '',
    auth.user.user_metadata,
  );

  const usage = ctx.applyLimits
    ? await getStudentPlanUsageBundle(auth.user.id, ctx.planSlug)
    : null;

  return NextResponse.json(
    {
      planSlug: ctx.planSlug,
      applyLimits: ctx.applyLimits,
      maxExamSlot: ctx.maxExamSlot,
      subscriptionMonths: ctx.subscriptionMonths,
      plusExamUnlock: ctx.plusExamUnlock,
      entitlements: ctx.entitlements,
      progressTracking: ctx.progressTracking,
      writingAdvanced: ctx.writingAdvanced,
      usage,
    },
    {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    },
  );
}
