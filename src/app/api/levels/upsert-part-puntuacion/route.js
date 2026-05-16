import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildUoePartDescripcion } from '@/utils/levelsPuntuaciones';
import { isUoePartPassed } from '@/utils/levelsUoePartScoring';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

export async function POST(req) {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return NextResponse.json(
        { error: 'Servidor no configurado (falta SUPABASE_SERVICE_ROLE_KEY).' },
        { status: 503 },
      );
    }

    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user?.id) {
      return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 });
    }

    const body = await req.json();
    const userId = authData.user.id;
    const preguntaId = body?.preguntaId;
    const examenId = body?.examenId;
    const parteNumero = Number(body?.parteNumero);
    const correctas = Math.max(0, Number(body?.correctas) || 0);
    const totalPreguntas = Math.max(1, Number(body?.totalPreguntas) || 1);

    if (!preguntaId || !examenId || !parteNumero) {
      return NextResponse.json({ error: 'Faltan datos de la parte.' }, { status: 400 });
    }

    const aprobado = isUoePartPassed(correctas, parteNumero);
    const puntuacion = aprobado ? 100 : Math.round((100 * correctas) / totalPreguntas);
    const descripcion = buildUoePartDescripcion({
      examenId,
      parteNumero,
      correctas,
      total: totalPreguntas,
      aprobado,
    });

    const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: existing, error: findErr } = await admin
      .from('levels_puntuaciones')
      .select('id')
      .eq('uuid_usuario', userId)
      .eq('examen_id', examenId)
      .eq('parte_numero', parteNumero)
      .maybeSingle();

    if (findErr) {
      return NextResponse.json({ error: findErr.message }, { status: 500 });
    }

    const row = {
      id_pregunta: preguntaId,
      uuid_usuario: userId,
      examen_id: examenId,
      parte_numero: parteNumero,
      correctas,
      total_preguntas: totalPreguntas,
      aprobado,
      puntuacion,
      descripcion,
    };

    if (existing?.id) {
      const { error: upErr } = await admin.from('levels_puntuaciones').update(row).eq('id', existing.id);
      if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });
      return NextResponse.json({ ok: true, updated: true });
    }

    const { error: insErr } = await admin.from('levels_puntuaciones').insert(row);
    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, created: true });
  } catch (err) {
    console.error('api/levels/upsert-part-puntuacion:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
