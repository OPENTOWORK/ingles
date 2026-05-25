import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { HEARTBEAT_INTERVAL_MS, SESSION_GAP_MS } from '@/lib/userActivity';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

const supabaseUrl = getSupabaseUrl();
const supabaseAnonKey = getSupabaseAnonKey();

async function upsertPerfilActividad(db, userId, deltaSeconds, startNewSession) {
  const deltaMinutes = Math.max(0, Math.round(Number(deltaSeconds) / 60));
  if (deltaMinutes <= 0) return;

  const today = new Date().toISOString().slice(0, 10);
  const { data: row, error: readError } = await db
    .from('perfil_actividad')
    .select('study_minutes, sessions_count')
    .eq('user_id', userId)
    .eq('activity_date', today)
    .maybeSingle();

  if (readError?.code === '42P01') return;

  if (row) {
    await db
      .from('perfil_actividad')
      .update({
        study_minutes: (Number(row.study_minutes) || 0) + deltaMinutes,
        sessions_count: (Number(row.sessions_count) || 0) + (startNewSession ? 1 : 0),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('activity_date', today);
  } else {
    await db.from('perfil_actividad').insert({
      user_id: userId,
      activity_date: today,
      study_minutes: deltaMinutes,
      sessions_count: startNewSession ? 1 : 0,
    });
  }
}

export async function POST(req) {
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

    const body = await req.json().catch(() => ({}));
    const deltaSeconds = Math.min(
      Math.max(Number(body?.deltaSeconds) || Math.round(HEARTBEAT_INTERVAL_MS / 1000), 5),
      120,
    );

    const serviceKey = getSupabaseServiceRoleKey()?.trim();
    const db = serviceKey
      ? createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });

    const userId = authData.user.id;
    const now = new Date();
    const nowIso = now.toISOString();

    const { data: presence } = await db
      .from('usuario_presencia')
      .select('user_id, last_seen_at, total_session_seconds, current_session_id')
      .eq('user_id', userId)
      .maybeSingle();

    const lastSeenMs = presence?.last_seen_at
      ? new Date(presence.last_seen_at).getTime()
      : null;
    const gapMs = lastSeenMs ? now.getTime() - lastSeenMs : Infinity;
    const startNewSession = !presence || gapMs > SESSION_GAP_MS;

    let currentSessionId = presence?.current_session_id || null;
    let totalSessionSeconds = Number(presence?.total_session_seconds) || 0;
    totalSessionSeconds += deltaSeconds;

    if (startNewSession) {
      if (currentSessionId) {
        await db
          .from('usuario_sesiones_app')
          .update({ ended_at: presence?.last_seen_at || nowIso })
          .eq('id', currentSessionId)
          .eq('user_id', userId);
      }

      const { data: newSession, error: sessionError } = await db
        .from('usuario_sesiones_app')
        .insert({
          user_id: userId,
          started_at: nowIso,
          duration_seconds: deltaSeconds,
        })
        .select('id')
        .single();

      if (sessionError) {
        console.error('[activity/heartbeat] session insert', sessionError);
        return NextResponse.json({ error: 'No se pudo registrar la sesión.' }, { status: 500 });
      }

      currentSessionId = newSession.id;
    } else if (currentSessionId) {
      const { data: sessionRow } = await db
        .from('usuario_sesiones_app')
        .select('duration_seconds')
        .eq('id', currentSessionId)
        .maybeSingle();

      const prev = Number(sessionRow?.duration_seconds) || 0;
      await db
        .from('usuario_sesiones_app')
        .update({ duration_seconds: prev + deltaSeconds, ended_at: null })
        .eq('id', currentSessionId)
        .eq('user_id', userId);
    } else {
      const { data: newSession, error: sessionError } = await db
        .from('usuario_sesiones_app')
        .insert({
          user_id: userId,
          started_at: nowIso,
          duration_seconds: deltaSeconds,
        })
        .select('id')
        .single();

      if (!sessionError) {
        currentSessionId = newSession?.id || null;
      }
    }

    const upsertPayload = {
      user_id: userId,
      last_seen_at: nowIso,
      total_session_seconds: totalSessionSeconds,
      current_session_id: currentSessionId,
    };

    const { error: upsertError } = presence
      ? await db.from('usuario_presencia').update(upsertPayload).eq('user_id', userId)
      : await db.from('usuario_presencia').insert(upsertPayload);

    if (upsertError) {
      console.error('[activity/heartbeat] presence upsert', upsertError);
      return NextResponse.json({ error: 'No se pudo actualizar la presencia.' }, { status: 500 });
    }

    await upsertPerfilActividad(db, userId, deltaSeconds, startNewSession);

    return NextResponse.json({ ok: true, totalSessionSeconds });
  } catch (err) {
    console.error('[activity/heartbeat]', err);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
