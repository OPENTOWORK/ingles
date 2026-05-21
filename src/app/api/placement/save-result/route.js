import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from '@/lib/supabaseEnv';
import {
  buildPlacementResultInsert,
  nivelAsignadoForPlacementDb,
} from '@/lib/placementResultsDb';

export async function POST(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const supabaseUrl = getSupabaseUrl();
    const supabaseAnonKey = getSupabaseAnonKey();
    const serviceRoleKey = getSupabaseServiceRoleKey();

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const placementResults = body.placementResults;
    if (!placementResults || typeof placementResults !== 'object') {
      return NextResponse.json(
        { error: 'Faltan los resultados del placement test.' },
        { status: 400 },
      );
    }

    const row = buildPlacementResultInsert({
      userId: authData.user.id,
      testId: body.testId,
      placementResults,
    });

    const nivel = nivelAsignadoForPlacementDb(placementResults);
    row.nivel_asignado = nivel;

    const insertRow = async (client) =>
      client
        .from('placement_results')
        .insert(row)
        .select('id, nivel_asignado, fecha')
        .single();

    let data;
    let error;

    if (serviceRoleKey) {
      const admin = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      ({ data, error } = await insertRow(admin));
    } else {
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error: sessionError } = await userClient.auth.setSession({
        access_token: token,
        refresh_token: token,
      });

      if (!sessionError) {
        ({ data, error } = await insertRow(userClient));
      } else {
        const headerClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });
        ({ data, error } = await insertRow(headerClient));
      }
    }

    if (error) {
      console.error('[placement/save-result]', error);
      const hint = !serviceRoleKey
        ? ' Configura SUPABASE_SERVICE_ROLE_KEY en .env.local para guardar en local.'
        : '';
      return NextResponse.json(
        { error: (error.message || 'No se pudo guardar el resultado.') + hint },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      id: data.id,
      nivel_asignado: data.nivel_asignado,
      fecha: data.fecha,
    });
  } catch (err) {
    console.error('[placement/save-result]', err);
    return NextResponse.json(
      { error: err.message || 'Error interno al guardar el placement.' },
      { status: 500 },
    );
  }
}
