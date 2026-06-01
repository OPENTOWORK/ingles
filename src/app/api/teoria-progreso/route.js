import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findTheoryApartadoForTopicHref } from '@/lib/teoriaProgress';
import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
import { THEORY_SECTION_CATALOG } from '@/data/teoriaSections';
import {
  EXAM_THEORY_PROGRESS_TABLES,
  queryFirstAvailableTable,
} from '@/lib/resolveTheoryProgressTables';
import {
  fetchTheoryPassedKeysByTopic,
  mergeProgresoRowsWithPuntuaciones,
  upsertLevelsTeoriaProgreso,
} from '@/lib/levelsTeoriaProgressDb';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabaseEnv';

const HUB_APARTADO_SLUGS = new Set(THEORY_SECTION_CATALOG.map((area) => area.slug));

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

function toHubRow(row) {
  const apartado = row.apartado || row.unidad;
  return {
    apartado,
    topic_href: row.topic_href,
    progreso_pct: row.progreso_pct,
    updated_at: row.updated_at,
  };
}

function filterHubRows(rows) {
  return (rows || []).filter((row) => {
    const apartado = row.apartado || row.unidad;
    if (apartado && HUB_APARTADO_SLUGS.has(apartado)) return true;
    const href = normalizeTopicHref(row.topic_href);
    return Boolean(findTheoryApartadoForTopicHref(href));
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

    const [{ data: levelsRows, error: levelsErr }, { data: legacyRows }, { pctByTopic }] =
      await Promise.all([
        queryFirstAvailableTable(admin, EXAM_THEORY_PROGRESS_TABLES, (table) =>
          admin
            .from(table)
            .select('unidad, topic_href, progreso_pct, updated_at')
            .eq('uuid_usuario', user.id),
        ),
        admin
          .from('teoria_progreso')
          .select('apartado, topic_href, progreso_pct, updated_at')
          .eq('uuid_usuario', user.id),
        fetchTheoryPassedKeysByTopic(admin, user.id),
      ]);

    const hubPctByTopic = {};
    for (const [href, pct] of Object.entries(pctByTopic)) {
      if (findTheoryApartadoForTopicHref(href)) hubPctByTopic[href] = pct;
    }

    const levelsMapped = (levelsRows ?? []).map((row) => ({
      ...row,
      apartado: row.unidad,
    }));

    const legacy = legacyRows ?? [];
    const combined = [...levelsMapped, ...legacy];
    const merged = filterHubRows(
      mergeProgresoRowsWithPuntuaciones(combined, hubPctByTopic).map(toHubRow),
    );

    if (levelsErr && !legacy.length && !merged.length) {
      return NextResponse.json({ rows: [], warning: levelsErr.message });
    }

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

    const apartado = body.apartado || findTheoryApartadoForTopicHref(topicHref);
    if (!apartado) {
      return NextResponse.json(
        { error: 'El tema no pertenece al hub Theory' },
        { status: 400 },
      );
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ saved: false, offline: true });
    }

    await upsertLevelsTeoriaProgreso(admin, user.id, topicHref, progresoPct);

    const { data, error } = await admin
      .from('teoria_progreso')
      .upsert(
        {
          uuid_usuario: user.id,
          apartado,
          topic_href: topicHref,
          progreso_pct: progresoPct,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'uuid_usuario,topic_href' },
      )
      .select('apartado, topic_href, progreso_pct, updated_at')
      .single();

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
