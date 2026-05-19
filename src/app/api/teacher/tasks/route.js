import { NextResponse } from 'next/server';
import { authenticateTeacherRequest, isSchemaNotReadyError } from '@/lib/teacherAccess';

async function enrichTasksWithStudents(db, tasks) {
  const alumnoIds = [...new Set((tasks || []).map((t) => t.alumno_id).filter(Boolean))];
  if (!alumnoIds.length) return tasks;

  const { data: profiles } = await db
    .from('Usuarios_y_Perfil_users')
    .select('id, email, nombre')
    .in('id', alumnoIds);

  const byId = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  return tasks.map((t) => ({
    ...t,
    alumno: t.alumno_id ? byId[t.alumno_id] || null : null,
  }));
}

export async function GET(req) {
  try {
    const auth = await authenticateTeacherRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { db, professorId } = auth;
    const { data, error } = await db
      .from('profesor_tareas')
      .select('id, titulo, descripcion, enlace, fecha_limite, estado, creado_en, alumno_id')
      .eq('profesor_id', professorId)
      .order('creado_en', { ascending: false })
      .limit(200);

    if (error) {
      if (isSchemaNotReadyError(error)) {
        return NextResponse.json({ tasks: [], tablesReady: false });
      }
      return NextResponse.json({ tasks: [], warning: error.message });
    }

    const tasks = await enrichTasksWithStudents(db, data || []);
    return NextResponse.json({ tasks, tablesReady: true });
  } catch (err) {
    console.error('[teacher/tasks GET]', err);
    return NextResponse.json({ tasks: [], warning: 'Error interno.' });
  }
}

export async function POST(req) {
  try {
    const auth = await authenticateTeacherRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const action = String(body?.action || 'create').trim();
    const { db, professorId, studentIds } = auth;

    if (action === 'delete') {
      const id = String(body?.id || '').trim();
      if (!id) return NextResponse.json({ error: 'id obligatorio.' }, { status: 400 });
      const { error } = await db.from('profesor_tareas').delete().eq('id', id).eq('profesor_id', professorId);
      if (error) {
        return NextResponse.json(
          { error: isSchemaNotReadyError(error) ? 'Ejecuta scripts/teacher_panel_tables.sql en Supabase.' : error.message },
          { status: isSchemaNotReadyError(error) ? 503 : 500 },
        );
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'update') {
      const id = String(body?.id || '').trim();
      const estado = body?.estado ? String(body.estado) : undefined;
      if (!id) return NextResponse.json({ error: 'id obligatorio.' }, { status: 400 });
      const patch = {};
      if (estado) patch.estado = estado;
      const { error } = await db.from('profesor_tareas').update(patch).eq('id', id).eq('profesor_id', professorId);
      if (error) {
        return NextResponse.json(
          { error: isSchemaNotReadyError(error) ? 'Ejecuta scripts/teacher_panel_tables.sql en Supabase.' : error.message },
          { status: isSchemaNotReadyError(error) ? 503 : 500 },
        );
      }
      return NextResponse.json({ success: true });
    }

    const titulo = String(body?.titulo || '').trim();
    const descripcion = String(body?.descripcion || '').trim() || null;
    const enlace = String(body?.enlace || '').trim() || null;
    const fecha_limite = body?.fecha_limite || null;
    const alumno_id = body?.alumno_id ? String(body.alumno_id) : null;

    if (!titulo) {
      return NextResponse.json({ error: 'Título obligatorio.' }, { status: 400 });
    }
    if (alumno_id && !studentIds.includes(alumno_id)) {
      return NextResponse.json({ error: 'Ese alumno no está en tu lista.' }, { status: 403 });
    }

    const { data, error } = await db
      .from('profesor_tareas')
      .insert({
        profesor_id: professorId,
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
  } catch (err) {
    console.error('[teacher/tasks POST]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
