import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  loadEstadisticasGenerales,
  loadPerfilActividadSummary,
  mergeGeneralStatsPayload,
} from '@/lib/aggregateEstadisticasTables';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: authData, error: authError } = await authClient.auth.getUser(token);
    if (authError || !authData?.user) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
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

    const rpcData = await loadEstadisticasGenerales(db, userId);

    let activitySummary = null;
    try {
      activitySummary = await loadPerfilActividadSummary(db, userId);
    } catch (actErr) {
      console.warn('[perfil/estadisticas-generales] actividad', actErr);
    }

    const payload = mergeGeneralStatsPayload(rpcData, activitySummary);

    return NextResponse.json(payload);
  } catch (err) {
    console.error('[perfil/estadisticas-generales]', err);
    return NextResponse.json({ error: 'Internal error.' }, { status: 500 });
  }
}
