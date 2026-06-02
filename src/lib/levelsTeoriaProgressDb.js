import { createHash } from 'crypto';
import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
import {
  buildTheoryExerciseDescripcion,
  parseTheoryExerciseDescripcion,
  theoryExerciseStorageKey,
  THEORY_EXERCISE_META_PREFIX,
  THEORY_EXERCISE_PASS_SCORE,
} from '@/lib/theoryExerciseMeta';
import { parseTopicLevels } from '@/lib/theoryExerciseLevelConfig';
import { findExamUnitSlugForTopicHref } from '@/lib/examTheoryProgress';
import { findTheoryApartadoForTopicHref } from '@/lib/teoriaProgress';
import {
  EXAM_THEORY_PROGRESS_TABLES,
  queryFirstAvailableTable,
} from '@/lib/resolveTheoryProgressTables';
import { SECTIONS } from '@/data/teoriaSections';

/** Sin ejercicios locales (antes 20/tema); el progreso por ejercicios viene de Supabase. */
const THEORY_EXERCISES_PER_LEVEL = 0;
const PUNTUACIONES_TABLE = 'levels_teoria_puntuaciones';
const ESTADISTICAS_TABLE = 'levels_teoria_estadisticas';
const PREGUNTAS_TABLE = 'levels_teoria_preguntas';

function stableUuidFromSeed(seed) {
  const hash = createHash('sha256').update(String(seed)).digest();
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

function stablePreguntaId(topicHref, cefrLevel, exerciseKey) {
  return stableUuidFromSeed(
    `theory-exercise:${normalizeTopicHref(topicHref)}|${cefrLevel}|${exerciseKey}`,
  );
}

async function resolveStudentRoleId(admin) {
  const candidates = ['Alumno', 'alumno', 'student', 'Student'];
  for (const nombre of candidates) {
    const { data } = await admin
      .from('Usuarios_y_Perfil_roles')
      .select('id')
      .eq('nombre', nombre)
      .maybeSingle();
    if (data?.id) return data.id;
  }
  const { data } = await admin
    .from('Usuarios_y_Perfil_roles')
    .select('id')
    .ilike('nombre', '%alumn%')
    .limit(1)
    .maybeSingle();
  return data?.id || null;
}

/**
 * FK de levels_teoria_puntuaciones / estadisticas → Usuarios_y_Perfil_users (no solo auth.users).
 */
export async function ensureAppUserProfileAdmin(admin, userId, email = null) {
  const { data: existing, error: selErr } = await admin
    .from('Usuarios_y_Perfil_users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (selErr) throw new Error(`Perfil usuario: ${selErr.message}`);
  if (existing?.id) return existing.id;

  const rolId = await resolveStudentRoleId(admin);
  const { error: insErr } = await admin.from('Usuarios_y_Perfil_users').upsert(
    {
      id: userId,
      email,
      rol_id: rolId,
      activo: true,
    },
    { onConflict: 'id' },
  );

  if (insErr) throw new Error(`Crear perfil usuario: ${insErr.message}`);
  return userId;
}

function findTopicMetaByHref(href) {
  const canonical = normalizeTopicHref(href);
  for (const topics of Object.values(SECTIONS)) {
    const topic = topics.find((item) => normalizeTopicHref(item.href) === canonical);
    if (topic) return topic;
  }
  return null;
}

function topicLevelLabel(topic) {
  if (!topic?.levels?.length) return 'B2';
  return topic.levels.join('-');
}

function resolveUnidadForTopic(topicHref) {
  return (
    findExamUnitSlugForTopicHref(topicHref) ||
    findTheoryApartadoForTopicHref(topicHref) ||
    null
  );
}

export function computeProgresoPctFromPassedKeys(topicHref, topicLevelLabel, passedStorageKeys) {
  if (!THEORY_EXERCISES_PER_LEVEL || THEORY_EXERCISES_PER_LEVEL <= 0) return 0;
  const href = normalizeTopicHref(topicHref);
  const levels = parseTopicLevels(topicLevelLabel);
  const total = Math.max(1, levels.length * THEORY_EXERCISES_PER_LEVEL);
  const passed = (passedStorageKeys || []).filter((key) =>
    String(key).startsWith(`${href}|`),
  ).length;
  return Math.min(100, Math.round((passed / total) * 100));
}

/** Ejercicios superados (algún intento con 100) por tema desde levels_teoria_puntuaciones. */
export async function fetchTheoryPassedKeysByTopic(admin, userId) {
  const { data, error } = await admin
    .from(PUNTUACIONES_TABLE)
    .select('descripcion, puntuacion, id_pregunta')
    .eq('uuid_usuario', userId)
    .like('descripcion', `${THEORY_EXERCISE_META_PREFIX}%`)
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) {
    if (error.code === '42P01') return { keysByTopic: {}, pctByTopic: {} };
    throw error;
  }

  if (!data?.length) {
    return { keysByTopic: {}, pctByTopic: {} };
  }

  const keysByTopic = {};
  const bestScoreByKey = {};

  const preguntaMetaById = {};
  const missingPreguntaIds = data
    .filter((row) => !parseTheoryExerciseDescripcion(row.descripcion) && row.id_pregunta)
    .map((row) => row.id_pregunta);

  if (missingPreguntaIds.length) {
    const { data: preguntas } = await admin
      .from(PREGUNTAS_TABLE)
      .select('id, pregunta, descripcion')
      .in('id', [...new Set(missingPreguntaIds)]);
    for (const pq of preguntas || []) {
      const parts = String(pq.descripcion || '').split(' · ');
      const href = parts[0] ? normalizeTopicHref(parts[0]) : null;
      const cefrLevel = parts[1] || 'B2';
      if (href && pq.pregunta) {
        preguntaMetaById[pq.id] = {
          topicHref: href,
          exerciseKey: pq.pregunta,
          cefrLevel,
        };
      }
    }
  }

  for (const row of data) {
    let meta = parseTheoryExerciseDescripcion(row.descripcion);
    if (!meta && row.id_pregunta) {
      meta = preguntaMetaById[row.id_pregunta] || null;
    }
    if (!meta) continue;
    const href = normalizeTopicHref(meta.topicHref);
    const storageKey = theoryExerciseStorageKey(
      meta.topicHref,
      meta.cefrLevel,
      meta.exerciseKey,
    );
    const pts = Number(row.puntuacion) || 0;
    bestScoreByKey[storageKey] = Math.max(bestScoreByKey[storageKey] ?? 0, pts);
    if (!keysByTopic[href]) keysByTopic[href] = new Set();
  }

  for (const [storageKey, best] of Object.entries(bestScoreByKey)) {
    if (best < THEORY_EXERCISE_PASS_SCORE) continue;
    const href = storageKey.split('|')[0];
    if (!keysByTopic[href]) keysByTopic[href] = new Set();
    keysByTopic[href].add(storageKey);
  }

  const pctByTopic = {};
  for (const [href, keySet] of Object.entries(keysByTopic)) {
    const meta = findTopicMetaByHref(href);
    pctByTopic[href] = computeProgresoPctFromPassedKeys(
      href,
      topicLevelLabel(meta),
      [...keySet],
    );
  }

  return { keysByTopic, pctByTopic };
}

export function mergeProgresoRowsWithPuntuaciones(rows, pctByTopic) {
  const byHref = {};

  for (const row of rows || []) {
    const href = normalizeTopicHref(row.topic_href);
    const stored = Number(row.progreso_pct ?? 0);
    const fromScores = pctByTopic[href];
    const prev = byHref[href]?.progreso_pct ?? 0;
    const progreso_pct = Math.min(
      100,
      Math.max(stored, prev, fromScores != null ? Number(fromScores) : 0),
    );
    byHref[href] = {
      ...(byHref[href] || {}),
      ...row,
      topic_href: href,
      unidad: row.unidad || row.apartado || byHref[href]?.unidad,
      apartado: row.apartado || row.unidad || byHref[href]?.apartado,
      progreso_pct,
    };
  }

  for (const [href, pct] of Object.entries(pctByTopic || {})) {
    if (byHref[href]) continue;
    const unidad = resolveUnidadForTopic(href);
    if (!unidad) continue;
    byHref[href] = {
      topic_href: href,
      unidad,
      progreso_pct: Math.min(100, Math.max(0, Math.round(Number(pct)))),
      updated_at: null,
    };
  }

  return Object.values(byHref);
}

export async function upsertLevelsTeoriaProgreso(admin, userId, topicHref, progresoPct) {
  const href = normalizeTopicHref(topicHref);
  const unidad = resolveUnidadForTopic(href);
  if (!unidad) return null;

  const row = {
    uuid_usuario: userId,
    unidad,
    topic_href: href,
    progreso_pct: Math.min(100, Math.max(0, Math.round(progresoPct))),
    updated_at: new Date().toISOString(),
  };

  const { error } = await queryFirstAvailableTable(admin, EXAM_THEORY_PROGRESS_TABLES, (table) =>
    admin.from(table).upsert(row, { onConflict: 'uuid_usuario,topic_href' }),
  );

  if (error) throw error;
  return row;
}

export async function upsertTeoriaEstadisticas(admin, userId, preguntaId, score) {
  const correct = Number(score) >= 100;
  const now = new Date().toISOString();

  const { data: existing, error: readErr } = await admin
    .from(ESTADISTICAS_TABLE)
    .select(
      'id, accesos, intentos_completados, respuestas_evaluadas, respuestas_correctas, respuestas_incorrectas, mejor_porcentaje',
    )
    .eq('usuario_id', userId)
    .eq('pregunta_id', preguntaId)
    .maybeSingle();

  if (readErr) {
    if (readErr.code === '42P01') return;
    throw readErr;
  }

  if (existing?.id) {
    const mejor = Math.max(Number(existing.mejor_porcentaje) || 0, Number(score) || 0);
    const { error } = await admin
      .from(ESTADISTICAS_TABLE)
      .update({
        accesos: (Number(existing.accesos) || 0) + 1,
        intentos_completados: (Number(existing.intentos_completados) || 0) + 1,
        respuestas_evaluadas: (Number(existing.respuestas_evaluadas) || 0) + 1,
        respuestas_correctas:
          (Number(existing.respuestas_correctas) || 0) + (correct ? 1 : 0),
        respuestas_incorrectas:
          (Number(existing.respuestas_incorrectas) || 0) + (correct ? 0 : 1),
        ultimo_porcentaje: score,
        mejor_porcentaje: mejor,
        ultima_interaccion: now,
        actualizado_en: now,
      })
      .eq('id', existing.id);
    if (error) throw error;
    return;
  }

  const { error } = await admin.from(ESTADISTICAS_TABLE).insert({
    usuario_id: userId,
    pregunta_id: preguntaId,
    skills_id: null,
    accesos: 1,
    intentos_completados: 1,
    respuestas_evaluadas: 1,
    respuestas_correctas: correct ? 1 : 0,
    respuestas_incorrectas: correct ? 0 : 1,
    mejor_porcentaje: score,
    ultimo_porcentaje: score,
    tiempo_segundos_total: 0,
    primera_interaccion: now,
    ultima_interaccion: now,
    metadata: { source: 'theory_exercises' },
    creado_en: now,
    actualizado_en: now,
  });

  if (error) {
    if (error.code === '23505') {
      return upsertTeoriaEstadisticas(admin, userId, preguntaId, score);
    }
    throw error;
  }
}

async function ensureTeoriaPreguntaId(admin, { topicHref, cefrLevel, exerciseKey }) {
  const id = stablePreguntaId(topicHref, cefrLevel, exerciseKey);

  const { data: existing } = await admin
    .from(PREGUNTAS_TABLE)
    .select('id')
    .eq('id', id)
    .maybeSingle();

  if (existing?.id) return id;

  // id_nivel / id_skills tienen DEFAULT gen_random_uuid() en BD → FK falla si no se anulan.
  const { error } = await admin.from(PREGUNTAS_TABLE).upsert(
    {
      id,
      pregunta: exerciseKey,
      descripcion: `${topicHref} · ${cefrLevel}`,
      id_nivel: null,
      id_skills: null,
      id_tipo_preguntas: null,
    },
    { onConflict: 'id' },
  );

  if (error) throw error;
  return id;
}

/** Una fila por intento (acierto o fallo); examen_id/parte_numero null evita el unique por parte. */
async function insertTeoriaPuntuacionIntento(admin, row) {
  const { error } = await admin.from(PUNTUACIONES_TABLE).insert(row);
  if (error) throw error;
}

export async function recordTheoryExerciseAttempt(admin, {
  userId,
  topicHref,
  cefrLevel,
  exerciseKey,
  topicLevelLabel,
  score = 0,
  userEmail = null,
}) {
  await ensureAppUserProfileAdmin(admin, userId, userEmail);

  const href = normalizeTopicHref(topicHref);
  const normalizedScore = Math.min(100, Math.max(0, Math.round(Number(score) || 0)));
  const correct = normalizedScore >= THEORY_EXERCISE_PASS_SCORE;

  const preguntaId = await ensureTeoriaPreguntaId(admin, {
    topicHref: href,
    cefrLevel,
    exerciseKey,
  });

  const descripcion = buildTheoryExerciseDescripcion({
    topicHref: href,
    exerciseKey,
    cefrLevel,
    score: normalizedScore,
  });

  const storageKey = theoryExerciseStorageKey(href, cefrLevel, exerciseKey);

  await insertTeoriaPuntuacionIntento(admin, {
    id_pregunta: preguntaId,
    uuid_usuario: userId,
    puntuacion: normalizedScore,
    descripcion,
    examen_id: null,
    parte_numero: null,
    correctas: correct ? 1 : 0,
    total_preguntas: 1,
    aprobado: correct,
    aciertos: correct ? 1 : 0,
    fallos: correct ? 0 : 1,
  });

  await upsertTeoriaEstadisticas(admin, userId, preguntaId, normalizedScore);

  const { keysByTopic } = await fetchTheoryPassedKeysByTopic(admin, userId);
  const passedKeys = [...(keysByTopic[href] || [])];

  const label = topicLevelLabel || topicLevelLabelFromHref(href);
  const progresoPct = computeProgresoPctFromPassedKeys(href, label, passedKeys);

  await upsertLevelsTeoriaProgreso(admin, userId, href, progresoPct);

  const hubApartado = findTheoryApartadoForTopicHref(href);
  if (hubApartado) {
    await admin.from('teoria_progreso').upsert(
      {
        uuid_usuario: userId,
        apartado: hubApartado,
        topic_href: href,
        progreso_pct: progresoPct,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'uuid_usuario,topic_href' },
    );
  }

  return {
    progresoPct,
    passedKeys,
    correct,
    score: normalizedScore,
    storageKey,
  };
}

/** @deprecated Usa recordTheoryExerciseAttempt */
export const recordTheoryExercisePass = recordTheoryExerciseAttempt;

function topicLevelLabelFromHref(href) {
  return topicLevelLabel(findTopicMetaByHref(href));
}

export function getAllTheoryTopicHrefs() {
  const hrefs = new Set();
  for (const topics of Object.values(SECTIONS)) {
    topics.forEach((t) => hrefs.add(normalizeTopicHref(t.href)));
  }
  return [...hrefs];
}
