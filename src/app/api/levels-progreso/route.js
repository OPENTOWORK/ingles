import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
import { findExamUnitSlugForTopicHref } from '@/lib/examTheoryProgress';
import {
  EXAM_THEORY_PROGRESS_TABLES,
  queryFirstAvailableTable,
} from '@/lib/resolveTheoryProgressTables';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

async function getUserFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const client = createClient(url, anon);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ rows: [] });
    }

    const { data, error } = await queryFirstAvailableTable(
      admin,
      EXAM_THEORY_PROGRESS_TABLES,
      (table) =>
        admin
          .from(table)
          .select('unidad, topic_href, progreso_pct, updated_at')
          .eq('uuid_usuario', user.id),
    );

    if (error) {
      return NextResponse.json({ rows: [], warning: error.message });
    }

    return NextResponse.json({ rows: data ?? [] });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Error al leer progreso' },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const topicHref = normalizeTopicHref(String(body.topic_href || '').trim());
    const progresoPct = Math.min(
      100,
      Math.max(0, Math.round(Number(body.progreso_pct) || 0)),
    );

    if (!topicHref.startsWith('/teoria/')) {
      return NextResponse.json({ error: 'topic_href inválido' }, { status: 400 });
    }

    const unidad = body.unidad || findExamUnitSlugForTopicHref(topicHref);
    if (!unidad) {
      return NextResponse.json(
        { error: 'El tema no pertenece a Exam theory' },
        { status: 400 },
      );
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ saved: false, offline: true });
    }

    const row = {
      uuid_usuario: user.id,
      unidad,
      topic_href: topicHref,
      progreso_pct: progresoPct,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await queryFirstAvailableTable(
      admin,
      EXAM_THEORY_PROGRESS_TABLES,
      (table) =>
        admin
          .from(table)
          .upsert(row, { onConflict: 'uuid_usuario,topic_href' })
          .select('unidad, topic_href, progreso_pct, updated_at')
          .single(),
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ saved: true, row: data });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Error al guardar progreso' },
      { status: 500 },
    );
  }
}
