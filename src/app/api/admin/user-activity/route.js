import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  buildConnectionAnalytics,
  buildSessionChartSeries,
  isUserOnline,
  formatSessionDuration,
} from '@/lib/userActivity';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import { userHasRole } from '@/utils/authRoles';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

export async function GET(req) {
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

    const isAdmin = await userHasRole(
      authData.user.id,
      ['admin', 'administrador'],
      authData.user.email,
    );
    if (!isAdmin) {
      return NextResponse.json({ error: 'Sin permiso.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'meses';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const serviceKey = getSupabaseServiceRoleKey()?.trim();
    const db = serviceKey
      ? createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });

    const [presenceRes, sessionsRes] = await Promise.all([
      db.from('usuario_presencia').select('user_id, last_seen_at, total_session_seconds'),
      db
        .from('usuario_sesiones_app')
        .select('user_id, started_at, duration_seconds')
        .order('started_at', { ascending: false })
        .limit(10000),
    ]);

    if (presenceRes.error) {
      console.error('[admin/user-activity] presence', presenceRes.error);
    }
    if (sessionsRes.error) {
      console.error('[admin/user-activity] sessions', sessionsRes.error);
    }

    const byUser = {};
    for (const row of presenceRes.data || []) {
      byUser[row.user_id] = {
        online: isUserOnline(row.last_seen_at),
        lastSeenAt: row.last_seen_at,
        totalSessionSeconds: Number(row.total_session_seconds) || 0,
        totalSessionLabel: formatSessionDuration(row.total_session_seconds),
      };
    }

    const sessions = sessionsRes.data || [];
    const chart = buildSessionChartSeries(sessions, period, startDate, endDate);
    const connection = buildConnectionAnalytics(sessions, startDate, endDate);

    return NextResponse.json({ byUser, chart, connection });
  } catch (err) {
    console.error('[admin/user-activity]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
