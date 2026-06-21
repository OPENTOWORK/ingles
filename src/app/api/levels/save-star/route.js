import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { saveLevelStars } from '@/utils/levelsStars';
import { LEVELS_SCORE_SOURCE } from '@/utils/levelsScoreSource';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

/** Persist one Levels_stars row via service role (fallback when client schema cache misses the table). */
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
    const puntuacionesId = body?.puntuacionesId;
    const stars = Math.min(3, Math.max(0, Number(body?.stars) || 0));
    const scoreSource = body?.scoreSource || LEVELS_SCORE_SOURCE.SKILL_PRACTICE;
    const descripcion = String(body?.descripcion || '').trim().slice(0, 2000) || null;

    if (!puntuacionesId) {
      return NextResponse.json({ error: 'Falta puntuacionesId.' }, { status: 400 });
    }

    const admin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: puntRow, error: puntErr } = await admin
      .from('levels_puntuaciones')
      .select('id, uuid_usuario')
      .eq('id', puntuacionesId)
      .maybeSingle();

    if (puntErr) {
      return NextResponse.json({ error: puntErr.message }, { status: 500 });
    }
    if (!puntRow?.id || puntRow.uuid_usuario !== authData.user.id) {
      return NextResponse.json({ error: 'Puntuación no encontrada.' }, { status: 404 });
    }

    const result = await saveLevelStars({
      puntuacionesId,
      stars,
      scoreSource,
      descripcion,
      supabaseClient: admin,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error.message || String(result.error) }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      saved: Boolean(result.saved),
      updated: Boolean(result.updated),
      created: Boolean(result.created),
    });
  } catch (err) {
    console.error('api/levels/save-star:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
