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
  asGeneratedArray,
} from '@/lib/formatB2Enunciado';
import {
  deleteExamenContent,
  deleteExamenFully,
  deletePartContentForExam,
  resolveLevelExamenId,
} from '@/lib/levelsExamPersist';
import { validateGeneratedExamPart } from '@/lib/examPartValidation';
import { logExamGeneration } from '@/lib/examGenerationLog';
import { getExamPartDisplayLabel } from '@/lib/examPartDisplayLabel';

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
Return ONLY JSON: directions, speakingPrompts (8–10 short interview questions).
Do NOT include modelAnswers or "correct answers" fields.
${meta}`;
  }
  if (partDef.activity === 'long-turn') {
    return `Create ${examName} Speaking Part 2 (long turn, photographs).
Return ONLY JSON: directions, theme, comparePrompt (one sentence asking candidate to compare two photos), photoA (scene description), photoB (scene description).
Do NOT include modelAnswers.
${meta}`;
  }
  if (partDef.activity === 'picture-description') {
    return `Create ${examName} Speaking Part 3 (individual long turn, one picture).
Return ONLY JSON: directions, theme, picturePrompt (describe the picture), photoDescription (detailed scene for one image), followUpQuestion.
Do NOT include modelAnswers.
${meta}`;
  }
  if (partDef.activity === 'collaborative') {
    return `Create ${examName} Speaking collaborative task.
Return ONLY JSON: directions, taskTitle, setting, collaborativePrompts (5–7 discussion prompts), bulletPoints (3 task points).
Do NOT include modelAnswers.
${meta}`;
  }
  return `Create ${examName} Speaking discussion.
Return ONLY JSON: directions, discussionQuestions (5–6 questions).
Do NOT include modelAnswers.
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
    partNumber: partDef.partNumber,
    questionCount: partDef.questionCount,
  });
}

async function generatePartJsonWithRetries(levelSlug, levelLabel, partDef, options) {
  const slug = String(levelSlug || '').toLowerCase();
  const parts = getLevelExamParts(slug) || [];
  const partIndex = parts.findIndex((p) => p.partNumber === partDef.partNumber);
  const seedBase = options.varietySeed ?? Date.now();

  let generated = await generatePartJson(levelLabel, partDef, options);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const validation = validateGeneratedExamPart(slug, partDef.partNumber, generated);
    generated = validation.normalized;
    if (validation.ok && isPartComplete(generated, partDef)) break;
    generated = await generatePartJson(levelLabel, partDef, {
      ...options,
      varietySeed: seedBase + partIndex + 5000 + (attempt + 1) * 2000,
    });
  }

  const validation = validateGeneratedExamPart(slug, partDef.partNumber, generated);
  return { generated: validation.normalized, validation };
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
      partNumber: partDef.partNumber,
      questionCount: partDef.questionCount,
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
    if (partDef.activity === 'essay') {
      return Boolean(gen.question && gen.bulletPoints?.length >= 3);
    }
    if (partDef.activity === 'part-2') {
      return (gen.questions?.length || 0) >= 4;
    }
    return Boolean(gen.instructions || gen.bulletPoints?.length || gen.taskTitle);
  }
  if (partDef.activity === 'key-word') return q.length >= 6;
  if (partDef.activity === 'multiple-matching' && partDef.mode === 'reading') {
    const minQ = partDef.questionCount != null ? Math.min(partDef.questionCount, 4) : 4;
    return (gen.sections?.length || 0) >= 2 && q.length >= minQ;
  }
  if (partDef.mode === 'listening') {
    if (partDef.activity === 'multiple-matching') {
      return (
        Boolean(gen.script) &&
        (asGeneratedArray(gen.matchingAnswers).length >= 5 || asGeneratedArray(gen.optionPool).length >= 8)
      );
    }
    if (partDef.activity === 'conversation' && partDef.partNumber === 13) {
      const mcq = asGeneratedArray(gen.questions).filter((item) => asGeneratedArray(item.options).length >= 3);
      return Boolean(gen.script) && mcq.length >= 7;
    }
    return Boolean(gen.script) && (q.length >= 2 || ma.length >= 2);
  }
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
    const letterOnlyMcq =
      partDef?.activity === 'gapped-text' ||
      (partDef?.activity === 'multiple-matching' && partDef?.mode === 'reading') ||
      (partDef?.activity === 'multiple-matching' && partDef?.mode === 'listening');
    const rows = mcq.map((row) => ({
      pregunta_id: pregunta.id,
      respuesta: formatMcqRespuestaRow({
        questionNumber: row.questionNumber,
        letter: row.letter,
        text: letterOnlyMcq ? '' : row.text,
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

  if (partDef.needsAudio && !skipAudio && (generated.script || asGeneratedArray(generated.audioClips).length)) {
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

  const t0 = Date.now();
  const { generated, validation } = await generatePartJsonWithRetries(slug, levelLabel, partDef, {
    examSlot,
    varietySeed: seedBase + partIndex,
    topic: theme,
  });

  if (!validation.ok) {
    logExamGeneration('part_generate_validation_failed', {
      level: slug,
      examNumber: examSlot,
      partNumber: partDef.partNumber,
      durationMs: Date.now() - t0,
      validationOk: false,
      saved: false,
      validationErrors: validation.errors,
    });
    throw new Error(`Validation failed: ${validation.errors.join(' ')}`);
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

  logExamGeneration('part_saved', {
    level: slug,
    examNumber: examSlot,
    partNumber: partDef.partNumber,
    durationMs: Date.now() - t0,
    validationOk: true,
    saved: true,
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

/** Generate JSON for one part without persisting (admin preview). */
export async function previewLevelExamPartGeneration({
  levelSlug,
  examSlot,
  partNumber,
  varietySeed,
  topic,
}) {
  if (!isDraloOpenAIConfigured()) {
    throw new Error('OPENAI_API_KEY is not configured.');
  }

  const slug = String(levelSlug || '').toLowerCase();
  const levelLabel = getLevelExamLabel(slug);
  const partDef = getLevelExamPartDef(slug, partNumber);
  if (!partDef) throw new Error(`Parte inválida: ${partNumber}`);

  const theme = topic || EXAM_THEMES[(examSlot - 1) % EXAM_THEMES.length];
  const parts = getLevelExamParts(slug) || [];
  const seedBase = varietySeed ?? Date.now() + examSlot * 1000;
  const partIndex = parts.findIndex((p) => p.partNumber === partDef.partNumber);

  const t0 = Date.now();
  const { generated, validation } = await generatePartJsonWithRetries(slug, levelLabel, partDef, {
    examSlot,
    varietySeed: seedBase + partIndex,
    topic: theme,
  });

  const enunciadoPreview = buildB2EnunciadoFromGenerated(generated, partDef.partNumber);
  const partTitle = getExamPartDisplayLabel(slug, partDef.partNumber);

  // Validación de calidad IA (B2 Parts 1–2): blind solve + rúbrica. Sus errores bloquean igual que los mecánicos.
  let quality = null;
  const qualityErrors = [];
  const qualityWarnings = [];
  if (slug === 'b2' && (partDef.partNumber === 1 || partDef.partNumber === 2) && validation.ok) {
    try {
      const { validateB2Part1Quality, validateB2Part2Quality } = await import('@/lib/examPartQualityValidator');
      quality =
        partDef.partNumber === 1
          ? await validateB2Part1Quality(generated)
          : await validateB2Part2Quality(generated);
      qualityErrors.push(...quality.errors);
      qualityWarnings.push(...quality.warnings);
    } catch (e) {
      qualityWarnings.push(`Quality validator failed to run: ${e?.message || e}`);
    }
  }

  // Posible segunda respuesta defendible (blind solve / rúbrica): el preview se permite,
  // pero el guardado queda bloqueado salvo override manual explícito (ver save).
  const needsReview = collectAmbiguityFindings(quality);
  if (needsReview.length) {
    generated.__needsReview = {
      status: 'ambiguity_warning',
      findings: needsReview,
      detectedAt: new Date().toISOString(),
    };
  } else {
    delete generated.__needsReview;
  }

  const mergedOk = validation.ok && qualityErrors.length === 0;
  const mergedErrors = [...validation.errors, ...qualityErrors];
  const mergedWarnings = [...validation.warnings, ...qualityWarnings];

  logExamGeneration('part_preview', {
    level: slug,
    examNumber: examSlot,
    partNumber: partDef.partNumber,
    action: 'preview',
    durationMs: Date.now() - t0,
    validationOk: mergedOk,
    saved: false,
    validationErrors: mergedOk ? null : mergedErrors,
  });

  return {
    partNumber: partDef.partNumber,
    partTitle,
    partLabel: partTitle,
    generated,
    enunciadoPreview,
    validation: {
      ok: mergedOk,
      errors: mergedErrors,
      warnings: mergedWarnings,
      needsReview,
    },
    quality,
  };
}

/**
 * Ítems con posible segunda respuesta defendible según el quality validator
 * (blind solve y rúbrica). No bloquean el preview, pero sí el guardado automático.
 * @returns {Array<{ itemNumber: number | null, type: string, detail: string }>}
 */
function collectAmbiguityFindings(quality) {
  if (!quality) return [];
  const findings = [];

  const mismatches = Array.isArray(quality?.blindSolve?.mismatches)
    ? quality.blindSolve.mismatches
    : [];
  for (const m of mismatches) {
    findings.push({
      itemNumber: m?.number ?? null,
      type: 'blind_solve_mismatch',
      detail: `Blind solver chose "${m?.solver}" but the key says "${m?.key}".`,
    });
  }

  const ambiguous = Array.isArray(quality?.blindSolve?.ambiguous)
    ? quality.blindSolve.ambiguous
    : [];
  for (const a of ambiguous) {
    const alternatives = (a?.letters || a?.words || []).join('/');
    findings.push({
      itemNumber: a?.number ?? null,
      type: 'ambiguity_warning',
      detail: `Solver considers more than one answer defensible (${alternatives}): ${a?.reason || 'no reason given'}.`,
    });
  }

  const multi = Array.isArray(quality?.rubric?.multipleAnswerItems)
    ? quality.rubric.multipleAnswerItems
    : [];
  for (const m of multi) {
    findings.push({
      itemNumber: m?.number ?? null,
      type: 'multiple_answers',
      detail: `Rubric reviewer accepts several words (${(m?.words || []).join('/')}): ${m?.reason || 'no reason given'}.`,
    });
  }

  // De-dup por ítem + tipo (mismatch y ambiguous pueden solaparse).
  const seen = new Set();
  return findings.filter((f) => {
    const key = `${f.itemNumber}::${f.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Persist admin-approved generated JSON for one part. */
export async function saveLevelExamPartFromPreview(adminDb, {
  levelSlug,
  levelId,
  examSlot,
  partNumber,
  generated,
  skipAudio = false,
  replacePartContent = true,
  overrideNeedsReview = false,
}) {
  const slug = String(levelSlug || '').toLowerCase();
  const partDef = getLevelExamPartDef(slug, partNumber);
  if (!partDef) throw new Error(`Parte inválida: ${partNumber}`);

  // Ambigüedad sin resolver (segunda respuesta defendible detectada en el preview):
  // no se persiste salvo override manual explícito.
  const review = generated?.__needsReview;
  const reviewFindings = Array.isArray(review?.findings) ? review.findings : [];
  if (reviewFindings.length && !overrideNeedsReview) {
    const detail = reviewFindings
      .map((f) => `Q${f?.itemNumber ?? '?'}: ${f?.detail || f?.type || 'ambiguity'}`)
      .join(' | ');
    logExamGeneration('part_save_blocked_needs_review', {
      level: slug,
      examNumber: examSlot,
      partNumber: partDef.partNumber,
      action: 'save',
      validationOk: false,
      saved: false,
      validationErrors: reviewFindings.map((f) => f?.detail || f?.type),
    });
    throw new Error(
      `Save blocked: the quality validator flagged a possible second defensible answer (${detail}). ` +
        'Fix the item and regenerate the preview, or save with the explicit overrideNeedsReview flag.',
    );
  }
  if (generated && typeof generated === 'object') {
    delete generated.__needsReview;
  }

  const validation = validateGeneratedExamPart(slug, partDef.partNumber, generated);
  if (!validation.ok) {
    logExamGeneration('part_save_validation_failed', {
      level: slug,
      examNumber: examSlot,
      partNumber: partDef.partNumber,
      action: 'save',
      validationOk: false,
      saved: false,
      validationErrors: validation.errors,
    });
    throw new Error(`Validation failed: ${validation.errors.join(' ')}`);
  }

  const examenId = await ensureLevelExamenRow(adminDb, slug, levelId, examSlot);
  const parteId = await ensureLevelParteRow(adminDb, slug, partDef.partNumber);

  if (replacePartContent) {
    await deletePartContentForExam(adminDb, examenId, parteId);
  }

  const t0 = Date.now();
  const preguntaId = await persistCambridgeGeneratedPart(adminDb, {
    levelSlug: slug,
    levelId,
    examenId,
    parteId,
    partNumber: partDef.partNumber,
    examSlot,
    generated: validation.normalized,
    partDef,
    skipAudio,
  });

  logExamGeneration('part_saved', {
    level: slug,
    examNumber: examSlot,
    partNumber: partDef.partNumber,
    action: 'save',
    durationMs: Date.now() - t0,
    validationOk: true,
    saved: true,
  });

  return {
    examenId,
    partNumber: partDef.partNumber,
    preguntaId,
    partTitle: getExamPartDisplayLabel(slug, partDef.partNumber),
  };
}
