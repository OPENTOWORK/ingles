import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
import { findExamUnitSlugForTopicHref } from '@/lib/examTheoryProgress';
import { EXAM_THEORY_CATALOG } from '@/data/teoriaSections';
import {
  fetchTheoryPassedKeysByTopic,
  mergeProgresoRowsWithPuntuaciones,
  upsertLevelsTeoriaProgreso,
} from '@/lib/levelsTeoriaProgressDb';
import {
  EXAM_THEORY_PROGRESS_TABLES,
  queryFirstAvailableTable,
} from '@/lib/resolveTheoryProgressTables';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

const EXAM_UNIT_SLUGS = new Set(EXAM_THEORY_CATALOG.map((area) => area.slug));

function getAdminClient() {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function getUserFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '')?.trim();
  if (!token) return null;

  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  if (!url || !anon) return null;

  const client = createClient(url, anon);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return null;
  return data.user;
}

function filterExamTheoryRows(rows) {
  return (rows || []).filter((row) => {
    const unidad = row.unidad || row.apartado;
    if (unidad && EXAM_UNIT_SLUGS.has(unidad)) return true;
    const href = normalizeTopicHref(row.topic_href);
    return Boolean(findExamUnitSlugForTopicHref(href));
  });
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

    const [{ data, error }, { pctByTopic }] = await Promise.all([
      queryFirstAvailableTable(admin, EXAM_THEORY_PROGRESS_TABLES, (table) =>
        admin
          .from(table)
          .select('unidad, topic_href, progreso_pct, updated_at')
          .eq('uuid_usuario', user.id),
      ),
      fetchTheoryPassedKeysByTopic(admin, user.id),
    ]);

    if (error) {
      return NextResponse.json({ rows: [], warning: error.message });
    }

    const examPctByTopic = {};
    for (const [href, pct] of Object.entries(pctByTopic)) {
      if (findExamUnitSlugForTopicHref(href)) examPctByTopic[href] = pct;
    }

    const merged = filterExamTheoryRows(
      mergeProgresoRowsWithPuntuaciones(data ?? [], examPctByTopic),
    );

    return NextResponse.json({ rows: merged });
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
        { error: 'El tema no pertenece a Exam Strategies' },
        { status: 400 },
      );
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ saved: false, offline: true });
    }

    const row = await upsertLevelsTeoriaProgreso(admin, user.id, topicHref, progresoPct);

    return NextResponse.json({
      saved: true,
      row: { ...row, unidad },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Error al guardar progreso' },
      { status: 500 },
    );
  }
}
