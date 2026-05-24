import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
import { findExamUnitSlugForTopicHref } from '@/lib/examTheoryProgress';
import { findTheoryApartadoForTopicHref } from '@/lib/teoriaProgress';
import { parseTopicLevels } from '@/lib/theoryExerciseLevelConfig';
import {
  buildTheoryExerciseDescripcion,
  parseTheoryExerciseDescripcion,
  theoryExerciseStorageKey,
} from '@/lib/theoryExerciseMeta';
import {
  EXAM_THEORY_PROGRESS_TABLES,
  EXAM_THEORY_PUNTUACIONES_TABLES,
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

function stablePreguntaId(topicHref, cefrLevel, exerciseKey) {
  const hash = createHash('sha256')
    .update(`theory-exercise:${topicHref}|${cefrLevel}|${exerciseKey}`)
    .digest();
  const b = Buffer.from(hash.subarray(0, 16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  return [
    b.subarray(0, 4).toString('hex'),
    b.subarray(4, 6).toString('hex'),
    b.subarray(6, 8).toString('hex'),
    b.subarray(8, 10).toString('hex'),
    b.subarray(10, 16).toString('hex'),
  ].join('-');
}

async function ensureTeoriaPregunta(admin, { topicHref, cefrLevel, exerciseKey }) {
  const id = stablePreguntaId(topicHref, cefrLevel, exerciseKey);
  const { data: existing } = await admin
    .from('levels_teoria_preguntas')
    .select('id')
    .eq('id', id)
    .maybeSingle();

  if (existing?.id) return id;

  const { error } = await admin.from('levels_teoria_preguntas').upsert(
    {
      id,
      pregunta: exerciseKey,
      descripcion: `${topicHref} · ${cefrLevel}`,
    },
    { onConflict: 'id' },
  );

  if (error) throw error;
  return id;
}

async function fetchPassedExerciseKeys(admin, userId, topicHref) {
  const { data, error } = await queryFirstAvailableTable(
    admin,
    EXAM_THEORY_PUNTUACIONES_TABLES,
    (table) =>
      admin
        .from(table)
        .select('descripcion, puntuacion')
        .eq('uuid_usuario', userId)
        .eq('puntuacion', 100)
        .order('created_at', { ascending: false })
        .limit(500),
  );

  if (error || !data?.length) return [];

  const keys = new Set();
  for (const row of data) {
    const meta = parseTheoryExerciseDescripcion(row.descripcion);
    if (!meta || normalizeTopicHref(meta.topicHref) !== normalizeTopicHref(topicHref)) continue;
    keys.add(theoryExerciseStorageKey(meta.topicHref, meta.cefrLevel, meta.exerciseKey));
  }
  return [...keys];
}

function computeProgressPct(topicHref, topicLevelLabel, passedKeys) {
  const href = normalizeTopicHref(topicHref);
  const levels = parseTopicLevels(topicLevelLabel);
  const total = Math.max(1, levels.length * 20);
  const passed = passedKeys.filter((key) => key.startsWith(`${href}|`)).length;
  return Math.min(100, Math.round((passed / total) * 100));
}

async function upsertTopicProgress(admin, userId, topicHref, progresoPct) {
  const examUnidad = findExamUnitSlugForTopicHref(topicHref);
  const hubApartado = findTheoryApartadoForTopicHref(topicHref);

  if (examUnidad) {
    const row = {
      uuid_usuario: userId,
      unidad: examUnidad,
      topic_href: topicHref,
      progreso_pct: progresoPct,
      updated_at: new Date().toISOString(),
    };
    await queryFirstAvailableTable(admin, EXAM_THEORY_PROGRESS_TABLES, (table) =>
      admin.from(table).upsert(row, { onConflict: 'uuid_usuario,topic_href' }),
    );
  }

  if (hubApartado) {
    const row = {
      uuid_usuario: userId,
      apartado: hubApartado,
      topic_href: topicHref,
      progreso_pct: progresoPct,
      updated_at: new Date().toISOString(),
    };
    await admin.from('teoria_progreso').upsert(row, { onConflict: 'uuid_usuario,topic_href' });
  }
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const topicHref = normalizeTopicHref(
      String(new URL(request.url).searchParams.get('topic_href') || '').trim(),
    );
    if (!topicHref.startsWith('/teoria/')) {
      return NextResponse.json({ error: 'topic_href inválido' }, { status: 400 });
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ passedKeys: [] });
    }

    const passedKeys = await fetchPassedExerciseKeys(admin, user.id, topicHref);
    return NextResponse.json({ passedKeys });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Error al leer progreso de ejercicios' },
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
    const exerciseKey = String(body.exercise_key || '').trim();
    const cefrLevel = String(body.cefr_level || 'B2').trim().toUpperCase();
    const topicLevelLabel = String(body.topic_level_label || cefrLevel).trim();
    const score = Number(body.puntuacion ?? body.score ?? 0);

    if (!topicHref.startsWith('/teoria/') || !exerciseKey) {
      return NextResponse.json({ error: 'Datos de ejercicio inválidos' }, { status: 400 });
    }

    if (score < 100) {
      return NextResponse.json({
        saved: false,
        reason: 'Solo las respuestas correctas avanzan el progreso.',
      });
    }

    const admin = getAdminClient();
    if (!admin) {
      return NextResponse.json({ saved: false, offline: true });
    }

    const storageKey = theoryExerciseStorageKey(topicHref, cefrLevel, exerciseKey);
    const existingKeys = await fetchPassedExerciseKeys(admin, user.id, topicHref);
    if (existingKeys.includes(storageKey)) {
      const progresoPct = computeProgressPct(topicHref, topicLevelLabel, existingKeys);
      return NextResponse.json({
        saved: true,
        alreadyPassed: true,
        progreso_pct: progresoPct,
        passedKeys: existingKeys,
      });
    }

    const preguntaId = await ensureTeoriaPregunta(admin, {
      topicHref,
      cefrLevel,
      exerciseKey,
    });

    const descripcion = buildTheoryExerciseDescripcion({
      topicHref,
      exerciseKey,
      cefrLevel,
    });

    const puntRow = {
      id_pregunta: preguntaId,
      uuid_usuario: user.id,
      puntuacion: 100,
      descripcion,
    };

    const { error: puntErr } = await queryFirstAvailableTable(
      admin,
      EXAM_THEORY_PUNTUACIONES_TABLES,
      (table) => admin.from(table).insert(puntRow),
    );

    if (puntErr) {
      return NextResponse.json({ error: puntErr.message }, { status: 500 });
    }

    const passedKeys = await fetchPassedExerciseKeys(admin, user.id, topicHref);
    if (!passedKeys.includes(storageKey)) {
      passedKeys.push(storageKey);
    }

    const progresoPct = computeProgressPct(topicHref, topicLevelLabel, passedKeys);
    await upsertTopicProgress(admin, user.id, topicHref, progresoPct);

    return NextResponse.json({
      saved: true,
      progreso_pct: progresoPct,
      passedKeys,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Error al guardar progreso de ejercicio' },
      { status: 500 },
    );
  }
}
