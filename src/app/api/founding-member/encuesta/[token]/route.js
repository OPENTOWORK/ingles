import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { FOUNDING_SURVEY_QUESTIONS } from '@/lib/foundingSurvey.rules';
import { getFoundingSurveyByToken, submitFoundingSurvey } from '@/lib/foundingSurveyServer';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_STORE = { 'Cache-Control': 'private, no-store, max-age=0, must-revalidate' };

function getAdminClient() {
  const url = getSupabaseUrl();
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  if (!url || !serviceKey) return null;

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(_req, { params }) {
  const adminClient = getAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: 'Configuración no disponible.' }, { status: 503 });
  }

  try {
    const loaded = await getFoundingSurveyByToken(adminClient, params.token);
    if (loaded.error) {
      return NextResponse.json({ error: loaded.error }, { status: loaded.status || 404 });
    }

    return NextResponse.json(
      {
        estado: loaded.estado,
        nombre: loaded.nombre,
        email: loaded.survey.email,
        fechaLimite: loaded.fechaLimite,
        diasRestantes: loaded.diasRestantes,
        preguntas: FOUNDING_SURVEY_QUESTIONS,
      },
      { headers: NO_STORE },
    );
  } catch (err) {
    console.error('api/founding-member/encuesta GET:', err);
    return NextResponse.json({ error: 'No se pudo cargar el formulario.' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const adminClient = getAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: 'Configuración no disponible.' }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const result = await submitFoundingSurvey(adminClient, params.token, body?.respuestas);

    if (result.error) {
      return NextResponse.json(
        { error: result.error, errors: result.errors || null },
        { status: result.status || 400 },
      );
    }

    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  } catch (err) {
    console.error('api/founding-member/encuesta POST:', err);
    return NextResponse.json({ error: 'No se pudieron guardar tus respuestas.' }, { status: 500 });
  }
}
