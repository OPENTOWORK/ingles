import { cambridgeChatCompletion, isDraloOpenAIConfigured } from '@/lib/draloAiEngine';
import { formatWritingFeedbackDisplay } from '@/lib/formatWritingFeedback';
import { injectServerAnnotatedText } from '@/lib/writingAnnotatedTextBuilder';
import {
  ensureMissingTitleProblem,
  ensureUnclearOpinionTaskCheck,
  stripStrongerB2SkipPlaceholder,
} from '@/lib/writingFeedbackPostProcess';

function extractScore(text, category) {
  // Acepta decimales ("2.5/5") porque el modelo a veces los genera pese al
  // formato pedido; se redondea hacia abajo (conservador).
  const regex = new RegExp(`${category}:\\s*(\\d(?:[.,]\\d+)?)\\s*/\\s*5`, 'i');
  const match = String(text || '').match(regex);
  return match ? Math.floor(parseFloat(match[1].replace(',', '.'))) : null;
}

const SCORE_CATEGORIES = ['Content', 'Communicative Achievement', 'Organisation', 'Language'];

/**
 * El alumno nunca debe ver scores decimales ("Language: 2.5/5"): se redondean
 * hacia abajo en el texto y se recalcula el Total para que cuadre.
 */
export function normalizeDecimalScores(feedback) {
  let text = String(feedback || '');
  let changed = false;
  for (const cat of SCORE_CATEGORIES) {
    text = text.replace(
      new RegExp(`(${cat}:\\s*)(\\d[.,]\\d+)(\\s*/\\s*5)`, 'i'),
      (m, pre, num, post) => {
        changed = true;
        return `${pre}${Math.floor(parseFloat(num.replace(',', '.')))}${post}`;
      },
    );
  }
  if (!changed) return text;
  const vals = SCORE_CATEGORIES.map((cat) => extractScore(text, cat));
  if (vals.every((v) => v !== null)) {
    const total = vals.reduce((a, b) => a + b, 0);
    text = text.replace(/(Total Score:\s*)\d+(?:[.,]\d+)?(\s*\/\s*20)/i, `$1${total}$2`);
  }
  return text;
}

/**
 * Coherencia CEFR/scores: con perfil totalmente on task de C>=4, CA>=4, O>=4 y
 * L>=3, una etiqueta B1+ contradice los propios scores del modelo. Sube
 * exactamente un escalón (B1+ → low B2) y parchea la línea Level. Acotado:
 * nunca sube más de un escalón ni toca perfiles con scores más débiles.
 */
export function applyCefrScoreCoherence({
  feedback,
  cefr,
  content,
  communication,
  organisation,
  language,
  taskMatch,
}) {
  if (cefr !== 'B1+') return { cefr, feedback };
  if (taskMatch && taskMatch !== 'on') return { cefr, feedback };
  if (!(content >= 4 && communication >= 4 && organisation >= 4 && language >= 3)) {
    return { cefr, feedback };
  }
  const lines = String(feedback || '').split('\n');
  const idx = lines.findIndex((l) => /^\s*\**(?:Estimated CEFR level|Level):/i.test(l));
  if (idx === -1) return { cefr, feedback };
  lines[idx] = lines[idx].replace(/B1\+/, 'low B2');
  return { cefr: 'low B2', feedback: lines.join('\n') };
}

function normalizeCardComparable(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/["'""'']/g, '')
    .replace(/[.,;:!?…]+$/, '')
    .replace(/\s+/g, ' ');
}

/**
 * Dedupe de correction cards en el texto crudo: el modelo a veces repite la
 * misma card (mismo Original + Correct). También descarta cards defectuosas
 * donde Original === Correct.
 */
export function dedupeCorrectionCards(feedback) {
  const lines = String(feedback || '').split('\n');
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (start === -1) {
      if (t.startsWith('✏️')) start = i;
    } else if (/^(📈|🚀|📚|📊|🎓|💪|🎯|📋|📝|🔍)/.test(t)) {
      end = i;
      break;
    }
  }
  if (start === -1) return feedback;

  const body = lines.slice(start + 1, end).join('\n');
  const chunks = body.split(/\n(?=Original:)/i);
  const seen = new Set();
  const kept = [];
  for (const chunk of chunks) {
    const om = chunk.match(/Original:\s*([^\n]*)/i);
    if (om) {
      const cm = chunk.match(/Correct:\s*([^\n]*)/i);
      const original = normalizeCardComparable(om[1]);
      const correct = normalizeCardComparable(cm?.[1] || '');
      if (original && original === correct) continue; // card defectuosa
      const key = `${original}|${correct}`;
      if (seen.has(key)) continue; // duplicado
      seen.add(key);
    }
    kept.push(chunk);
  }
  if (kept.length === chunks.length) return feedback;
  return [
    ...lines.slice(0, start + 1),
    kept.join('\n').replace(/\n{3,}/g, '\n\n'),
    ...lines.slice(end),
  ].join('\n');
}

const IMPLIED_POINT_REGEX =
  /\b(implied|implicit(?:ly)?|not (?:stated |made )?explicit(?:ly)?(?: stated| enough)?|should be (?:stated|made) (?:more )?(?:explicit|clear)|not clearly state[ds]?\b|needs? (?:a )?clearer|could be (?:stated |made )?clearer)/i;

/**
 * Backstop determinista: un punto IMPLÍCITO está respondido. Si el modelo marca
 * PARTLY OFF TASK pero su propia justificación dice que el punto está "implied"
 * o "not explicitly stated" (sin mencionar nada missing/misunderstood), se
 * reclasifica a ON TASK para no aplicar el clamp de Content.
 */
export function reclassifyImpliedTaskMatch(feedback) {
  const lines = String(feedback || '').split('\n');
  const idx = lines.findIndex((l) => /Task match:\s*\**\s*PARTLY OFF TASK/i.test(l));
  if (idx === -1) return feedback;
  if (!IMPLIED_POINT_REGEX.test(lines[idx])) return feedback;
  if (/\b(missing|misunderstood|not answered|unanswered|ignored|wrong)\b/i.test(lines[idx])) return feedback;
  lines[idx] = lines[idx].replace(/PARTLY OFF TASK/i, 'ON TASK');
  return lines.join('\n');
}

export function extractCefrLevel(text) {
  // (?![\w+]) en vez de \b: \b no funciona tras "+" (B1+ se extraía como B1).
  const match = String(text || '').match(
    /(?:Estimated CEFR level|Level):\s*(A2\+?|B1\+?|low\s+B2|B2\+?|C1)(?![\w+])/i,
  );
  return match ? match[1].replace(/\s+/g, ' ').trim() : null;
}

export function countEssayWords(text) {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

const CEFR_LABELS = ['A2', 'A2+', 'B1', 'B1+', 'low B2', 'B2', 'B2+', 'C1'];
const CEFR_TOKEN_REGEX = /(A2\+?|B1\+?|low\s+B2|B2\+?|C1)(?![\w+])/gi;

/**
 * El alumno nunca debe ver etiquetas ambiguas tipo "B1/B1+", "B1 or B1+" o
 * "between B1 and B2". Si la línea "Level:" contiene más de un nivel, se
 * normaliza de forma conservadora al más bajo y se reescribe la línea.
 */
export function normalizeCefrLevelLine(feedback) {
  const lines = String(feedback || '').split('\n');
  const idx = lines.findIndex((l) => /^\s*\**(?:Estimated CEFR level|Level):/i.test(l));
  if (idx === -1) return feedback;
  const value = lines[idx].replace(/^\s*\**(?:Estimated CEFR level|Level):\s*/i, '');
  const tokens = [...value.matchAll(CEFR_TOKEN_REGEX)]
    .map((m) => CEFR_LABELS.find((l) => l.toLowerCase() === m[1].replace(/\s+/g, ' ').toLowerCase()))
    .filter(Boolean);
  if (new Set(tokens).size <= 1) return feedback;
  const lowest = tokens.reduce((a, b) => (CEFR_LABELS.indexOf(b) < CEFR_LABELS.indexOf(a) ? b : a));
  lines[idx] = `Level: ${lowest}`;
  return lines.join('\n');
}

const WORD_LIMIT_CLAIM_REGEX =
  /\bword\s*-?\s*(limit|count)\b|\b(over|under|above|below|exceed\w*|outside)\s+the\s+(word\s+)?(limit|maximum|minimum|range)\b|\b\d+\s*-?\s*word\s+(limit|maximum|minimum)\b/i;

/**
 * El word count se calcula programáticamente: si el texto ESTÁ dentro del rango,
 * el modelo no puede inventarse que se pasa o se queda corto. Se eliminan las
 * frases que mencionan el word limit/count sin tocar el resto del feedback.
 */
export function stripInRangeWordCountClaims({ feedback, wordCount, wordMin, wordMax }) {
  const wc = Number(wordCount);
  if (!(wc >= wordMin && wc <= wordMax)) return feedback;
  const out = [];
  for (const line of String(feedback || '').split('\n')) {
    if (!WORD_LIMIT_CLAIM_REGEX.test(line)) {
      out.push(line);
      continue;
    }
    const isBullet = /^\s*-\s*/.test(line);
    const sentences = line.split(/(?<=[.!?])\s+/);
    let rebuilt = sentences.filter((s) => !WORD_LIMIT_CLAIM_REGEX.test(s)).join(' ').trim();
    if (!rebuilt || /^[-•*\s]*$/.test(rebuilt)) continue; // la línea entera era el claim falso
    if (isBullet && !rebuilt.startsWith('-')) rebuilt = `- ${rebuilt}`;
    out.push(rebuilt);
  }
  return out.join('\n');
}

/**
 * B2 readiness: el "Pass" numérico (12/20) solo vale si el nivel CEFR estimado
 * acompaña. B1/B1+ nunca es B2-ready aunque el total llegue a 12.
 */
export function resolveB2Readiness({ cefr, total }) {
  const lvl = String(cefr || '').trim().toLowerCase();
  const score = Number(total) || 0;
  if (score < 12) {
    return { key: 'needs-improvement', label: 'Needs improvement', passed: false };
  }
  if (['a2', 'a2+', 'b1', 'b1+'].includes(lvl)) {
    return { key: 'not-b2-ready', label: 'Not B2-ready yet', passed: false };
  }
  if (lvl === 'low b2') {
    return { key: 'borderline', label: 'Borderline — close to B2', passed: true };
  }
  if (['b2', 'b2+', 'c1'].includes(lvl)) {
    return { key: 'b2-ready', label: 'B2-ready', passed: true };
  }
  // Nivel no parseable: conservador, pass numérico sin confirmar nivel.
  return { key: 'score-pass-unverified', label: 'Score pass — level not detected', passed: true };
}

/**
 * Flag global de Writing Correction V2. Controla TODO lo nuevo (word count
 * rules, readiness, guardrails, enforcement de improved version, línea final
 * determinista y Calibration Pack). Default OFF: sin la variable, producción
 * sigue usando el corrector actual aunque se deploye este archivo.
 */
export function isWritingCorrectionV2Enabled() {
  return process.env.DRALO_WRITING_CORRECTION_V2_ENABLED === 'true';
}

/** Sub-flag del Calibration Pack: nunca activo si V2 está apagado. */
export function isWritingCalibrationEnabled() {
  return isWritingCorrectionV2Enabled() && process.env.DRALO_WRITING_CALIBRATION_ENABLED === 'true';
}

/** Heurística simple de tipo de tarea a partir del enunciado. */
function inferWritingTaskType(taskPack = '') {
  const t = String(taskPack).toLowerCase();
  for (const type of ['email', 'letter', 'article', 'report', 'review', 'story']) {
    if (t.includes(type)) return type;
  }
  return 'essay';
}

/**
 * Calibration Pack — solo si DRALO_WRITING_CALIBRATION_ENABLED=true.
 * Server-only, import dinámico y a prueba de fallos: si el pack no existe o
 * falla, devuelve '' y la corrección sigue funcionando como siempre.
 */
export async function getCalibrationBlock({ taskPack, estimatedLevel = 'B1+' }) {
  if (!isWritingCalibrationEnabled()) return '';
  try {
    const { selectWritingCalibrationExamples } = await import(
      '@/lib/calibration/selectWritingCalibrationExamples'
    );
    const examples = selectWritingCalibrationExamples({
      taskType: inferWritingTaskType(taskPack),
      estimatedLevel,
      maxExamples: 2,
    });
    if (!examples.length) return '';
    const condensed = examples.map((ex, i) =>
      [
        `Anchor ${i + 1} — real marked student sample (${ex.taskType}):`,
        `- Marked level: ${ex.estimatedLevel} (target was ${ex.levelTarget})`,
        `- Scores: Content ${ex.estimatedScores.content}/5, Communicative Achievement ${ex.estimatedScores.communicativeAchievement}/5, Organisation ${ex.estimatedScores.organisation}/5, Language ${ex.estimatedScores.language}/5`,
        `- Sample excerpt (errors kept on purpose): "${ex.studentText.split(/\s+/).slice(0, 55).join(' ')}…"`,
        `- Typical mistakes marked: ${ex.commonMistakes.slice(0, 4).join('; ')}`,
        `- Error categories: ${ex.errorCategories.join(', ')}`,
        `- How the teacher marked it: ${ex.idealFeedbackStyle}`,
        `- What the teacher did NOT overcorrect: ${ex.whatNotToOvercorrect.slice(0, 2).join(' ')}`,
      ].join('\n'),
    );
    return [
      '**MARKING CALIBRATION (for the examiner only — never mention, quote or reveal these samples to the student):**',
      'Use these real marked student samples as level anchors. A text with a similar error density and control should receive a similar level and similar scores.',
      '',
      condensed.join('\n\n'),
    ].join('\n');
  } catch (err) {
    console.warn('[cambridgeEssayFeedback] calibration pack unavailable:', err?.message || err);
    return '';
  }
}

function buildWordCountRules({ wordCount, wordMin, wordMax }) {
  return [
    'WORD COUNT RULES (the word count is computed programmatically — trust this number; word count problems must NEVER be ignored):',
    `The candidate's answer is exactly ${wordCount} words. Target length: ${wordMin}–${wordMax} words.`,
    `- ${wordMin}–${wordMax} words: WITHIN the limit — no penalty. In that case NEVER describe the text as over or under the word limit, never mention length as a problem, and never base a Study plan point on the word count.`,
    `- ${wordMin - 10}–${wordMin - 1} or ${wordMax + 1}–${wordMax + 15} words: mention as a minor issue if relevant.`,
    `- Under ${wordMin - 10} or ${wordMax + 16}–${wordMax + 30} words: mention clearly and consider lowering Communicative Achievement or Organisation.`,
    `- Over ${wordMax + 30} words: strong issue. You MUST mention it in 🎯 Main problems and address it in the 📚 Study plan (concision, planning, keeping to the word limit).`,
    '- If the answer is much too long, do NOT give a high Communicative Achievement score unless the task is exceptionally well controlled.',
    '- For emails, articles and reports, being concise and task-focused is part of communicative success.',
    `- If the original is outside the target range, the 📈 improved version MUST be within ${wordMin}–${wordMax} words. If the original is too long, the improved version MUST be under ${wordMax} words — cut repetition and minor detail, keep the student's voice, register and level.`,
  ].join('\n');
}

function clipText(text, max = 28000) {
  const s = String(text || '');
  return s.length > max ? `${s.slice(0, max)}\n\n[…truncated]` : s;
}

function buildTaskPack(taskContext = {}, structuredExamContext = '') {
  const structured = String(structuredExamContext || '').trim();
  if (structured) return structured;

  const tc = taskContext && typeof taskContext === 'object' ? taskContext : {};
  const partLabel = String(tc.partLabel || '').trim();
  const partDescription = String(tc.partDescription || '').trim();
  const taskInstructions = String(tc.instructions || '').trim();
  const taskInputText = String(tc.inputText || '').trim();

  return [
    partLabel && `**Part / section:** ${partLabel}`,
    partDescription && `**Part description (Cambridge rubric context):**\n${clipText(partDescription)}`,
    taskInstructions &&
      `**Task instructions (primary criteria for Content and Communicative Achievement):**\n${clipText(taskInstructions)}`,
    taskInputText &&
      `**Input / stimulus material (notes, texts, bullet points the candidate must address):**\n${clipText(taskInputText)}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function buildB2FirstPrompt({ essay, taskPack, wordMin, wordMax, wordCount, calibrationBlock = '', v2 = false }) {
  const lengthBlock = v2
    ? buildWordCountRules({ wordCount, wordMin, wordMax })
    : `Target length when relevant: **${wordMin}–${wordMax} words**.`;

  const v2Guardrails = v2
    ? `
- Task relevance comes FIRST in Content. Compare the answer with the EXACT task set: if it ignores the set topic or answers a completely different question, Content MUST be 0/5 or 1/5, this must be the FIRST bullet in Main problems, and you must never describe the task as addressed. A well-written but off-topic answer still fails on Content.
- Content measures task coverage, NOT grammar. Give Content 5/5 ONLY if every point of the task is covered clearly AND sufficiently developed — not merely mentioned in passing.
- Lower Content when points are missing, underdeveloped, off-focus or answered incompletely. Do not lower Content for grammar mistakes alone (that is Language).
- Do NOT double-punish implicit answers: if every task point is covered and the ONLY Content issue is that one point is answered implicitly rather than explicitly (e.g. a clear positive view instead of "I recommend it"), Content is 4/5 — not 3/5.
- If the length is far off target (over ${wordMax + 30} or under ${wordMin - 20} words), re-check Content together with Communicative Achievement: a long answer that still covers everything may keep its Content score, but the loss of control should normally lower Communicative Achievement.
- Do NOT give Language 4/5 or higher if there are frequent grammar errors.
- If Language is 2/5 or below, never describe the text as B2-ready.
- If there are many basic errors, the estimated level should normally not exceed B1+.
- LEVEL/SCORE COHERENCE: if the answer is fully on task and you give Content 4/5 or 5/5, Communicative Achievement 4/5, Organisation 4/5 and Language 3/5, the estimated level should normally be low B2, NOT B1+. Reserve B1+ for texts with weaker scores or severe, frequent language problems.
- If the answer is clearly too long or too short, cap Communicative Achievement unless the response is exceptionally well controlled.`
    : '';

  return `
You are an experienced Cambridge B2 First writing examiner marking like a real teacher on paper: direct, precise, and constructive — not overly kind. Praise only what genuinely works. Penalise vague content, unnatural phrasing, missing task points, and missing essay title. Estimate the student's REAL level honestly; do NOT inflate scores.

${taskPack ? `**EXACT TASK SET TO THE CANDIDATE** — you MUST evaluate task fulfilment against this:\n---\n${taskPack}\n---\n` : 'No separate task sheet was supplied; infer a typical B2 Part 1 (essay) or Part 2 task from the answer.\n'}
${
    v2 && taskPack
      ? `
STEP 0 — TASK RELEVANCE CHECK (do this BEFORE scoring anything):
Compare the candidate's answer with the exact task above, point by point: list every question/bullet the task asks and check each one is genuinely answered.
- If the answer discusses a different topic or ignores the question that was set, it is OFF TASK: Content MUST be 0/5 or 1/5, the FIRST bullet of 🎯 Main problems MUST state that the answer does not address the set task, and the one-sentence level explanation must mention it too.
- A well-written answer about the wrong topic still fails on Content. Never describe an off-task answer as addressing the task.
- If OFF TASK: Communicative Achievement must not exceed 2/5; do NOT produce a polished improved version of the off-topic text — in 📈 write only a short note telling the student to rewrite the answer so it responds to the task; and the 📚 Study plan Strategy must include reading the task carefully and planning before writing.
- It is PARTLY OFF TASK when the answer deals with the general topic but misses, misunderstands or only superficially answers one or more of the task points (e.g. the task asks what to bring FOR THE TRIP and the student only talks about bringing a present). In the Task check line, NAME the task point that is not fully answered.
- PARTLY OFF TASK applies ONLY to explicit questions/bullets the task asks. For "Do you agree?" opinion essays, a one-sided answer with a clear opinion and reasons IS ON TASK — not discussing the opposite view may be mentioned as a Content development point, but it is NEVER PARTLY OFF TASK.
- IMPLIED task points are ANSWERED task points. If the task asks the writer to "say whether you would recommend it" (or to give an opinion) and the text clearly expresses an overall positive or negative view — e.g. "learning to play an instrument is beneficial for young people" — that point IS answered implicitly: it is ON TASK, NEVER PARTLY OFF TASK. Write: "Task match: ON TASK — ... The recommendation is positive but should be stated more explicitly." 🎯 Main problems should include a bullet noting that the recommendation/opinion should be stated explicitly. Reserve PARTLY OFF TASK for task points that are genuinely missing or misunderstood.
- An opinion counts as STATED if it appears ANYWHERE in the text, in ANY wording — e.g. "the most important thing is…", "X is number one", "X is everything", "I think…", "in my opinion…", "the best quality is…". Even if it is badly written, repetitive or underdeveloped, that task point is ANSWERED: mark ON TASK (e.g. "ON TASK — The article discusses friendship and gives a clear opinion that loyalty is the most important quality, although the ideas need clearer development."). Weak writing belongs to Language/Organisation, not to the Task check.
- CRITICAL: this leniency applies ONLY to opinion/recommendation points. For INFORMATIONAL questions (what / when / where / which — e.g. "What should I bring?"), the reply must actually answer what was asked. A reply that MISREADS the question (e.g. talking about a present for the host when the task asks what to bring for the trip) is a MISUNDERSTOOD point → PARTLY OFF TASK, never ON TASK.
- SCORING RULE for implicit or unclearly-stated points: if your Task check is ON TASK and the only caveat is that a point "should be stated more explicitly" or "needs clearer development", Content MUST be 4/5. Giving Content 3/5 in that situation is double-punishing and is WRONG. Content 3/5 requires a task point that is genuinely missing, misunderstood or barely touched.
- If PARTLY OFF TASK: Content must not exceed 3/5; 🎯 Main problems MUST include a bullet explaining exactly which task point is missing or misunderstood and what the task actually asked for; the 📈 improved version MUST repair that task point with a brief, natural answer at the student's CURRENT level, tone and register (an informal email stays informal — do not make it more formal); and the 📚 Study plan Strategy must include: "Before writing, underline every question in the task and make sure you answer each one directly."
- Only when the answer fully covers every task point, score Content by how completely and clearly it covers them.
- If the task above does NOT state a specific topic or question (e.g. only the task type is known), treat the answer as ON TASK and score Content on completeness and development only.
`
      : ''
  }
${lengthBlock}

Assessment scale:
- **Content**: All content is relevant; target reader fully informed.
- **Communicative Achievement**: Register, format and conventions appropriate to the task.
- **Organisation**: Text well organised; coherent; uses a range of cohesive devices.
- **Language**: Good range of vocabulary and grammar; errors do not impede communication.

CRITICAL marking rules:
- Mark using four subscales (0–5 each, total /20). Be realistic: good structure with weak task coverage is normally Content 3/5, not 4/5.
- Focus on the 8–12 most important issues; explain WHY each error matters and give a natural alternative.
- Do NOT mark connectors (However, Moreover, Whereas…) as strengths if they are misused, awkwardly placed, or create grammar problems.
- Do NOT praise vague phrases ("many things", "specific benefits", "towards it", "for your own good") — mark them as vocabulary or content problems.
- Acceptable B1+/low B2 essays with several language problems: Language 3/5, total often 12–13/20 — not B2-ready unless control is consistently strong.
- The improved version MUST be materially different from the original: add a title, clarify the opinion, develop weak notes, fix errors — not a near-copy with two word changes.
- The Stronger B2 version MUST always be written for any complete essay (140+ words of real content). NEVER write "Not needed yet".${v2Guardrails}
${calibrationBlock ? `\n${calibrationBlock}\n` : ''}

**Required response format (in English). Do NOT use markdown headers (#, ##, ###). Use these emoji section titles exactly, in this order:**

📝 Dralo writing feedback

💪 Main strengths
- 1–3 bullet points ONLY for genuine strengths (clear paragraphing, relevant attempt, one good structure) — skip this section item if nothing is truly strong.

🎯 Main problems
- 3–5 bullet points on what most limits the mark (task coverage, missing title, vague content, unnatural phrases, grammar breakdown).
- For Part 1 essays: if there is NO title at the top, this MUST appear here and Communicative Achievement must lose at least 1 point.

🎓 Estimated CEFR level
Level: <exactly ONE label from: A2, A2+, B1, B1+, low B2, B2, B2+, C1 — NEVER a combination or range such as "B1/B1+", "B1 or B1+", "B1-B2" or "between B1 and B2". If you hesitate between two labels, choose the LOWER one.>
One sentence explaining why.
${
  v2 && taskPack
    ? `
📋 Task check
Task match: <exactly one of: ON TASK / PARTLY OFF TASK / OFF TASK> — one short sentence; if PARTLY OFF TASK or OFF TASK, name exactly which task point(s) are not (fully) answered.
Title included: <yes / no>
Clear opinion: <yes / no / partial / n/a> — for "Do you agree?" essays, "partial" or "no" if the stance is not direct.
All notes covered: <yes / partial / no> — name any underdeveloped note (e.g. services, own idea).
Word count ok: <yes / no>
Paragraphing: <weak / acceptable / good>
`
    : ''
}
📊 Scores
- Content: x/5
- Communicative Achievement: x/5
- Organisation: x/5
- Language: x/5
**Total Score: X/20**
Each x MUST be a whole number from 0 to 5 — never use decimals or halves (no 2.5/5, no 3,5/5).

✏️ Corrections
Mark like an FCE teacher on paper (see colour guide). Minimum 8 cards covering grammar, vocabulary, spelling (if any), content, and at most 1–2 genuine strengths.

MANDATORY colour mix (count your cards before finishing):
- At least 2 YELLOW vocabulary cards (Type: vocabulary, Problem: "WW" or "rep. vocab.")
- At least 2 PURPLE content cards (Type: task response, Problem: purple labels below)
- At least 2 RED grammar cards (Type: grammar/cohesion)
- At least 1 BLUE spelling card if any real misspelling exists (Type: spelling)
- At most 2 GREEN strength cards — ONLY if genuinely good in context (never misused Moreover/However/Whereas)

TEACHER LABELS BY COLOUR (Problem field MUST start with these — Type MUST match the colour):
- YELLOW vocabulary → Problem: "WW" or "WW — …" OR "rep. vocab." · Type: vocabulary (NEVER grammar)
- BLUE spelling → Problem: "spelling ⇒ <correct form>" · Type: spelling
- RED grammar → Problem: "Too long…", "clunky", "break the sentence.", "need an object here", "subject-verb agreement", "sounds translated from Spanish" · Type: grammar or cohesion
- PURPLE content → Problem: "needs more developing", "tell me which!", "is this the right concept?", "too generic", "only mentioned in passing" · Type: task response (NEVER grammar)
- GREEN strengths → Problem: "clear paragraphing ✓", "good contrast ✓", "relevant example ✓" — NOT "good connector!" unless the connector is perfect

For each error/strength, output a block in exactly this format (each field on its own line):
Original: "exact phrase from the student's text"
Problem: <teacher label from above — SHORT like margin notes on paper>
Correct: "corrected phrase" (for green strengths, repeat the good phrase)
Why: one short sentence explaining why it is wrong and what natural English would do
Severity: <major | medium | minor>
Type: <MUST match the colour — see above>${
    v2
      ? `
Correction card selection rules:
- If Language is 3/5 or lower, the text certainly contains several real errors: include AT LEAST 3 correction cards (aim for 4–6). Fewer than 3 is acceptable ONLY if the text genuinely has fewer than 3 real errors.
- Priority order: 1) errors in basic grammar, 2) repeated errors, 3) errors you mention in 🎯 Main problems or the 📚 Study plan, 4) errors that are easy for the student to understand.
- COHERENCE RULE: every grammar or vocabulary area you list in the 📚 Study plan must be backed by a matching correction card or a 🎯 Main problems bullet. For example, if the Study plan says "plural and possessive forms", you MUST show that card (e.g. Original: "student's lives" → Correct: "students' lives").
- Never invent errors and never "correct" sentences that are already natural and accurate.
- NEVER output the same card twice: each Original phrase appears in at most ONE card.
- Style and word-choice improvements (repetitive phrasing, flat adjectives like "nice"/"good") are Type: vocabulary or register — NEVER grammar.
- Do not create a card for an acceptable sentence unless the change clearly improves accuracy, clarity or task style. A card that merely rephrases a correct sentence with no clear gain must be dropped.
- For reviews, prefer vocabulary/style upgrades the student can reuse: "nice" → "lively / pleasant / enjoyable"; "good place" → "convenient option"; "too crowded" → "very crowded at weekends".`
      : ''
  }

🔍 Annotated text
Reproduce the student's FULL text (including title). Mark EVERY Original phrase from ✏️ Corrections with the matching tag — yellow for WW/rep.vocab., purple for task response, red for grammar, blue for spelling, green for strengths:
- [[voc]]…[[/voc]] yellow vocabulary · [[spell]]…[[/spell]] spelling · [[gram]]…[[/gram]] grammar · [[cont]]…[[/cont]] content · [[good]]…[[/good]] strengths
Never mark a vocabulary (WW) or content (tell me which!) phrase as [[gram]].

📈 Improved version (your level)
Rewrite the student's essay at their CURRENT level (${wordMin}–${wordMax} words). It MUST:
- include a suitable title;
- answer “Do you agree?” clearly if that is the task;
- develop the underdeveloped notes (especially services and own idea);
- fix the main errors you marked;
- read noticeably better than the original — NOT a near-copy.${
    v2 && taskPack
      ? `\nMANDATORY if your Task match is PARTLY OFF TASK: the rewrite must REPAIR the missed or misunderstood task point — add one or two short, natural sentences that actually answer it, at the student's level, tone and register (e.g. if the task asked what to bring for a trip, suggest clothes or useful items for the trip). Never leave that task point unanswered in the rewrite.
If a task point was only IMPLIED or stated unclearly in the original (e.g. a recommendation or an opinion), make it explicit in the rewrite with one short sentence at the student's level, using a clear opinion marker (e.g. "That is why I would recommend it to everyone." or "In my opinion, loyalty is the most important quality in a good friend.").
If the text has a title (articles, reports, reviews) and the title contains an error, correct the title too (e.g. "LEARN TO PLAY INSTRUMENT" → "Learn to Play an Instrument") — never copy a faulty title unchanged.
For reviews, upgrade flat adjectives to natural review vocabulary at the student's level (e.g. "The atmosphere is nice…" → "The atmosphere is lively, which makes the place more exciting.").`
      : ''
  }${
    v2 && wordCount > wordMax
      ? `\nIMPORTANT: the original is ${wordCount} words, which is over the limit. Your rewrite MUST be between ${wordMin} and ${wordMax} words — aim for about ${Math.round((wordMin + wordMax) / 2)} words. Cut repetition, redundant examples and minor detail. Do NOT exceed ${wordMax} words.`
      : v2 && wordCount < wordMin
        ? `\nNote: the original is ${wordCount} words, under the ${wordMin}-word minimum. Keep the rewrite at the student's level; do not pad it artificially, but show in the structure where ideas could be developed.`
        : ''
  }

🚀 Stronger B2 version
You MUST always write a full Stronger B2 version here (${wordMin}–${wordMax} words) when the student submitted a complete essay. NEVER write "Not needed yet" or skip this section.
The Stronger B2 version must: sound natural (not C1 artificial); include a title; answer the task directly; cover all notes clearly; use B2 connectors only where they fit; stay within the word limit.

📚 Study plan
Before your next writing, practise:
Grammar:
- 3 specific grammar points
Vocabulary:
- 2 vocabulary areas
Strategy:
- 1 writing strategy

${
  v2
    ? `Readiness line — end with exactly ONE of these lines, chosen by your estimated level and total score:
- "✅ B2-ready — pass standard met." ONLY if the estimated level is B2, B2+ or C1 AND the total is 12/20 or higher.
- "🟡 Borderline — close to B2. Keep polishing accuracy." if the estimated level is low B2 AND the total is 12/20 or higher.
- "❌ Not yet at B2 level — keep practising." in all other cases (including B1 or B1+, even if the total reaches 12/20).`
    : `Pass threshold: 12/20. End with exactly one line: either "✅ Pass — B2 standard met." or "❌ Not yet at pass level — keep practising."`
}

If the text is gibberish or far too short, still return the full structure with low scores (0–1/5).

**Candidate's answer:**
${essay}
`.trim();
}

function buildGenericPrompt(essay) {
  return `
You are an experienced Cambridge English writing examiner. Evaluate this text using four subscales (0–5 each).

Return plain text with emoji section titles (no # headers): 📝 title, then 💬 General feedback, 💪 Strengths, 🎯 Areas for improvement, ✏️ Language corrections (quote → correction), and:
- Content: x/5
- Communicative Achievement: x/5
- Organisation: x/5
- Language: x/5
Total Score: X/20
End with "✅ Pass" or "❌ Not yet at pass level".

Text:
${essay}
`.trim();
}

/** Parsea la línea "Task match:" del 📋 Task check. */
export function extractTaskMatch(text) {
  const m = String(text || '').match(/Task match:\s*\**\s*(ON TASK|PARTLY OFF TASK|OFF TASK)/i);
  if (!m) return null;
  const v = m[1].toUpperCase();
  if (v === 'ON TASK') return 'on';
  if (v === 'OFF TASK') return 'off';
  return 'partly';
}

/**
 * El modelo a veces declara OFF TASK pero no aplica la penalización numérica.
 * Clamp determinista: off task → Content ≤ 1 y Communicative Achievement ≤ 2;
 * partly off → Content ≤ 3. Parchea Content/CA/Total en el texto para que
 * siempre coincidan con el objeto scores.
 */
export function applyTaskRelevanceClamp({ feedback, content, communication, organisation, language, taskMatch }) {
  if (!taskMatch || taskMatch === 'on') return { content, communication, feedback };
  const contentCap = taskMatch === 'off' ? 1 : 3;
  const caCap = taskMatch === 'off' ? 2 : 5;
  const newContent = Math.min(content, contentCap);
  const newCa = Math.min(communication, caCap);
  if (newContent === content && newCa === communication) {
    return { content, communication, feedback };
  }
  const newTotal = newContent + newCa + organisation + language;
  let patched = String(feedback);
  if (newContent !== content) {
    patched = patched.replace(/(-\s*Content:\s*)\d+(\s*\/\s*5)/i, `$1${newContent}$2`);
  }
  if (newCa !== communication) {
    patched = patched.replace(/(-\s*Communicative Achievement:\s*)\d+(\s*\/\s*5)/i, `$1${newCa}$2`);
  }
  patched = patched.replace(/(Total Score:\s*)\d+(\s*\/\s*20)/i, `$1${newTotal}$2`);
  return { content: newContent, communication: newCa, feedback: patched };
}

export const OFF_TASK_IMPROVED_NOTE = [
  'Improved version not provided because the answer does not respond to the task. First rewrite your essay so that it answers the question. Then Dralo can help improve the language.',
  '',
  'Language corrections are still shown above to help you fix common grammar mistakes.',
].join('\n');

const OFF_TASK_STUDY_PLAN_LINE = '- Read the task carefully and plan your answer before writing.';
const PARTLY_OFF_TASK_STUDY_PLAN_LINE =
  '- Before writing, underline every question in the task and make sure you answer each one directly.';

/**
 * Off task: nunca entregar una improved version pulida del texto equivocado.
 * Se sustituye la sección 📈 por la nota de reescritura (determinista, no
 * depende de que el modelo obedezca el prompt).
 */
export function applyOffTaskImprovedNote(feedback) {
  const section = locateImprovedSection(feedback);
  if (!section) return feedback;
  return [
    ...section.lines.slice(0, section.start + 1),
    OFF_TASK_IMPROVED_NOTE,
    ...section.lines.slice(section.end),
  ].join('\n');
}

/** Inserta una línea de estrategia al final del 📚 Study plan si aún no está cubierta. */
function ensureStudyPlanLine(feedback, line, presentRegex) {
  if (presentRegex.test(feedback)) return feedback;
  const lines = String(feedback || '').split('\n');
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (start === -1) {
      if (t.startsWith('📚')) start = i;
    } else if (/^(✅|🟡|❌|📝|🎓|📊|💪|🎯|✏️|📈|🚀|🔍)/.test(t)) {
      end = i;
      break;
    }
  }
  if (start === -1) return `${feedback}\n${line}`;
  while (end > start + 1 && !lines[end - 1].trim()) end -= 1;
  return [...lines.slice(0, end), line, ...lines.slice(end)].join('\n');
}

/** Garantiza que el study plan de una respuesta off task incluye leer la task. */
export function ensureOffTaskStudyPlanLine(feedback) {
  return ensureStudyPlanLine(feedback, OFF_TASK_STUDY_PLAN_LINE, /read the task carefully/i);
}

/** Partly off task: estrategia de subrayar y responder cada pregunta de la task. */
export function ensurePartlyOffTaskStudyPlanLine(feedback) {
  return ensureStudyPlanLine(
    feedback,
    PARTLY_OFF_TASK_STUDY_PLAN_LINE,
    /underline every question|answer each (one|question)/i,
  );
}

const OPINION_CLARITY_STUDY_PLAN_LINE =
  '- State your opinion clearly in the introduction or conclusion.';
const REVIEW_VOCAB_STUDY_PLAN_LINE =
  '- Practise review adjectives and phrases: lively, affordable, crowded, convenient, enjoyable, worth visiting.';

/** Reviews: vocabulario típico de review en el study plan. */
export function ensureReviewStudyPlanLine(feedback) {
  return ensureStudyPlanLine(
    feedback,
    REVIEW_VOCAB_STUDY_PLAN_LINE,
    /review adjectives|lively, affordable/i,
  );
}

/** ¿El Task check es ON TASK pero con caveat de opinión/punto poco explícito? */
export function hasExplicitnessCaveat(feedback) {
  const line = String(feedback || '').match(/Task match:[^\n]*/i)?.[0] || '';
  return /ON TASK/i.test(line) && IMPLIED_POINT_REGEX.test(line);
}

/** ON TASK con opinión implícita/poco clara: estrategia de opinión explícita. */
export function ensureOpinionClarityStudyPlanLine(feedback) {
  return ensureStudyPlanLine(
    feedback,
    OPINION_CLARITY_STUDY_PLAN_LINE,
    /state your opinion clearly|opinion[^\n]*\b(introduction|conclusion)\b/i,
  );
}

/**
 * Floor anti doble castigo: si el Task check es ON TASK y su único caveat es
 * que un punto está implícito/poco explícito, Content 3/5 contradice la regla
 * de scoring (debe ser 4/5). Solo sube 3→4 y parchea Content/Total en el texto;
 * nunca toca scores de 0-2 (esos indican problemas reales de Content).
 */
export function applyImplicitOnTaskContentFloor({
  feedback,
  content,
  communication,
  organisation,
  language,
  taskMatch,
}) {
  if (taskMatch !== 'on' || content !== 3 || !hasExplicitnessCaveat(feedback)) {
    return { content, feedback };
  }
  const newContent = 4;
  const newTotal = newContent + communication + organisation + language;
  let patched = String(feedback).replace(/(-\s*Content:\s*)\d+(\s*\/\s*5)/i, `$1${newContent}$2`);
  patched = patched.replace(/(Total Score:\s*)\d+(\s*\/\s*20)/i, `$1${newTotal}$2`);
  return { content: newContent, feedback: patched };
}

function locateCorrectionsSection(feedback) {
  const lines = String(feedback || '').split('\n');
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (start === -1) {
      if (t.startsWith('✏️')) start = i;
    } else if (/^(📈|🚀|📚|📊|🎓|💪|🎯|📋|📝|🔍)/.test(t)) {
      end = i;
      break;
    }
  }
  if (start === -1) return null;
  return { start, end, lines };
}

function countCorrectionCards(feedback) {
  return (String(feedback || '').match(/^Original:/gim) || []).length;
}

const STUDY_AREA_TAXONOMY = [
  { key: 'possessive and plural forms', area: /possessive|plural/i, card: /possessive|plural|s'/i },
  { key: 'articles (a/an/the)', area: /\barticles?\b/i, card: /\barticles?\b|\ban?\b vs/i },
  { key: 'prepositions', area: /preposition/i, card: /preposition/i },
  { key: 'verb tenses', area: /\btenses?\b/i, card: /\btenses?\b/i },
  { key: 'subject-verb agreement', area: /agreement/i, card: /agreement/i },
  { key: 'punctuation and commas', area: /comma|punctuation/i, card: /comma|punctuation/i },
  { key: 'spelling', area: /spelling/i, card: /spelling|typo/i },
  { key: 'word order', area: /word order/i, card: /word order/i },
  {
    key: 'verb forms (infinitive/gerund)',
    area: /infinitive|gerund|verb form|causative/i,
    card: /infinitive|gerund|verb form|base form|causative/i,
  },
];

function getStudyPlanGrammarBlock(text) {
  const studyStart = String(text || '').indexOf('📚');
  if (studyStart === -1) return '';
  const study = String(text).slice(studyStart);
  return (study.match(/Grammar:\s*\n([\s\S]*?)(?=\n\s*(?:Vocabulary|Strategy):|$)/i) || [])[1] || '';
}

/**
 * Coherencia Study plan ↔ cards: áreas de Grammar del study plan que no están
 * respaldadas por ninguna correction card (la evidencia es SOLO la sección
 * ✏️ Corrections: mencionar el área en Main problems no basta — el alumno
 * necesita ver el ejemplo concreto). Solo se inspecciona el bloque "Grammar:"
 * para evitar falsos positivos.
 */
export function findUncoveredStudyPlanAreas(feedback) {
  const text = String(feedback || '');
  const grammarBlock = getStudyPlanGrammarBlock(text);
  if (!grammarBlock.trim()) return [];
  const corrStart = text.indexOf('✏️');
  if (corrStart === -1) return [];
  const corrEnd = text.indexOf('📈', corrStart);
  const evidence = corrEnd === -1 ? text.slice(corrStart) : text.slice(corrStart, corrEnd);
  const uncovered = [];
  for (const { key, area, card } of STUDY_AREA_TAXONOMY) {
    if (area.test(grammarBlock) && !card.test(evidence)) uncovered.push(key);
  }
  return uncovered;
}

/**
 * Último recurso de coherencia: si tras intentar añadir cards sigue habiendo
 * áreas de Grammar del study plan sin respaldo, se eliminan esos bullets para
 * que el alumno nunca vea un área de estudio sin ejemplo que la justifique.
 */
export function removeUnbackedStudyPlanAreas(feedback) {
  const uncoveredKeys = findUncoveredStudyPlanAreas(feedback);
  if (!uncoveredKeys.length) return feedback;
  const areaRegexes = STUDY_AREA_TAXONOMY.filter((t) => uncoveredKeys.includes(t.key)).map((t) => t.area);
  const text = String(feedback);
  const studyStart = text.indexOf('📚');
  if (studyStart === -1) return feedback;
  const lines = text.split('\n');
  let inStudy = false;
  let inGrammar = false;
  const out = [];
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('📚')) inStudy = true;
    else if (inStudy && /^(✅|🟡|❌|📝|🎓|📊|💪|🎯|✏️|📈|🚀)/.test(t)) inStudy = false;
    if (inStudy && /^Grammar:/i.test(t)) inGrammar = true;
    else if (inStudy && /^(Vocabulary|Strategy):/i.test(t)) inGrammar = false;
    if (inStudy && inGrammar && /^-\s/.test(t) && areaRegexes.some((re) => re.test(t))) {
      continue;
    }
    out.push(line);
  }
  return out.join('\n');
}

/** Normalización laxa para comprobar que una frase citada existe en el texto del alumno. */
function normalizeForQuoteMatch(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/["'""'']/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Hard rule: con Language <= 3 deben mostrarse al menos 3 correction cards si
 * existen errores reales. Si el modelo entrega menos, una única llamada extra
 * pide errores ADICIONALES; cada card nueva se valida programáticamente
 * (Original citado del texto real, no duplicada, Original !== Correct) antes
 * de añadirla. Si no se obtienen cards válidas, se deja el feedback tal cual:
 * nunca se inventan errores.
 */
async function ensureMinimumCorrectionCards({ feedback, essay, minCards = 3, uncoveredAreas = [] }) {
  const existingCount = countCorrectionCards(feedback);
  if (existingCount >= minCards && !uncoveredAreas.length) return { feedback, added: 0 };
  const section = locateCorrectionsSection(feedback);
  if (!section) return { feedback, added: 0 };

  const existingOriginals = [...String(feedback).matchAll(/Original:\s*([^\n]*)/gi)].map((m) =>
    m[1].trim(),
  );
  const needed = Math.max(1, minCards - existingCount) + 1; // una de margen

  // Coherencia con el study plan: áreas mencionadas sin card tienen prioridad absoluta.
  const priorityBlock = uncoveredAreas.length
    ? `\nIMPORTANT: the study plan for this student mentions these grammar areas, but no correction card covers them yet. Search the text SPECIFICALLY for one error of each kind and include it if it exists:\n${uncoveredAreas.map((a) => `- ${a}`).join('\n')}\n`
    : '';

  let extraText = '';
  try {
    const { text } = await cambridgeChatCompletion({
      system:
        'You are an exam writing teacher. You extract REAL, useful error corrections from a student text. You never invent errors.',
      messages: [
        {
          role: 'user',
          content: `This is a student's exam writing:\n---\n${essay}\n---\nThese errors are already covered (do NOT repeat them):\n${existingOriginals.map((o) => `- ${o}`).join('\n')}\n${priorityBlock}\nFind up to ${needed} ADDITIONAL clear, useful errors. Prioritise vocabulary (WW, unnatural collocation), content/task gaps, and grammar — not only connectors.\nFor each one output a block in exactly this format and nothing else:\nOriginal: "exact phrase copied verbatim from the student's text"\nProblem: <teacher label: WW | rep. vocab. | tell me which! | needs more developing | Too long… | clunky | spelling ⇒ word>\nCorrect: "corrected phrase"\nWhy: brief teacher-style explanation\nSeverity: <major | medium | minor>\nType: <vocabulary | task response | grammar | spelling | cohesion | register>\n\nIf the text genuinely has no more real errors, output exactly: NONE`,
        },
      ],
      temperature: 0.2,
    });
    extraText = String(text || '').trim();
  } catch (err) {
    console.warn('[cambridgeEssayFeedback] extra corrections call failed:', err?.message || err);
    return { feedback, added: 0 };
  }

  if (!extraText || /^NONE\b/i.test(extraText)) return { feedback, added: 0 };

  const essayNorm = normalizeForQuoteMatch(essay);
  const seenKeys = existingOriginals.map((o) => normalizeCardComparable(o.replace(/^"|"$/g, '')));
  const validBlocks = [];
  for (const chunk of extraText.replace(/```/g, '').split(/\n(?=Original:)/i)) {
    const om = chunk.match(/Original:\s*([^\n]*)/i);
    const cm = chunk.match(/Correct:\s*([^\n]*)/i);
    if (!om || !cm) continue;
    const original = om[1].trim().replace(/^"|"$/g, '');
    const correct = cm[1].trim().replace(/^"|"$/g, '');
    const origKey = normalizeCardComparable(original);
    if (!origKey) continue;
    // Anti-solape: descarta la card si su Original contiene (o está contenido
    // en) el Original de otra card — es el mismo error con otro span.
    if (seenKeys.some((k) => k && (k.includes(origKey) || origKey.includes(k)))) continue;
    if (origKey === normalizeCardComparable(correct)) continue;
    // Anti-invención: la frase debe existir literalmente en el texto del alumno.
    if (!essayNorm.includes(normalizeForQuoteMatch(original))) continue;
    seenKeys.push(origKey);
    validBlocks.push(chunk.trim());
    if (existingCount + validBlocks.length >= minCards + 1) break;
  }

  if (!validBlocks.length) return { feedback, added: 0 };

  const { start, end, lines } = section;
  let insertAt = end;
  while (insertAt > start + 1 && !lines[insertAt - 1].trim()) insertAt -= 1;
  const patched = [
    ...lines.slice(0, insertAt),
    '',
    validBlocks.join('\n\n'),
    ...lines.slice(insertAt),
  ].join('\n');
  return { feedback: patched, added: validBlocks.length };
}

const READINESS_FEEDBACK_LINES = {
  'b2-ready': '✅ B2-ready — pass standard met.',
  borderline: '🟡 Borderline — close to B2. Keep polishing accuracy.',
  'not-b2-ready': '❌ Not yet at B2 level — keep practising.',
  'needs-improvement': '❌ Not yet at B2 level — keep practising.',
  'score-pass-unverified': '✅ Pass — keep consolidating B2 accuracy.',
};

/**
 * La línea final de readiness no se delega al modelo: se sobrescribe con la
 * decisión determinista de resolveB2Readiness para que texto y badge coincidan.
 */
function syncReadinessLine(text, readiness) {
  const replacement = READINESS_FEEDBACK_LINES[readiness?.key];
  if (!replacement) return text;
  const lines = String(text || '').split('\n');
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const t = lines[i].trim();
    if (!t) continue;
    if (/^(✅|🟡|❌)/.test(t)) lines[i] = replacement;
    else lines.push('', replacement);
    return lines.join('\n');
  }
  return text;
}

function locateImprovedSection(feedback) {
  const lines = String(feedback || '').split('\n');
  let start = -1;
  let end = lines.length;
  for (let i = 0; i < lines.length; i += 1) {
    const t = lines[i].trim();
    if (start === -1) {
      if (t.startsWith('📈')) start = i;
    } else if (/^(🚀|📚|📊|🎓|✏️|💬|💪|🎯)/.test(t)) {
      end = i;
      break;
    }
  }
  if (start === -1) return null;
  return { start, end, lines, body: lines.slice(start + 1, end).join('\n').trim() };
}

export function buildImprovedVersionFallbackNote(wordMin, wordMax) {
  return `The improved version could not be shortened reliably. Please rewrite your answer aiming for ${wordMin}–${wordMax} words: keep your strongest ideas, cut repetition and minor detail, and check the corrections above as you rewrite.`;
}

async function requestShortenedVersion({ body, wc, wordMin, wordMax, hardMax, aggressive = false }) {
  const target = hardMax ? hardMax - 10 : Math.round((wordMin + wordMax) / 2);
  const limitText = hardMax
    ? `It MUST be ${hardMax} words or fewer — this is an absolute hard maximum. Aim for about ${target} words.`
    : `It must be between ${wordMin} and ${wordMax} words (aim for about ${target}).`;
  const aggressiveText = aggressive
    ? ' Be ruthless: keep only what is needed to answer the task. Drop whole sentences of secondary detail if necessary, but keep the answer to every part of the task, keep the student\'s level, and keep the informal/formal register as appropriate (including greeting and sign-off if present).'
    : ' Cut repetition, redundant examples and minor detail only.';
  const { text } = await cambridgeChatCompletion({
    system: 'You shorten corrected student texts without changing their CEFR level, voice or register.',
    messages: [
      {
        role: 'user',
        content: `This corrected student text is ${wc} words, which is too long. ${limitText}${aggressiveText} Keep the same CEFR level, the same voice and register, and any greeting/sign-off. Output ONLY the shortened text, with no commentary.\n\n${body}`,
      },
    ],
    temperature: aggressive ? 0.1 : 0.2,
  });
  return String(text || '').trim();
}

/**
 * Hard rule server-side: si el original superaba el límite, la improved version
 * tiene que quedar dentro de 140–190. El modelo no es fiable contando palabras,
 * así que se verifica programáticamente: 1) acortado normal, 2) reintento con
 * máximo duro de 180, 3) reintento agresivo con máximo 175 y temperatura mínima,
 * 4) si todo falla, NUNCA se entrega la versión larga — se sustituye por una
 * nota segura y se marca en los metadatos para auditoría.
 */
async function enforceImprovedVersionLength({ feedback, wordMin, wordMax }) {
  const section = locateImprovedSection(feedback);
  if (!section || !section.body) {
    return { feedback, meta: { enforced: false, attempts: 0, finalWordCount: null, fallbackNote: false } };
  }
  const wc = countEssayWords(section.body);
  if (wc <= wordMax) {
    return { feedback, meta: { enforced: false, attempts: 0, finalWordCount: wc, fallbackNote: false } };
  }

  const minAcceptable = Math.max(60, wordMin - 30);
  const replaceBody = (newBody) =>
    [...section.lines.slice(0, section.start + 1), newBody, ...section.lines.slice(section.end)].join('\n');

  const attempts = [
    { hardMax: null, aggressive: false },
    { hardMax: Math.max(140, wordMax - 10), aggressive: false }, // máx. 180 para límite 190
    { hardMax: Math.max(140, wordMax - 15), aggressive: true }, // máx. 175, agresivo, temp 0.1
  ];
  for (let i = 0; i < attempts.length; i += 1) {
    try {
      const shortened = await requestShortenedVersion({
        body: section.body,
        wc,
        wordMin,
        wordMax,
        hardMax: attempts[i].hardMax,
        aggressive: attempts[i].aggressive,
      });
      const newWc = countEssayWords(shortened);
      if (shortened && newWc <= wordMax && newWc >= minAcceptable) {
        return {
          feedback: replaceBody(shortened),
          meta: { enforced: true, attempts: i + 1, finalWordCount: newWc, fallbackNote: false },
        };
      }
    } catch (err) {
      console.warn('[cambridgeEssayFeedback] improved-version shortening failed:', err?.message || err);
    }
  }

  // Último recurso: jamás entregar al alumno una improved version fuera de rango.
  const note = buildImprovedVersionFallbackNote(wordMin, wordMax);
  console.warn('[cambridgeEssayFeedback] improved version could not be shortened; safe note delivered.');
  return {
    feedback: replaceBody(note),
    meta: { enforced: true, attempts: attempts.length, finalWordCount: null, fallbackNote: true },
  };
}

/**
 * @param {object} params
 * @param {string} params.essay
 * @param {string} [params.level]
 * @param {object} [params.taskContext]
 * @param {number} [params.wordMin]
 * @param {number} [params.wordMax]
 */
export async function evaluateCambridgeEssay({
  essay,
  level = 'b2',
  taskContext = {},
  structuredExamContext = '',
  wordMin = 140,
  wordMax = 190,
}) {
  const trimmed = String(essay || '').trim();
  if (!trimmed) {
    return { ok: false, status: 400, error: 'Essay too short or missing.' };
  }

  if (!isDraloOpenAIConfigured()) {
    return {
      ok: false,
      status: 503,
      error:
        'OPENAI_API_KEY is not configured on the server. Add it to .env.local to enable Cambridge writing correction (DRALO AI GPT).',
    };
  }

  const examLevel = String(level || '').toLowerCase();
  const isB2First = examLevel === 'b2' || examLevel === 'fce' || examLevel === 'b2first';
  const taskPack = buildTaskPack(taskContext, structuredExamContext);
  const wMin = Number.isFinite(Number(wordMin)) ? Number(wordMin) : 140;
  const wMax = Number.isFinite(Number(wordMax)) ? Number(wordMax) : 190;
  const essayWordCount = countEssayWords(trimmed);
  const v2 = isWritingCorrectionV2Enabled();
  // getCalibrationBlock ya devuelve '' si V2 está apagado (doble gate).
  const calibrationBlock = isB2First && v2 ? await getCalibrationBlock({ taskPack }) : '';

  const prompt = isB2First
    ? buildB2FirstPrompt({
        essay: trimmed,
        taskPack,
        wordMin: wMin,
        wordMax: wMax,
        wordCount: essayWordCount,
        calibrationBlock,
        v2,
      })
    : buildGenericPrompt(trimmed);

  try {
    const { text: rawFeedback } = await cambridgeChatCompletion({
      system:
        'Be precise and exam-focused like a strict but fair Cambridge writing teacher. Do not flatter weak work. Use emoji section titles (📝 💪 🎯 🎓 📊 🔍 ✏️ 📈 🚀 📚) — never use # markdown headers.',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.25,
    });
    if (!rawFeedback) {
      return { ok: false, status: 502, error: 'The examiner returned an empty response. Please try again.' };
    }

    // Saneados deterministas: nivel CEFR único (nunca "B1/B1+") y cero menciones
    // inventadas al word limit cuando el texto está dentro del rango.
    let feedback = rawFeedback;
    if (v2 && isB2First) {
      feedback = normalizeCefrLevelLine(feedback);
      feedback = normalizeDecimalScores(feedback);
      feedback = dedupeCorrectionCards(feedback);
      feedback = stripInRangeWordCountClaims({
        feedback,
        wordCount: essayWordCount,
        wordMin: wMin,
        wordMax: wMax,
      });
      feedback = reclassifyImpliedTaskMatch(feedback);
    }

    const taskMatch = v2 && isB2First ? extractTaskMatch(feedback) : null;
    const isOffTask = taskMatch === 'off';

    let lengthCheckedFeedback = feedback;
    let improvedVersionMeta = null;
    // Off task: no se acorta la improved version porque se va a sustituir por la nota.
    if (v2 && isB2First && !isOffTask && essayWordCount > wMax) {
      const enforced = await enforceImprovedVersionLength({ feedback, wordMin: wMin, wordMax: wMax });
      lengthCheckedFeedback = enforced.feedback;
      improvedVersionMeta = enforced.meta;
    }

    const rawContent = extractScore(feedback, 'Content') ?? 0;
    const rawCommunication = extractScore(feedback, 'Communicative Achievement') ?? 0;
    const organisation = extractScore(feedback, 'Organisation') ?? 0;
    const language = extractScore(feedback, 'Language') ?? 0;

    // Relevancia de task: el clamp se aplica sobre el texto ya procesado para
    // que Content/CA/Total mostrados y los del objeto scores coincidan siempre.
    const clamped = applyTaskRelevanceClamp({
      feedback: lengthCheckedFeedback,
      content: rawContent,
      communication: rawCommunication,
      organisation,
      language,
      taskMatch,
    });
    let content = clamped.content;
    const communication = clamped.communication;
    lengthCheckedFeedback = clamped.feedback;

    if (v2 && isB2First) {
      const floored = applyImplicitOnTaskContentFloor({
        feedback: lengthCheckedFeedback,
        content,
        communication,
        organisation,
        language,
        taskMatch,
      });
      content = floored.content;
      lengthCheckedFeedback = floored.feedback;
    }

    if (v2 && isB2First && isOffTask) {
      // Nunca pulir un texto off-topic como si fuera una respuesta válida.
      lengthCheckedFeedback = applyOffTaskImprovedNote(lengthCheckedFeedback);
      lengthCheckedFeedback = ensureOffTaskStudyPlanLine(lengthCheckedFeedback);
      improvedVersionMeta = { enforced: true, attempts: 0, finalWordCount: null, fallbackNote: false, offTaskNote: true };
    } else if (v2 && isB2First && taskMatch === 'partly') {
      lengthCheckedFeedback = ensurePartlyOffTaskStudyPlanLine(lengthCheckedFeedback);
    } else if (v2 && isB2First && taskMatch === 'on' && hasExplicitnessCaveat(lengthCheckedFeedback)) {
      // Opinión/punto respondido pero poco explícito: estrategia específica.
      lengthCheckedFeedback = ensureOpinionClarityStudyPlanLine(lengthCheckedFeedback);
    }

    if (v2 && isB2First && !isOffTask && inferWritingTaskType(taskPack) === 'review') {
      lengthCheckedFeedback = ensureReviewStudyPlanLine(lengthCheckedFeedback);
    }

    // Hard rule: con Language <= 3, mínimo 3 cards útiles (si existen errores
    // reales) y coherencia study plan ↔ cards.
    if (v2 && isB2First && !isOffTask && language <= 3) {
      const uncovered = findUncoveredStudyPlanAreas(lengthCheckedFeedback);
      if (countCorrectionCards(lengthCheckedFeedback) < 3 || uncovered.length) {
        const ensured = await ensureMinimumCorrectionCards({
          feedback: lengthCheckedFeedback,
          essay: trimmed,
          minCards: 3,
          uncoveredAreas: uncovered,
        });
        lengthCheckedFeedback = ensured.feedback;
      }
      lengthCheckedFeedback = removeUnbackedStudyPlanAreas(lengthCheckedFeedback);
    }

    if (isB2First) {
      lengthCheckedFeedback = injectServerAnnotatedText(lengthCheckedFeedback, String(essay ?? ''));
    }

    if (v2 && isB2First && !isOffTask) {
      lengthCheckedFeedback = ensureMissingTitleProblem(lengthCheckedFeedback, trimmed);
      lengthCheckedFeedback = ensureUnclearOpinionTaskCheck(
        lengthCheckedFeedback,
        trimmed,
        taskPack,
      );
      lengthCheckedFeedback = stripStrongerB2SkipPlaceholder(
        lengthCheckedFeedback,
        essayWordCount,
      );
    }

    const total = content + communication + organisation + language;
    const required = 12;
    let cefr = extractCefrLevel(feedback);
    if (v2 && isB2First) {
      const coherent = applyCefrScoreCoherence({
        feedback: lengthCheckedFeedback,
        cefr,
        content,
        communication,
        organisation,
        language,
        taskMatch,
      });
      cefr = coherent.cefr;
      lengthCheckedFeedback = coherent.feedback;
    }
    // V2: "Pass" exige nivel además de puntos (B1/B1+ nunca pasa con 12/20).
    // Legacy (V2 off): comportamiento actual de producción, pass = total >= 12.
    const readiness = v2 ? resolveB2Readiness({ cefr, total }) : null;
    const passed = v2 ? readiness.passed : total >= required;

    const formattedFeedback =
      v2 && isB2First
        ? syncReadinessLine(formatWritingFeedbackDisplay(lengthCheckedFeedback), readiness)
        : formatWritingFeedbackDisplay(lengthCheckedFeedback);

    return {
      ok: true,
      status: 200,
      feedback: formattedFeedback,
      scores: {
        content,
        communication,
        organisation,
        language,
        total,
        passed,
        required,
        cefr,
        wordCount: essayWordCount,
        ...(v2 ? { readiness, improvedVersion: improvedVersionMeta, taskMatch } : {}),
      },
    };
  } catch (err) {
    console.error('[cambridgeEssayFeedback]', err);
    return {
      ok: false,
      status: 500,
      error: err?.message || 'Something went wrong while processing your request.',
    };
  }
}
