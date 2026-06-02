import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
import { isTeoriaTipoOpen, teoriaTipoLabel } from '@/lib/levelsTeoriaExerciseTypes';
import {
  findTheoryPartByHref,
  getAllTheoryPartOptions,
} from '@/lib/theoryPartsCatalog';
import {
  buildTeoriaPreguntaDescripcion,
  buildTeoriaUnitMetaDescripcion,
  parseStudentInstructionFromTeoriaDescripcion,
  parseTopicHrefFromTeoriaDescripcion,
} from '@/lib/teoriaExerciseDescripcion';

const PREGUNTAS_TABLE = 'levels_teoria_preguntas';
const RESPUESTAS_TABLE = 'levels_teoria_respuestas';
const ABIERTAS_TABLE = 'levels_teoria_respuestas_abiertas';
const PUNTUACIONES_TABLE = 'levels_teoria_puntuaciones';
const ESTADISTICAS_TABLE = 'levels_teoria_estadisticas';

async function resolveCatalogRow(db, table, id, label) {
  const { data, error } = await db.from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error(`${label} no encontrado.`);
  return data;
}

export async function fetchTeoriaEjercicioDetail(db, preguntaId) {
  const { data: pregunta, error } = await db
    .from(PREGUNTAS_TABLE)
    .select('*')
    .eq('id', preguntaId)
    .maybeSingle();

  if (error) throw error;
  if (!pregunta?.id) return null;

  const [nivelRes, skillRes, tipoRes, cerradasRes, abiertaRes] = await Promise.all([
    pregunta.id_nivel
      ? db.from('levels').select('id, nombre').eq('id', pregunta.id_nivel).maybeSingle()
      : { data: null },
    pregunta.id_skills
      ? db.from('levels_skills').select('id, nombre').eq('id', pregunta.id_skills).maybeSingle()
      : { data: null },
    pregunta.id_tipo_preguntas
      ? db
          .from('levels_teoria_tipos_preguntas')
          .select('id, Nombre, Descripcion')
          .eq('id', pregunta.id_tipo_preguntas)
          .maybeSingle()
      : { data: null },
    db
      .from(RESPUESTAS_TABLE)
      .select('id, respuesta, Correcta')
      .eq('id_preguntas_teoria', preguntaId)
      .order('id', { ascending: true }),
    db
      .from(ABIERTAS_TABLE)
      .select('id, respuesta, descripcion')
      .eq('id_preguntas', preguntaId)
      .maybeSingle(),
  ]);

  const tipo = tipoRes?.data || null;
  const open = isTeoriaTipoOpen(tipo);
  const topicHref = parseTopicHrefFromTeoriaDescripcion(pregunta.descripcion);
  const theoryPart = topicHref
    ? findTheoryPartByHref(getAllTheoryPartOptions(), topicHref)
    : null;

  return {
    ...pregunta,
    nivel: nivelRes?.data || null,
    skill: skillRes?.data || null,
    tipo,
    answerMode: open ? 'open' : 'closed',
    topicHref: topicHref || '',
    theoryPart,
    instruction: parseStudentInstructionFromTeoriaDescripcion(pregunta.descripcion),
    opciones: (cerradasRes.data || []).map((r) => ({
      id: r.id,
      text: String(r.respuesta || '').trim(),
      correcta: Boolean(r.Correcta),
    })),
    respuestaAbierta: abiertaRes?.data?.respuesta
      ? String(abiertaRes.data.respuesta)
      : '',
    respuestaAbiertaDescripcion: abiertaRes?.data?.descripcion
      ? String(abiertaRes.data.descripcion)
      : '',
    respuestaAbiertaId: abiertaRes?.data?.id || null,
  };
}

export async function updateTeoriaEjercicio(db, preguntaId, body) {
  const existing = await fetchTeoriaEjercicioDetail(db, preguntaId);
  if (!existing) throw new Error('Ejercicio no encontrado.');

  const nivelId = body.nivelId || body.id_nivel || existing.id_nivel;
  const skillId = body.skillId || body.id_skills || existing.id_skills;
  const tipoId = body.tipoId || body.id_tipo_preguntas || existing.id_tipo_preguntas;
  const topicHref = normalizeTopicHref(
    body.topicHref || body.topicPartHref || existing.topicHref || '',
  );

  if (!topicHref) {
    throw new Error('Selecciona la parte de teoría.');
  }

  const [nivel, skill, tipo] = await Promise.all([
    resolveCatalogRow(db, 'levels', nivelId, 'Nivel'),
    resolveCatalogRow(db, 'levels_skills', skillId, 'Skill'),
    resolveCatalogRow(db, 'levels_teoria_tipos_preguntas', tipoId, 'Tipo de pregunta'),
  ]);

  const theoryPart = findTheoryPartByHref(getAllTheoryPartOptions(), topicHref);
  if (!theoryPart) throw new Error('La parte de teoría no es válida.');

  const topicHint = body.topicHint?.trim() || body.topic?.trim() || '';
  const pregunta = String(body.pregunta ?? existing.pregunta ?? '').trim();
  const instruction = String(
    body.instruction ?? body.studentInstruction ?? existing.instruction ?? '',
  ).trim();

  if (!pregunta) throw new Error('La pregunta no puede estar vacía.');

  const metaDesc = buildTeoriaUnitMetaDescripcion({
    topicHref,
    theoryPartLabel: theoryPart.label,
    tipoLabel: teoriaTipoLabel(tipo),
    nivelNombre: nivel.nombre,
    skillNombre: skill.nombre,
    topicHint,
  });
  const descripcion = buildTeoriaPreguntaDescripcion(metaDesc, instruction);

  const { error: updErr } = await db
    .from(PREGUNTAS_TABLE)
    .update({
      id_nivel: nivelId,
      id_skills: skillId,
      id_tipo_preguntas: tipoId,
      pregunta,
      descripcion,
    })
    .eq('id', preguntaId);

  if (updErr) throw new Error(updErr.message);

  const open = isTeoriaTipoOpen(tipo);

  if (open) {
    await db.from(RESPUESTAS_TABLE).delete().eq('id_preguntas_teoria', preguntaId);

    const modelAnswer = String(
      body.respuestaAbierta ?? existing.respuestaAbierta ?? '',
    ).trim();
    const rubric = String(
      body.respuestaAbiertaDescripcion ?? existing.respuestaAbiertaDescripcion ?? '',
    ).trim();

    if (existing.respuestaAbiertaId) {
      const { error } = await db
        .from(ABIERTAS_TABLE)
        .update({
          respuesta: modelAnswer || 'Model answer',
          descripcion: rubric || 'Accept answers that match the model.',
        })
        .eq('id', existing.respuestaAbiertaId);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await db.from(ABIERTAS_TABLE).insert({
        id_preguntas: preguntaId,
        respuesta: modelAnswer || 'Model answer',
        descripcion: rubric || 'Accept answers that match the model.',
      });
      if (error) throw new Error(error.message);
    }
  } else {
    await db.from(ABIERTAS_TABLE).delete().eq('id_preguntas', preguntaId);

    let opciones = Array.isArray(body.opciones) ? body.opciones : existing.opciones;
    opciones = opciones
      .map((o) => ({
        text: String(o.text || o.respuesta || '').trim(),
        correcta: Boolean(o.correcta ?? o.Correcta),
      }))
      .filter((o) => o.text);

    if (!opciones.length) throw new Error('Añade al menos una opción de respuesta.');

    if (!opciones.some((o) => o.correcta)) opciones[0].correcta = true;

    await db.from(RESPUESTAS_TABLE).delete().eq('id_preguntas_teoria', preguntaId);

    const rows = opciones.map((o) => ({
      id_preguntas_teoria: preguntaId,
      respuesta: o.text,
      Correcta: o.correcta,
    }));

    const { error: insErr } = await db.from(RESPUESTAS_TABLE).insert(rows);
    if (insErr) throw new Error(insErr.message);
  }

  return fetchTeoriaEjercicioDetail(db, preguntaId);
}

export async function deleteTeoriaEjercicio(db, preguntaId) {
  const existing = await fetchTeoriaEjercicioDetail(db, preguntaId);
  if (!existing) throw new Error('Ejercicio no encontrado.');

  const { error: puntErr } = await db
    .from(PUNTUACIONES_TABLE)
    .delete()
    .eq('id_pregunta', preguntaId);
  if (puntErr && puntErr.code !== '42P01') throw new Error(puntErr.message);

  const { error: statsErr } = await db
    .from(ESTADISTICAS_TABLE)
    .delete()
    .eq('pregunta_id', preguntaId);
  if (statsErr && statsErr.code !== '42P01') throw new Error(statsErr.message);

  await db.from(RESPUESTAS_TABLE).delete().eq('id_preguntas_teoria', preguntaId);
  await db.from(ABIERTAS_TABLE).delete().eq('id_preguntas', preguntaId);

  const { error } = await db.from(PREGUNTAS_TABLE).delete().eq('id', preguntaId);
  if (error) throw new Error(error.message);

  return { ok: true, id: preguntaId };
}

/** @param {import('@supabase/supabase-js').SupabaseClient} db */
export async function deleteManyTeoriaEjercicios(db, preguntaIds) {
  const ids = [...new Set((preguntaIds || []).map(String).filter(Boolean))];
  if (!ids.length) return { deleted: [], failed: [] };

  const deleted = [];
  const failed = [];
  for (const id of ids) {
    try {
      await deleteTeoriaEjercicio(db, id);
      deleted.push(id);
    } catch (err) {
      failed.push({ id, error: err?.message || 'Error' });
    }
  }
  return { deleted, failed };
}
