import { cambridgeChatCompletion, isDraloOpenAIConfigured } from '@/lib/draloAiEngine';
import { A2_EXAM_PARTS } from '@/lib/a2ExamCatalog';
import {
  buildA2PartGeneratePrompt,
  getA2PartDef,
  isA2GeneratedPartComplete,
  normalizeGeneratedPayload,
} from '@/lib/draloAiA2ExamPrompts';
import {
  deleteExamenContent,
  deletePartContentForExam,
  ensureA2ExamenRow,
  ensureA2ParteRow,
  examHasPreguntas,
  persistGeneratedPart,
} from '@/lib/levelsExamPersist';

function parseJsonFromModel(text) {
  const raw = String(text || '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Invalid JSON from Examenes de Cambridge engine');
  }
}

async function generatePartJson(partDef, options) {
  const prompt = buildA2PartGeneratePrompt(partDef, options);
  const { text } = await cambridgeChatCompletion({
    system:
      'Output only valid JSON for one A2 Key exam part. Follow official Cambridge sample-test layout.',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.88,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });
  const parsed = parseJsonFromModel(text);
  return normalizeGeneratedPayload({ ...parsed, partNumber: partDef.partNumber });
}

export const A2_EXAM_PART_COUNT = A2_EXAM_PARTS.length;

/**
 * Elimina todo el contenido del examen A2 en Supabase (preguntas, respuestas, audios).
 * @param {import('@supabase/supabase-js').SupabaseClient} adminDb
 */
export async function resetA2ExamContent(adminDb, { levelId, examSlot }) {
  const examenId = await ensureA2ExamenRow(adminDb, levelId, examSlot);
  await deleteExamenContent(adminDb, examenId);
  return { examenId, deleted: true };
}

/**
 * Genera y persiste una sola parte del examen A2.
 * @param {import('@supabase/supabase-js').SupabaseClient} adminDb
 */
export async function generateAndPersistA2ExamPart(adminDb, {
  levelId,
  examSlot,
  partNumber,
  reset = false,
  skipAudio = false,
  skipImages = false,
  varietySeed,
  topic,
}) {
  if (!isDraloOpenAIConfigured()) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const partDef = getA2PartDef(partNumber);
  if (!partDef) throw new Error(`Parte inválida: ${partNumber}`);

  const examenId = await ensureA2ExamenRow(adminDb, levelId, examSlot);
  if (reset) {
    await deleteExamenContent(adminDb, examenId);
  }

  const parteId = await ensureA2ParteRow(adminDb, partDef.partNumber, { refreshDescription: true });
  const seedBase = varietySeed ?? Date.now();
  const topics = [
    'a school trip and hobbies',
    'food, cooking and restaurants',
    'sport and outdoor activities',
    'travel and holidays',
    'technology and social media',
  ];
  const theme = topic || topics[(examSlot - 1) % topics.length];
  const partIndex = A2_EXAM_PARTS.findIndex((p) => p.partNumber === partDef.partNumber);

  let generated = await generatePartJson(partDef, {
    examSlot,
    varietySeed: seedBase + partIndex,
    topic: theme,
  });

  for (let attempt = 0; attempt < 3 && !isA2GeneratedPartComplete(generated, partDef); attempt += 1) {
    generated = await generatePartJson(partDef, {
      examSlot,
      varietySeed: seedBase + partIndex + 1000 + attempt * 500,
      topic: theme,
    });
  }

  if (!isA2GeneratedPartComplete(generated, partDef)) {
    console.warn(
      `[A2 exam] Part ${partDef.partNumber} may be incomplete; persisting anyway.`,
      generated,
    );
  }

  await deletePartContentForExam(adminDb, examenId, parteId);

  const preguntaId = await persistGeneratedPart(adminDb, {
    levelId,
    examenId,
    parteId,
    partNumber: partDef.partNumber,
    examSlot,
    generated,
    partDef,
    skipAudio,
    skipImages,
  });

  return {
    examenId,
    partNumber: partDef.partNumber,
    preguntaId,
    partTitle: partDef.title,
  };
}

/**
 * Genera y persiste un examen A2 completo (14 partes) en Supabase.
 * @param {import('@supabase/supabase-js').SupabaseClient} adminDb
 */
export async function generateAndPersistA2Exam(adminDb, {
  levelId,
  examSlot,
  force = false,
  skipAudio = false,
  skipImages = false,
  onProgress,
}) {
  if (!isDraloOpenAIConfigured()) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const examenId = await ensureA2ExamenRow(adminDb, levelId, examSlot);
  const hasContent = await examHasPreguntas(adminDb, examenId, levelId);

  if (hasContent && !force) {
    return { examenId, created: false, message: 'Exam already exists.' };
  }

  if (force) {
    await deleteExamenContent(adminDb, examenId);
  }

  const varietySeed = Date.now();
  const topics = [
    'a school trip and hobbies',
    'food, cooking and restaurants',
    'sport and outdoor activities',
    'travel and holidays',
    'technology and social media',
  ];
  const topic = topics[(examSlot - 1) % topics.length];

  const results = [];
  for (let i = 0; i < A2_EXAM_PARTS.length; i += 1) {
    const partDef = A2_EXAM_PARTS[i];
    onProgress?.({ step: i + 1, total: A2_EXAM_PARTS.length, part: partDef.partNumber });

    const row = await generateAndPersistA2ExamPart(adminDb, {
      levelId,
      examSlot,
      partNumber: partDef.partNumber,
      reset: false,
      skipAudio,
      skipImages,
      varietySeed,
      topic,
    });

    results.push({ partNumber: row.partNumber, preguntaId: row.preguntaId });
  }

  return {
    examenId,
    created: true,
    parts: results,
    message: `Examen ${examSlot} A2 generated (${results.length} parts).`,
  };
}
