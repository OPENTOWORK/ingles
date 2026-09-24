export const WELCOME_FORM_MOMENT = 'primer_inicio';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Carga el formulario asignado a un momento (p. ej. primer inicio) con sus preguntas. */
export async function loadFormularioByMoment(db, momento) {
  const { data: form, error } = await db
    .from('formularios')
    .select('id, titulo, descripcion')
    .eq('momento', momento)
    .maybeSingle();
  if (error) throw error;
  if (!form) return null;

  const { data: preguntas, error: preguntasError } = await db
    .from('formulario_preguntas')
    .select('id, titulo, ayuda, tipo, obligatoria, opciones, orden')
    .eq('formulario_id', form.id)
    .order('orden', { ascending: true })
    .order('creado_en', { ascending: true });
  if (preguntasError) throw preguntasError;

  return { ...form, preguntas: preguntas || [] };
}

/**
 * Valida las respuestas contra las preguntas del servidor y devuelve una copia legible
 * (enunciado + texto), para que la ficha siga siendo legible si luego se editan las preguntas.
 */
export function buildFormularioRespuestas(preguntas, respuestas) {
  const input = respuestas && typeof respuestas === 'object' ? respuestas : {};
  const out = [];

  for (const pregunta of preguntas || []) {
    if (pregunta.tipo === 'info') continue;
    const raw = input[pregunta.id];
    const opciones = Array.isArray(pregunta.opciones) ? pregunta.opciones : [];
    let valor = null;
    let texto = '';

    if (pregunta.tipo === 'varias') {
      const ids = Array.isArray(raw) ? raw.map(String) : [];
      const elegidas = opciones.filter((opcion) => ids.includes(String(opcion.id)));
      valor = elegidas.map((opcion) => opcion.id);
      texto = elegidas.map((opcion) => opcion.label).join(', ');
    } else if (pregunta.tipo === 'una') {
      const elegida = opciones.find((opcion) => String(opcion.id) === String(raw ?? ''));
      valor = elegida ? elegida.id : null;
      texto = elegida ? elegida.label : '';
    } else if (pregunta.tipo === 'fecha') {
      const value = String(raw || '').trim();
      if (value && !DATE_RE.test(value)) {
        return { error: `La fecha de «${pregunta.titulo}» no es válida.` };
      }
      valor = value || null;
      texto = value ? value.split('-').reverse().join('/') : '';
    } else {
      const value = String(raw || '').trim().slice(0, 2000);
      valor = value || null;
      texto = value;
    }

    if (pregunta.obligatoria && !texto) {
      return { error: `Responde a «${pregunta.titulo}».` };
    }

    out.push({
      pregunta_id: pregunta.id,
      pregunta: pregunta.titulo,
      tipo: pregunta.tipo,
      valor,
      texto,
    });
  }

  return { value: out };
}
