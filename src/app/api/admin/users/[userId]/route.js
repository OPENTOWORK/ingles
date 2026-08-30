import { NextResponse } from 'next/server';
import { authenticateAdminRequest } from '@/lib/adminAccess';
import { getSupabaseServiceRoleKey } from '@/lib/supabaseEnv';
import { getPageTitleForPath } from '@/lib/pageViewLabels';
import { isSchemaNotReadyError } from '@/lib/teacherAccess';
import {
  formatSessionDuration,
  formatDeviceTypeLabel,
  groupSessionsByDate,
  isUserOnline,
  withinDateRange,
} from '@/lib/userActivity';

async function loadProfile(db, userId) {
  const variants = [
    'id, email, nombre, rol_id, creado_en, activo',
    'id, email, nombre, rol_id, creado_en',
  ];

  for (const selectClause of variants) {
    const { data, error } = await db
      .from('user_profiles')
      .select(selectClause)
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) return data;
    if (error && !String(error.message || '').includes('column')) break;
  }

  const { data, error } = await db
    .from('Usuarios_y_Perfil_users')
    .select('id, email, nombre, rol_id, creado_en, activo')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function deleteAppUserRows(db, userId) {
  const cleanupTables = [
  { table: 'DraloIA_nivel_usuario', column: 'id_usuario' },
  { table: 'Usuarios_y_Perfil_profiles', column: 'user_id' },
  ];

  for (const { table, column } of cleanupTables) {
    const { error } = await db.from(table).delete().eq(column, userId);
    if (error && !String(error.message || '').includes('does not exist')) {
      console.warn(`[admin/users DELETE] cleanup ${table}:`, error.message);
    }
  }

  const deleteAttempts = [
    () => db.from('Usuarios_y_Perfil_users').delete().eq('id', userId),
    () => db.from('user_profiles').delete().eq('id', userId),
  ];

  for (const run of deleteAttempts) {
    const { error } = await run();
    if (!error) return;
    if (!String(error.message || '').includes('does not exist')) {
      console.warn('[admin/users DELETE] app user row:', error.message);
    }
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const userId = String((await params)?.userId || '').trim();
    if (!userId) {
      return NextResponse.json({ error: 'Usuario no válido.' }, { status: 400 });
    }

    if (userId === auth.user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta de administrador.' },
        { status: 400 },
      );
    }

    if (!getSupabaseServiceRoleKey()?.trim()) {
      return NextResponse.json(
        { error: 'Eliminación completa no configurada (falta service role).' },
        { status: 503 },
      );
    }

    const { db } = auth;
    await deleteAppUserRows(db, userId);

    const { error: authDeleteError } = await db.auth.admin.deleteUser(userId);
    if (authDeleteError) {
      const msg = String(authDeleteError.message || '').toLowerCase();
      const notFound =
        msg.includes('not found') || msg.includes('user not found') || authDeleteError.status === 404;
      if (!notFound) {
        console.error('[admin/users DELETE] auth:', authDeleteError);
        return NextResponse.json(
          { error: authDeleteError.message || 'No se pudo eliminar la cuenta de autenticación.' },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/users/[userId] DELETE]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const auth = await authenticateAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const userId = String((await params)?.userId || '').trim();
    if (!userId) {
      return NextResponse.json({ error: 'Usuario no válido.' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const navOnly = searchParams.get('navOnly') === '1';

    const { db } = auth;

    const profile = await loadProfile(db, userId);
    if (!profile) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    if (navOnly) {
      const navRes = await db
        .from('usuario_navegacion')
        .select('id, path, page_title, visited_at, duration_seconds')
        .eq('user_id', userId)
        .order('visited_at', { ascending: false })
        .limit(500);

      const navigationReady = !navRes.error || !isSchemaNotReadyError(navRes.error);
      const pageViews = ((navigationReady ? navRes.data : null) || [])
        .filter((row) => withinDateRange(row.visited_at, startDate, endDate))
        .map((row) => {
          const visited = row.visited_at ? new Date(row.visited_at) : null;
          const sec = Number(row.duration_seconds) || 0;
          return {
            id: row.id,
            path: row.path,
            pageTitle: row.page_title || getPageTitleForPath(row.path),
            visitedAt: row.visited_at,
            visitedLabel: visited
              ? visited.toLocaleString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—',
            durationSeconds: sec,
            durationLabel: formatSessionDuration(sec),
          };
        });

      return NextResponse.json({ pageViews, navigationReady });
    }

    const [presenceRes, sessionsRes, placementRes, navRes, rolesRes] = await Promise.all([
      db
        .from('usuario_presencia')
        .select('user_id, last_seen_at, total_session_seconds')
        .eq('user_id', userId)
        .maybeSingle(),
      db
        .from('usuario_sesiones_app')
        .select('id, started_at, ended_at, duration_seconds, device_type')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(500),
      db
        .from('placement_results')
        .select('nivel_asignado, fecha')
        .eq('user_id', userId)
        .order('fecha', { ascending: false })
        .limit(1)
        .maybeSingle(),
      db
        .from('usuario_navegacion')
        .select('id, path, page_title, visited_at, duration_seconds')
        .eq('user_id', userId)
        .order('visited_at', { ascending: false })
        .limit(300),
      db.from('Usuarios_y_Perfil_roles').select('id, nombre'),
    ]);

    let roleName = '';
    if (profile.rol_id && rolesRes.data) {
      const role = rolesRes.data.find((r) => r.id === profile.rol_id);
      roleName = role?.nombre || '';
    }

    const presence = presenceRes.data;
    const sessions = sessionsRes.data || [];
    const placementRow = placementRes.data;

    const navigationReady = !navRes.error || !isSchemaNotReadyError(navRes.error);
    const pageViews = ((navigationReady ? navRes.data : null) || [])
      .filter((row) => withinDateRange(row.visited_at, startDate, endDate))
      .map((row) => {
      const visited = row.visited_at ? new Date(row.visited_at) : null;
      const sec = Number(row.duration_seconds) || 0;
      return {
        id: row.id,
        path: row.path,
        pageTitle: row.page_title || getPageTitleForPath(row.path),
        visitedAt: row.visited_at,
        visitedLabel: visited
          ? visited.toLocaleString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          : '—',
        durationSeconds: sec,
        durationLabel: formatSessionDuration(sec),
      };
    });

    return NextResponse.json({
      profile: {
        id: profile.id,
        email: profile.email,
        nombre: profile.nombre,
        rolId: profile.rol_id,
        rolNombre: roleName,
        creadoEn: profile.creado_en,
        activo: profile.activo !== false,
      },
      presence: {
        online: presence ? isUserOnline(presence.last_seen_at) : false,
        lastSeenAt: presence?.last_seen_at || null,
        totalSessionSeconds: Number(presence?.total_session_seconds) || 0,
        totalSessionLabel: formatSessionDuration(presence?.total_session_seconds),
      },
      placement: placementRow
        ? {
            done: true,
            level: placementRow.nivel_asignado || '—',
            date: placementRow.fecha,
          }
        : { done: false, level: null, date: null },
      sessions: sessions.map((s) => ({
        id: s.id,
        startedAt: s.started_at,
        endedAt: s.ended_at,
        durationSeconds: Number(s.duration_seconds) || 0,
        durationLabel: formatSessionDuration(s.duration_seconds),
        deviceType: s.device_type || null,
        deviceLabel: formatDeviceTypeLabel(s.device_type),
      })),
      sessionsByDate: groupSessionsByDate(sessions),
      pageViews,
      navigationReady,
    });
  } catch (err) {
    console.error('[admin/users/[userId]]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
