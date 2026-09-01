import { cambridgeExamGenerationCompletion, isDraloOpenAIConfigured, draloChatCompletion, getDraloFastModel } from '@/lib/draloAiEngine';
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
  findLevelExamenRowBySlot,
  resolveLevelExamenId,
} from '@/lib/levelsExamPersist';
import { validateGeneratedExamPart } from '@/lib/examPartValidation';
import { logExamGeneration } from '@/lib/examGenerationLog';
import { getExamPartDisplayLabel } from '@/lib/examPartDisplayLabel';
import { getB2ListeningAudioTargets } from '@/lib/b2ListeningAudioTargets';

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

function wordCount(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

async function expandScriptToListeningLength(text, { targetMin = 95, targetMax = 115, maxTokens = 900 } = {}) {
  const trimmed = String(text || '').trim();
  if (!trimmed || wordCount(trimmed) >= targetMin) return trimmed;

  const { text: out } = await draloChatCompletion({
    model: getDraloFastModel(),
    temperature: 0.35,
    max_tokens: maxTokens,
    messages: [
      {
        role: 'user',
        content:
          `Expand the following English listening script to between ${targetMin} and ${targetMax} words. ` +
          'Keep the same speakers (A:/B: labels if present), meaning, and natural B2 exam style. ' +
          'Return ONLY the expanded script — no JSON, no commentary.\n\n' +
          trimmed,
      },
    ],
  });

  const expanded = String(out || '').trim();
  return wordCount(expanded) >= targetMin - 8 ? expanded : trimmed;
}

async function expandListeningScriptsInGenerated(generated, partDef) {
  if (partDef.mode !== 'listening' || !partDef.needsAudio) return generated;

  const targets = getB2ListeningAudioTargets(partDef.partNumber);
  if (!targets) return generated;

  const gen = { ...generated };
  const expandOpts = {
    targetMin: targets.expandMin,
    targetMax: targets.expandMax,
    maxTokens: partDef.partNumber === 11 || partDef.partNumber === 13 ? 4096 : 900,
  };

  if (partDef.activity === 'short-extracts') {
    const questions = Array.isArray(gen.questions) ? gen.questions : [];
    gen.questions = await Promise.all(
      questions.map(async (q) => ({
        ...q,
        script: await expandScriptToListeningLength(q.script, expandOpts),
      })),
    );
    gen.audioClips = gen.questions.map((q, i) => ({
      orden: q.number ?? i + 1,
      titulo: String(q.situation || q.prompt || `Extract ${i + 1}`).trim(),
      text: String(q.script || '').trim(),
    }));
    gen.script = gen.questions.map((q) => String(q.script || '').trim()).filter(Boolean).join('\n\n');
  }

  if (partDef.activity === 'multiple-matching') {
    const clips = Array.isArray(gen.audioClips) ? gen.audioClips : [];
    if (clips.length) {
      gen.audioClips = await Promise.all(
        clips.map(async (clip, i) => ({
          ...clip,
          orden: clip.orden ?? i + 1,
          text: await expandScriptToListeningLength(clip.text || clip.script, expandOpts),
        })),
      );
    } else if (gen.script) {
      const blocks = String(gen.script)
        .split(/(?=Speaker\s+\d+\s*:)/i)
        .map((b) => b.trim())
        .filter(Boolean);
      const expanded = await Promise.all(
        blocks.map((block) => expandScriptToListeningLength(block, expandOpts)),
      );
      gen.script = expanded.join('\n\n');
      gen.audioClips = expanded.map((text, i) => ({
        orden: i + 1,
        titulo: `Speaker ${i + 1}`,
        text,
      }));
    }
  }

  if (
    (partDef.activity === 'sentence-completion' || partDef.activity === 'conversation') &&
    gen.script
  ) {
    gen.script = await expandScriptToListeningLength(gen.script, expandOpts);
  }

  return gen;
}

/**
 * El modelo a veces devuelve las respuestas como letras sueltas (["B","A",…]) en lugar de
 * {number, answer}. Se reasocian por posición con los números de pregunta.
 */
function normalizeAnswerRows(value, questions) {
  const rows = Array.isArray(value) ? value : Object.values(value || {});
  return rows.map((row, i) => {
    if (row && typeof row === 'object') {
      return { ...row, number: row.number ?? questions[i]?.number ?? i + 1 };
    }
    return { number: questions[i]?.number ?? i + 1, answer: String(row ?? '').trim() };
  });
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
    matchingAnswers: normalizeAnswerRows(gen.matchingAnswers, questions),
    modelAnswers: normalizeAnswerRows(gen.modelAnswers, questions),
    speakingPrompts: Array.isArray(gen.speakingPrompts)
      ? gen.speakingPrompts
      : Object.values(gen.speakingPrompts || {}),
    collaborativePrompts: Array.isArray(gen.collaborativePrompts)
      ? gen.collaborativePrompts
      : Object.values(gen.collaborativePrompts || {}),
    discussionQuestions: Array.isArray(gen.discussionQuestions)
      ? gen.discussionQuestions
      : Object.values(gen.discussionQuestions || {}),
    bulletPoints: Array.isArray(gen.bulletPoints) ? gen.bulletPoints : Object.values(gen.bulletPoints || {}),
    partNumber,
  };
}

const B2_LONG_TURN_EXAM1_PHOTOS = {
  theme: 'Studying',
  photoA: 'Students studying together in a library',
  photoB: 'A student studying alone at home',
  comparePrompt:
    'Compare the two photographs. Say what you see and why the people might prefer each way of studying.',
};

const B2_SPEAKING_JSON_RULES = `
Return ONLY valid JSON (no markdown). All student-facing task text in English.
Do NOT include modelAnswers, scoring rubrics, or examiner mark sheets.
Cambridge B2 First Speaking lasts about 14 minutes with 4 parts (normally two candidates).
Cambridge does NOT award a separate mark per part — performance is assessed across all four parts.`;

function buildB2SpeakingPrompt(partDef, options) {
  const topic = options.topic || 'everyday life';
  const seed = options.varietySeed ?? Date.now();
  const examSlot = Number(options.examSlot) || 1;
  const meta = `Cambridge B2 First Speaking — Exam set ${examSlot}. Theme: ${topic}. Variety seed: ${seed}.`;

  if (partDef.activity === 'interview') {
    return `Create B2 First Speaking Part 1 (Interview, about 2 minutes).
${meta}
${B2_SPEAKING_JSON_RULES}
The examiner asks brief personal questions to each candidate (studies, work, free time, travel, plans).
Generate exactly 3–4 short independent interview questions at B2 level.
Include guidance for short answers: the examiner may follow up with "Why?", "Why not?" or "Tell me more."
Return ONLY JSON with keys:
- partTitle (string)
- directions (official-style instructions for candidates)
- durationNote (string, e.g. "About 2 minutes")
- speakingPrompts (array of exactly 3–4 strings)
- followUpGuidance (string)
- followUpExamples (array of 2–3 strings)`;
  }

  if (partDef.activity === 'long-turn') {
    const photoContext =
      examSlot === 1
        ? `Use these fixed photographs for Exam 1:
- Photo A: ${B2_LONG_TURN_EXAM1_PHOTOS.photoA}
- Photo B: ${B2_LONG_TURN_EXAM1_PHOTOS.photoB}
- Theme: ${B2_LONG_TURN_EXAM1_PHOTOS.theme}
- Compare prompt must match: "${B2_LONG_TURN_EXAM1_PHOTOS.comparePrompt}"`
        : `Create two original, related contrasting photographs on theme "${topic}".`;

    return `Create B2 First Speaking Part 2 (Long turn, about 4 minutes total for both candidates).
${meta}
${B2_SPEAKING_JSON_RULES}
Each candidate compares two photographs for about 1 minute. The other candidate then answers a related question for about 30 seconds.
${photoContext}
Return ONLY JSON with keys:
- partTitle
- directions
- durationNote
- theme (string)
- comparePrompt (one comparative question for the 1-minute long turn)
- photoA (detailed original scene description for photograph A)
- photoB (detailed original scene description for photograph B)
- partnerFollowUpQuestion (short question for the other candidate, ~30 seconds)
- discourseFocusNote (string: assess Discourse Management — organisation, relevance, development)`;
  }

  if (partDef.activity === 'collaborative') {
    return `Create B2 First Speaking Part 3 (Collaborative task, about 4 minutes).
${meta}
${B2_SPEAKING_JSON_RULES}
Candidates receive a central question and exactly 5 written idea prompts. They have 15 seconds to read, discuss for about 2 minutes, then decide in about 1 minute.
In solo practice the AI plays the partner candidate.
Return ONLY JSON with keys:
- partTitle
- directions (include 15-second reading time, ~2 min discussion, ~1 min decision)
- durationNote
- centralQuestion (main situational question)
- collaborativePrompts (array of EXACTLY 5 idea prompts on the task sheet)
- setting (brief context)
- decisionQuestion (final question to reach one decision)
- interactiveFocusNote (string: assess Interactive Communication — turn-taking, inviting, responding)`;
  }

  if (partDef.activity === 'discussion') {
    return `Create B2 First Speaking Part 4 (Discussion, about 4 minutes).
${meta}
${B2_SPEAKING_JSON_RULES}
Deeper discussion on the Part 3 theme. Examiner asks opinion, justification, agreement and disagreement questions.
Return ONLY JSON with keys:
- partTitle
- directions
- durationNote
- part3ThemeLink (string linking back to the Part 3 collaborative theme)
- discussionQuestions (array of 4–6 open questions)
- dynamicFollowUpGuidance (string: examiner may ask Why?, Do you agree?, What about…?)`;
  }

  return `Create B2 First Speaking task.
${meta}
${B2_SPEAKING_JSON_RULES}
Return ONLY JSON with directions and appropriate prompts for activity "${partDef.activity}".`;
}

function buildSpeakingPrompt(levelLabel, partDef, options) {
  if (levelLabel === 'B2' && partDef.mode === 'speaking') {
    return buildB2SpeakingPrompt(partDef, options);
  }

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

function isB2SpeakingPartComplete(gen, partDef) {
  switch (partDef.activity) {
    case 'interview':
      return gen.speakingPrompts?.length >= 3 && gen.speakingPrompts?.length <= 5;
    case 'long-turn':
      return Boolean(gen.comparePrompt && gen.photoA && gen.photoB && gen.partnerFollowUpQuestion);
    case 'collaborative':
      return (
        gen.collaborativePrompts?.length === 5 &&
        Boolean(gen.centralQuestion && gen.decisionQuestion)
      );
    case 'discussion':
      return gen.discussionQuestions?.length >= 4 && gen.discussionQuestions?.length <= 6;
    default:
      return false;
  }
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

export function getLevelExamPartSystemPrompt(levelLabel) {
  return `Output only valid JSON for one complete ${CAMBRIDGE_EXAM_NAMES[levelLabel] || levelLabel} exam part.`;
}

export function buildLevelExamPartUserPrompt(levelLabel, partDef, options = {}) {
  if (partDef.mode === 'speaking') {
    return buildSpeakingPrompt(levelLabel, partDef, options);
  }
  if (partDef.mode === 'writing' && partDef.activity === 'email') {
    return buildWritingPrompt(levelLabel, partDef, options);
  }
  return buildExamGeneratePrompt(partDef.mode, partDef.activity, levelLabel, {
    topic: options.topic,
    varietySeed: options.varietySeed,
    partNumber: partDef.partNumber,
    questionCount: partDef.questionCount,
  });
}

export function resolveDefaultLevelExamPartPrompt({
  levelSlug,
  partNumber,
  examSlot = 1,
  topic,
  varietySeed,
}) {
  const slug = String(levelSlug || '').toLowerCase();
  const levelLabel = getLevelExamLabel(slug);
  const partDef = getLevelExamPartDef(slug, partNumber);
  if (!partDef) throw new Error(`Parte inválida: ${partNumber}`);

  const theme = topic || EXAM_THEMES[(Number(examSlot) - 1) % EXAM_THEMES.length];
  const parts = getLevelExamParts(slug) || [];
  const partIndex = parts.findIndex((p) => p.partNumber === partDef.partNumber);
  const seedBase = varietySeed ?? Date.now() + Number(examSlot) * 1000;
  const seed = seedBase + Math.max(partIndex, 0);

  return {
    system: getLevelExamPartSystemPrompt(levelLabel),
    user: buildLevelExamPartUserPrompt(levelLabel, partDef, {
      examSlot,
      topic: theme,
      varietySeed: seed,
    }),
    meta: {
      levelSlug: slug,
      partNumber: partDef.partNumber,
      partTitle: getExamPartDisplayLabel(slug, partDef.partNumber),
      examSlot: Number(examSlot),
      topic: theme,
      varietySeed: seed,
    },
  };
}

export async function generatePartJsonWithRetries(levelSlug, levelLabel, partDef, options) {
  const slug = String(levelSlug || '').toLowerCase();
  const parts = getLevelExamParts(slug) || [];
  const partIndex = parts.findIndex((p) => p.partNumber === partDef.partNumber);
  const seedBase = options.varietySeed ?? Date.now();

  // RUOE B2 (partes 1–7) falla a menudo por límites de palabras / gaps: más reintentos + repair.
  const isB2Ruoe = slug === 'b2' && partDef.partNumber >= 1 && partDef.partNumber <= 7;
  const maxAttempts = partDef.mode === 'listening' ? 5 : isB2Ruoe ? 8 : 3;

  const baseUserPrompt =
    options.userPrompt ||
    buildLevelExamPartUserPrompt(levelLabel, partDef, {
      examSlot: options.examSlot,
      topic: options.topic,
      varietySeed: seedBase + Math.max(partIndex, 0),
    });

  let generated = null;
  let validation = { ok: false, errors: [], warnings: [], normalized: null };

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    let repairSuffix = '';
    if (attempt > 0 && Array.isArray(validation.errors) && validation.errors.length) {
      const pn = partDef.partNumber;
      let lengthHint =
        'CRITICAL length: for cloze Parts 1–3, passage must be 150–180 words (prefer ~160–170). If too long, cut clauses; if too short, add natural detail. Keep all required gaps.';
      if (pn === 5) {
        lengthHint =
          'CRITICAL length: Part 5 passage MUST be 550–650 words (never under 500). Expand with detail, examples and contrast — do not return a short summary.';
      } else if (pn === 6) {
        lengthHint =
          'CRITICAL length: Part 6 passage MUST be 500–600 words with gaps (37)–(42). Expand substantially; short passages fail.';
      } else if (pn === 7) {
        lengthHint =
          'CRITICAL length: each Part 7 section A–D MUST be 120–150 words. Expand every person text.';
      } else if (pn === 4) {
        lengthHint =
          'CRITICAL Part 4: every question needs grading_metadata with exactly 2 markingPoints; at least 2 answers must be 4–5 Cambridge words; keyword must appear unchanged in every answer.';
      } else if (pn === 3) {
        lengthHint =
          'CRITICAL Part 3: passage markers must be exactly (N) ___ (STEM) for (0) and (17)–(24); include adjectives/adverbs/verbs among answers (not only nouns); stems/blanks do not count toward 150–180 words.';
      }
      repairSuffix = `

PREVIOUS ATTEMPT FAILED VALIDATION — return a NEW complete JSON that fixes ALL of these:
${validation.errors.map((e) => `- ${e}`).join('\n')}
${lengthHint}`;
    }

    try {
      generated = await generatePartJson(levelLabel, partDef, {
        ...options,
        userPrompt: `${baseUserPrompt}${repairSuffix}`,
        varietySeed: seedBase + Math.max(partIndex, 0) + attempt * 3000,
      });
    } catch (e) {
      validation = {
        ok: false,
        errors: [`Generation/parse error: ${e?.message || e}`],
        warnings: [],
        normalized: generated,
      };
      continue;
    }

    validation = validateGeneratedExamPart(slug, partDef.partNumber, generated);
    generated = validation.normalized;
    if (validation.ok && isPartComplete(generated, partDef)) {
      return { generated, validation };
    }
  }

  return { generated: validation.normalized || generated, validation };
}

async function generatePartJson(levelLabel, partDef, options) {
  const prompt =
    options.userPrompt ||
    buildLevelExamPartUserPrompt(levelLabel, partDef, options);
  const system = options.systemPrompt || getLevelExamPartSystemPrompt(levelLabel);

  const readingHeavy =
    partDef.mode === 'reading' ||
    (partDef.partNumber >= 5 && partDef.partNumber <= 7);
  const { text } = await cambridgeExamGenerationCompletion({
    system,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.9,
    max_tokens: readingHeavy ? 12288 : 8192,
    response_format: { type: 'json_object' },
  });
  let parsed = normalizeGenerated(parseJsonFromModel(text), partDef.partNumber);
  parsed = await expandListeningScriptsInGenerated(parsed, partDef);
  return parsed;
}

function isPartComplete(gen, partDef) {
  const q = gen.questions || [];
  const ma = gen.modelAnswers || [];
  if (partDef.mode === 'speaking') {
    if (partDef.partNumber >= 14 && partDef.partNumber <= 17) {
      return isB2SpeakingPartComplete(gen, partDef);
    }
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
    if (partDef.activity === 'short-extracts') {
      const withScript = q.filter((item) => wordCount(item.script) >= 80);
      return withScript.length >= (partDef.questionCount || 8);
    }
    if (partDef.activity === 'multiple-matching') {
      const minClips = partDef.partNumber === 12 ? 5 : 0;
      const clipCount = asGeneratedArray(gen.audioClips).length;
      const matchingCount = asGeneratedArray(gen.matchingAnswers).length;
      const poolCount = asGeneratedArray(gen.optionPool).length;
      return (
        Boolean(gen.script) &&
        matchingCount >= 5 &&
        poolCount >= 8 &&
        (minClips ? clipCount >= minClips : true)
      );
    }
    if (partDef.activity === 'conversation' && partDef.partNumber === 13) {
      const mcq = asGeneratedArray(gen.questions).filter(
        (item) => asGeneratedArray(item.options).length === 3,
      );
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
  const existing = await findLevelExamenRowBySlot(db, levelId, slot);

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
    const { extractListeningClipsFromGenerated, synthesizeAndUploadListeningClips, listeningCombinedDefaultTitle } = await import(
      '@/lib/levelsExamAudioStorage'
    );
    const { getB2ListeningAudioAssembly } = await import('@/lib/b2ListeningAudioTargets');
    const defaultAssembly =
      String(levelSlug || '').toLowerCase() === 'b2' ? getB2ListeningAudioAssembly(partNumber) : null;
    const clipSpecs = extractListeningClipsFromGenerated(generated, partDef);
    const audioRows = await synthesizeAndUploadListeningClips(db, {
      partNumber,
      examSlot,
      levelLabel,
      script: generated.script,
      clips: clipSpecs,
      partDef,
      audioAssembly: { ...(defaultAssembly || {}), ...(generated.audioAssembly || {}) },
      listeningIntro: generated.listeningIntro,
      combinedTitle: listeningCombinedDefaultTitle(
        partNumber,
        generated.setting || generated.title,
      ),
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
  persistDespiteValidation = false,
  useCodePrompts = false,
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
  const {
    resolveEffectiveExamPartGenerationPrompt,
    resolveDefaultExamPartGenerationPrompt,
  } = await import('@/lib/examPartGenerationPrompt');
  const generationPrompt = useCodePrompts
    ? resolveDefaultExamPartGenerationPrompt({
        levelSlug: slug,
        partNumber: partDef.partNumber,
        examSlot,
        topic: theme,
        varietySeed: seedBase + partIndex,
      })
    : await resolveEffectiveExamPartGenerationPrompt(adminDb, {
        levelSlug: slug,
        partNumber: partDef.partNumber,
        examSlot,
        topic: theme,
        varietySeed: seedBase + partIndex,
      });

  const { generated, validation } = await generatePartJsonWithRetries(slug, levelLabel, partDef, {
    examSlot,
    varietySeed: seedBase + partIndex,
    topic: theme,
    userPrompt: generationPrompt.user,
    systemPrompt: generationPrompt.system,
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
    if (!persistDespiteValidation) {
      throw new Error(`Validation failed: ${validation.errors.join(' ')}`);
    }
    console.warn(
      `[generateAndPersistLevelExamPart] Part ${partDef.partNumber}: persisting despite validation errors:`,
      validation.errors.join(' | '),
    );
  }

  if (replacePartContent || !preserveExistingParts) {
    await deletePartContentForExam(adminDb, examenId, parteId, {
      levelSlug: slug,
      partNumber: partDef.partNumber,
    });
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
  persistDespiteValidation = false,
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
      persistDespiteValidation,
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
  adminDb,
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

  const { resolveEffectiveExamPartGenerationPrompt } = await import('@/lib/examPartGenerationPrompt');
  const generationPrompt = await resolveEffectiveExamPartGenerationPrompt(adminDb, {
    levelSlug: slug,
    partNumber,
    examSlot,
    topic: theme,
    varietySeed: seedBase + partIndex,
  });

  const t0 = Date.now();
  const { generated, validation } = await generatePartJsonWithRetries(slug, levelLabel, partDef, {
    examSlot,
    varietySeed: seedBase + partIndex,
    topic: theme,
    userPrompt: generationPrompt.user,
    systemPrompt: generationPrompt.system,
  });

  const enunciadoPreview = buildB2EnunciadoFromGenerated(generated, partDef.partNumber);
  const partTitle = getExamPartDisplayLabel(slug, partDef.partNumber);

  // Validación de calidad IA (B2 Parts 1–2): blind solve + rúbrica. Sus errores bloquean igual que los mecánicos.
  // Parts 3, 5, 6, 7: adversarial QUALITY review (structured findings — no mechanical HARD promotion).
  let quality = null;
  const qualityErrors = [];
  const qualityWarnings = [];
  const adversarialQualityFails = [];
  if (slug === 'b2' && validation.ok) {
    try {
      if (partDef.partNumber === 1 || partDef.partNumber === 2) {
        const { validateB2Part1Quality, validateB2Part2Quality } = await import('@/lib/examPartQualityValidator');
        quality =
          partDef.partNumber === 1
            ? await validateB2Part1Quality(generated)
            : await validateB2Part2Quality(generated);
        qualityErrors.push(...quality.errors);
        qualityWarnings.push(...quality.warnings);
      } else if ([3, 5, 6, 7].includes(partDef.partNumber)) {
        const { runRuoeAdversarialQualityReview } = await import('@/lib/ruoeAiAdversarialQuality');
        const adversarial = await runRuoeAdversarialQualityReview(partDef.partNumber, generated);
        quality = adversarial;
        adversarialQualityFails.push(...adversarial.qualityFails);
        qualityWarnings.push(...adversarial.warnings);
        if (adversarial.findings?.length) {
          generated.__adversarialFindings = adversarial.findings;
        }
      }
    } catch (e) {
      qualityWarnings.push(`Quality validator failed to run: ${e?.message || e}`);
    }
  }

  // Posible segunda respuesta defendible (blind solve / rúbrica): el preview se permite,
  // pero el guardado queda bloqueado salvo override manual explícito (ver save).
  const needsReview = collectAmbiguityFindings(quality);
  for (const msg of [...(validation.qualityFails || []), ...adversarialQualityFails]) {
    needsReview.push({
      itemNumber: null,
      type: 'quality_fail',
      detail: msg,
    });
  }
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
      qualityFails: [...(validation.qualityFails || []), ...adversarialQualityFails],
      warnings: mergedWarnings,
      needsReview,
    },
    quality,
    generationPrompt,
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
    await deletePartContentForExam(adminDb, examenId, parteId, {
      levelSlug: slug,
      partNumber: partDef.partNumber,
    });
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
