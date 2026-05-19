import { NextResponse } from 'next/server';
import { authenticateTeacherRequest, isSchemaNotReadyError } from '@/lib/teacherAccess';

async function enrichGradesWithStudents(db, grades) {
  const alumnoIds = [...new Set((grades || []).map((g) => g.alumno_id).filter(Boolean))];
  if (!alumnoIds.length) return grades;

  const { data: profiles } = await db
    .from('Usuarios_y_Perfil_users')
    .select('id, email, nombre')
    .in('id', alumnoIds);

  const byId = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
  return grades.map((g) => ({
    ...g,
    alumno: byId[g.alumno_id] || null,
  }));
}

export async function GET(req) {
  try {
    const auth = await authenticateTeacherRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(req.url);
    const alumnoId = searchParams.get('alumnoId');

    const { db, professorId, studentIds } = auth;
    let query = db
      .from('profesor_calificaciones')
      .select('id, titulo, nota, comentario, creado_en, actualizado_en, alumno_id')
      .eq('profesor_id', professorId)
      .order('creado_en', { ascending: false })
      .limit(300);

    if (alumnoId) {
      if (!studentIds.includes(alumnoId)) {
        return NextResponse.json({ error: 'Alumno no autorizado.' }, { status: 403 });
      }
      query = query.eq('alumno_id', alumnoId);
    } else if (!auth.isAdmin) {
      query = query.in(
        'alumno_id',
        studentIds.length ? studentIds : ['00000000-0000-0000-0000-000000000000'],
      );
    }

    const { data, error } = await query;
    if (error && isSchemaNotReadyError(error)) {
      return NextResponse.json({ grades: [], autoScores: [], tablesReady: false });
    }
    if (error) {
      return NextResponse.json({ grades: [], autoScores: [], warning: error.message });
    }

    const grades = await enrichGradesWithStudents(db, data || []);

    let autoScores = [];
    if (studentIds.length) {
      const levelsRes = await db
        .from('levels_puntuaciones')
        .select('uuid_usuario, puntuacion, created_at, descripcion')
        .in('uuid_usuario', studentIds)
        .order('created_at', { ascending: false })
        .limit(500);
      autoScores = levelsRes.data || [];
    }

    return NextResponse.json({ grades, autoScores, tablesReady: true });
  } catch (err) {
    console.error('[teacher/grades GET]', err);
    return NextResponse.json({ grades: [], autoScores: [] });
  }
}

export async function POST(req) {
  try {
    const auth = await authenticateTeacherRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const action = String(body?.action || 'save').trim();
    const { db, professorId, studentIds } = auth;

    if (action === 'delete') {
      const id = String(body?.id || '').trim();
      if (!id) return NextResponse.json({ error: 'id obligatorio.' }, { status: 400 });
      const { error } = await db
        .from('profesor_calificaciones')
        .delete()
        .eq('id', id)
        .eq('profesor_id', professorId);
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

    const alumno_id = String(body?.alumno_id || '').trim();
    const titulo = String(body?.titulo || '').trim();
    const nota = Number(body?.nota);
    const comentario = String(body?.comentario || '').trim() || null;
    const id = String(body?.id || '').trim();

    if (!alumno_id || !studentIds.includes(alumno_id)) {
      return NextResponse.json({ error: 'Alumno no válido o no asignado.' }, { status: 403 });
    }
    if (!titulo || Number.isNaN(nota) || nota < 0 || nota > 100) {
      return NextResponse.json({ error: 'Título y nota (0–100) obligatorios.' }, { status: 400 });
    }

    if (id) {
      const { error } = await db
        .from('profesor_calificaciones')
        .update({ titulo, nota, comentario, actualizado_en: new Date().toISOString() })
        .eq('id', id)
        .eq('profesor_id', professorId);
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

    const { data, error } = await db
      .from('profesor_calificaciones')
      .insert({
        profesor_id: professorId,
        alumno_id,
        titulo,
        nota,
        comentario,
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

    return NextResponse.json({ success: true, grade: data });
  } catch (err) {
    console.error('[teacher/grades POST]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
