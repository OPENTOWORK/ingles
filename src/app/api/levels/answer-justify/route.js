import { NextResponse } from 'next/server';
import { cambridgeChatCompletion, isDraloOpenAIConfigured } from '@/lib/draloAiEngine';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 40;

/** @type {Map<string, { n: number, reset: number }>} */
const ipBuckets = new Map();

function clientIp(req) {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0].trim().slice(0, 64) || 'unknown';
  return req.headers.get('x-real-ip')?.trim().slice(0, 64) || 'unknown';
}

function tryConsumeRate(ip) {
  const now = Date.now();
  let b = ipBuckets.get(ip);
  if (!b || now > b.reset) {
    b = { n: 0, reset: now + WINDOW_MS };
    ipBuckets.set(ip, b);
  }
  if (b.n >= MAX_PER_IP) return false;
  b.n += 1;
  return true;
}

const MAX_CONTEXT = 6000;

function clip(s) {
  const t = String(s || '').trim();
  if (!t) return '';
  return t.length > MAX_CONTEXT ? `${t.slice(0, MAX_CONTEXT)}\n\n[…]` : t;
}

/** Normalise for comparing model tail vs official key. */
function normalizeKeyCompare(s) {
  return String(s || '')
    .trim()
    .replace(/\.$/, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Strip trailing "The correct answer is: <key>" (or Spanish equivalent) when the UI already shows the key.
 * @param {string} line
 * @param {string} key
 */
function stripRedundantKeyedSuffix(line, key) {
  const keyNorm = normalizeKeyCompare(key);
  if (!keyNorm || !line) return line;

  const markers = ['the correct answer is:', 'la respuesta correcta es:'];
  let out = line;
  for (const needle of markers) {
    const lower = out.toLowerCase();
    let search = lower.length;
    while (search > 0) {
      const pos = lower.lastIndexOf(needle, search - 1);
      if (pos === -1) break;
      const rest = normalizeKeyCompare(out.slice(pos + needle.length));
      if (rest === keyNorm) {
        out = out
          .slice(0, pos)
          .trim()
          .replace(/\s*[,;]?\s*$/, '')
          .trim();
        break;
      }
      search = pos;
    }
  }
  return out.trim();
}

export async function POST(req) {
  if (!isDraloOpenAIConfigured()) {
    return NextResponse.json(
      {
        error:
          'Falta OPENAI_API_KEY en el servidor. Añádela en .env.local (motor DRALO AI GPT).',
      },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  if (!tryConsumeRate(ip)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Prueba más tarde.' }, { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const partLabel = clip(body?.partLabel);
  const questionLabel = clip(body?.questionLabel);
  const contextSnippet = clip(body?.contextSnippet);
  const userChoiceText = clip(body?.userChoiceText);
  const correctChoiceText = clip(body?.correctChoiceText);
  const answersFromDatabase = clip(body?.answersFromDatabase);
  const isCorrect = Boolean(body?.isCorrect);
  const styleParam = String(body?.style || '').toLowerCase();
  const isOpenClozeStyle = styleParam === 'open-cloze';
  const isWordFormationStyle = styleParam === 'word-formation';
  const isKeyWordStyle = styleParam === 'key-word';
  const isReadingMcqStyle = styleParam === 'reading-mcq';
  const isGappedTextStyle = styleParam === 'gapped-text';
  const isReadingMatchingStyle = styleParam === 'reading-matching';
  const isClozeStyle = styleParam === 'cloze' || isOpenClozeStyle || isWordFormationStyle;

  if (!contextSnippet || !String(userChoiceText || '').trim()) {
    return NextResponse.json({ error: 'Faltan datos para justificar.' }, { status: 400 });
  }
  if (!isCorrect && !String(correctChoiceText || '').trim()) {
    return NextResponse.json(
      { error: 'Falta la clave correcta del ejercicio para el caso incorrecto.' },
      { status: 400 },
    );
  }

  const CLOZE_SHARED = `You are an experienced English teacher explaining ONE multiple-choice cloze gap (Cambridge Use of English Part 1 style).

The options test collocations, phrasal verbs, fixed expressions, dependent prepositions, or close-meaning vocabulary. Your job is to name the EXACT word partnership or meaning difference that decides the answer.

Rules:
- Quote the exact collocation / fixed expression / preposition pattern (e.g. "strike a balance", "interested in", "raise awareness"). Use double quotation marks ONLY around quoted words/expressions.
- Be concrete. FORBIDDEN vague wording: "does not fit the context", "is more appropriate", "improves the sentence", "sounds better", "is the best option".
- Refer to options by their word only (e.g. "strike"), never "Option B".
- Write in English. Single line, no line breaks. Do not mention the model provider.`;

  const OPEN_CLOZE_SHARED = `You are an experienced English teacher explaining ONE open cloze gap (Cambridge Use of English Part 2 style: ONE word per gap, mainly grammar/function words).

Open cloze gaps test prepositions, relative pronouns, auxiliaries, determiners, quantifiers, linkers/connectors and fixed grammar patterns. Your job is to name the EXACT grammar reason that decides the answer: which preposition the verb/adjective/noun takes, what kind of connector the sentence needs, which auxiliary the tense requires, etc.

Rules:
- Name the grammar category and the pattern explicitly (e.g. the time connector "when", the dependent preposition in "rely on", the auxiliary "has" for present perfect). Use double quotation marks ONLY around quoted words.
- Be concrete. FORBIDDEN vague wording: "does not fit the context", "is more appropriate", "improves the sentence", "sounds better", "is the best option".
- Write in English. Single line, no line breaks. Do not mention the model provider.`;

  const openClozeSystem = isCorrect
    ? `${OPEN_CLOZE_SHARED}

The student's answer is CORRECT.
Format (1 sentence, 2 maximum, max 280 characters):
Correct. "<student's word>" is right because <the exact grammar function it performs in this sentence>.
Example: Correct. "When" is right because it connects the time of returning home with remembering the journey.`
    : `${OPEN_CLOZE_SHARED}

The student's answer is WRONG.
Format (2–3 short sentences, max 420 characters):
Your answer "<student's word>" is not correct because <exact grammar reason it fails: wrong word class, wrong preposition, refers to people/things, wrong tense…>. The gap needs <the grammar category required>. The correct answer is "<keyed word>" because <its exact function in this sentence>.
Example: Your answer "who" is not correct because it refers to people. The sentence needs a time connector. "When" is correct because it links the moment of returning home with remembering the journey.`;

  const clozeSystem = isCorrect
    ? `${CLOZE_SHARED}

The student's answer is CORRECT.
Format (1 sentence, 2 maximum, max 280 characters):
Correct. "<student's word>" is the right answer because <the exact collocation / fixed expression / preposition / meaning that makes it right>.
Example: Correct. "Strike" is the right answer because the natural collocation is "strike a balance".`
    : `${CLOZE_SHARED}

The student's answer is WRONG.
Format (2 sentences, max 400 characters):
Your answer "<student's word>" is incorrect because <exact reason: wrong collocation / wrong preposition / meaning difference, naming the unnatural combination>. The correct answer is "<keyed word>" because <the exact expression or pattern, e.g. the fixed expression is "strike a balance">.
Example: Your answer "reach" is incorrect because "reach a balance" is not the natural expression in this context. The correct answer is "strike" because the fixed expression is "strike a balance".`;

  const WORD_FORMATION_SHARED = `You are an experienced English teacher explaining ONE word-formation gap (Cambridge B2 Part 3: ONE derived word from the base word in capitals).

Rules:
- ONE short sentence (two at most). Max 220 characters.
- Name the word class needed (noun, adjective, adverb, verb) and how the base word is transformed.
- Use double quotation marks ONLY around the correct word and the base word if quoted.
- Do NOT write long paragraphs or generic praise.
Example: "Decision" is correct because the sentence needs a noun after "a difficult".`;

  const wordFormationSystem = isCorrect
    ? `${WORD_FORMATION_SHARED}\nThe student's word is CORRECT.`
    : `${WORD_FORMATION_SHARED}\nThe student's word is WRONG. Briefly say why it fails (wrong word class/form), then state the keyed word and why it fits.`;

  const KEY_WORD_SHARED = `You are an experienced English teacher explaining ONE key-word transformation (Cambridge B2 Part 4: 2–5 words including the keyword unchanged).

Rules:
- ONE or TWO short sentences. Max 260 characters.
- Explain the grammar transformation (passive, reported speech, conditional, etc.).
- Do NOT write long paragraphs.`;

  const keyWordSystem = isCorrect
    ? `${KEY_WORD_SHARED}\nThe student's transformation is CORRECT.`
    : `${KEY_WORD_SHARED}\nThe student's transformation is WRONG. Say what pattern was required and why the keyed answer fits.`;

  const READING_EVIDENCE_SHARED = `You are an experienced English teacher explaining ONE reading comprehension item (Cambridge B2).

Rules:
- Start with "The correct answer is X." where X is the letter of the keyed option (A, B, C or D).
- Then quote ONE short phrase from the passage using double quotation marks: The text says: "..."
- Add ONE brief sentence: This shows that...
- Max 320 characters total. No long paragraphs. Do not mention the model provider.`;

  const readingEvidenceSystem = `${READING_EVIDENCE_SHARED}\nUse the CONTEXT to find exact textual evidence for the OFFICIAL keyed answer.`;

  const GAPPED_TEXT_SHARED = `You are an experienced English teacher explaining ONE gapped-text choice (Cambridge B2 Part 6).

Rules:
- Start with "The correct answer is X." (letter A–G).
- Explain how the sentence links to the idea BEFORE and/or AFTER the gap; quote a short phrase if possible using double quotation marks.
- Max 340 characters. No long paragraphs.`;

  const gappedTextSystem = `${GAPPED_TEXT_SHARED}\nUse the passage context around the gap.`;

  const system = isCorrect
    ? `You are an experienced English teacher (CEFR) for exam-style reading and use-of-English tasks.
The student's answer is CORRECT according to the task key.

Write in English only, professional and coherent with the CONTEXT you are given (instructions + passage, or gap sentence).

Give a substantive rationale: explain which idea, reference, collocation, contrast, time/place link, or grammatical pattern in the CONTEXT supports the keyed answer. Paraphrase evidence in your own words; do not invent facts not supported by the CONTEXT.

Forbidden: circular reasoning ("because it is the correct option"), empty praise ("good job"), or answering only "because it fits the text" without saying how. Do not open with "The correct answer is" or "Option B is correct because B".

You may mention a name or short phrase from the keyed option if it clarifies the referent. Do not list all distractors. Do not mention the model provider.

Two sentences maximum (or one longer sentence if it stays clear). Max 420 characters. No quotation marks. Single line, no line breaks.`
    : `You are an experienced English teacher (CEFR) for exam-style tasks.
The student's answer is WRONG according to the task key.

Write in English only, professional and tied to the CONTEXT.

1) Briefly explain why the student's choice misaligns with the passage or rubric (specific mismatch: referent, time, attitude, collocation, etc.—not vague).
2) Give ONE short sentence with the positive rationale for the official keyed answer: which detail in the CONTEXT supports it (no circular "because it is correct").
3) Do NOT end with "The correct answer is:" or repeat the full CLAVE_OFICIAL line; the app already shows the correct answer separately. You may refer to the idea in words (e.g. many activities) without restating the option label.

Do not mention the model provider.
Max 520 characters in total. No quotation marks. Single line, no line breaks.`;

  // "A) reach" / "3 B word" → "reach" (cloze style habla solo de palabras, no de letras).
  const bareWord = (s) =>
    String(s || '')
      .replace(/^\d+\s+[A-D]\s+/i, '')
      .replace(/^[A-D]\)\s*/i, '')
      .trim();

  const clozeUser = `Part: ${partLabel || '—'}
Item: ${questionLabel || '—'}
Result according to the answer key: ${isCorrect ? 'CORRECT' : 'WRONG'}

Sentence/passage context (find the gap this item belongs to):
${contextSnippet}

${
    answersFromDatabase
      ? `${isOpenClozeStyle ? 'Accepted answer(s) for this gap' : 'The four options for this gap'}:\n${answersFromDatabase}\n\n`
      : ''
  }Student's word: ${bareWord(userChoiceText)}
${isCorrect ? '' : `Keyed correct word: ${bareWord(correctChoiceText)}`}`;

  const user = `Parte: ${partLabel || '—'}
Ítem: ${questionLabel || '—'}
Resultado según la base de datos del ejercicio: ${isCorrect ? 'ACIERTO' : 'FALLO'}

Contexto (extracto del enunciado o texto):
${contextSnippet}

${answersFromDatabase ? `Respuestas / opciones registradas en la base de datos para este ítem:\n${answersFromDatabase}\n\n` : ''}Lo que respondió el alumno: ${userChoiceText}
${
  isCorrect
    ? String(correctChoiceText || '').trim()
      ? `OFFICIAL_KEYED_ANSWER (verbatim; the student's response matches this): ${String(correctChoiceText).trim()}`
      : ''
    : `CLAVE_OFICIAL (official key from DB—use only for reasoning; do NOT paste this full string or "The correct answer is:" in your reply; the UI shows the key): ${correctChoiceText}`
}`;

  try {
    const resolvedSystem = isWordFormationStyle
      ? wordFormationSystem
      : isKeyWordStyle
        ? keyWordSystem
        : isReadingMcqStyle || isReadingMatchingStyle
          ? readingEvidenceSystem
          : isGappedTextStyle
            ? gappedTextSystem
            : isOpenClozeStyle
              ? openClozeSystem
              : isClozeStyle
                ? clozeSystem
                : system;
    const resolvedUser = isClozeStyle && !isWordFormationStyle ? clozeUser : user;
    const { text: raw } = await cambridgeChatCompletion({
      system: resolvedSystem,
      messages: [{ role: 'user', content: resolvedUser }],
      temperature: isClozeStyle || isKeyWordStyle || isWordFormationStyle ? 0.2 : 0.35,
      max_tokens: isCorrect ? 200 : 280,
    });
    let oneLine = raw.replace(/\s+/g, ' ').trim();

    if (isClozeStyle) {
      // El formato cloze incluye deliberadamente "The correct answer is …": no recortar la coletilla.
      oneLine = oneLine.slice(0, isCorrect ? 320 : 440);
    } else if (!isCorrect && String(correctChoiceText || '').trim()) {
      const key = String(correctChoiceText).trim();
      oneLine = stripRedundantKeyedSuffix(oneLine, key);
      oneLine = oneLine.slice(0, 560);
    } else {
      oneLine = oneLine.slice(0, isCorrect ? 460 : 520);
    }

    return NextResponse.json({ justification: oneLine || 'Could not generate an explanation.' });
  } catch (e) {
    const msg = e?.message || 'Error al generar la justificación.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
