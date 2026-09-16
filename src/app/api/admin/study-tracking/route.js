import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { isSchemaNotReadyError } from '@/lib/teacherAccess';
import { buildStudyFocusByUser, summarizeStudyFocus } from '@/lib/studyFocus';
import { buildStudyReport } from '@/lib/studySession';
import { SEGUIMIENTO_SESIONES_TABLE } from '@/lib/studySessionServer';
import { isStarredTeamMember, resolveStarredTeamUserIds } from '@/lib/adminStarredUsers';

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const excludeStaff = searchParams.get('excludeStaff') === '1';

    const { db } = auth;

    const [navRes, sessionsRes, monitoredRes] = await Promise.all([
      db
        .from('usuario_navegacion')
        .select('user_id, path, page_title, visited_at, duration_seconds')
        .order('visited_at', { ascending: false })
        .limit(20000),
      db
        .from('usuario_sesiones_app')
        .select('user_id, started_at, duration_seconds')
        .order('started_at', { ascending: false })
        .limit(10000),
      db
        .from(SEGUIMIENTO_SESIONES_TABLE)
        .select('*')
        .eq('status', 'finalizada')
        .order('started_at', { ascending: false })
        .limit(50),
    ]);

    const navigationReady = !navRes.error || !isSchemaNotReadyError(navRes.error);
    if (navRes.error && navigationReady) {
      console.error('[admin/study-tracking] navigation', navRes.error);
    }
    if (sessionsRes.error) {
      console.error('[admin/study-tracking] sessions', sessionsRes.error);
    }

    const starredUserIds = excludeStaff ? await resolveStarredTeamUserIds(db) : null;
    const keepUser = (userId) => !isStarredTeamMember(starredUserIds, userId);

    const pageViews = ((navigationReady ? navRes.data : null) || []).filter((row) =>
      keepUser(row.user_id),
    );
    const sessions = (sessionsRes.data || []).filter((row) => keepUser(row.user_id));

    const users = buildStudyFocusByUser(pageViews, sessions, { startDate, endDate });
    const summary = summarizeStudyFocus(users);

    const monitored = (monitoredRes.data || []).filter((row) => keepUser(row.user_id));

    const userIds = Array.from(
      new Set([...users.map((row) => row.userId), ...monitored.map((row) => String(row.user_id))]),
    );
    const profileById = new Map();
    if (userIds.length > 0) {
      const [profilesRes, legacyRes] = await Promise.all([
        db.from('user_profiles').select('id, email, nombre').in('id', userIds),
        db.from('Usuarios_y_Perfil_users').select('id, email, nombre').in('id', userIds),
      ]);
      for (const row of profilesRes.data || []) {
        profileById.set(String(row.id), row);
      }
      for (const row of legacyRes.data || []) {
        const key = String(row.id);
        if (!profileById.has(key)) profileById.set(key, row);
      }
    }

    return NextResponse.json({
      summary,
      users: users.map((row) => {
        const profile = profileById.get(row.userId);
        return {
          ...row,
          name: profile?.nombre || '—',
          email: profile?.email || '—',
        };
      }),
      monitoredSessions: monitored.map((row) => {
        const profile = profileById.get(String(row.user_id));
        return {
          ...buildStudyReport(row),
          name: profile?.nombre || '—',
          email: profile?.email || '—',
          resumen: row.resumen || null,
        };
      }),
      navigationReady,
      appliedExcludeStaff: excludeStaff,
      excludedStaffCount: starredUserIds?.size ?? 0,
    });
  } catch (err) {
    console.error('[admin/study-tracking]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
