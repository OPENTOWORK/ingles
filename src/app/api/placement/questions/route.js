import { NextResponse } from 'next/server';
import {
  buildPlacementQuestionSet,
  detectStructuredQuestionBase,
  isStructuredPlacementBatchMode,
  mapPlacementRowToQuestion,
  PLACEMENT_EXAM2_EXPECTED_QUESTIONS,
  resolvePlacementMeta,
} from '@/lib/placementSupabase';
import { getSupabaseServiceRoleKey } from '@/lib/supabaseEnv';
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

    const testId = req.nextUrl.searchParams.get('testId')?.trim() || null;
    if (!testId) {
      return NextResponse.json(
        { error: 'Indica qué examen quieres cargar (testId).' },
        { status: 400 },
      );
    }

    if (!getSupabaseServiceRoleKey()) {
      console.warn(
        '[placement/questions] Sin SUPABASE_SERVICE_ROLE_KEY: RLS puede ocultar respuestas.',
      );
    }

    const db = createPlacementDb(token);
    const rows = await fetchPlacementRowsWithRespuestas(db, { testId });

    const { data: testRow } = await db
      .from('placement_tests')
      .select('*')
      .eq('id', testId)
      .maybeSingle();

    const questions = buildPlacementQuestionSet(rows, { test: testRow });
    const isExam2 = isStructuredPlacementBatchMode(rows, testRow);
    const exam2Base = isExam2 ? detectStructuredQuestionBase(rows, testRow) : 1;

    const skipped = [];
    for (const row of rows) {
      const mapped = mapPlacementRowToQuestion(row);
      if (!mapped) {
        const meta = resolvePlacementMeta(row, {
          exam2BaseOffset: exam2Base,
          test: testRow,
          forceStructured: isExam2,
        });
        const respCount = Array.isArray(row.placement_respuestas)
          ? row.placement_respuestas.length
          : 0;
        skipped.push({
          id: row.id,
          explicacion: row.explicacion,
          part: meta.part,
          respuestas: respCount,
        });
      }
    }

    if (
      isExam2 &&
      questions.length > 0 &&
      questions.length < PLACEMENT_EXAM2_EXPECTED_QUESTIONS
    ) {
      console.warn(
        `[placement/questions] Examen 2: ${questions.length}/${PLACEMENT_EXAM2_EXPECTED_QUESTIONS} cargadas; ${skipped.length} filas omitidas.`,
      );
    }

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: 'Este examen no tiene preguntas válidas (revisa respuestas y opciones correctas).',
          testId,
          poolSize: rows.length,
          skippedCount: skipped.length,
          skipped: skipped.slice(0, 20),
        },
        { status: 404 },
      );
    }

    const maxRaw = process.env.PLACEMENT_MAX_QUESTIONS;
    const max =
      maxRaw && Number.isFinite(Number(maxRaw)) && Number(maxRaw) > 0
        ? Math.min(questions.length, Number(maxRaw))
        : questions.length;

    const sessionQuestions = questions.slice(0, max);

    const partCounts = {
      1: sessionQuestions.filter((q) => q.part === 1).length,
      2: sessionQuestions.filter((q) => q.part === 2).length,
      3: sessionQuestions.filter((q) => q.part === 3).length,
    };

    return NextResponse.json({
      testId,
      questions: sessionQuestions,
      total: sessionQuestions.length,
      poolSize: rows.length,
      loadedFromDb: rows.length,
      skippedCount: skipped.length,
      partCounts,
      exam2: isExam2,
      expectedTotal: isExam2 ? PLACEMENT_EXAM2_EXPECTED_QUESTIONS : null,
      complete: isExam2
        ? sessionQuestions.length >= PLACEMENT_EXAM2_EXPECTED_QUESTIONS
        : sessionQuestions.length > 0,
    });
  } catch (err) {
    console.error('[placement/questions]', err);
    return NextResponse.json(
      { error: err.message || 'Error interno.' },
      { status: 500 },
    );
  }
}
