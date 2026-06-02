import { NextResponse } from 'next/server';
import { requireAdminFromRequest } from '@/lib/adminApiAuth';
import { fetchRecentTeoriaPreguntas } from '@/lib/levelsTeoriaExerciseGenerator';
import {
  deleteTeoriaEjercicio,
  fetchTeoriaEjercicioDetail,
  updateTeoriaEjercicio,
} from '@/lib/teoriaEjercicioAdminCrud';

export async function GET(req, { params }) {
  try {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const id = (await params)?.id;
    const exercise = await fetchTeoriaEjercicioDetail(auth.adminDb, id);
    if (!exercise) {
      return NextResponse.json({ error: 'Ejercicio no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ exercise });
  } catch (err) {
    console.error('[admin/teoria-ejercicios/[id] GET]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const id = (await params)?.id;
    const body = await req.json().catch(() => ({}));
    const exercise = await updateTeoriaEjercicio(auth.adminDb, id, body);
    const recent = await fetchRecentTeoriaPreguntas(auth.adminDb, 120);

    return NextResponse.json({ ok: true, exercise, recent });
  } catch (err) {
    console.error('[admin/teoria-ejercicios/[id] PATCH]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireAdminFromRequest(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const id = (await params)?.id;
    await deleteTeoriaEjercicio(auth.adminDb, id);
    const recent = await fetchRecentTeoriaPreguntas(auth.adminDb, 120);

    return NextResponse.json({ ok: true, recent });
  } catch (err) {
    console.error('[admin/teoria-ejercicios/[id] DELETE]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
