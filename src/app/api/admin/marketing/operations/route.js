import { NextResponse } from 'next/server';
import { authenticateMarketingPlanAdminRequest } from '@/lib/adminAccess';
import { isSchemaNotReadyError } from '@/lib/teacherAccess';
import { monthlyPlanRevenueEur, stopsForVisit, summarizeMarketingOperations } from '@/lib/marketingOperations';
import { subscriptionGrantsAccess } from '@/lib/stripe/server';

export const dynamic = 'force-dynamic';

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

export async function GET(req) {
  try {
    const auth = await authenticateMarketingPlanAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const db = auth.db;
    const { data: visitors, error: visitorsError } = await db
      .from('marketing_visitors')
      .select('visitor_id, user_id, created_at, last_ip, first_source, first_landing_page')
      .order('created_at', { ascending: false })
      .limit(500);
    if (visitorsError) throw visitorsError;

    const visible = (visitors || []).filter((row) => row.visitor_id && !isLocalAdminIp(row.last_ip));
    const visitorIds = visible.map((row) => row.visitor_id);
    const [pages, subscriptionsResult] = await Promise.all([
      loadPages(db, visitorIds),
      db.from('suscripciones').select('user_id, plan_id, status, interval'),
    ]);

    const pagesByVisitor = new Map();
    for (const page of pages) {
      const list = pagesByVisitor.get(page.visitor_id) || [];
      list.push(page);
      pagesByVisitor.set(page.visitor_id, list);
    }

    const visits = visible.map((row) => ({
      id: row.visitor_id,
      userId: row.user_id || null,
      createdAt: row.created_at || null,
      source: row.first_source || '',
      landing: row.first_landing_page || '',
      stops: stopsForVisit(pagesByVisitor.get(row.visitor_id) || [], row.first_landing_page || ''),
    }));

    const subscriptions = subscriptionsResult.error
      ? []
      : (subscriptionsResult.data || []).map((row) => ({
          userId: row.user_id,
          planId: row.plan_id,
          interval: row.interval,
          grantsAccess: subscriptionGrantsAccess(row.status),
          monthlyEur: monthlyPlanRevenueEur(row.plan_id, row.interval),
        }));

    return NextResponse.json(summarizeMarketingOperations({ visits, subscriptions }));
  } catch (err) {
    console.error('[api/admin/marketing/operations] GET', err);
    return NextResponse.json(
      { error: err?.message || 'No se pudieron cargar las métricas de marketing.' },
      { status: 500 },
    );
  }
}
