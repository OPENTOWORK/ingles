import { NextResponse } from 'next/server';
import {
  buildConnectionAnalytics,
  buildSessionChartSeries,
  isUserOnline,
  formatSessionDuration,
} from '@/lib/userActivity';
import { authenticateAdminRequest } from '@/lib/adminAccess';

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'meses';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const db = auth.db;

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
