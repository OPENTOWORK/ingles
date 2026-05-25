import { formatLevelsPartDisplayName } from '@/utils/formatLevelsPartDisplayName';

async function fetchPreguntaLevelMap(supabase, preguntaIds) {
  const map = {};
  if (!preguntaIds.length) return map;

  const { data: preguntas } = await supabase
    .from('levels_preguntas')
    .select('id, level_id')
    .in('id', preguntaIds);

  const levelIds = [...new Set((preguntas || []).map((p) => p.level_id).filter(Boolean))];
  const levelNames = {};
  if (levelIds.length) {
    const { data: levels } = await supabase.from('levels').select('id, nombre').in('id', levelIds);
    (levels || []).forEach((l) => {
      levelNames[l.id] = String(l.nombre || '').toLowerCase();
    });
  }

  (preguntas || []).forEach((p) => {
    map[p.id] = levelNames[p.level_id] || 'b2';
  });
  return map;
}

/** Carga levels_estadisticas y levels_puntuaciones del usuario con metadatos de partes/exámenes. */
export async function fetchLevelsPracticeData(supabase, userId) {
  if (!userId) {
    return {
      estadisticas: [],
      puntuaciones: [],
      partNames: {},
      examNames: {},
      preguntaLevel: {},
    };
  }

  const [estRes, puntRes] = await Promise.all([
    supabase
      .from('levels_estadisticas')
      .select(
        'id, parte_id, pregunta_id, accesos, intentos_completados, respuestas_evaluadas, respuestas_correctas, mejor_porcentaje, ultimo_porcentaje, tiempo_segundos_total, ultima_interaccion, creado_en',
      )
      .eq('usuario_id', userId)
      .order('ultima_interaccion', { ascending: false }),
    supabase
      .from('levels_puntuaciones')
      .select(
        'id, examen_id, parte_numero, puntuacion, descripcion, correctas, total_preguntas, aprobado, created_at',
      )
      .eq('uuid_usuario', userId)
      .order('created_at', { ascending: false })
      .limit(200),
  ]);

  if (estRes.error && estRes.error.code !== '42P01') throw estRes.error;
  if (puntRes.error && puntRes.error.code !== '42P01') throw puntRes.error;

  const estadisticas = estRes.data || [];
  const puntuaciones = puntRes.data || [];

  const partIds = [...new Set(estadisticas.map((r) => r.parte_id).filter(Boolean))];
  const examIds = [...new Set(puntuaciones.map((r) => r.examen_id).filter(Boolean))];
  const preguntaIds = [...new Set(estadisticas.map((r) => r.pregunta_id).filter(Boolean))];

  const [partsResult, examsResult, preguntaLevel] = await Promise.all([
    partIds.length
      ? supabase.from('levels_partes').select('id, nombre_parte').in('id', partIds)
      : Promise.resolve({ data: [] }),
    examIds.length
      ? supabase.from('levels_examenes').select('id, nombre').in('id', examIds)
      : Promise.resolve({ data: [] }),
    fetchPreguntaLevelMap(supabase, preguntaIds),
  ]);

  const partNames = {};
  (partsResult.data || []).forEach((p) => {
    partNames[p.id] = formatLevelsPartDisplayName(p.nombre_parte);
  });

  const examNames = {};
  (examsResult.data || []).forEach((e) => {
    examNames[e.id] = e.nombre || 'Examen';
  });

  return { estadisticas, puntuaciones, partNames, examNames, preguntaLevel };
}
