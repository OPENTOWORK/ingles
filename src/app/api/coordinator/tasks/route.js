import { NextResponse } from 'next/server';
import {
  authenticateCoordinatorRequest,
  getTeacherRoleIds,
  isSchemaNotReadyError,
} from '@/lib/coordinatorAccess';

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

async function assertStudentAssignedToTeacher(db, profesorId, alumnoId) {
  const { data, error } = await db
    .from('profesor_alumnos')
    .select('id')
    .eq('profesor_id', profesorId)
    .eq('alumno_id', alumnoId)
    .maybeSingle();
  if (error && !isSchemaNotReadyError(error)) throw error;
  return Boolean(data?.id);
}

async function enrichTasks(db, tasks) {
  const alumnoIds = [...new Set((tasks || []).map((t) => t.alumno_id).filter(Boolean))];
  const profesorIds = [...new Set((tasks || []).map((t) => t.profesor_id).filter(Boolean))];
  const userIds = [...new Set([...alumnoIds, ...profesorIds])];

  let profilesById = {};
  if (userIds.length) {
    const { data: profiles } = await db
      .from('Usuarios_y_Perfil_users')
      .select('id, email, nombre')
      .in('id', userIds);
    profilesById = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  }

  return (tasks || []).map((t) => ({
    ...t,
    alumno: t.alumno_id ? profilesById[t.alumno_id] || null : null,
    profesor: profilesById[t.profesor_id] || null,
  }));
}

export async function GET(req) {
  try {
    const auth = await authenticateCoordinatorRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const profesorId = String(searchParams.get('profesorId') || '').trim();
    const estado = String(searchParams.get('estado') || '').trim();

    const tablesProbe = await auth.db.from('profesor_tareas').select('id').limit(1);
    if (isSchemaNotReadyError(tablesProbe.error)) {
      return NextResponse.json({ tasks: [], tablesReady: false });
    }

    let query = auth.db
      .from('profesor_tareas')
      .select(
        'id, profesor_id, titulo, descripcion, enlace, fecha_limite, estado, creado_en, alumno_id',
      )
      .order('creado_en', { ascending: false })
      .limit(500);

    if (profesorId) {
      const teacherCheck = await assertTeacherId(auth.db, profesorId);
      if (!teacherCheck.ok) {
        return NextResponse.json({ error: teacherCheck.error }, { status: 404 });
      }
      query = query.eq('profesor_id', profesorId);
    } else {
      const teacherRoleIds = await getTeacherRoleIds(auth.db);
      if (!teacherRoleIds.length) {
        return NextResponse.json({ tasks: [], tablesReady: true });
      }
      const { data: teachers } = await auth.db
        .from('Usuarios_y_Perfil_users')
        .select('id')
        .in('rol_id', teacherRoleIds);
      const teacherIds = (teachers || []).map((t) => t.id);
      if (!teacherIds.length) {
        return NextResponse.json({ tasks: [], tablesReady: true });
      }
      query = query.in('profesor_id', teacherIds);
    }

    if (estado && ['pendiente', 'completada', 'cancelada'].includes(estado)) {
      query = query.eq('estado', estado);
    }

    const { data, error } = await query;
    if (error) {
      if (isSchemaNotReadyError(error)) {
        return NextResponse.json({ tasks: [], tablesReady: false });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const tasks = await enrichTasks(auth.db, data || []);
    const pendingCount = tasks.filter((t) => t.estado === 'pendiente').length;

    return NextResponse.json({
      tasks,
      tablesReady: true,
      summary: {
        total: tasks.length,
        pending: pendingCount,
        completed: tasks.filter((t) => t.estado === 'completada').length,
        cancelled: tasks.filter((t) => t.estado === 'cancelada').length,
      },
    });
  } catch (err) {
    console.error('[coordinator/tasks GET]', err);
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
    const action = String(body?.action || 'create').trim();
    const profesorId = String(body?.profesorId || '').trim();

    if (!profesorId) {
      return NextResponse.json({ error: 'profesorId es obligatorio.' }, { status: 400 });
    }

    const teacherCheck = await assertTeacherId(auth.db, profesorId);
    if (!teacherCheck.ok) {
      return NextResponse.json({ error: teacherCheck.error }, { status: 404 });
    }

    if (action === 'create') {
      const titulo = String(body?.titulo || '').trim();
      const descripcion = String(body?.descripcion || '').trim() || null;
      const enlace = String(body?.enlace || '').trim() || null;
      const fecha_limite = body?.fecha_limite || null;
      const alumno_id = body?.alumno_id ? String(body.alumno_id) : null;

      if (!titulo) {
        return NextResponse.json({ error: 'Título obligatorio.' }, { status: 400 });
      }

      if (alumno_id) {
        const assigned = await assertStudentAssignedToTeacher(auth.db, profesorId, alumno_id);
        if (!assigned) {
          return NextResponse.json(
            { error: 'Ese alumno no está asignado a este profesor.' },
            { status: 403 },
          );
        }
      }

      const { data, error } = await auth.db
        .from('profesor_tareas')
        .insert({
          profesor_id: profesorId,
          alumno_id,
          titulo,
          descripcion,
          enlace,
          fecha_limite,
          estado: 'pendiente',
        })
        .select()
        .single();

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

      return NextResponse.json({ success: true, task: data });
    }

    const id = String(body?.id || '').trim();
    if (!id) {
      return NextResponse.json({ error: 'id obligatorio.' }, { status: 400 });
    }

    if (action === 'delete') {
      const { error } = await auth.db
        .from('profesor_tareas')
        .delete()
        .eq('id', id)
        .eq('profesor_id', profesorId);
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

    if (action === 'update') {
      const estado = body?.estado ? String(body.estado) : undefined;
      if (!estado || !['pendiente', 'completada', 'cancelada'].includes(estado)) {
        return NextResponse.json({ error: 'Estado no válido.' }, { status: 400 });
      }
      const { error } = await auth.db
        .from('profesor_tareas')
        .update({ estado })
        .eq('id', id)
        .eq('profesor_id', profesorId);
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

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    console.error('[coordinator/tasks POST]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
