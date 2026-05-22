import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPageTitleForPath } from '@/lib/pageViewLabels';
import { isSchemaNotReadyError } from '@/lib/teacherAccess';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const path = String(body?.path || '').trim();
    if (!path || path.length > 500) {
      return NextResponse.json({ error: 'Ruta no válida.' }, { status: 400 });
    }

    const durationSeconds = Math.min(
      Math.max(Number(body?.durationSeconds) || 0, 0),
      86400,
    );
    if (durationSeconds < 2) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const pageTitle =
      String(body?.pageTitle || '').trim().slice(0, 200) ||
      getPageTitleForPath(path);

    const serviceKey = getSupabaseServiceRoleKey()?.trim();
    const db = serviceKey
      ? createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });

    const visitedAt = body?.visitedAt
      ? new Date(body.visitedAt).toISOString()
      : new Date().toISOString();

    const { error } = await db.from('usuario_navegacion').insert({
      user_id: authData.user.id,
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

    return NextResponse.json({ ok: true, navigationReady: true });
  } catch (err) {
    console.error('[activity/page-view]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
