import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPageTitleForPath } from '@/lib/pageViewLabels';
import { isSchemaNotReadyError } from '@/lib/teacherAccess';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { isValidVisitorId } from '@/lib/marketing/crm/constants';
import {
  getClientIpFromRequest,
  tryConsumeMarketingIngestRate,
} from '@/lib/marketing/crm/rateLimit';
import { isTrackedPublicPath } from '@/lib/visitorPresence';
import { normalizeVisitPath } from '@/lib/visitorJourney';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

function getServiceClient() {
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  if (!serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function POST(req) {
  try {
    const ip = getClientIpFromRequest(req);
    if (!tryConsumeMarketingIngestRate(ip, 'activity:page-view')) {
      return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 });
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    let user = null;
    if (token) {
      const authClient = createClient(supabaseUrl, supabaseAnonKey);
      const { data: authData, error: authError } = await authClient.auth.getUser(token);
      if (!authError && authData?.user) user = authData.user;
    }

    const body = await req.json().catch(() => ({}));
    const visitorId = String(body?.visitorId || '').trim();
    const validVisitor = isValidVisitorId(visitorId);
    if (!user && !validVisitor) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const path = normalizeVisitPath(body?.path);
    if (!path || path.length > 500 || !isTrackedPublicPath(path)) {
      return NextResponse.json({ error: 'Ruta no válida.' }, { status: 400 });
    }

    const durationSeconds = Math.min(Math.max(Number(body?.durationSeconds) || 0, 0), 86400);
    if (durationSeconds < 2) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const pageTitle =
      String(body?.pageTitle || '').trim().slice(0, 200) || getPageTitleForPath(path);
    const visitedAt = body?.visitedAt
      ? new Date(body.visitedAt).toISOString()
      : new Date().toISOString();

    const db = getServiceClient();
    if (!db) {
      return NextResponse.json({ error: 'Servidor sin configurar.' }, { status: 503 });
    }

    if (validVisitor) {
      const seenAt = new Date().toISOString();
      const { error: insertVisitorError } = await db.from('marketing_visitors').insert({
        visitor_id: visitorId,
        last_seen_at: seenAt,
        ...(user?.id ? { user_id: user.id, identified_at: seenAt } : {}),
      });
      if (insertVisitorError && insertVisitorError.code !== '23505') {
        console.error('[activity/page-view] visitor', insertVisitorError);
      }

      const { error: pageError } = await db.from('marketing_visitor_pages').insert({
        visitor_id: visitorId,
        user_id: user?.id || null,
        path,
        page_title: pageTitle,
        visited_at: visitedAt,
        duration_seconds: durationSeconds,
      });
      if (pageError && !isSchemaNotReadyError(pageError)) {
        console.error('[activity/page-view] visitor page', pageError);
      }
    }

    const skipAccountNav =
      process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEV_FULL_TRACKING !== '1';

    if (user && !skipAccountNav) {
      const { error } = await db.from('usuario_navegacion').insert({
        user_id: user.id,
        path,
        page_title: pageTitle,
        visited_at: visitedAt,
        duration_seconds: durationSeconds,
      });

      if (error) {
        if (isSchemaNotReadyError(error)) {
          return NextResponse.json({ ok: true, navigationReady: false });
        }
        console.error('[activity/page-view]', error);
        return NextResponse.json({ error: 'No se pudo registrar la visita.' }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, navigationReady: true });
  } catch (err) {
    console.error('[activity/page-view]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
