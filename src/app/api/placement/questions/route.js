import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildPlacementQuestionSet } from '@/lib/placementSupabase';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

const SELECT_QUERY = `
  id,
  pregunta,
  explicacion,
  test_id,
  partes_id,
  placement_tests ( dificultad ),
  placement_partes ( nombre_parte ),
  placement_respuestas (
    id,
    respuesta,
    correcta
  )
`;

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();
    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
    }

    const serviceKey = getSupabaseServiceRoleKey()?.trim();
    const db = serviceKey
      ? createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });

    const { data: rows, error } = await db
      .from('placement_preguntas')
      .select(SELECT_QUERY)
      .order('id', { ascending: true });

    if (error) {
      console.error('[placement/questions]', error);
      return NextResponse.json(
        { error: error.message || 'No se pudieron cargar las preguntas.' },
        { status: 500 },
      );
    }

    const questions = buildPlacementQuestionSet(rows || []);

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No hay preguntas de placement configuradas en Supabase.' },
        { status: 404 },
      );
    }

    const maxRaw = process.env.PLACEMENT_MAX_QUESTIONS;
    const max =
      maxRaw && Number.isFinite(Number(maxRaw)) && Number(maxRaw) > 0
        ? Math.min(questions.length, Number(maxRaw))
        : questions.length;

    const sessionQuestions = questions.slice(0, max);

    return NextResponse.json({
      questions: sessionQuestions,
      total: sessionQuestions.length,
      poolSize: questions.length,
    });
  } catch (err) {
    console.error('[placement/questions]', err);
    return NextResponse.json(
      { error: err.message || 'Error interno.' },
      { status: 500 },
    );
  }
}
