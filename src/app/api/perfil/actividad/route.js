import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  aggregateSessionsByDay,
  buildStudyHeatmapGrid,
  computeActivitySummary,
  rowsToActivityMap,
} from '@/lib/perfilActividad';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
    }

    const userId = authData.user.id;
    const serviceKey = getSupabaseServiceRoleKey()?.trim();
    const db = serviceKey
      ? createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });

    const since = new Date();
    since.setUTCDate(since.getUTCDate() - 400);
    const sinceIso = since.toISOString();

    const { data: rows, error: actError } = await db
      .from('perfil_actividad')
      .select('activity_date, study_minutes, sessions_count')
      .eq('user_id', userId)
      .gte('activity_date', sinceIso.slice(0, 10))
      .order('activity_date', { ascending: true });

    let activityMap = rowsToActivityMap(rows || []);

    if (actError?.code === '42P01') {
      activityMap = new Map();
    } else if (actError) {
      console.error('[perfil/actividad] select', actError);
      return NextResponse.json({ error: 'No se pudo cargar la actividad.' }, { status: 500 });
    }

    if (activityMap.size < 3) {
      const { data: sessions, error: sessError } = await db
        .from('usuario_sesiones_app')
        .select('started_at, duration_seconds')
        .eq('user_id', userId)
        .gte('started_at', sinceIso)
        .order('started_at', { ascending: true });

      if (!sessError && sessions?.length) {
        activityMap = aggregateSessionsByDay(sessions);
      }
    }

    const grid = buildStudyHeatmapGrid(activityMap);
    const summary = computeActivitySummary(activityMap);

    return NextResponse.json({
      summary,
      weeks: grid.weeks,
      monthLabels: grid.monthLabels,
      weekdayLabels: grid.weekdayLabels,
      source: rows?.length ? 'perfil_actividad' : activityMap.size ? 'sesiones' : 'empty',
    });
  } catch (err) {
    console.error('[perfil/actividad]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
