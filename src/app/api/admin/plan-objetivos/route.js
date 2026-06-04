import { NextResponse } from 'next/server';
import { authenticatePlanObjetivosAdminRequest } from '@/lib/adminAccess';

export async function GET(req) {
  try {
    const auth = await authenticatePlanObjetivosAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { data: plans, error: plansError } = await auth.db
      .from('plan_objetivos')
      .select('*')
      .order('updated_at', { ascending: false });

    if (plansError) {
      console.error('[admin/plan-objetivos]', plansError);
      return NextResponse.json({ error: plansError.message }, { status: 500 });
    }

    const userIds = [...new Set((plans || []).map((p) => p.user_id))];
    let profilesByUser = {};

    if (userIds.length > 0) {
      const { data: profiles } = await auth.db
        .from('user_profiles')
        .select('id, nombre, email')
        .in('id', userIds);

      profilesByUser = Object.fromEntries(
        (profiles || []).map((p) => [p.id, { nombre: p.nombre, email: p.email }]),
      );
    }

    const enriched = (plans || []).map((plan) => ({
      ...plan,
      profile: profilesByUser[plan.user_id] || null,
    }));

    return NextResponse.json({ plans: enriched });
  } catch (err) {
    console.error('[admin/plan-objetivos]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
