import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseUserFromRequest } from '@/lib/getSupabaseUserFromRequest';
import {
  buildExerciseFavoriteMeta,
  serializeExerciseFavoriteMeta,
} from '@/lib/exerciseFavoriteMeta';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

function getAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function unauthorized() {
  return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
}

function misconfigured() {
  return NextResponse.json(
    { error: 'Server not configured (missing SUPABASE_SERVICE_ROLE_KEY).' },
    { status: 503 },
  );
}

/** @param {import('@supabase/supabase-js').SupabaseClient} admin */
async function verifyPreguntaExists(admin, preguntaId) {
  const { data, error } = await admin
    .from('levels_preguntas')
    .select('id')
    .eq('id', preguntaId)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data?.id);
}

export async function GET(req) {
  try {
    const auth = await getSupabaseUserFromRequest(req);
    if (!auth?.user?.id) return unauthorized();

    const admin = getAdminClient();
    if (!admin) return misconfigured();

    const preguntaId = new URL(req.url).searchParams.get('preguntaId')?.trim().replace(/\/+$/, '') || '';

    if (preguntaId) {
      const { data, error } = await admin
        .from('levels_favoritos')
        .select('id, pregunta_id, descripcion, created_at')
        .eq('usuario_id', auth.user.id)
        .eq('pregunta_id', preguntaId)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ isFavorite: Boolean(data?.id), favorite: data || null });
    }

    const { data, error } = await admin
      .from('levels_favoritos')
      .select('id, pregunta_id, descripcion, created_at')
      .eq('usuario_id', auth.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ favorites: data || [] });
  } catch (err) {
    console.error('[api/levels/exercise-favorites] GET', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await getSupabaseUserFromRequest(req);
    if (!auth?.user?.id) return unauthorized();

    const admin = getAdminClient();
    if (!admin) return misconfigured();

    const body = await req.json().catch(() => ({}));
    const preguntaId = String(body?.preguntaId || '')
      .trim()
      .replace(/\/+$/, '');
    const meta = buildExerciseFavoriteMeta(body?.meta || {});

    if (!preguntaId) {
      return NextResponse.json({ error: 'Missing preguntaId.' }, { status: 400 });
    }

    const exists = await verifyPreguntaExists(admin, preguntaId);
    if (!exists) {
      return NextResponse.json({ error: 'Exercise not found.' }, { status: 404 });
    }

    const payload = {
      usuario_id: auth.user.id,
      pregunta_id: preguntaId,
      descripcion: serializeExerciseFavoriteMeta(meta),
    };

    const { data: existing, error: existingErr } = await admin
      .from('levels_favoritos')
      .select('id, pregunta_id, descripcion, created_at')
      .eq('usuario_id', auth.user.id)
      .eq('pregunta_id', preguntaId)
      .maybeSingle();

    if (existingErr) {
      return NextResponse.json({ error: existingErr.message }, { status: 500 });
    }

    if (existing?.id) {
      return NextResponse.json({ favorite: existing, created: false });
    }

    const { data, error } = await admin
      .from('levels_favoritos')
      .insert(payload)
      .select('id, pregunta_id, descripcion, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ favorite: data, created: true });
  } catch (err) {
    console.error('[api/levels/exercise-favorites] POST', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const auth = await getSupabaseUserFromRequest(req);
    if (!auth?.user?.id) return unauthorized();

    const admin = getAdminClient();
    if (!admin) return misconfigured();

    const body = await req.json().catch(() => ({}));
    const favoriteId = String(body?.favoriteId || '').trim();
    const preguntaId = String(body?.preguntaId || '')
      .trim()
      .replace(/\/+$/, '');

    if (!favoriteId && !preguntaId) {
      return NextResponse.json({ error: 'Missing favoriteId or preguntaId.' }, { status: 400 });
    }

    let query = admin.from('levels_favoritos').delete().eq('usuario_id', auth.user.id);
    if (favoriteId) query = query.eq('id', favoriteId);
    else query = query.eq('pregunta_id', preguntaId);

    const { error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/levels/exercise-favorites] DELETE', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
