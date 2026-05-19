import { NextResponse } from 'next/server';
import {
  buildConnectionAnalytics,
  buildSessionChartSeries,
  formatSessionDuration,
  isUserOnline,
} from '@/lib/userActivity';
import { authenticateTeacherRequest } from '@/lib/teacherAccess';

export async function GET(req) {
  try {
    const auth = await authenticateTeacherRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'meses';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const alumnoId = searchParams.get('alumnoId') || '';

    const { db, studentIds } = auth;
    const ids = alumnoId && studentIds.includes(alumnoId) ? [alumnoId] : studentIds;

    if (!ids.length) {
      return NextResponse.json({
        byUser: {},
        chart: [],
        connection: {
          totalSessionLabel: '0 s',
          sessionCount: 0,
          activeUsers: 0,
          avgPerUserLabel: '0 s',
          horaPico: '-',
          diaPico: '-',
          heatmap: [],
        },
      });
    }

    const [presenceRes, sessionsRes, profilesRes] = await Promise.all([
      db.from('usuario_presencia').select('user_id, last_seen_at, total_session_seconds').in('user_id', ids),
      db
        .from('usuario_sesiones_app')
        .select('user_id, started_at, duration_seconds')
        .in('user_id', ids)
        .order('started_at', { ascending: false })
        .limit(10000),
      db.from('Usuarios_y_Perfil_users').select('id, email, nombre').in('id', ids),
    ]);

    const nameById = {};
    for (const p of profilesRes.data || []) {
      nameById[p.id] = p.nombre || p.email;
    }

    const byUser = {};
    for (const row of presenceRes.data || []) {
      byUser[row.user_id] = {
        name: nameById[row.user_id] || row.user_id,
        online: isUserOnline(row.last_seen_at),
        lastSeenAt: row.last_seen_at,
        totalSessionSeconds: Number(row.total_session_seconds) || 0,
        totalSessionLabel: formatSessionDuration(row.total_session_seconds),
      };
    }

    for (const id of ids) {
      if (!byUser[id]) {
        byUser[id] = {
          name: nameById[id] || id,
          online: false,
          lastSeenAt: null,
          totalSessionSeconds: 0,
          totalSessionLabel: '0 s',
        };
      }
    }

    const sessions = sessionsRes.data || [];
    const sessionCountByUser = {};
    for (const s of sessions) {
      sessionCountByUser[s.user_id] = (sessionCountByUser[s.user_id] || 0) + 1;
    }
    for (const [uid, meta] of Object.entries(byUser)) {
      meta.sessionCount = sessionCountByUser[uid] || 0;
    }

    const chart = buildSessionChartSeries(sessions, period, startDate, endDate);
    const connection = buildConnectionAnalytics(sessions, startDate, endDate);

    return NextResponse.json({ byUser, chart, connection });
  } catch (err) {
    console.error('[teacher/user-activity]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
