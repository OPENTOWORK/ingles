import { NextResponse } from 'next/server';
import { authenticatePlanObjetivosAdminRequest } from '@/lib/adminAccess';
import { WELCOME_FORM_MOMENT } from '@/lib/formularioRespuestas';

const TIPOS = new Set(['varias', 'una', 'texto', 'fecha', 'info']);
const MOMENTOS = new Set([WELCOME_FORM_MOMENT]);

function cleanText(value, max) {
  return String(value || '').trim().slice(0, max);
}

function cleanOptions(opciones, tipo) {
  if (tipo === 'texto' || tipo === 'fecha' || tipo === 'info') return [];
  if (!Array.isArray(opciones)) return [];
  const options = opciones
    .slice(0, 40)
    .map((option) => ({
      id: cleanText(option?.id, 80),
      label: cleanText(option?.label, 200),
      hint: cleanText(option?.hint, 120),
    }))
    .filter((option) => option.label);

  const used = new Set();
  let next = 1;
  for (const option of options) {
    if (option.id && !used.has(option.id)) {
      used.add(option.id);
      continue;
    }
    while (used.has(`opcion-${next}`) || options.some((other) => other.id === `opcion-${next}`)) {
      next += 1;
    }
    option.id = `opcion-${next}`;
    used.add(option.id);
  }
  return options;
}

function cleanQuestion(body) {
  const tipo = TIPOS.has(body?.tipo) ? body.tipo : 'varias';
  const titulo = cleanText(body?.titulo, 240);
  if (!titulo) return { error: 'Escribe el enunciado de la pregunta.' };
  const opciones = cleanOptions(body?.opciones, tipo);
  if ((tipo === 'varias' || tipo === 'una') && opciones.length === 0) {
    return { error: 'Añade al menos una opción.' };
  }
  return {
    value: {
      titulo,
      ayuda: cleanText(body?.ayuda, 500),
      tipo,
      obligatoria: tipo === 'info' ? false : Boolean(body?.obligatoria),
      opciones,
    },
  };
}

async function loadForms(db) {
  const { data: forms, error } = await db
    .from('formularios')
    .select('id, titulo, descripcion, momento, orden, creado_en, actualizado_en')
    .order('orden', { ascending: true })
    .order('creado_en', { ascending: true });
  if (error) throw error;

  const { data: questions, error: questionsError } = await db
    .from('formulario_preguntas')
    .select('id, formulario_id, titulo, ayuda, tipo, obligatoria, opciones, orden')
    .order('orden', { ascending: true })
    .order('creado_en', { ascending: true });
  if (questionsError) throw questionsError;

  return (forms || []).map((form) => ({
    ...form,
    preguntas: (questions || []).filter((question) => question.formulario_id === form.id),
  }));
}

async function respondWithForms(db) {
  return NextResponse.json({ forms: await loadForms(db) });
}

export async function GET(req) {
  try {
    const auth = await authenticatePlanObjetivosAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    return await respondWithForms(auth.db);
  } catch (err) {
    console.error('[admin/formularios GET]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const auth = await authenticatePlanObjetivosAdminRequest(req);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const now = new Date().toISOString();
    const action = body.action;

    if (action === 'create-form') {
      const titulo = cleanText(body.titulo, 120);
      if (!titulo) {
        return NextResponse.json({ error: 'Escribe el nombre del formulario.' }, { status: 400 });
      }
      const { data: existing } = await auth.db
        .from('formularios')
        .select('orden')
        .order('orden', { ascending: false })
        .limit(1);
      const orden = (existing?.[0]?.orden ?? -1) + 1;
      const { error } = await auth.db.from('formularios').insert({
        titulo,
        descripcion: cleanText(body.descripcion, 500),
        orden,
        actualizado_en: now,
      });
      if (error) throw error;
      return await respondWithForms(auth.db);
    }

    if (action === 'update-form') {
      const titulo = cleanText(body.titulo, 120);
      if (!body.id || !titulo) {
        return NextResponse.json({ error: 'Falta el nombre del formulario.' }, { status: 400 });
      }
      const momento = MOMENTOS.has(body.momento) ? body.momento : null;
      if (momento) {
        const { error: clearError } = await auth.db
          .from('formularios')
          .update({ momento: null, actualizado_en: now })
          .eq('momento', momento)
          .neq('id', body.id);
        if (clearError) throw clearError;
      }
      const { error } = await auth.db
        .from('formularios')
        .update({
          titulo,
          descripcion: cleanText(body.descripcion, 500),
          momento,
          actualizado_en: now,
        })
        .eq('id', body.id);
      if (error) throw error;
      return await respondWithForms(auth.db);
    }

    if (action === 'delete-form') {
      if (!body.id) {
        return NextResponse.json({ error: 'Falta el formulario.' }, { status: 400 });
      }
      const { error } = await auth.db.from('formularios').delete().eq('id', body.id);
      if (error) throw error;
      return await respondWithForms(auth.db);
    }

    if (action === 'create-question') {
      if (!body.formularioId) {
        return NextResponse.json({ error: 'Falta el formulario.' }, { status: 400 });
      }
      const question = cleanQuestion(body);
      if (question.error) {
        return NextResponse.json({ error: question.error }, { status: 400 });
      }
      const { data: existing } = await auth.db
        .from('formulario_preguntas')
        .select('orden')
        .eq('formulario_id', body.formularioId)
        .order('orden', { ascending: false })
        .limit(1);
      const orden = (existing?.[0]?.orden ?? -1) + 1;
      const { error } = await auth.db.from('formulario_preguntas').insert({
        formulario_id: body.formularioId,
        ...question.value,
        orden,
        actualizado_en: now,
      });
      if (error) throw error;
      return await respondWithForms(auth.db);
    }

    if (action === 'update-question') {
      if (!body.id) {
        return NextResponse.json({ error: 'Falta la pregunta.' }, { status: 400 });
      }
      const question = cleanQuestion(body);
      if (question.error) {
        return NextResponse.json({ error: question.error }, { status: 400 });
      }
      const { error } = await auth.db
        .from('formulario_preguntas')
        .update({ ...question.value, actualizado_en: now })
        .eq('id', body.id);
      if (error) throw error;
      return await respondWithForms(auth.db);
    }

    if (action === 'delete-question') {
      if (!body.id) {
        return NextResponse.json({ error: 'Falta la pregunta.' }, { status: 400 });
      }
      const { error } = await auth.db.from('formulario_preguntas').delete().eq('id', body.id);
      if (error) throw error;
      return await respondWithForms(auth.db);
    }

    if (action === 'move-question') {
      if (!body.id || (body.direction !== 'up' && body.direction !== 'down')) {
        return NextResponse.json({ error: 'No se puede mover la pregunta.' }, { status: 400 });
      }
      const { data: question, error: questionError } = await auth.db
        .from('formulario_preguntas')
        .select('id, formulario_id')
        .eq('id', body.id)
        .maybeSingle();
      if (questionError) throw questionError;
      if (!question) {
        return NextResponse.json({ error: 'Pregunta no encontrada.' }, { status: 404 });
      }
      const { data: siblings, error: siblingsError } = await auth.db
        .from('formulario_preguntas')
        .select('id')
        .eq('formulario_id', question.formulario_id)
        .order('orden', { ascending: true })
        .order('creado_en', { ascending: true });
      if (siblingsError) throw siblingsError;
      const index = (siblings || []).findIndex((row) => row.id === question.id);
      const target = body.direction === 'up' ? index - 1 : index + 1;
      if (index < 0 || target < 0 || target >= siblings.length) {
        return await respondWithForms(auth.db);
      }
      const reordered = [...siblings];
      const [moved] = reordered.splice(index, 1);
      reordered.splice(target, 0, moved);
      for (let orden = 0; orden < reordered.length; orden += 1) {
        const { error } = await auth.db
          .from('formulario_preguntas')
          .update({ orden, actualizado_en: now })
          .eq('id', reordered[orden].id);
        if (error) throw error;
      }
      return await respondWithForms(auth.db);
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    console.error('[admin/formularios POST]', err);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
