import { normalizeTopicHref } from '@/lib/normalizeTopicHref';
import { draloChatCompletion, isOpenAIConfigured } from '@/lib/ai/draloAiEngine';
import { isTeoriaTipoOpen, parseTeoriaTipoNumber, teoriaTipoLabel } from '@/lib/levelsTeoriaExerciseTypes';
import {
  findTheoryPartByHref,
  getAllTheoryPartOptions,
} from '@/lib/theoryPartsCatalog';
import {
  buildTeoriaPreguntaDescripcion,
  buildTeoriaUnitMetaDescripcion,
  parseTopicHrefFromTeoriaDescripcion,
} from '@/lib/teoriaExerciseDescripcion';

const PREGUNTAS_TABLE = 'levels_teoria_preguntas';
const RESPUESTAS_TABLE = 'levels_teoria_respuestas';
const ABIERTAS_TABLE = 'levels_teoria_respuestas_abiertas';

function buildFallbackExercise({ nivel, skill, tipo, topicHint }) {
  const open = isTeoriaTipoOpen(tipo);
  const levelLabel = String(nivel?.nombre || 'B2').toUpperCase();
  const skillLabel = String(skill?.nombre || 'Grammar');
  const tipoLabel = teoriaTipoLabel(tipo);
  const topic = topicHint?.trim() || `${skillLabel} practice`;

  const pregunta = `[${levelLabel}] ${topic} — ${tipoLabel}`;
  const descripcion = `Auto-generated theory exercise (${tipoLabel}). Review and edit in Supabase if needed.`;

  if (open) {
    return {
      pregunta,
      descripcion,
      opciones: [],
      respuesta_abierta: 'Sample model answer for learners (edit in admin).',
      respuesta_abierta_descripcion: 'Accept answers that match the main idea and use appropriate grammar.',
    };
  }

  return {
    pregunta,
    descripcion,
    opciones: [
      { text: 'Option A (correct)', correcta: true },
      { text: 'Option B', correcta: false },
      { text: 'Option C', correcta: false },
      { text: 'Option D', correcta: false },
    ],
    respuesta_abierta: null,
    respuesta_abierta_descripcion: null,
  };
}

async function generateExerciseWithAi({ nivel, skill, tipo, topicHint, theoryPart }) {
  const open = isTeoriaTipoOpen(tipo);
  const tipoNum = parseTeoriaTipoNumber(tipo);
  const levelLabel = String(nivel?.nombre || 'B2').toUpperCase();
  const skillLabel = String(skill?.nombre || 'Grammar');
  const partLabel = theoryPart?.label || '';

  const systemPrompt = `You create English learning exercises for the Dralo platform.
Return ONLY valid JSON (no markdown).
CEFR level: ${levelLabel}
Skill: ${skillLabel}
Question type: ${teoriaTipoLabel(tipo)} (Tipo ${tipoNum ?? '?'})
Answer format: ${open ? 'OPEN (one model answer + short rubric)' : 'CLOSED (exactly 4 options, exactly one with correcta true)'}`;

  const contextTopic = topicHint?.trim() || partLabel;
  const userMessage = `Create one exercise${contextTopic ? ` for the theory unit "${contextTopic}"` : ''}.
JSON schema:
{
  "pregunta": "question stem in English",
  "descripcion": "short instruction for the student in English",
  "opciones": [{ "text": "string", "correcta": boolean }],
  "respuesta_abierta": "string or null",
  "respuesta_abierta_descripcion": "grading rubric or null"
}
Rules:
- For closed types: provide exactly 4 opciones, one correcta true.
- For open types: opciones must be [], fill respuesta_abierta and respuesta_abierta_descripcion.
- Difficulty appropriate for ${levelLabel}.`;

  const raw = await draloChatCompletion({
    systemPrompt,
    userMessage,
    temperature: 0.5,
    max_tokens: 900,
    response_format: { type: 'json_object' },
  });

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('La IA no devolvió JSON válido.');
  }

  const opciones = Array.isArray(parsed.opciones) ? parsed.opciones : [];
  return {
    pregunta: String(parsed.pregunta || '').trim() || `Exercise (${levelLabel})`,
    descripcion: String(parsed.descripcion || '').trim() || teoriaTipoLabel(tipo),
    opciones: open
      ? []
      : opciones.slice(0, 6).map((o) => ({
          text: String(o.text || o.respuesta || '').trim(),
          correcta: Boolean(o.correcta),
        })),
    respuesta_abierta: open ? String(parsed.respuesta_abierta || '').trim() : null,
    respuesta_abierta_descripcion: open
      ? String(parsed.respuesta_abierta_descripcion || '').trim()
      : null,
  };
}

async function resolveCatalogRow(db, table, id, label) {
  const { data, error } = await db.from(table).select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error(`${label} no encontrado.`);
  return data;
}

/**
 * Genera contenido y persiste en levels_teoria_preguntas + respuestas (cerradas o abiertas).
 */
export async function generateAndPersistTeoriaExercise(db, {
  nivelId,
  skillId,
  tipoId,
  topicHint = '',
  topicHref = '',
}) {
  if (!nivelId || !skillId || !tipoId) {
    throw new Error('Nivel, skill y tipo de pregunta son obligatorios.');
  }

  const canonicalHref = normalizeTopicHref(topicHref);
  if (!canonicalHref) {
    throw new Error('Selecciona la parte de teoría donde debe aparecer el ejercicio.');
  }

  const theoryPart = findTheoryPartByHref(getAllTheoryPartOptions(), canonicalHref);
  if (!theoryPart) {
    throw new Error('La parte de teoría seleccionada no es válida.');
  }

  const [nivel, skill, tipo] = await Promise.all([
    resolveCatalogRow(db, 'levels', nivelId, 'Nivel'),
    resolveCatalogRow(db, 'levels_skills', skillId, 'Skill'),
    resolveCatalogRow(db, 'levels_teoria_tipos_preguntas', tipoId, 'Tipo de pregunta'),
  ]);

  const effectiveHint = topicHint?.trim() || theoryPart.label;

  let content;
  if (isOpenAIConfigured()) {
    try {
      content = await generateExerciseWithAi({
        nivel,
        skill,
        tipo,
        topicHint: effectiveHint,
        theoryPart,
      });
    } catch (err) {
      console.warn('[teoria-ejercicios] AI fallback:', err?.message);
      content = buildFallbackExercise({ nivel, skill, tipo, topicHint: effectiveHint });
    }
  } else {
    content = buildFallbackExercise({ nivel, skill, tipo, topicHint: effectiveHint });
  }

  const open = isTeoriaTipoOpen(tipo);
  const metaDesc = buildTeoriaUnitMetaDescripcion({
    topicHref: canonicalHref,
    theoryPartLabel: theoryPart.label,
    tipoLabel: teoriaTipoLabel(tipo),
    nivelNombre: nivel.nombre,
    skillNombre: skill.nombre,
    topicHint,
  });
  const descripcion = buildTeoriaPreguntaDescripcion(metaDesc, content.descripcion);

  const { data: preguntaRow, error: preguntaErr } = await db
    .from(PREGUNTAS_TABLE)
    .insert({
      id_nivel: nivelId,
      id_skills: skillId,
      id_tipo_preguntas: tipoId,
      pregunta: content.pregunta,
      descripcion,
    })
    .select('*')
    .single();

  if (preguntaErr) throw new Error(preguntaErr.message);

  let respuestas = [];
  let respuestaAbierta = null;

  if (open) {
    const { data: abiertaRow, error: abiertaErr } = await db
      .from(ABIERTAS_TABLE)
      .insert({
        id_preguntas: preguntaRow.id,
        respuesta: content.respuesta_abierta || 'Model answer',
        descripcion:
          content.respuesta_abierta_descripcion ||
          'Answers that match the model in meaning and use correct grammar.',
      })
      .select('*')
      .single();

    if (abiertaErr) throw new Error(abiertaErr.message);
    respuestaAbierta = abiertaRow;
  } else {
    let opciones = content.opciones.filter((o) => o.text);
    if (!opciones.length) {
      opciones = buildFallbackExercise({ nivel, skill, tipo, topicHint }).opciones;
    }
    if (!opciones.some((o) => o.correcta)) {
      opciones[0] = { ...opciones[0], correcta: true };
    }

    const rows = opciones.map((o) => ({
      id_preguntas_teoria: preguntaRow.id,
      respuesta: o.text,
      Correcta: o.correcta,
    }));

    const { data: respRows, error: respErr } = await db
      .from(RESPUESTAS_TABLE)
      .insert(rows)
      .select('*');

    if (respErr) throw new Error(respErr.message);
    respuestas = respRows || [];
  }

  return {
    pregunta: preguntaRow,
    respuestas,
    respuestaAbierta,
    answerMode: open ? 'open' : 'closed',
    generatedWithAi: isOpenAIConfigured(),
    theoryPart,
  };
}

export async function fetchTeoriaExerciseCatalog(db) {
  const theoryParts = getAllTheoryPartOptions();

  const [levelsRes, skillsRes, tiposRes] = await Promise.all([
    db.from('levels').select('id, nombre, descripcion').order('nombre', { ascending: true }),
    db.from('levels_skills').select('id, nombre, descripcion').order('nombre', { ascending: true }),
    db
      .from('levels_teoria_tipos_preguntas')
      .select('id, Nombre, Descripcion')
      .order('Nombre', { ascending: true }),
  ]);

  if (levelsRes.error) throw levelsRes.error;
  if (skillsRes.error) throw skillsRes.error;
  if (tiposRes.error) throw tiposRes.error;

  return {
    levels: levelsRes.data || [],
    skills: skillsRes.data || [],
    tipos: (tiposRes.data || []).map((t) => ({
      ...t,
      answerMode: isTeoriaTipoOpen(t) ? 'open' : 'closed',
      label: teoriaTipoLabel(t),
    })),
    theoryParts,
  };
}

export async function fetchRecentTeoriaPreguntas(db, limit = 30) {
  const { data: preguntas, error } = await db
    .from(PREGUNTAS_TABLE)
    .select(
      'id, pregunta, descripcion, created_at, id_nivel, id_skills, id_tipo_preguntas',
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!preguntas?.length) return [];

  const nivelIds = [...new Set(preguntas.map((p) => p.id_nivel).filter(Boolean))];
  const skillIds = [...new Set(preguntas.map((p) => p.id_skills).filter(Boolean))];
  const tipoIds = [...new Set(preguntas.map((p) => p.id_tipo_preguntas).filter(Boolean))];

  const [niveles, skills, tipos] = await Promise.all([
    nivelIds.length
      ? db.from('levels').select('id, nombre').in('id', nivelIds)
      : { data: [] },
    skillIds.length
      ? db.from('levels_skills').select('id, nombre').in('id', skillIds)
      : { data: [] },
    tipoIds.length
      ? db.from('levels_teoria_tipos_preguntas').select('id, Nombre, Descripcion').in('id', tipoIds)
      : { data: [] },
  ]);

  const nivelById = Object.fromEntries((niveles.data || []).map((n) => [n.id, n]));
  const skillById = Object.fromEntries((skills.data || []).map((s) => [s.id, s]));
  const tipoById = Object.fromEntries((tipos.data || []).map((t) => [t.id, t]));

  const partByHref = Object.fromEntries(getAllTheoryPartOptions().map((part) => [part.href, part]));

  return preguntas.map((p) => {
    const linkedHref = parseTopicHrefFromTeoriaDescripcion(p.descripcion);
    const theoryPart = linkedHref
      ? partByHref[linkedHref] || { href: linkedHref, label: linkedHref }
      : null;

    return {
      ...p,
      nivel: nivelById[p.id_nivel] || null,
      skill: skillById[p.id_skills] || null,
      tipo: tipoById[p.id_tipo_preguntas] || null,
      answerMode: isTeoriaTipoOpen(tipoById[p.id_tipo_preguntas]) ? 'open' : 'closed',
      theoryPart,
    };
  });
}
