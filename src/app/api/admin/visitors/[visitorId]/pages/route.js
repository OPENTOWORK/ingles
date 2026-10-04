import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { isSchemaNotReadyError } from '@/lib/teacherAccess';
import { isValidVisitorId } from '@/lib/marketing/crm/constants';
import {
  fallbackJourneyFromVisit,
  mergeVisitorJourneySources,
} from '@/lib/visitorJourney';

const VISIT_WINDOW_BEFORE_MS = 2 * 60 * 1000;
const VISIT_WINDOW_AFTER_MS = 5 * 60 * 1000;

function withinVisitWindow(value, startMs, endMs) {
  if (!value) return false;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return false;
  return time >= startMs && time <= endMs;
}

export async function GET(req, { params }) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const visitorId = String(params?.visitorId || '').trim();
    if (!isValidVisitorId(visitorId)) {
      return NextResponse.json({ error: 'Visitante no válido.' }, { status: 400 });
    }

    const db = auth.db;
    const { data: visitor, error: visitorError } = await db
      .from('marketing_visitors')
      .select('visitor_id, user_id, created_at, last_seen_at, first_landing_page')
      .eq('visitor_id', visitorId)
      .maybeSingle();

    if (visitorError) throw visitorError;
    if (!visitor) {
      return NextResponse.json({ error: 'Visita no encontrada.' }, { status: 404 });
    }

    const startMs = new Date(visitor.created_at).getTime() - VISIT_WINDOW_BEFORE_MS;
    const lastSeen = visitor.last_seen_at || visitor.created_at;
    const endMs = new Date(lastSeen).getTime() + VISIT_WINDOW_AFTER_MS;
    const [pagesRes, userPagesRes, eventsRes] = await Promise.all([
      db
        .from('marketing_visitor_pages')
        .select('id, path, page_title, visited_at, duration_seconds')
        .eq('visitor_id', visitorId)
        .order('visited_at', { ascending: false })
        .limit(300),
      visitor.user_id
        ? db
            .from('usuario_navegacion')
            .select('id, path, page_title, visited_at, duration_seconds')
            .eq('user_id', visitor.user_id)
            .order('visited_at', { ascending: false })
            .limit(300)
        : Promise.resolve({ data: [], error: null }),
      db
        .from('marketing_events')
        .select('event_public_id, page_url, event_timestamp, metadata')
        .eq('visitor_id', visitorId)
        .eq('event_name', 'page_view')
        .order('event_timestamp', { ascending: false })
        .limit(200),
    ]);

    const visitorPagesReady = !pagesRes.error || isSchemaNotReadyError(pagesRes.error);
    if (pagesRes.error && !isSchemaNotReadyError(pagesRes.error)) throw pagesRes.error;

    const userPagesReady = !userPagesRes.error || isSchemaNotReadyError(userPagesRes.error);
    if (userPagesRes.error && !isSchemaNotReadyError(userPagesRes.error)) {
      console.error('[admin/visitors/pages] user pages', userPagesRes.error);
    }

    const eventsReady = !eventsRes.error || isSchemaNotReadyError(eventsRes.error);
    if (eventsRes.error && !isSchemaNotReadyError(eventsRes.error)) {
      console.error('[admin/visitors/pages] events', eventsRes.error);
    }

    const visitorPages = visitorPagesReady ? pagesRes.data || [] : [];
    const userPages = (userPagesReady ? userPagesRes.data || [] : []).filter((row) =>
      withinVisitWindow(row.visited_at, startMs, endMs),
    );
    const eventPages = (eventsReady ? eventsRes.data || [] : []).map((row) => ({
      id: row.event_public_id,
      path: row.page_url,
      visited_at: row.event_timestamp,
      duration_seconds: Number(row.metadata?.duration_seconds) || 0,
    }));

    const pages = mergeVisitorJourneySources({
      visitorPages,
      userPages,
      eventPages,
      fallback: fallbackJourneyFromVisit({
        landing: visitor.first_landing_page,
        seenAt: visitor.created_at,
        // No measured duration: do not assign days between visits to the landing page.
      }),
    });

    return NextResponse.json({
      visitorId,
      userId: visitor.user_id || null,
      pages,
    });
  } catch (err) {
    console.error('[admin/visitors/pages]', err);
    return NextResponse.json({ error: 'No se pudo cargar el recorrido.' }, { status: 500 });
  }
}
