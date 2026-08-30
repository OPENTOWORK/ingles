import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { normalizeAdminAssignablePlanSlug } from '@/data/financialPlanConfig';
import { subscriptionGrantsAccess } from '@/lib/stripe/server';

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { db } = auth;
    const [usersRes, subsRes] = await Promise.all([
      db.from('Usuarios_y_Perfil_users').select('id, plan_id'),
      db.from('suscripciones').select('user_id, plan_id, status'),
    ]);

    if (usersRes.error) {
      return NextResponse.json({ error: usersRes.error.message }, { status: 500 });
    }
    if (subsRes.error) {
      return NextResponse.json({ error: subsRes.error.message }, { status: 500 });
    }

    const subsByUser = Object.fromEntries((subsRes.data || []).map((row) => [row.user_id, row]));
    const plansByUser = {};

    for (const row of usersRes.data || []) {
      const assignedPlanSlug = normalizeAdminAssignablePlanSlug(row.plan_id);
      const sub = subsByUser[row.id];

      if (sub && subscriptionGrantsAccess(sub.status) && sub.plan_id) {
        plansByUser[row.id] = {
          planSlug: normalizeAdminAssignablePlanSlug(sub.plan_id),
          assignedPlanSlug,
          source: 'stripe',
          stripeStatus: sub.status,
        };
        continue;
      }

      plansByUser[row.id] = {
        planSlug: assignedPlanSlug,
        assignedPlanSlug,
        source: 'admin',
        stripeStatus: sub?.status || null,
      };
    }

    return NextResponse.json({ plansByUser });
  } catch (err) {
    console.error('[admin/users/plans GET]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
