import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildUoePartDescripcion } from '@/utils/levelsPuntuaciones';
import { LEVELS_SCORE_SOURCE } from '@/utils/levelsScoreSource';
import {
  getB2PartScoringV2,
  isB2PartPassed,
  isB2PartPassedByPoints,
} from '@/utils/levelsB2PartScoring';

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
    const scoreSource = body?.scoreSource || LEVELS_SCORE_SOURCE.SKILL_PRACTICE;
    const scoringVersion = Number(body?.scoringVersion) || 1;
    const puntosObtenidos = body?.puntosObtenidos != null ? Math.max(0, Number(body.puntosObtenidos) || 0) : null;
    const puntosMaximos = body?.puntosMaximos != null ? Math.max(1, Number(body.puntosMaximos) || 1) : null;

    if (!preguntaId || !examenId || !parteNumero) {
      return NextResponse.json({ error: 'Faltan datos de la parte.' }, { status: 400 });
    }

    if (scoringVersion !== 1 && scoringVersion !== 2) {
      return NextResponse.json({ error: 'scoring_version inválida.' }, { status: 400 });
    }

    if (scoringVersion === 2) {
      if (puntosObtenidos == null || puntosMaximos == null) {
        return NextResponse.json(
          { error: 'Scoring V2 requiere puntosObtenidos y puntosMaximos.' },
          { status: 400 },
        );
      }
      if (puntosObtenidos > puntosMaximos) {
        return NextResponse.json(
          { error: 'puntosObtenidos no puede superar puntosMaximos.' },
          { status: 400 },
        );
      }
      const expectedMax = getB2PartScoringV2(parteNumero)?.maxPoints;
      if (expectedMax && puntosMaximos !== expectedMax) {
        return NextResponse.json(
          { error: `puntosMaximos debe ser ${expectedMax} para la parte ${parteNumero}.` },
          { status: 400 },
        );
      }
    }

    const aprobado =
      scoringVersion === 2
        ? isB2PartPassedByPoints(puntosObtenidos, parteNumero)
        : isB2PartPassed(correctas, parteNumero);
    const puntuacion =
      scoringVersion === 2
        ? aprobado
          ? 100
          : Math.round((100 * puntosObtenidos) / puntosMaximos)
        : aprobado
          ? 100
          : Math.round((100 * correctas) / totalPreguntas);
    const descripcion = buildUoePartDescripcion({
      examenId,
      parteNumero,
      correctas,
      total: totalPreguntas,
      aprobado,
      scoreSource,
      scoringVersion,
      puntosObtenidos: puntosObtenidos ?? undefined,
      puntosMaximos: puntosMaximos ?? undefined,
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
      .eq('score_source', scoreSource)
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
      score_source: scoreSource,
      scoring_version: scoringVersion,
    };
    if (scoringVersion === 2) {
      row.puntos_obtenidos = puntosObtenidos;
      row.puntos_maximos = puntosMaximos;
    }

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
