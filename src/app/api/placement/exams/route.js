import { NextResponse } from 'next/server';
import { buildPlacementExamCatalog } from '@/lib/placementSupabase';
import {
  createPlacementDb,
  fetchPlacementRowsWithRespuestas,
  getPlacementAuthToken,
  verifyPlacementToken,
} from '@/lib/placementDb';

export async function GET(req) {
  try {
    const token = getPlacementAuthToken(req);
    if (!token) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const user = await verifyPlacementToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
    }

    const db = createPlacementDb(token);

    const { data: tests, error: testsError } = await db
      .from('placement_tests')
      .select('*')
      .order('id', { ascending: true });

    if (testsError) {
      console.error('[placement/exams] tests', testsError);
      return NextResponse.json(
        { error: testsError.message || 'No se pudieron cargar los exámenes.' },
        { status: 500 },
      );
    }

    const rows = await fetchPlacementRowsWithRespuestas(db);
    const exams = buildPlacementExamCatalog(tests || [], rows);

    for (const exam of exams) {
      if (/test\s*2|examen\s*2/i.test(exam.label) && exam.totalQuestions < 61) {
        console.warn(
          `[placement/exams] "${exam.label}" incompleto: ${exam.totalQuestions}/61`,
          exam.parts,
        );
      }
    }

    if (exams.length === 0) {
      return NextResponse.json(
        { error: 'No hay exámenes de placement configurados en Supabase.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ exams });
  } catch (err) {
    console.error('[placement/exams]', err);
    return NextResponse.json(
      { error: err.message || 'Error interno.' },
      { status: 500 },
    );
  }
}
