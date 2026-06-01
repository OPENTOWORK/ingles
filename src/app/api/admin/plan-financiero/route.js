import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { DEFAULT_MONETIZATION_PLANS } from '@/data/financialPlanConfig';

function monthKey(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function aggregateCountByMonth(rows, dateField) {
  const counts = {};
  for (const row of rows || []) {
    const key = monthKey(row[dateField]);
    if (!key) continue;
    counts[key] = (counts[key] || 0) + 1;
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}

function aggregateRevenueByMonth(payments) {
  const totals = {};
  for (const row of payments || []) {
    if (row.exito === false) continue;
    const key = monthKey(row.fecha_pago);
    if (!key) continue;
    totals[key] = (totals[key] || 0) + (Number(row.importe) || 0);
  }
  return Object.entries(totals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue * 100) / 100,
    }));
}

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = auth.db;

    const [
      { data: plans, error: plansError },
      { data: subscriptions, error: subsError },
      { data: payments, error: paymentsError },
    ] = await Promise.all([
      db.from('monetizacion_planes').select('*').order('precio', { ascending: true }),
      db
        .from('monetizacion_suscripciones')
        .select('*')
        .order('inicio_en', { ascending: false })
        .limit(200),
      db
        .from('monetizacion_pagos')
        .select('*')
        .order('fecha_pago', { ascending: false })
        .limit(100),
    ]);

    if (plansError) {
      console.error('[admin/plan-financiero] planes', plansError);
      return NextResponse.json({ error: plansError.message }, { status: 500 });
    }
    if (subsError) {
      console.error('[admin/plan-financiero] suscripciones', subsError);
      return NextResponse.json({ error: subsError.message }, { status: 500 });
    }
    if (paymentsError) {
      console.error('[admin/plan-financiero] pagos', paymentsError);
      return NextResponse.json({ error: paymentsError.message }, { status: 500 });
    }

    const planById = Object.fromEntries((plans || []).map((p) => [p.id, p]));
    const userIds = [
      ...new Set(
        [...(subscriptions || []), ...(payments || [])]
          .map((r) => r.user_id)
          .filter(Boolean),
      ),
    ];

    let profilesByUser = {};
    if (userIds.length) {
      const { data: profiles } = await db
        .from('Usuarios_y_Perfil_users')
        .select('id, email, nombre')
        .in('id', userIds);
      profilesByUser = Object.fromEntries(
        (profiles || []).map((p) => [
          p.id,
          {
            email: p.email,
            nombre: p.nombre || null,
          },
        ]),
      );
    }

    const enrichedSubs = (subscriptions || []).map((s) => ({
      ...s,
      plan: planById[s.plan_id] || null,
      profile: profilesByUser[s.user_id] || null,
    }));

    const enrichedPayments = (payments || []).map((p) => ({
      ...p,
      profile: profilesByUser[p.user_id] || null,
    }));

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeStates = new Set(['activa', 'active']);
    const activeSubscriptions = enrichedSubs.filter((s) =>
      activeStates.has(String(s.estado || '').toLowerCase()),
    );

    const newLast30 = enrichedSubs.filter((s) => {
      const d = new Date(s.inicio_en);
      return !Number.isNaN(d.getTime()) && d >= thirtyDaysAgo;
    });

    const successfulPayments = (payments || []).filter((p) => p.exito !== false);
    const totalRevenue = successfulPayments.reduce(
      (sum, p) => sum + (Number(p.importe) || 0),
      0,
    );

    const revenueLast30 = successfulPayments
      .filter((p) => {
        const d = new Date(p.fecha_pago);
        return !Number.isNaN(d.getTime()) && d >= thirtyDaysAgo;
      })
      .reduce((sum, p) => sum + (Number(p.importe) || 0), 0);

    const subsByPlan = {};
    for (const s of enrichedSubs) {
      const name = s.plan?.nombre || 'Sin plan';
      subsByPlan[name] = (subsByPlan[name] || 0) + 1;
    }

    return NextResponse.json({
      summary: {
        totalPlans: (plans || []).length,
        activePlans: (plans || []).filter((p) => p.activo !== false).length,
        totalSubscriptions: enrichedSubs.length,
        activeSubscriptions: activeSubscriptions.length,
        newSubscriptionsLast30Days: newLast30.length,
        totalPayments: successfulPayments.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        revenueLast30Days: Math.round(revenueLast30 * 100) / 100,
      },
      plans: plans || [],
      subscriptions: enrichedSubs,
      payments: enrichedPayments,
      subscriptionsByMonth: aggregateCountByMonth(enrichedSubs, 'inicio_en'),
      revenueByMonth: aggregateRevenueByMonth(successfulPayments),
      subscribersByPlan: Object.entries(subsByPlan).map(([plan, count]) => ({ plan, count })),
    });
  } catch (err) {
    console.error('[admin/plan-financiero]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

/** Crea planes por defecto si la tabla está vacía (solo admin). */
export async function POST(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { count, error: countError } = await auth.db
      .from('monetizacion_planes')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: 'Ya existen planes. Edítalos desde el panel o en Supabase.' },
        { status: 409 },
      );
    }

    const rows = DEFAULT_MONETIZATION_PLANS.map((p) => ({
      ...p,
      creado_en: new Date().toISOString(),
    }));

    const { data, error } = await auth.db.from('monetizacion_planes').insert(rows).select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ created: data?.length || 0, plans: data });
  } catch (err) {
    console.error('[admin/plan-financiero POST]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
