import { getSupabaseAdmin } from '@/lib/aiUsage';
import { draloChatCompletion, getFastModel } from '@/lib/ai/draloAiEngine';

const SYSTEM_PROMPT =
  'You are an academic English teacher. Write a short explanation in English, maximum two sentences, explaining why the correct answer is correct. Focus only on the correct answer. Use clear academic language. Mention the grammar, vocabulary, context, inference, or exam logic that makes the answer correct. Do not explain mainly why the student\'s answer is wrong. Do not say \'because it is correct\'. Return only the explanation text.';

function clip(text, max = 4000) {
  const t = String(text || '').trim();
  return t.length > max ? `${t.slice(0, max)}\n[…]` : t;
}

function normalizeExplanation(text) {
  const cleaned = String(text || '')
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\s+/g, ' ');
  if (!cleaned) return '';
  const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
  return sentences.slice(0, 2).join(' ').trim();
}

function isWeakExplanation(text) {
  const t = String(text || '').toLowerCase();
  return (
    !t ||
    t.length < 20 ||
    /because it is (the )?correct answer/.test(t) ||
    /this is correct because it is right/.test(t)
  );
}

/**
 * @param {object} keys
 * @param {string} [keys.respuestaId]
 * @param {string} [keys.respuestaAbiertaId]
 * @param {string} [keys.preguntaId]
 * @param {number} [keys.itemNum]
 */
export async function findLevelsJustificacion(keys = {}) {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const { respuestaId, respuestaAbiertaId, preguntaId, itemNum } = keys;

  if (respuestaId) {
    const { data } = await db
      .from('levels_justificaciones')
      .select('id, justificacion')
      .eq('id_respuesta', respuestaId)
      .not('justificacion', 'is', null)
      .limit(1)
      .maybeSingle();
    if (data?.justificacion) return data;
  }

  if (respuestaAbiertaId) {
    const { data } = await db
      .from('levels_justificaciones')
      .select('id, justificacion')
      .eq('id_respuesta_abierta', respuestaAbiertaId)
      .not('justificacion', 'is', null)
      .limit(1)
      .maybeSingle();
    if (data?.justificacion) return data;
  }

  if (preguntaId && itemNum != null && Number.isFinite(Number(itemNum))) {
    const { data, error } = await db
      .from('levels_justificaciones')
      .select('id, justificacion')
      .eq('pregunta_id', preguntaId)
      .eq('item_num', Number(itemNum))
      .not('justificacion', 'is', null)
      .limit(1)
      .maybeSingle();
    if (!error && data?.justificacion) return data;
  }

  return null;
}

/**
 * @param {object} row
 */
export async function saveLevelsJustificacion(row) {
  const db = getSupabaseAdmin();
  if (!db) return null;

  const payload = {
    justificacion: row.justificacion,
    id_respuesta: row.respuestaId || null,
    id_respuesta_abierta: row.respuestaAbiertaId || null,
  };

  if (row.preguntaId) payload.pregunta_id = row.preguntaId;
  if (row.itemNum != null && Number.isFinite(Number(row.itemNum))) {
    payload.item_num = Number(row.itemNum);
  }

  const conflictColumn = row.respuestaId
    ? 'id_respuesta'
    : row.respuestaAbiertaId
      ? 'id_respuesta_abierta'
      : null;

  const tryInsert = async (payload) => {
    const { data, error } = await db
      .from('levels_justificaciones')
      .insert(payload)
      .select('id, justificacion')
      .maybeSingle();
    return { data, error };
  };

  if (conflictColumn) {
    const { data, error } = await db
      .from('levels_justificaciones')
      .upsert(payload, { onConflict: conflictColumn })
      .select('id, justificacion')
      .maybeSingle();
    if (!error && data) return data;
    if (error && !/does not exist|unique|duplicate/i.test(error.message || '')) {
      console.warn('[levelsJustificaciones] upsert:', error.message);
    }
  }

  const existing = await findLevelsJustificacion({
    respuestaId: row.respuestaId,
    respuestaAbiertaId: row.respuestaAbiertaId,
    preguntaId: row.preguntaId,
    itemNum: row.itemNum,
  });
  if (existing) return existing;

  let { data, error } = await tryInsert(payload);
  if (error && /pregunta_id|item_num|column/i.test(error.message || '')) {
    const slim = { ...payload };
    delete slim.pregunta_id;
    delete slim.item_num;
    ({ data, error } = await tryInsert(slim));
  }

  if (error) {
    console.error('[levelsJustificaciones] save failed:', error.message);
    return null;
  }
  return data;
}

function buildUserPrompt(body) {
  const lines = [];
  if (body.level) lines.push(`Level: ${body.level}`);
  if (body.partLabel) lines.push(`Part: ${body.partLabel}`);
  if (body.partNumber != null) lines.push(`Part number: ${body.partNumber}`);
  if (body.exerciseType) lines.push(`Exercise type: ${body.exerciseType}`);
  if (body.questionLabel) lines.push(`Item: ${body.questionLabel}`);
  if (body.questionText) lines.push(`Question / passage context:\n${clip(body.questionText, 2800)}`);
  if (body.contextSnippet && body.contextSnippet !== body.questionText) {
    lines.push(`Additional context:\n${clip(body.contextSnippet, 1800)}`);
  }
  if (body.answerOptions) {
    lines.push(`Answer options:\n${clip(body.answerOptions, 1200)}`);
  }
  if (body.correctChoiceText) {
    lines.push(`Correct answer: ${clip(body.correctChoiceText, 400)}`);
  }
  lines.push(
    'Write the explanation now. Focus only on why the correct answer is correct. Maximum two sentences.',
  );
  return lines.join('\n\n');
}

/**
 * @param {Record<string, unknown>} body
 * @returns {Promise<string>}
 */
export async function generateLevelsJustificacionWithOpenAI(body) {
  const userPrompt = buildUserPrompt(body);
  const raw = await draloChatCompletion({
    systemPrompt: SYSTEM_PROMPT,
    userMessage: userPrompt,
    model: getFastModel(),
    temperature: 0.25,
    max_tokens: 180,
  });
  const explanation = normalizeExplanation(raw);
  if (isWeakExplanation(explanation)) {
    throw new Error('Generated explanation was too weak or empty.');
  }
  return explanation;
}

/**
 * @param {Record<string, unknown>} body
 * @returns {Promise<{ found: boolean, explanation?: string, cached?: boolean, message?: string }>}
 */
export async function resolveLevelsAnswerJustification(body) {
  const respuestaId = body.respuestaId || body.respuesta_id || null;
  const respuestaAbiertaId = body.respuestaAbiertaId || body.respuesta_abierta_id || null;
  const preguntaId = body.preguntaId || body.pregunta_id || body.questionId || null;
  const itemNum =
    body.questionNumber != null
      ? Number(body.questionNumber)
      : body.itemNum != null
        ? Number(body.itemNum)
        : null;

  const cached = await findLevelsJustificacion({
    respuestaId,
    respuestaAbiertaId,
    preguntaId,
    itemNum,
  });

  if (cached?.justificacion) {
    return { found: true, explanation: cached.justificacion, cached: true };
  }

  if (!body.correctChoiceText && !body.answerOptions) {
    return {
      found: false,
      message: 'Explanation temporarily unavailable.',
    };
  }

  const explanation = await generateLevelsJustificacionWithOpenAI(body);

  await saveLevelsJustificacion({
    respuestaId,
    respuestaAbiertaId,
    preguntaId,
    itemNum,
    justificacion: explanation,
  });

  return { found: true, explanation, cached: false };
}
