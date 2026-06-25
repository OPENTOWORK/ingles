import { NextResponse } from 'next/server';
import {
  authenticateCoordinatorRequest,
  getTeacherRoleIds,
  isSchemaNotReadyError,
} from '@/lib/coordinatorAccess';
import { authenticateStaffTasksRequest } from '@/lib/staffTasksAccess';
import { normalizeRoleName } from '@/utils/authRoles';
import { formatSessionDuration, isUserOnline } from '@/lib/userActivity';

async function assertTeacherId(db, profesorId) {
  const teacherRoleIds = await getTeacherRoleIds(db);
  const { data: row, error } = await db
    .from('Usuarios_y_Perfil_users')
    .select('id, email, nombre, rol_id, activo')
    .eq('id', profesorId)
    .maybeSingle();
  if (error) throw error;
  if (!row?.id || !teacherRoleIds.includes(row.rol_id)) {
    return { ok: false, error: 'Profesor no válido.' };
  }
  return { ok: true, teacher: row };
}

export async function GET(req) {
  try {
    const auth = await authenticateStaffTasksRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const profesorId = String(searchParams.get('profesorId') || '').trim();
    if (!profesorId) {
      return NextResponse.json({ error: 'profesorId es obligatorio.' }, { status: 400 });
    }

    const teacherCheck = await assertTeacherId(auth.db, profesorId);
    if (!teacherCheck.ok) {
      return NextResponse.json({ error: teacherCheck.error }, { status: 404 });
    }

    const tablesProbe = await auth.db.from('profesor_alumnos').select('id').limit(1);
    const tablesReady = !isSchemaNotReadyError(tablesProbe.error);

    const { data: links, error: linksError } = await auth.db
      .from('profesor_alumnos')
      .select('alumno_id')
      .eq('profesor_id', profesorId);

    if (linksError) {
      if (isSchemaNotReadyError(linksError)) {
        return NextResponse.json({ students: [], teacher: teacherCheck.teacher, tablesReady: false });
      }
      return NextResponse.json({ error: linksError.message }, { status: 500 });
    }

    const studentIds = (links || []).map((r) => r.alumno_id).filter(Boolean);
    if (!studentIds.length) {
      return NextResponse.json({ students: [], teacher: teacherCheck.teacher, tablesReady });
    }

    const { data: profiles, error: profError } = await auth.db
      .from('Usuarios_y_Perfil_users')
      .select('id, email, nombre, activo, creado_en')
      .in('id', studentIds)
      .order('nombre', { ascending: true });

    if (profError) {
      return NextResponse.json({ error: profError.message }, { status: 500 });
    }

    const { data: presenceRows } = await auth.db
      .from('usuario_presencia')
      .select('user_id, last_seen_at, total_session_seconds')
      .in('user_id', studentIds);

    const presenceByUser = Object.fromEntries(
      (presenceRows || []).map((r) => [r.user_id, r]),
    );

    const students = (profiles || []).map((p) => {
      const pres = presenceByUser[p.id];
      return {
        ...p,
        online: pres ? isUserOnline(pres.last_seen_at) : false,
        totalSessionLabel: formatSessionDuration(pres?.total_session_seconds),
      };
    });

    return NextResponse.json({
      students,
      teacher: teacherCheck.teacher,
      tablesReady,
    });
  } catch (err) {
    console.error('[coordinator/students GET]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await authenticateCoordinatorRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const action = String(body?.action || 'assign').trim();
    const profesorId = String(body?.profesorId || '').trim();

    if (!profesorId) {
      return NextResponse.json({ error: 'profesorId es obligatorio.' }, { status: 400 });
    }

    const teacherCheck = await assertTeacherId(auth.db, profesorId);
    if (!teacherCheck.ok) {
      return NextResponse.json({ error: teacherCheck.error }, { status: 404 });
    }

    if (action === 'remove') {
      const alumnoId = String(body?.alumnoId || '').trim();
      if (!alumnoId) {
        return NextResponse.json({ error: 'alumnoId obligatorio.' }, { status: 400 });
      }
      const { error } = await auth.db
        .from('profesor_alumnos')
        .delete()
        .eq('profesor_id', profesorId)
        .eq('alumno_id', alumnoId);
      if (error) {
        return NextResponse.json(
          {
            error: isSchemaNotReadyError(error)
              ? 'Ejecuta scripts/teacher_panel_tables.sql en Supabase.'
              : error.message,
          },
          { status: isSchemaNotReadyError(error) ? 503 : 500 },
        );
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'assign') {
      const email = String(body?.email || '').trim().toLowerCase();
      const alumnoId = String(body?.alumnoId || '').trim();
      let targetId = alumnoId;

      if (!targetId && email) {
        const { data: row } = await auth.db
          .from('Usuarios_y_Perfil_users')
          .select('id, rol_id, Usuarios_y_Perfil_roles(nombre)')
          .eq('email', email)
          .maybeSingle();
        if (!row?.id) {
          return NextResponse.json({ error: 'No existe un usuario con ese email.' }, { status: 404 });
        }
        const roleName = normalizeRoleName(
          Array.isArray(row.Usuarios_y_Perfil_roles)
            ? row.Usuarios_y_Perfil_roles[0]?.nombre
            : row.Usuarios_y_Perfil_roles?.nombre,
        );
        if (roleName !== 'student' && roleName !== 'alumno') {
          return NextResponse.json({ error: 'Solo puedes asignar alumnos.' }, { status: 400 });
        }
        targetId = row.id;
      }

      if (!targetId) {
        return NextResponse.json({ error: 'Email o alumnoId obligatorio.' }, { status: 400 });
      }

      const { error } = await auth.db.from('profesor_alumnos').upsert(
        { profesor_id: profesorId, alumno_id: targetId },
        { onConflict: 'profesor_id,alumno_id' },
      );
      if (error) {
        return NextResponse.json(
          {
            error: isSchemaNotReadyError(error)
              ? 'Ejecuta scripts/teacher_panel_tables.sql en Supabase.'
              : error.message,
          },
          { status: isSchemaNotReadyError(error) ? 503 : 500 },
        );
      }
      return NextResponse.json({ success: true, alumnoId: targetId });
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    console.error('[coordinator/students POST]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
