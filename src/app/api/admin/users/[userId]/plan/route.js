import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { ADMIN_PANEL_ASSIGNABLE_PLAN_SLUGS } from '@/data/financialPlanConfig';
import { assignUserPlan } from '@/lib/adminUserPlan';

export async function PATCH(req, { params }) {
  try {
    const auth = await authenticateAdminRequest(req);
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

    const result = await assignUserPlan(auth.db, userId, planSlug);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error('[admin/users/[userId]/plan PATCH]', err);
    return NextResponse.json(
      { error: err?.message || 'No se pudo actualizar el plan.' },
      { status: 500 },
    );
  }
}
