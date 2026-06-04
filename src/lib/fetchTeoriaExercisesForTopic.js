import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
import {
  isTeoriaTipoOpen,
  parseTeoriaTipoNumber,
  teoriaTipoColloquialLabel,
  teoriaTipoLabel,
} from '@/lib/levelsTeoriaExerciseTypes';
import { parseTopicHrefFromTeoriaDescripcion, parseStudentInstructionFromTeoriaDescripcion } from '@/lib/teoriaExerciseDescripcion';

const PREGUNTAS_TABLE = 'levels_teoria_preguntas';
const RESPUESTAS_TABLE = 'levels_teoria_respuestas';
const ABIERTAS_TABLE = 'levels_teoria_respuestas_abiertas';

/**
 * @typedef {Object} TeoriaExerciseDto
 * @property {string} id
 * @property {string} pregunta
 * @property {string} instruction
 * @property {string} tipoLabel
 * @property {string} tipoColloquialLabel
 * @property {number|null} tipoNum
 * @property {'open'|'closed'} answerMode
 * @property {{ text: string, correcta: boolean }[]} opciones
 * @property {string|null} respuestaAbierta
 * @property {string|null} respuestaAbiertaDescripcion
 */

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} db
 * @param {{ topicHref: string, cefrLevel?: string, allCefrLevels?: boolean }} params
 * @returns {Promise<TeoriaExerciseDto[]>}
 */
export async function fetchTeoriaExercisesForTopic(db, {
  topicHref,
  cefrLevel = 'B2',
  allCefrLevels = false,
}) {
  const href = normalizeTopicHref(topicHref);
  if (!href) return [];

  let nivelId = null;
  if (!allCefrLevels) {
    const levelCode = String(cefrLevel || 'B2').trim().toLowerCase();
    const { data: nivelRow } = await db
      .from('levels')
      .select('id')
      .ilike('nombre', levelCode)
      .maybeSingle();
    nivelId = nivelRow?.id || null;
  }

  let query = db
    .from(PREGUNTAS_TABLE)
    .select('id, pregunta, descripcion, id_nivel, id_skills, id_tipo_preguntas, created_at')
    .like('descripcion', `${href}%`)
    .order('created_at', { ascending: true });

  if (nivelId) query = query.eq('id_nivel', nivelId);

  const { data: preguntas, error } = await query;
  if (error) throw error;
  if (!preguntas?.length) return [];

  const ids = preguntas.map((p) => p.id);
  const tipoIds = [...new Set(preguntas.map((p) => p.id_tipo_preguntas).filter(Boolean))];

  const [cerradasRes, abiertasRes, tiposRes] = await Promise.all([
    db
      .from(RESPUESTAS_TABLE)
      .select('id_preguntas_teoria, respuesta, Correcta')
      .in('id_preguntas_teoria', ids),
    db.from(ABIERTAS_TABLE).select('id_preguntas, respuesta, descripcion').in('id_preguntas', ids),
    tipoIds.length
      ? db.from('levels_teoria_tipos_preguntas').select('id, Nombre, Descripcion').in('id', tipoIds)
      : { data: [] },
  ]);

  if (cerradasRes.error) throw cerradasRes.error;
  if (abiertasRes.error) throw abiertasRes.error;

  const opcionesByPregunta = {};
  for (const row of cerradasRes.data || []) {
    const pid = row.id_preguntas_teoria;
    if (!opcionesByPregunta[pid]) opcionesByPregunta[pid] = [];
    opcionesByPregunta[pid].push({
      text: String(row.respuesta || '').trim(),
      correcta: Boolean(row.Correcta),
    });
  }

  const abiertaByPregunta = Object.fromEntries(
    (abiertasRes.data || []).map((row) => [row.id_preguntas, row]),
  );

  const tipoById = Object.fromEntries((tiposRes.data || []).map((t) => [t.id, t]));

  return preguntas
    .filter((p) => parseTopicHrefFromTeoriaDescripcion(p.descripcion) === href)
    .map((p) => {
      const tipo = tipoById[p.id_tipo_preguntas] || null;
      const open = isTeoriaTipoOpen(tipo);
      const abierta = abiertaByPregunta[p.id] || null;
      const instruction =
        parseStudentInstructionFromTeoriaDescripcion(p.descripcion) ||
        String(p.descripcion || '').split(' | ').pop()?.trim() ||
        '';

      const tipoNum = parseTeoriaTipoNumber(tipo);

      return {
        id: p.id,
        pregunta: String(p.pregunta || '').trim(),
        instruction,
        tipoLabel: teoriaTipoLabel(tipo),
        tipoColloquialLabel: teoriaTipoColloquialLabel(tipo),
        tipoNum,
        answerMode: open ? 'open' : 'closed',
        opciones: opcionesByPregunta[p.id] || [],
        respuestaAbierta: abierta?.respuesta ? String(abierta.respuesta) : null,
        respuestaAbiertaDescripcion: abierta?.descripcion
          ? String(abierta.descripcion)
          : null,
      };
    });
}
