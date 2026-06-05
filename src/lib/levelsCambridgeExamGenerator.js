import { cambridgeExamGenerationCompletion, isDraloOpenAIConfigured } from '@/lib/draloAiEngine';
import { buildExamGeneratePrompt } from '@/lib/draloAiExamPrompts';
import {
  getLevelExamLabel,
  getLevelExamPartDef,
  getLevelExamParts,
  examenNameForLevel,
  parteNameForLevel,
} from '@/lib/levelsExamCatalog';
import {
  buildB2EnunciadoFromGenerated,
  buildAnswerRowsFromGenerated,
  formatMcqRespuestaRow,
  formatOpenRespuestaRow,
} from '@/lib/formatB2Enunciado';
import {
  deleteExamenContent,
  deleteExamenFully,
  deletePartContentForExam,
  resolveLevelExamenId,
} from '@/lib/levelsExamPersist';

const EXAM_THEMES = [
  'urban life and technology',
  'travel and cultural exchange',
  'health and lifestyle',
  'work and education',
  'environment and sustainability',
  'entertainment and media',
];

const CAMBRIDGE_EXAM_NAMES = {
  B1: 'B1 Preliminary',
  B2: 'B2 First',
  C1: 'C1 Advanced',
  C2: 'C2 Proficiency',
};

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

function buildSpeakingPrompt(levelLabel, partDef, options) {
  const topic = options.topic || 'everyday life';
  const seed = options.varietySeed ?? Date.now();
  const examName = CAMBRIDGE_EXAM_NAMES[levelLabel] || levelLabel;
  const meta = `Exam set ${options.examSlot}. Theme: ${topic}. Seed: ${seed}.`;

  if (partDef.activity === 'interview') {
    return `Create ${examName} Speaking Part 1 (interview).
Return ONLY JSON: directions, speakingPrompts (8–10 short interview questions), modelAnswers (sample answers q1–q8).
${meta}`;
  }
  if (partDef.activity === 'long-turn') {
    return `Create ${examName} Speaking Part 2 (long turn, photographs).
Return ONLY JSON: directions, theme, comparePrompt (one sentence asking candidate to compare two photos), photoA (scene description), photoB (scene description), modelAnswers.
${meta}`;
  }
  if (partDef.activity === 'picture-description') {
    return `Create ${examName} Speaking Part 3 (individual long turn, one picture).
Return ONLY JSON: directions, theme, picturePrompt (describe the picture), photoDescription (detailed scene for one image), followUpQuestion, modelAnswers.
${meta}`;
  }
  if (partDef.activity === 'collaborative') {
    return `Create ${examName} Speaking collaborative task.
Return ONLY JSON: directions, taskTitle, setting, collaborativePrompts (5–7 discussion prompts), bulletPoints (3 task points), modelAnswers.
${meta}`;
  }
  return `Create ${examName} Speaking discussion.
Return ONLY JSON: directions, discussionQuestions (5–6 questions), modelAnswers.
${meta}`;
}

function buildWritingPrompt(levelLabel, partDef, options) {
  const topic = options.topic || 'everyday life';
  const seed = options.varietySeed ?? Date.now();
  const examName = CAMBRIDGE_EXAM_NAMES[levelLabel] || levelLabel;
  const meta = `Exam set ${options.examSlot}. Theme: ${topic}. Seed: ${seed}.`;

  if (partDef.activity === 'email') {
    return `Create ${examName} Writing Part 1 (email, ~100 words).
Return ONLY JSON: partTitle, directions, example{text,explanation}, taskTitle, instructions, inputNotes, bulletPoints, wordMin (about 100), wordMax (about 100), register, checklist.
${meta}`;
  }

  return buildExamGeneratePrompt(partDef.mode, partDef.activity, levelLabel, {
    topic: options.topic,
    varietySeed: options.varietySeed,
  });
}

async function generatePartJson(levelLabel, partDef, options) {
  let prompt;
  if (partDef.mode === 'speaking') {
    prompt = buildSpeakingPrompt(levelLabel, partDef, options);
  } else if (partDef.mode === 'writing' && partDef.activity === 'email') {
    prompt = buildWritingPrompt(levelLabel, partDef, options);
  } else {
    prompt = buildExamGeneratePrompt(partDef.mode, partDef.activity, levelLabel, {
      topic: options.topic,
      varietySeed: options.varietySeed,
    });
  }

  const { text } = await cambridgeExamGenerationCompletion({
    system: `Output only valid JSON for one complete ${CAMBRIDGE_EXAM_NAMES[levelLabel] || levelLabel} exam part.`,
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
    return (
      (gen.speakingPrompts?.length ||
        gen.discussionQuestions?.length ||
        gen.collaborativePrompts?.length ||
        gen.picturePrompt ||
        gen.photoDescription ||
        0) >= 1
    );
  }
  if (partDef.mode === 'writing') {
    return Boolean(gen.instructions || gen.bulletPoints?.length || gen.taskTitle);
  }
  if (partDef.activity === 'key-word') return q.length >= 4;
  if (partDef.activity === 'multiple-matching' && partDef.mode === 'reading') {
    const minQ = partDef.questionCount != null ? Math.min(partDef.questionCount, 4) : 4;
    return (gen.sections?.length || 0) >= 2 && q.length >= minQ;
  }
  if (partDef.mode === 'listening') return Boolean(gen.script) && (q.length >= 2 || ma.length >= 2);
  if (gen.passage && q.length >= 2) return true;
  if (gen.passage && ma.length >= 3) return true;
  return ma.length >= 3;
}

export async function ensureLevelExamenRow(db, levelSlug, levelId, slot) {
  const nombre = examenNameForLevel(levelSlug, slot);
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

export async function ensureLevelParteRow(db, levelSlug, partNumber) {
  const nombre = parteNameForLevel(levelSlug, partNumber);
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

async function partHasContent(db, examenId, parteId) {
  const { count, error } = await db
    .from('levels_preguntas')
    .select('id', { count: 'exact', head: true })
    .eq('examen_id', examenId)
    .eq('parte_id', parteId);
  if (error) throw error;
  return (count || 0) > 0;
}

export async function persistCambridgeGeneratedPart(db, {
  levelSlug,
  levelId,
  examenId,
  parteId,
  partNumber,
  examSlot,
  generated,
  partDef,
  skipAudio = false,
}) {
  const levelLabel = getLevelExamLabel(levelSlug);
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
      levelLabel,
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

export async function resetLevelExamContent(adminDb, levelSlug, { levelId, examSlot }) {
  const examenId = await ensureLevelExamenRow(adminDb, levelSlug, levelId, examSlot);
  await deleteExamenContent(adminDb, examenId);
  return { examenId, deleted: true };
}

/** Elimina contenido + fila levels_examenes del slot (B1–C2). */
export async function deleteLevelExam(adminDb, levelSlug, { levelId, examSlot }) {
  const examenId = await resolveLevelExamenId(adminDb, levelSlug, levelId, examSlot);
  if (!examenId) return { deleted: false, examenId: null };
  return deleteExamenFully(adminDb, examenId);
}

/**
 * Genera y persiste una parte. Por defecto no borra partes que ya tienen contenido (preserveExistingParts).
 */
export async function generateAndPersistLevelExamPart(adminDb, {
  levelSlug,
  levelId,
  examSlot,
  partNumber,
  skipAudio = false,
  varietySeed,
  topic,
  preserveExistingParts = true,
  replacePartContent = false,
}) {
  if (!isDraloOpenAIConfigured()) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const slug = String(levelSlug || '').toLowerCase();
  const levelLabel = getLevelExamLabel(slug);
  const partDef = getLevelExamPartDef(slug, partNumber);
  if (!partDef) throw new Error(`Parte inválida: ${partNumber}`);

  const examenId = await ensureLevelExamenRow(adminDb, slug, levelId, examSlot);
  const parteId = await ensureLevelParteRow(adminDb, slug, partDef.partNumber);

  const hasContent = await partHasContent(adminDb, examenId, parteId);
  if (preserveExistingParts && hasContent && !replacePartContent) {
    return {
      examenId,
      partNumber: partDef.partNumber,
      preguntaId: null,
      partTitle: partDef.section,
      skipped: true,
    };
  }

  const theme = topic || EXAM_THEMES[(examSlot - 1) % EXAM_THEMES.length];
  const parts = getLevelExamParts(slug) || [];
  const seedBase = varietySeed ?? Date.now() + examSlot * 1000;
  const partIndex = parts.findIndex((p) => p.partNumber === partDef.partNumber);

  let generated = await generatePartJson(levelLabel, partDef, {
    examSlot,
    varietySeed: seedBase + partIndex,
    topic: theme,
  });

  for (let attempt = 0; attempt < 2 && !isPartComplete(generated, partDef); attempt += 1) {
    generated = await generatePartJson(levelLabel, partDef, {
      examSlot,
      varietySeed: seedBase + partIndex + 5000 + attempt * 2000,
      topic: theme,
    });
  }

  if (replacePartContent || !preserveExistingParts) {
    await deletePartContentForExam(adminDb, examenId, parteId);
  }

  const preguntaId = await persistCambridgeGeneratedPart(adminDb, {
    levelSlug: slug,
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
    skipped: false,
  };
}

export async function generateAndPersistLevelExam(adminDb, {
  levelSlug,
  levelId,
  examSlot,
  force = false,
  skipAudio = false,
  preserveExistingParts = true,
  replacePartContent = false,
  onProgress,
}) {
  if (!isDraloOpenAIConfigured()) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const slug = String(levelSlug || '').toLowerCase();
  const parts = getLevelExamParts(slug);
  if (!parts?.length) throw new Error(`Nivel no soportado: ${slug}`);

  const examenId = await ensureLevelExamenRow(adminDb, slug, levelId, examSlot);

  if (force) {
    await deleteExamenContent(adminDb, examenId);
  }

  const varietySeed = Date.now();
  const topic = EXAM_THEMES[(examSlot - 1) % EXAM_THEMES.length];
  const results = [];

  for (let i = 0; i < parts.length; i += 1) {
    const partDef = parts[i];
    onProgress?.({ step: i + 1, total: parts.length, part: partDef.partNumber });

    const row = await generateAndPersistLevelExamPart(adminDb, {
      levelSlug: slug,
      levelId,
      examSlot,
      partNumber: partDef.partNumber,
      skipAudio,
      varietySeed,
      topic,
      preserveExistingParts: force ? false : preserveExistingParts,
      replacePartContent: force ? true : replacePartContent,
    });
    results.push({
      partNumber: row.partNumber,
      preguntaId: row.preguntaId,
      skipped: row.skipped,
    });
  }

  const created = results.filter((r) => !r.skipped && r.preguntaId).length;
  const skipped = results.filter((r) => r.skipped).length;

  return {
    examenId,
    created: created > 0,
    parts: results,
    skipped,
    message: `Examen ${examSlot} ${getLevelExamLabel(slug)}: ${created} partes generadas${skipped ? `, ${skipped} omitidas (ya tenían contenido)` : ''}.`,
  };
}
