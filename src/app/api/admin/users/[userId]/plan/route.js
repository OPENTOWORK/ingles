import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { ADMIN_PANEL_ASSIGNABLE_PLAN_SLUGS } from '@/data/financialPlanConfig';
import { resolveEffectivePlanForUser } from '@/lib/adminUserPlan';
import {
  applyAuditedPlan,
  assertAuditTransactionReady,
  buildAdminPlanWriteResult,
  PROFILE_TABLE,
} from '@/lib/adminChangeLog';
import { syncAuthPlanMetadata } from '@/lib/stripe/subscriptions';

export async function PATCH(req, { params }) {
  try {
    const auth = await authenticateAdminRequest(req, ['admin']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const userId = String((await params)?.userId || '').trim();
    if (!userId) {
      return NextResponse.json({ error: 'Usuario no válido.' }, { status: 400 });
    }

    const body = await req.json();
    const planSlug = String(body?.planSlug || '').trim().toLowerCase();
    if (!ADMIN_PANEL_ASSIGNABLE_PLAN_SLUGS.includes(planSlug)) {
      return NextResponse.json(
        { error: 'Solo puedes asignar Plan FREE, Friendly PLUS o Friendly PREMIUM.' },
        { status: 400 },
      );
    }

    await assertAuditTransactionReady(auth.db, auth.user.id);

    const { data: beforeRow, error: beforeError } = await auth.db
      .from(PROFILE_TABLE)
      .select('plan_id')
      .eq('id', userId)
      .maybeSingle();
    if (beforeError) {
      return NextResponse.json({ error: beforeError.message || 'No se pudo leer el plan actual.' }, { status: 500 });
    }
    if (!beforeRow) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    const audit = await applyAuditedPlan(auth.db, {
      actorId: auth.user.id,
      userId,
      planSlug,
    });

    let authSynced = false;
    try {
      const sync = await syncAuthPlanMetadata(auth.db, userId, planSlug);
      authSynced = sync?.ok === true;
      if (!authSynced) {
        console.error('[admin/users plan] auth metadata', sync?.error || 'sincronización pendiente');
      }
    } catch (metadataError) {
      console.error('[admin/users plan] auth metadata', metadataError);
    }

    const effective = await resolveEffectivePlanForUser(auth.db, userId, planSlug);
    return NextResponse.json(
      buildAdminPlanWriteResult({
        auditRecorded: audit.changed,
        authSynced,
        effective,
      }),
    );
  } catch (err) {
    console.error('[admin/users/[userId]/plan PATCH]', err);
    return NextResponse.json(
      { error: err?.message || 'No se pudo actualizar el plan.' },
      { status: err?.status || 500 },
    );
  }
}
