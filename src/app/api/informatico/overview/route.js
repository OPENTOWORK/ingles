import { NextResponse } from 'next/server';
import { authenticateItRequest } from '@/lib/itAccess';
import { isUserOnline } from '@/lib/userActivity';
import { normalizeRoleName } from '@/utils/authRoles';
import { TICKET_STATUS } from '@/utils/contactModuleConfig';

export async function GET(req) {
  try {
    const auth = await authenticateItRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { db } = auth;
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const [usersRes, rolesRes, presenceRes, ticketsRes, authFailRes, sessionsRes] =
      await Promise.all([
        db.from('Usuarios_y_Perfil_users').select('id, activo, rol_id'),
        db.from('Usuarios_y_Perfil_roles').select('id, nombre'),
        db.from('usuario_presencia').select('user_id, last_seen_at'),
        db
          .from('contacto_soporte')
          .select('id, estado', { count: 'exact', head: true })
          .eq('estado', TICKET_STATUS.UNANSWERED),
        db
          .from('auth_sesiones')
          .select('id', { count: 'exact', head: true })
          .eq('exitoso', false)
          .gte('creado_en', dayAgo),
        db
          .from('usuario_sesiones_app')
          .select('id', { count: 'exact', head: true })
          .gte('started_at', dayAgo),
      ]);

    const users = usersRes.data || [];
    const roleNameById = Object.fromEntries(
      (rolesRes.data || []).map((r) => [r.id, normalizeRoleName(r.nombre)]),
    );

    const roleCounts = {};
    let activeUsers = 0;
    for (const u of users) {
      if (u.activo !== false) activeUsers += 1;
      const rn = roleNameById[u.rol_id] || 'otro';
      roleCounts[rn] = (roleCounts[rn] || 0) + 1;
    }

    let onlineNow = 0;
    for (const p of presenceRes.data || []) {
      if (isUserOnline(p.last_seen_at)) onlineNow += 1;
    }

    return NextResponse.json({
      totalUsers: users.length,
      activeUsers,
      onlineNow,
      roleCounts,
      pendingTickets: ticketsRes.count ?? 0,
      failedLogins24h: authFailRes.count ?? 0,
      appSessions24h: sessionsRes.count ?? 0,
    });
  } catch (err) {
    console.error('[informatico/overview]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
