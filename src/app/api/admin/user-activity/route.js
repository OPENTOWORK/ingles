import { NextResponse } from 'next/server';
import {
  buildActiveUsersActivityReport,
  buildConnectionAnalytics,
  buildSessionChartSeries,
  isUserOnline,
  formatSessionDuration,
  withinDateRange,
} from '@/lib/userActivity';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { isStarredTeamMember, resolveStarredTeamUserIds } from '@/lib/adminStarredUsers';
import { classifyStudyPath } from '@/lib/studyFocus';

async function resolveUserIdsForRoleFilter(db, roleId) {
  if (!roleId || roleId === 'all') return null;

  const ids = new Set();
  const roleKeys = new Set([String(roleId)]);
  const numeric = Number(roleId);
  if (Number.isFinite(numeric)) {
    roleKeys.add(numeric);
  }

  for (const key of roleKeys) {
    const { data, error } = await db.from('Usuarios_y_Perfil_users').select('id').eq('rol_id', key);
    if (error) {
      console.error('[admin/user-activity] role filter users', error);
    } else {
      for (const row of data || []) ids.add(row.user_id ?? row.id);
    }

    const profileRes = await db.from('user_profiles').select('id').eq('rol_id', key);
    if (profileRes.error) {
      console.error('[admin/user-activity] role filter profiles', profileRes.error);
    } else {
      for (const row of profileRes.data || []) ids.add(row.id);
    }
  }

  return ids;
}

export async function GET(req) {
  try {
    const auth = await authenticateAdminRequest(req, ['admin']);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'meses';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const roleId = searchParams.get('roleId') || '';
    const userIdFilter = String(searchParams.get('userId') || '').trim();
    const excludeStaff = searchParams.get('excludeStaff') === '1';

    const db = auth.db;
    const starredUserIds = excludeStaff ? await resolveStarredTeamUserIds(db) : null;

    const [presenceRes, sessionsRes, navigationRes] = await Promise.all([
      db.from('usuario_presencia').select('user_id, last_seen_at, total_session_seconds'),
      db
        .from('usuario_sesiones_app')
        .select('user_id, started_at, duration_seconds')
        .order('started_at', { ascending: false })
        .limit(10000),
      db
        .from('usuario_navegacion')
        .select('user_id, path, visited_at, duration_seconds')
        .order('visited_at', { ascending: false })
        .limit(20000),
    ]);

    if (presenceRes.error) {
      console.error('[admin/user-activity] presence', presenceRes.error);
    }
    if (sessionsRes.error) {
      console.error('[admin/user-activity] sessions', sessionsRes.error);
    }
    if (navigationRes.error) {
      console.error('[admin/user-activity] navigation', navigationRes.error);
    }

    const byUser = {};
    for (const row of presenceRes.data || []) {
      if (isStarredTeamMember(starredUserIds, row.user_id)) continue;
      byUser[row.user_id] = {
        online: isUserOnline(row.last_seen_at),
        lastSeenAt: row.last_seen_at,
        totalSessionSeconds: Number(row.total_session_seconds) || 0,
        totalSessionLabel: formatSessionDuration(row.total_session_seconds),
      };
    }

    let sessions = (sessionsRes.data || []).filter(
      (row) => !isStarredTeamMember(starredUserIds, row.user_id),
    );
    const allowedUserIds = await resolveUserIdsForRoleFilter(db, roleId);
    if (allowedUserIds !== null) {
      sessions = sessions.filter((row) => allowedUserIds.has(row.user_id));
    }
    if (userIdFilter) {
      sessions = sessions.filter((row) => String(row.user_id) === userIdFilter);
    }

    const chart = buildSessionChartSeries(sessions, period, startDate, endDate);
    const connection = buildConnectionAnalytics(sessions, startDate, endDate);
    const activeUsersBase = buildActiveUsersActivityReport(sessions, startDate, endDate);

    const studySecondsByUser = new Map();
    for (const row of navigationRes.data || []) {
      if (isStarredTeamMember(starredUserIds, row.user_id)) continue;
      if (!row.user_id || !withinDateRange(row.visited_at, startDate, endDate)) continue;
      if (allowedUserIds !== null && !allowedUserIds.has(row.user_id)) continue;
      if (userIdFilter && String(row.user_id) !== userIdFilter) continue;

      const { isStudy } = classifyStudyPath(row.path);
      if (!isStudy) continue;

      const key = String(row.user_id);
      const seconds = Math.max(0, Number(row.duration_seconds) || 0);
      studySecondsByUser.set(key, (studySecondsByUser.get(key) || 0) + seconds);
    }

    const profileIds = activeUsersBase.map((row) => row.userId);
    const profileById = new Map();
    if (profileIds.length > 0) {
      const [profilesRes, legacyUsersRes] = await Promise.all([
        db.from('user_profiles').select('id, email, nombre').in('id', profileIds),
        db.from('Usuarios_y_Perfil_users').select('id, email, nombre').in('id', profileIds),
      ]);
      for (const row of profilesRes.data || []) {
        profileById.set(String(row.id), row);
      }
      for (const row of legacyUsersRes.data || []) {
        const key = String(row.id);
        if (!profileById.has(key)) profileById.set(key, row);
      }
    }

    const activeUsers = activeUsersBase.map((row) => {
      const profile = profileById.get(row.userId);
      const rawStudySeconds = studySecondsByUser.get(row.userId) || 0;
      const studySeconds = Math.min(row.totalSeconds, rawStudySeconds);
      const studyRatio =
        row.totalSeconds > 0 ? Math.round((studySeconds / row.totalSeconds) * 100) : 0;

      return {
        ...row,
        name: profile?.nombre || profile?.name || '—',
        email: profile?.email || '—',
        studySeconds,
        studyLabel: formatSessionDuration(studySeconds),
        studyRatio,
      };
    });

    const totalStudySeconds = activeUsers.reduce((sum, row) => sum + (row.studySeconds || 0), 0);
    const connectionWithStudy = {
      ...connection,
      studySeconds: totalStudySeconds,
      studyLabel: formatSessionDuration(totalStudySeconds),
      studyRatio:
        connection.totalSessionSeconds > 0
          ? Math.round((totalStudySeconds / connection.totalSessionSeconds) * 100)
          : 0,
    };

    return NextResponse.json({
      byUser,
      chart,
      connection: connectionWithStudy,
      activeUsers,
      appliedRoleId: roleId && roleId !== 'all' ? String(roleId) : 'all',
      appliedUserId: userIdFilter || '',
      appliedExcludeStaff: excludeStaff,
      excludedStaffCount: starredUserIds?.size ?? 0,
    });
  } catch (err) {
    console.error('[admin/user-activity]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
