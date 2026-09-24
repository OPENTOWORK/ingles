import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';
import {
  WELCOME_FORM_MOMENT,
  buildFormularioRespuestas,
  loadFormularioByMoment,
} from '@/lib/formularioRespuestas';

function getServiceClient() {
  const serviceKey = getSupabaseServiceRoleKey()?.trim();
  if (!serviceKey) return null;
  return createClient(getSupabaseUrl(), serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function authenticate(req) {
  const auth = await getSupabaseUserFromRequest(req);
  if (!auth?.user) {
    return { error: NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 }) };
  }
  const db = getServiceClient();
  if (!db) {
    return {
      error: NextResponse.json({ error: 'Servidor sin configurar.' }, { status: 500 }),
    };
  }
  return { user: auth.user, db };
}

export async function GET(req) {
  try {
    const auth = await authenticate(req);
    if (auth.error) return auth.error;

    const form = await loadFormularioByMoment(auth.db, WELCOME_FORM_MOMENT);
    if (!form || form.preguntas.length === 0) {
      return NextResponse.json({ form: null, answered: false });
    }

    const { data: existing, error } = await auth.db
      .from('formulario_respuestas')
      .select('id')
      .eq('formulario_id', form.id)
      .eq('user_id', auth.user.id)
      .maybeSingle();
    if (error) throw error;

    return NextResponse.json({ form, answered: Boolean(existing) });
  } catch (err) {
    console.error('[formularios/bienvenida GET]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await authenticate(req);
    if (auth.error) return auth.error;

    const body = await req.json().catch(() => ({}));
    const form = await loadFormularioByMoment(auth.db, WELCOME_FORM_MOMENT);
    if (!form || form.id !== body.formularioId) {
      return NextResponse.json(
        { error: 'El formulario ha cambiado. Recarga la página y vuelve a intentarlo.' },
        { status: 409 },
      );
    }

    const result = buildFormularioRespuestas(form.preguntas, body.respuestas);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { error } = await auth.db.from('formulario_respuestas').upsert(
      {
        formulario_id: form.id,
        formulario_titulo: form.titulo,
        user_id: auth.user.id,
        respuestas: result.value,
        completado_en: new Date().toISOString(),
      },
      { onConflict: 'formulario_id,user_id' },
    );
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[formularios/bienvenida POST]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
