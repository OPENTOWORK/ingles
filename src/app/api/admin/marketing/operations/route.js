import { NextResponse } from 'next/server';
import { authenticateMarketingPlanAdminRequest } from '@/lib/adminAccess';
import { isSchemaNotReadyError } from '@/lib/teacherAccess';
import { readAllMarketingRows, readMarketingRowsByIds } from '@/lib/marketingMetrics';
import {
  monthBoundsIso,
  monthlyPlanRevenueEur,
  monthsSpanning,
  signupVisitIds,
  stopsForVisit,
  summarizeMarketingOperations,
  visitMonthKey,
} from '@/lib/marketingOperations';
import { subscriptionGrantsAccess } from '@/lib/stripe/server';
import { isStudentRole } from '@/utils/authRoles';

export const dynamic = 'force-dynamic';

const NO_STORE = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
};

function isLocalAdminIp(ip) {
  const value = String(ip || '').trim().toLowerCase().replace(/^::ffff:/, '');
  return value === '::1' || value === '127.0.0.1' || value === 'localhost';
}

async function loadPages(db, visitorIds) {
  const rows = [];
  const chunkSize = 100;
  for (let index = 0; index < visitorIds.length; index += chunkSize) {
    const chunk = visitorIds.slice(index, index + chunkSize);
    let from = 0;
    for (;;) {
      const { data, error } = await db
        .from('marketing_visitor_pages')
        .select('visitor_id, path, page_title, visited_at')
        .in('visitor_id', chunk)
        .order('visited_at', { ascending: true })
        .range(from, from + 999);
      if (error) {
        if (isSchemaNotReadyError(error)) return rows;
        throw error;
      }
      rows.push(...(data || []));
      if (!data || data.length < 1000) break;
      from += 1000;
    }
  }
  return rows;
}

async function loadAccountContext(db, userIds) {
  const createdAtByUser = new Map();
  const staffIds = new Set();
  if (!userIds.length) return { createdAtByUser, staffIds };
  let profiles = [];
  try {
    profiles = await readMarketingRowsByIds(userIds, (ids) => db
      .from('Usuarios_y_Perfil_users')
      .select('id, rol_id, creado_en')
      .in('id', ids)
      .order('id'));
  } catch {
    return { createdAtByUser, staffIds };
  }
  const roleIds = [...new Set(profiles.map((row) => row.rol_id).filter(Boolean))];
  const roleNameById = new Map();
  if (roleIds.length) {
    const { data: roles } = await db
      .from('Usuarios_y_Perfil_roles')
      .select('id, nombre')
      .in('id', roleIds);
    for (const role of roles || []) roleNameById.set(String(role.id), role.nombre || '');
  }
  for (const profile of profiles) {
    if (profile.creado_en) createdAtByUser.set(profile.id, profile.creado_en);
    const roleName = roleNameById.get(String(profile.rol_id)) || '';
    if (roleName && !isStudentRole(roleName)) staffIds.add(profile.id);
  }
  return { createdAtByUser, staffIds };
}

export async function GET(req) {
  try {
    const auth = await authenticateMarketingPlanAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = auth.db;
    const requestedMonth = new URL(req.url).searchParams.get('month') || 'all';
    const [oldestResult, newestResult] = await Promise.all([
      db.from('marketing_visitors').select('created_at').order('created_at', { ascending: true }).limit(1),
      db.from('marketing_visitors').select('created_at').order('created_at', { ascending: false }).limit(1),
    ]);
    if (oldestResult.error) throw oldestResult.error;
    if (newestResult.error) throw newestResult.error;
    const months = monthsSpanning(
      oldestResult.data?.[0]?.created_at,
      newestResult.data?.[0]?.created_at,
    );
    const month = requestedMonth === 'latest' ? (months[0] || 'all') : requestedMonth;
    const bounds = month === 'all' ? null : monthBoundsIso(month);
    const visitors = await readAllMarketingRows(() => {
      let query = db
        .from('marketing_visitors')
        .select('visitor_id, user_id, created_at, last_ip, first_source, first_landing_page')
        .order('created_at', { ascending: false })
        .order('visitor_id');
      if (bounds) query = query.gte('created_at', bounds.start).lt('created_at', bounds.end);
      return query;
    });

    const visible = visitors.filter((row) => row.visitor_id && !isLocalAdminIp(row.last_ip));
    const inPeriod = month === 'all'
      ? visible
      : visible.filter((row) => visitMonthKey(row.created_at) === month);
    const visitorIds = inPeriod.map((row) => row.visitor_id);
    const userIds = [...new Set(inPeriod.map((row) => row.user_id).filter(Boolean))];
    const [pages, subscriptionsResult, accountContext] = await Promise.all([
      loadPages(db, visitorIds),
      db.from('suscripciones').select('user_id, plan_id, status, interval'),
      loadAccountContext(db, userIds),
    ]);

    const pagesByVisitor = new Map();
    for (const page of pages) {
      const list = pagesByVisitor.get(page.visitor_id) || [];
      list.push(page);
      pagesByVisitor.set(page.visitor_id, list);
    }

    const visits = inPeriod.map((row) => ({
      id: row.visitor_id,
      userId: row.user_id || null,
      createdAt: row.created_at || null,
      source: row.first_source || '',
      landing: row.first_landing_page || '',
      staff: accountContext.staffIds.has(row.user_id),
      stops: stopsForVisit(pagesByVisitor.get(row.visitor_id) || [], row.first_landing_page || ''),
    }));
    const signups = signupVisitIds(visits, accountContext.createdAtByUser);
    for (const visit of visits) visit.signedUp = signups.has(visit.id);

    const subscriptions = subscriptionsResult.error
      ? []
      : (subscriptionsResult.data || []).map((row) => ({
          userId: row.user_id,
          planId: row.plan_id,
          interval: row.interval,
          grantsAccess: subscriptionGrantsAccess(row.status),
          monthlyEur: monthlyPlanRevenueEur(row.plan_id, row.interval),
        }));

    return NextResponse.json({
      ...summarizeMarketingOperations({ visits, subscriptions }),
      month,
      months,
    }, { headers: NO_STORE });
  } catch (err) {
    console.error('[api/admin/marketing/operations] GET', err);
    return NextResponse.json(
      { error: err?.message || 'No se pudieron cargar las métricas de marketing.' },
      { status: 500, headers: NO_STORE },
    );
  }
}
