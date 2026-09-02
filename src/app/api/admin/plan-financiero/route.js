import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import {
  DEFAULT_MONETIZATION_PLANS,
  LEGACY_PLAN_NAMES,
  ALL_USER_PLAN_SLUGS,
  planSlugFromDbRow,
} from '@/data/financialPlanConfig';
import { rowToDbInsert } from '@/lib/subscriptionPlans';

function buildPlanRow(plan) {
  return rowToDbInsert({
    nombre: plan.nombre,
    slug: plan.slug,
    descripcion: plan.descripcion,
    descripcionCorta: plan.descripcion_corta || plan.descripcionCorta,
    precio: plan.precio,
    duracion_dias: plan.duracion_dias,
    activo: plan.activo,
    badge: plan.badge,
    orden: plan.orden,
    stripe_price_id: plan.stripe_price_id,
    entitlements: plan.entitlements,
    badgeVariant: plan.badgeVariant,
    recommended: plan.recommended,
  });
}

async function upsertPlanRow(db, plan) {
  const extended = buildPlanRow(plan);
  const minimal = {
    nombre: extended.nombre,
    descripcion: extended.descripcion,
    precio: extended.precio,
    duracion_dias: extended.duracion_dias,
    activo: extended.activo,
  };

  let existing = null;
  const { data: bySlug, error: slugErr } = await db
    .from('monetizacion_planes')
    .select('id')
    .eq('slug', plan.slug)
    .maybeSingle();

  if (!slugErr && bySlug?.id) existing = bySlug;
  else {
    const { data: byName } = await db
      .from('monetizacion_planes')
      .select('id')
      .eq('nombre', plan.nombre)
      .maybeSingle();
    if (byName?.id) existing = byName;
  }

  if (existing?.id) {
    let { error } = await db.from('monetizacion_planes').update(extended).eq('id', existing.id);
    if (error) {
      ({ error } = await db.from('monetizacion_planes').update(minimal).eq('id', existing.id));
    }
    if (error) throw error;
    return 'updated';
  }

  let { error } = await db.from('monetizacion_planes').insert({
    ...extended,
    creado_en: new Date().toISOString(),
  });
  if (error) {
    ({ error } = await db.from('monetizacion_planes').insert({
      ...minimal,
      creado_en: new Date().toISOString(),
    }));
  }
  if (error) throw error;
  return 'created';
}

async function syncCatalog(db) {
  if (LEGACY_PLAN_NAMES.length) {
    await db.from('monetizacion_planes').update({ activo: false }).in('nombre', LEGACY_PLAN_NAMES);
  }

  const stats = { created: 0, updated: 0, deactivated: 0 };
  for (const plan of DEFAULT_MONETIZATION_PLANS) {
    const result = await upsertPlanRow(db, plan);
    if (result === 'created') stats.created += 1;
    else stats.updated += 1;
  }

  const { data: allPlans, error: allErr } = await db.from('monetizacion_planes').select('id, slug, nombre, activo');
  if (allErr) throw allErr;

  for (const row of allPlans || []) {
    const slug = planSlugFromDbRow(row);
    if (!ALL_USER_PLAN_SLUGS.includes(slug) && row.activo !== false) {
      await db.from('monetizacion_planes').update({ activo: false }).eq('id', row.id);
      stats.deactivated += 1;
    }
  }

  return stats;
}

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

    const activePlans = (plans || []).filter((p) => p.activo !== false);

    return NextResponse.json({
      summary: {
        totalPlans: (plans || []).length,
        activePlans: activePlans.length,
        totalSubscriptions: enrichedSubs.length,
        activeSubscriptions: activeSubscriptions.length,
        newSubscriptionsLast30Days: newLast30.length,
        totalPayments: successfulPayments.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        revenueLast30Days: Math.round(revenueLast30 * 100) / 100,
      },
      plans: activePlans,
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

/** Crea o sincroniza catálogo FREE · PLUS · PREMIUM (solo admin). */
export async function POST(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    if (body?.action === 'sync-catalog') {
      const stats = await syncCatalog(auth.db);
      return NextResponse.json({
        ok: true,
        message: 'Catálogo sincronizado: FREE, PLUS y PREMIUM.',
        ...stats,
      });
    }

    if (body?.action === 'create-plan') {
      const nombre = String(body.nombre || '').trim();
      const slug = String(body.slug || '')
        .trim()
        .toLowerCase();
      if (!nombre || !slug) {
        return NextResponse.json({ error: 'Nombre y slug son obligatorios.' }, { status: 400 });
      }
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return NextResponse.json(
          { error: 'El slug solo puede contener letras minúsculas, números y guiones.' },
          { status: 400 },
        );
      }

      const { data: existing, error: existErr } = await auth.db
        .from('monetizacion_planes')
        .select('id, activo')
        .eq('slug', slug)
        .maybeSingle();

      if (existErr) {
        return NextResponse.json({ error: existErr.message }, { status: 500 });
      }
      if (existing && existing.activo !== false) {
        return NextResponse.json(
          { error: 'Ya existe un plan activo con este slug.' },
          { status: 409 },
        );
      }

      await upsertPlanRow(auth.db, {
        nombre,
        slug,
        descripcion: body.descripcion || '',
        descripcion_corta: body.descripcion_corta || '',
        precio: body.precio ?? 0,
        duracion_dias: body.duracion_dias ?? 30,
        activo: true,
        badge: body.badge || null,
        orden: body.orden ?? 0,
        stripe_price_id: body.stripe_price_id || null,
        entitlements: body.entitlements || {},
      });

      const { data: plan, error: fetchErr } = await auth.db
        .from('monetizacion_planes')
        .select('*')
        .eq('slug', slug)
        .single();

      if (fetchErr) {
        return NextResponse.json({ error: fetchErr.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, plan });
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

    const stats = await syncCatalog(auth.db);
    const { data: plans } = await auth.db
      .from('monetizacion_planes')
      .select('*')
      .order('orden', { ascending: true });

    return NextResponse.json({
      created: stats.created,
      updated: stats.updated,
      plans: plans || [],
    });
  } catch (err) {
    console.error('[admin/plan-financiero POST]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

async function updatePlanById(db, id, payload) {
  const existingMeta =
    payload.metadata && typeof payload.metadata === 'object' ? payload.metadata : {};

  const extended = buildPlanRow({
    nombre: payload.nombre,
    slug: payload.slug,
    descripcion: payload.descripcion,
    descripcion_corta: payload.descripcion_corta,
    precio: payload.precio,
    duracion_dias: payload.duracion_dias,
    activo: payload.activo !== false,
    badge: payload.badge,
    orden: payload.orden,
    stripe_price_id: payload.stripe_price_id,
    entitlements: existingMeta.entitlements,
    badgeVariant: existingMeta.badge_variant,
    recommended: existingMeta.recommended,
  });

  const minimal = {
    nombre: extended.nombre,
    descripcion: extended.descripcion,
    precio: extended.precio,
    duracion_dias: extended.duracion_dias,
    activo: extended.activo,
  };

  let { data, error } = await db.from('monetizacion_planes').update(extended).eq('id', id).select('*').single();
  if (error) {
    ({ data, error } = await db.from('monetizacion_planes').update(minimal).eq('id', id).select('*').single());
  }
  if (error) throw error;
  return data;
}

/** Actualiza un plan activo (solo admin). */
export async function PATCH(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const id = body?.id;
    if (!id) {
      return NextResponse.json({ error: 'Falta el id del plan.' }, { status: 400 });
    }

    const { data: current, error: fetchErr } = await auth.db
      .from('monetizacion_planes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }
    if (!current) {
      return NextResponse.json({ error: 'Plan no encontrado.' }, { status: 404 });
    }

    const meta = current.metadata && typeof current.metadata === 'object' ? current.metadata : {};
    const plan = await updatePlanById(auth.db, id, {
      nombre: body.nombre ?? current.nombre,
      slug: body.slug ?? current.slug,
      descripcion: body.descripcion ?? current.descripcion,
      descripcion_corta: body.descripcion_corta ?? meta.descripcion_corta ?? '',
      precio: body.precio ?? current.precio,
      duracion_dias: body.duracion_dias ?? current.duracion_dias,
      badge: body.badge !== undefined ? body.badge : current.badge,
      orden: body.orden ?? current.orden,
      stripe_price_id:
        body.stripe_price_id !== undefined ? body.stripe_price_id : current.stripe_price_id,
      activo: body.activo !== undefined ? body.activo : current.activo,
      metadata: {
        ...meta,
        descripcion_corta: body.descripcion_corta ?? meta.descripcion_corta ?? '',
      },
    });

    return NextResponse.json({ ok: true, plan });
  } catch (err) {
    console.error('[admin/plan-financiero PATCH]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

/** Elimina un plan (soft-delete si tiene suscripciones). */
export async function DELETE(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Falta el id del plan.' }, { status: 400 });
    }

    const { data: plan, error: planErr } = await auth.db
      .from('monetizacion_planes')
      .select('id, nombre')
      .eq('id', id)
      .maybeSingle();

    if (planErr) {
      return NextResponse.json({ error: planErr.message }, { status: 500 });
    }
    if (!plan) {
      return NextResponse.json({ error: 'Plan no encontrado.' }, { status: 404 });
    }

    const { count, error: countErr } = await auth.db
      .from('monetizacion_suscripciones')
      .select('id', { count: 'exact', head: true })
      .eq('plan_id', id);

    if (countErr) {
      return NextResponse.json({ error: countErr.message }, { status: 500 });
    }

    if ((count ?? 0) > 0) {
      const { error } = await auth.db.from('monetizacion_planes').update({ activo: false }).eq('id', id);
      if (error) throw error;
      return NextResponse.json({
        ok: true,
        softDeleted: true,
        message: 'Plan desactivado (tiene suscripciones asociadas).',
      });
    }

    const { error: delErr } = await auth.db.from('monetizacion_planes').delete().eq('id', id);
    if (delErr) throw delErr;

    return NextResponse.json({
      ok: true,
      softDeleted: false,
      message: 'Plan eliminado.',
    });
  } catch (err) {
    console.error('[admin/plan-financiero DELETE]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
