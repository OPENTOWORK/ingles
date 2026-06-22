import { NextResponse } from 'next/server';
import {
  buildActiveUsersActivityReport,
  buildConnectionAnalytics,
  buildSessionChartSeries,
  isUserOnline,
  formatSessionDuration,
} from '@/lib/userActivity';
import { authenticateAdminRequest } from '@/lib/adminAccess';

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
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'meses';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const roleId = searchParams.get('roleId') || '';
    const userIdFilter = String(searchParams.get('userId') || '').trim();

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

    let sessions = sessionsRes.data || [];
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
      return {
        ...row,
        name: profile?.nombre || profile?.name || '—',
        email: profile?.email || '—',
      };
    });

    return NextResponse.json({
      byUser,
      chart,
      connection,
      activeUsers,
      appliedRoleId: roleId && roleId !== 'all' ? String(roleId) : 'all',
      appliedUserId: userIdFilter || '',
    });
  } catch (err) {
    console.error('[admin/user-activity]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
