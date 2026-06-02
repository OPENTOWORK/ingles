import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/adminApiAuth';
import {
  fetchRecentTeoriaPreguntas,
  fetchTeoriaExerciseCatalog,
  generateAndPersistTeoriaExercise,
} from '@/lib/levelsTeoriaExerciseGenerator';
import { deleteManyTeoriaEjercicios } from '@/lib/teoriaEjercicioAdminCrud';

const RECENT_LIMIT = 120;

export const maxDuration = 120;

export async function GET(req) {
  try {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const catalog = await fetchTeoriaExerciseCatalog(auth.adminDb);
    const recent = await fetchRecentTeoriaPreguntas(auth.adminDb, RECENT_LIMIT);

    return NextResponse.json({
      ...catalog,
      recent,
      aiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    });
  } catch (err) {
    console.error('[admin/teoria-ejercicios GET]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const result = await generateAndPersistTeoriaExercise(auth.adminDb, {
      nivelId: body.nivelId || body.id_nivel,
      skillId: body.skillId || body.id_skills,
      tipoId: body.tipoId || body.id_tipo_preguntas,
      topicHref: body.topicHref || body.topicPartHref || body.parteTeoria || '',
      topicHint: body.topic || body.topicHint || body.tema || '',
    });

    const recent = await fetchRecentTeoriaPreguntas(auth.adminDb, RECENT_LIMIT);

    return NextResponse.json({
      ok: true,
      message: 'Ejercicio creado en las tres tablas vinculadas.',
      ...result,
      recent,
    });
  } catch (err) {
    console.error('[admin/teoria-ejercicios POST]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body.ids) ? body.ids : [];
    if (!ids.length) {
      return NextResponse.json({ error: 'Indica al menos un id en ids[]' }, { status: 400 });
    }

    const { deleted, failed } = await deleteManyTeoriaEjercicios(auth.adminDb, ids);
    const recent = await fetchRecentTeoriaPreguntas(auth.adminDb, RECENT_LIMIT);

    return NextResponse.json({
      ok: failed.length === 0,
      deletedCount: deleted.length,
      failed,
      recent,
    });
  } catch (err) {
    console.error('[admin/teoria-ejercicios DELETE bulk]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
