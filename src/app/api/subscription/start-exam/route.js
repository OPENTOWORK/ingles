import { NextResponse } from 'next/server';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { LIMIT_REACHED } from '@/lib/aiUsageLimitCopy';
import {
  PLAN_USAGE_KEYS,
  canAccessExamSlot,
  checkPlanUsage,
  consumePlanUsage,
  getStudentPlanContext,
} from '@/lib/planAccess';

export const dynamic = 'force-dynamic';

/**
 * Valida acceso al slot de examen y consume cuota mensual si es un intento nuevo.
 * Body: { examSlot: number, resuming?: boolean }
 */
export async function POST(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user?.id) {
    return NextResponse.json({ error: 'AUTH_REQUIRED' }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 });
  }

  const examSlot = Number(body?.examSlot);
  if (!Number.isFinite(examSlot) || examSlot < 1) {
    return NextResponse.json({ error: 'INVALID_EXAM_SLOT' }, { status: 400 });
  }

  const ctx = await getStudentPlanContext(
    auth.user.id,
    auth.user.email ?? '',
    auth.user.user_metadata,
  );

  if (!ctx.applyLimits) {
    return NextResponse.json({ allowed: true, bypass: true });
  }

  if (!canAccessExamSlot(ctx.planSlug, examSlot, { maxExamSlot: ctx.maxExamSlot })) {
    const isPlus = String(ctx.planSlug).toLowerCase() === 'premium';
    return NextResponse.json(
      {
        allowed: false,
        code: 'EXAM_SLOT_LOCKED',
        message: isPlus
          ? `Este examen se desbloqueará en el próximo mes de tu plan Plus. Ahora tienes acceso a los exámenes 1–${ctx.maxExamSlot}.`
          : 'Este examen requiere un plan superior. El plan gratuito incluye solo el Test 1.',
        maxExamSlot: ctx.maxExamSlot,
        plusExamUnlock: ctx.plusExamUnlock,
      },
      { status: 403 },
    );
  }

  if (body?.resuming === true) {
    const check = await checkPlanUsage(
      auth.user.id,
      PLAN_USAGE_KEYS.EXAM_SESSION,
      ctx.planSlug,
    );
    return NextResponse.json({
      allowed: true,
      resuming: true,
      usage: check,
    });
  }

  const result = await consumePlanUsage(
    auth.user.id,
    PLAN_USAGE_KEYS.EXAM_SESSION,
    ctx.planSlug,
  );

  if (!result.allowed) {
    return NextResponse.json(
      {
        allowed: false,
        code: result.code || 'PLAN_LIMIT_REACHED',
        message: LIMIT_REACHED.exam.es,
        limit: result.limit,
        used: result.used,
      },
      { status: 429 },
    );
  }

  return NextResponse.json({
    allowed: true,
    consumed: Boolean(result.consumed),
    limit: result.limit,
    used: result.used,
  });
}
