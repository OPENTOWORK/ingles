import { draloChatCompletion, isDraloOpenAIConfigured } from '@/lib/draloAiEngine';
import { buildExamGeneratePrompt } from '@/lib/draloAiExamPrompts';
import { B2_EXAM_PARTS, getB2PartDef } from '@/lib/b2ExamCatalog';
import {
  buildB2EnunciadoFromGenerated,
  buildAnswerRowsFromGenerated,
  formatMcqRespuestaRow,
  formatOpenRespuestaRow,
} from '@/lib/formatB2Enunciado';
import {
  deleteExamenContent,
  deletePartContentForExam,
} from '@/lib/levelsExamPersist';

function parseJsonFromModel(text) {
  const raw = String(text || '').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Invalid JSON from DRALO AI');
  }
}

function normalizeGenerated(gen, partNumber) {
  if (!gen || typeof gen !== 'object') return gen;
  const questions = (Array.isArray(gen.questions) ? gen.questions : Object.values(gen.questions || {})).map(
    (q, i) => ({ ...q, number: q.number ?? i + 1 }),
  );
  return {
    ...gen,
    questions,
    sections: Array.isArray(gen.sections) ? gen.sections : Object.values(gen.sections || {}),
    sentencePool: Array.isArray(gen.sentencePool) ? gen.sentencePool : Object.values(gen.sentencePool || {}),
    optionPool: Array.isArray(gen.optionPool) ? gen.optionPool : Object.values(gen.optionPool || {}),
    matchingAnswers: Array.isArray(gen.matchingAnswers)
      ? gen.matchingAnswers
      : Object.values(gen.matchingAnswers || {}),
    modelAnswers: Array.isArray(gen.modelAnswers) ? gen.modelAnswers : Object.values(gen.modelAnswers || {}),
    speakingPrompts: Array.isArray(gen.speakingPrompts)
      ? gen.speakingPrompts
      : Object.values(gen.speakingPrompts || {}),
    bulletPoints: Array.isArray(gen.bulletPoints) ? gen.bulletPoints : Object.values(gen.bulletPoints || {}),
    partNumber,
  };
}

function buildB2SpeakingPrompt(partDef, options) {
  const topic = options.topic || 'everyday life';
  const seed = options.varietySeed ?? Date.now();
  const meta = `Exam set ${options.examSlot}. Theme: ${topic}. Seed: ${seed}.`;

  if (partDef.activity === 'interview') {
    return `Create B2 First Speaking Part 1 (interview, ~2 min).
Return ONLY JSON: directions, speakingPrompts (8–10 short interview questions), modelAnswers (sample answers q1–q8).
${meta}`;
  }
  if (partDef.activity === 'long-turn') {
    return `Create B2 First Speaking Part 2 (long turn, photographs).
Return ONLY JSON: directions, theme, comparePrompt (one sentence asking candidate to compare two photos), photoA (scene description), photoB (scene description), modelAnswers.
${meta}`;
  }
  if (partDef.activity === 'collaborative') {
    return `Create B2 First Speaking Part 3 (collaborative task).
Return ONLY JSON: directions, taskTitle, setting, collaborativePrompts (5–7 discussion prompts), bulletPoints (3 task points), modelAnswers.
${meta}`;
  }
  return `Create B2 First Speaking Part 4 (discussion related to Part 3).
Return ONLY JSON: directions, discussionQuestions (5–6 questions), modelAnswers.
${meta}`;
}

async function generatePartJson(partDef, options) {
  const prompt =
    partDef.mode === 'speaking'
      ? buildB2SpeakingPrompt(partDef, options)
      : buildExamGeneratePrompt(partDef.mode, partDef.activity, 'B2', {
          topic: options.topic,
          varietySeed: options.varietySeed,
        });

  const { text } = await draloChatCompletion({
    useAssistant: false,
    system:
      'You are DRALO AI, a Cambridge B2 First exam writer. Output only valid JSON for one complete exam part.',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.9,
    max_tokens: 8192,
    response_format: { type: 'json_object' },
  });
  return normalizeGenerated(parseJsonFromModel(text), partDef.partNumber);
}

function isPartComplete(gen, partDef) {
  const q = gen.questions || [];
  const ma = gen.modelAnswers || [];
  if (partDef.mode === 'speaking') {
    return (gen.speakingPrompts?.length || gen.discussionQuestions?.length || gen.collaborativePrompts?.length || 0) >= 3;
  }
  if (partDef.mode === 'writing') {
    return Boolean(gen.instructions || gen.bulletPoints?.length || gen.taskTitle);
  }
  if (partDef.activity === 'key-word') return q.length >= 6;
  if (partDef.activity === 'multiple-matching' && partDef.mode === 'reading') {
    return (gen.sections?.length || 0) >= 4 && q.length >= 6;
  }
  if (partDef.mode === 'listening') return Boolean(gen.script) && (q.length >= 3 || ma.length >= 3);
  if (gen.passage && q.length >= 3) return true;
  if (gen.passage && ma.length >= 5) return true;
  return ma.length >= 4;
}

export async function ensureB2ExamenRow(db, levelId, slot) {
  const nombre = `Examen ${slot} B2`;
  const { data: existing } = await db
    .from('levels_examenes')
    .select('id, nombre')
    .eq('level_id', levelId)
    .ilike('nombre', `%Examen ${slot}%`)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data: inserted, error } = await db
    .from('levels_examenes')
    .insert({ level_id: levelId, nombre })
    .select('id')
    .single();
  if (error) throw new Error(`levels_examenes: ${error.message}`);
  return inserted.id;
}

export async function ensureB2ParteRow(db, partNumber) {
  const nombre = `Parte ${partNumber} B2`;
  const { data: existing } = await db
    .from('levels_partes')
    .select('id')
    .eq('nombre_parte', nombre)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data: inserted, error } = await db
    .from('levels_partes')
    .insert({ nombre_parte: nombre })
    .select('id')
    .single();
  if (error) throw new Error(`levels_partes: ${error.message}`);
  return inserted.id;
}

export async function persistB2GeneratedPart(db, {
  levelId,
  examenId,
  parteId,
  partNumber,
  examSlot,
  generated,
  partDef,
  skipAudio = false,
}) {
  const enunciado = buildB2EnunciadoFromGenerated(generated, partNumber);

  const { data: pregunta, error: pqErr } = await db
    .from('levels_preguntas')
    .insert({
      level_id: levelId,
      examen_id: examenId,
      parte_id: parteId,
      enunciado,
    })
    .select('id')
    .single();
  if (pqErr) throw new Error(`levels_preguntas: ${pqErr.message}`);

  const { mcq, open } = buildAnswerRowsFromGenerated(generated);

  if (mcq.length) {
    const rows = mcq.map((row) => ({
      pregunta_id: pregunta.id,
      respuesta: formatMcqRespuestaRow({
        questionNumber: row.questionNumber,
        letter: row.letter,
        text: row.text,
      }),
      correcta: Boolean(row.correcta),
    }));
    const { error } = await db.from('levels_respuestas').insert(rows);
    if (error) throw new Error(`levels_respuestas: ${error.message}`);
  }

  if (open.length) {
    const rows = open.map((row) => ({
      pregunta_id_abierta: pregunta.id,
      respuesta_texto: formatOpenRespuestaRow(row),
    }));
    const { error } = await db.from('levels_respuestas_abiertas').insert(rows);
    if (error) throw new Error(`levels_respuestas_abiertas: ${error.message}`);
  }

  if (partDef.needsAudio && !skipAudio && generated.script) {
    const { extractListeningClipsFromGenerated, synthesizeAndUploadListeningClips } = await import(
      '@/lib/levelsExamAudioStorage'
    );
    const clipSpecs = extractListeningClipsFromGenerated(generated, partDef);
    const audioRows = await synthesizeAndUploadListeningClips(db, {
      partNumber,
      examSlot,
      levelLabel: 'B2',
      script: generated.script,
      clips: clipSpecs,
    });
    if (audioRows.length) {
      const { error } = await db.from('levels_preguntas_audios').insert(
        audioRows.map((a) => ({
          pregunta_id: pregunta.id,
          audio_url: a.audio_url,
          orden: a.orden,
          titulo: a.titulo,
        })),
      );
      if (error) throw new Error(`levels_preguntas_audios: ${error.message}`);
    }
  }

  return pregunta.id;
}

export async function resetB2ExamContent(adminDb, { levelId, examSlot }) {
  const examenId = await ensureB2ExamenRow(adminDb, levelId, examSlot);
  await deleteExamenContent(adminDb, examenId);
  return { examenId, deleted: true };
}

export async function generateAndPersistB2ExamPart(adminDb, {
  levelId,
  examSlot,
  partNumber,
  skipAudio = false,
  varietySeed,
  topic,
}) {
  if (!isDraloOpenAIConfigured()) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const partDef = getB2PartDef(partNumber);
  if (!partDef) throw new Error(`Parte inválida: ${partNumber}`);

  const examenId = await ensureB2ExamenRow(adminDb, levelId, examSlot);
  const parteId = await ensureB2ParteRow(adminDb, partDef.partNumber);

  const themes = [
    'urban life and technology',
    'travel and cultural exchange',
    'health and lifestyle',
    'work and education',
    'environment and sustainability',
    'entertainment and media',
  ];
  const theme = topic || themes[(examSlot - 1) % themes.length];
  const seedBase = varietySeed ?? Date.now() + examSlot * 1000;
  const partIndex = B2_EXAM_PARTS.findIndex((p) => p.partNumber === partDef.partNumber);

  let generated = await generatePartJson(partDef, {
    examSlot,
    varietySeed: seedBase + partIndex,
    topic: theme,
  });

  for (let attempt = 0; attempt < 2 && !isPartComplete(generated, partDef); attempt += 1) {
    generated = await generatePartJson(partDef, {
      examSlot,
      varietySeed: seedBase + partIndex + 5000 + attempt * 2000,
      topic: theme,
    });
  }

  await deletePartContentForExam(adminDb, examenId, parteId);

  const preguntaId = await persistB2GeneratedPart(adminDb, {
    levelId,
    examenId,
    parteId,
    partNumber: partDef.partNumber,
    examSlot,
    generated,
    partDef,
    skipAudio,
  });

  return {
    examenId,
    partNumber: partDef.partNumber,
    preguntaId,
    partTitle: partDef.section,
  };
}

export async function generateAndPersistB2Exam(adminDb, {
  levelId,
  examSlot,
  force = false,
  skipAudio = false,
  onProgress,
}) {
  if (!isDraloOpenAIConfigured()) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const examenId = await ensureB2ExamenRow(adminDb, levelId, examSlot);

  if (force) {
    await deleteExamenContent(adminDb, examenId);
  }

  const varietySeed = Date.now();
  const themes = [
    'urban life and technology',
    'travel and cultural exchange',
    'health and lifestyle',
    'work and education',
    'environment and sustainability',
    'entertainment and media',
  ];
  const topic = themes[(examSlot - 1) % themes.length];

  const results = [];
  for (let i = 0; i < B2_EXAM_PARTS.length; i += 1) {
    const partDef = B2_EXAM_PARTS[i];
    onProgress?.({ step: i + 1, total: B2_EXAM_PARTS.length, part: partDef.partNumber });

    const row = await generateAndPersistB2ExamPart(adminDb, {
      levelId,
      examSlot,
      partNumber: partDef.partNumber,
      skipAudio,
      varietySeed,
      topic,
    });
    results.push({ partNumber: row.partNumber, preguntaId: row.preguntaId });
  }

  return {
    examenId,
    created: true,
    parts: results,
    message: `Examen ${examSlot} B2 generated (${results.length} parts).`,
  };
}
