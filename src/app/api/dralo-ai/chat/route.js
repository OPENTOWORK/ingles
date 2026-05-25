import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 50;
const OPENAI_CHAT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

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

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

function clip(s, max = 8000) {
  const t = String(s || '').trim();
  return t.length > max ? `${t.slice(0, max)}\n[…]` : t;
}

function buildGeneratePrompt(mode, activity, level, options = {}) {
  const L = level || 'B2';
  const seed = options.varietySeed ?? Date.now();
  const topic = options.topic || 'general everyday life';
  const avoid = Array.isArray(options.recentFingerprints)
    ? options.recentFingerprints.filter(Boolean).slice(0, 10)
    : [];
  const avoidBlock =
    avoid.length > 0
      ? `\nDo NOT repeat or closely imitate these previous items (new vocabulary and structure required):\n${avoid.map((f) => `- ${f}`).join('\n')}`
      : '';

  if (mode === 'use-of-english') {
    const varietyRules = `
Topic/theme for this item: ${topic}.
Variety seed: ${seed}.
Create a completely NEW item — different sentences, keyword, and grammar point from any example.
${avoidBlock}`;

    if (activity === 'multiple-choice-cloze') {
      return `Create ONE ${L} multiple-choice cloze item (Cambridge Part 1 style — single gap).
${varietyRules}
Rules: four distinct options testing vocabulary/collocation; modelAnswer must match exactly one option string.
Return ONLY valid JSON:
{"instruction":"Choose the word that best fits the gap.","textBefore":"sentence before gap ","textAfter":" sentence after gap","options":["word1","word2","word3","word4"],"modelAnswer":"correct word exactly as in options","briefTip":"one short tip about collocation or register"}`;
    }
    if (activity === 'key-word') {
      return `You are a Cambridge ${L} Use of English examiner. Create ONE key word transformation item.
${varietyRules}
Rules: keyword is ONE word in capitals (not GIVEN unless it truly fits); maxWords 2-5 at ${L}; modelAnswer is the complete second sentence including the keyword unchanged.
Return ONLY valid JSON:
{"stem":"Complete the second sentence so it has a similar meaning to the first, using the word given.","sentence1":"...","keyword":"WORD","sentence2Start":"start of second sentence with gap at end","maxWords":5,"modelAnswer":"full correct second sentence","briefTip":"one short grammar tip in English"}`;
    }
    if (activity === 'word-formation') {
      return `Create ONE ${L} word formation gap.
${varietyRules}
Return ONLY JSON:
{"instruction":"Use the word in capitals to form ONE word that fits the gap.","textBefore":"...","stem":"ROOT","textAfter":"...","modelAnswer":"one word only","briefTip":"morphology hint"}`;
    }
    return `Create ONE ${L} open cloze (single gap, no options).
${varietyRules}
Return ONLY JSON:
{"instruction":"Read the sentence and write ONE word for the gap.","textBefore":"...","textAfter":"...","modelAnswer":"exact one-word answer","briefTip":"grammar hint without giving answer"}`;
  }

  const varietyRules = `
Topic/theme: ${topic}.
Variety seed: ${seed}.
Create a completely NEW task at ${L} level.
${avoidBlock}`;

  if (mode === 'reading') {
    if (activity === 'gapped-text') {
      return `Create ONE ${L} gapped text reading task (Cambridge Part 6 style).
${varietyRules}
Return ONLY JSON:
{"title":"...","passage":"short text with one gap marked [GAP]","gapPrompt":"Which sentence (A–D) fits the gap?","options":["A) sentence...","B) sentence...","C) sentence...","D) sentence..."],"questions":[{"id":"q1","prompt":"Which sentence fits the gap?","type":"mcq","options":["A) ...","B) ...","C) ...","D) ..."]}],"modelAnswers":[{"id":"q1","answer":"A) ..."}]}`;
    }
    if (activity === 'multiple-matching') {
      return `Create ONE ${L} multiple matching reading task (Cambridge Part 7 style).
${varietyRules}
Return ONLY JSON:
{"title":"...","passage":"text with 2–3 labelled sections (A, B, C)","questions":[{"id":"q1","prompt":"Which section mentions X?","type":"mcq","options":["A","B","C","D"]},{"id":"q2","prompt":"...","type":"mcq","options":["A","B","C","D"]}],"modelAnswers":[{"id":"q1","answer":"B"},{"id":"q2","answer":"..."}]}`;
    }
    return `Create ONE ${L} multiple-choice reading task (Cambridge Part 5 style): passage 120–180 words + 2 MCQ questions.
${varietyRules}
Return ONLY JSON:
{"title":"...","passage":"...","questions":[{"id":"q1","prompt":"...","type":"mcq","options":["A) ...","B) ...","C) ...","D) ..."]},{"id":"q2","prompt":"...","type":"mcq","options":["A) ...","B) ...","C) ...","D) ..."]}],"modelAnswers":[{"id":"q1","answer":"..."},{"id":"q2","answer":"..."}]}`;
  }

  if (mode === 'listening') {
    if (activity === 'sentence-completion') {
      return `Create ONE ${L} listening sentence-completion task (Cambridge Part 2 style): monologue script + 2 gap questions.
${varietyRules}
The "script" must be a single-speaker monologue (continuous prose, NO "A:" / "B:" dialogue labels).
Return ONLY JSON:
{"title":"...","setting":"one line context","script":"monologue to read aloud","questions":[{"id":"q1","prompt":"Complete: The speaker says the event will be held ___","type":"short"},{"id":"q2","prompt":"...","type":"short"}],"modelAnswers":[{"id":"q1","answer":"..."},{"id":"q2","answer":"..."}]}`;
    }
    if (activity === 'conversation') {
      return `Create ONE ${L} listening conversation task (Cambridge Part 3 style): dialogue script + 2 MCQ questions.
${varietyRules}
The "script" MUST be a dialogue with exactly two speakers, one line per turn, formatted like:
A: first line of speech
B: reply
A: next line
(Use only A: and B: labels — no other speaker names.)
Return ONLY JSON:
{"title":"...","setting":"context","script":"A: ...\\nB: ...\\nA: ...","questions":[{"id":"q1","prompt":"...","type":"mcq","options":["A) ...","B) ...","C) ...","D) ..."]},{"id":"q2","prompt":"...","type":"mcq","options":["A) ...","B) ...","C) ...","D) ..."]}],"modelAnswers":[{"id":"q1","answer":"..."},{"id":"q2","answer":"..."}]}`;
    }
    if (activity === 'multiple-matching') {
      return `Create ONE ${L} listening multiple-matching task (Cambridge Part 4 style): script with 2 speakers + 2 matching questions.
${varietyRules}
Format "script" as alternating lines "A: ..." and "B: ..." (one line per turn).
Return ONLY JSON:
{"title":"...","setting":"context","script":"A: ...\\nB: ...","questions":[{"id":"q1","prompt":"Which speaker says X?","type":"mcq","options":["Speaker 1","Speaker 2","Both","Neither"]},{"id":"q2","prompt":"...","type":"mcq","options":["A) ...","B) ...","C) ...","D) ..."]}],"modelAnswers":[{"id":"q1","answer":"..."},{"id":"q2","answer":"..."}]}`;
    }
    return `Create ONE ${L} listening short-extracts task (Cambridge Part 1 style): short dialogue 70–100 words + 2 MCQ questions.
${varietyRules}
Format "script" as alternating "A: ..." and "B: ..." lines (natural conversation).
Return ONLY JSON:
{"title":"...","setting":"context","script":"A: ...\\nB: ...","questions":[{"id":"q1","prompt":"...","type":"mcq","options":["A) ...","B) ...","C) ...","D) ..."]},{"id":"q2","prompt":"...","type":"mcq","options":["A) ...","B) ...","C) ...","D) ..."]}],"modelAnswers":[{"id":"q1","answer":"..."},{"id":"q2","answer":"..."}]}`;
  }

  if (mode === 'writing') {
    const genre =
      activity === 'part-2'
        ? 'one of: article, formal/semi-formal letter, report, or review for a magazine'
        : 'compulsory essay giving opinion (Cambridge Part 1)';
    return `Create ONE ${L} ${genre} writing task.
${varietyRules}
Return ONLY JSON:
{"taskTitle":"...","instructions":"bullet points what candidate must include","inputNotes":"optional stimulus","wordMin":${L === 'A2' ? 80 : L === 'B1' ? 120 : 140},"wordMax":${L === 'A2' ? 100 : L === 'B1' ? 150 : 190},"register":"formal|neutral|informal","checklist":["point1","point2"]}`;
  }

  return 'Return JSON {"error":"unknown mode"}';
}

function buildCheckPrompt(mode, activity, level, exercise, userAnswer, questionId) {
  const L = level || 'B2';
  const ex = clip(JSON.stringify(exercise), 5000);
  const ans = clip(userAnswer, 1200);

  if (mode === 'use-of-english') {
    const model = exercise?.modelAnswer || '';
    return `Cambridge ${L} examiner. Exercise JSON: ${ex}
Official modelAnswer from exercise: "${model}"
Student answer: "${ans}"
Compare strictly to modelAnswer (accept minor spelling if meaning clear). Return ONLY JSON:
{"correct":true|false,"scorePercent":0-100,"feedback":"REQUIRED: 2-4 sentences in English ALWAYS — if correct, praise the answer AND explain why it works (grammar, collocation, word formation, or structure); if wrong, explain the mistake clearly","modelAnswer":"repeat the official modelAnswer exactly when correct is false; empty string when correct is true"}`;
  }

  if (mode === 'reading' || mode === 'listening') {
    return `Cambridge ${L} ${mode} examiner. Full task JSON: ${ex}
Question id: ${questionId || 'q1'}
Student answer: "${ans}"
Use modelAnswers in JSON. Return ONLY JSON:
{"correct":true|false,"feedback":"REQUIRED: 2-4 sentences in English ALWAYS — if correct, explain why the answer fits the text/audio; if wrong, explain the mistake and point to evidence","correctAnswer":"official answer when correct is false; empty string when correct is true"}`;
  }

  return `Feedback for: ${ans}`;
}

function normalizeRlCheckResult(result, exercise, questionId) {
  const correct = Boolean(result?.correct);
  const modelAnswers = Array.isArray(exercise?.modelAnswers) ? exercise.modelAnswers : [];
  const official =
    modelAnswers.find((m) => m.id === questionId)?.answer ||
    result?.correctAnswer ||
    '';
  let feedback = String(result?.feedback || '').trim();
  if (!feedback) {
    feedback = correct
      ? 'Correct — well done.'
      : 'Not quite. See the correct answer below.';
  }
  return {
    correct,
    feedback,
    correctAnswer: correct ? '' : String(official).trim(),
  };
}

function normalizeUoeCheckResult(result, exercise) {
  const correct = Boolean(result?.correct);
  const modelAnswer = String(result?.modelAnswer || exercise?.modelAnswer || '').trim();
  const tip = String(exercise?.briefTip || '').trim();
  let feedback = String(result?.feedback || '').trim();

  if (!feedback) {
    feedback = correct
      ? 'Correct — well done.'
      : 'Not quite. See the model answer below.';
  }
  if (correct && tip && !feedback.toLowerCase().includes(tip.toLowerCase().slice(0, 12))) {
    feedback = `${feedback} ${tip}`;
  }
  if (!correct && tip && !feedback.toLowerCase().includes(tip.toLowerCase().slice(0, 12))) {
    feedback = `${feedback} ${tip}`;
  }

  return {
    correct,
    scorePercent:
      typeof result?.scorePercent === 'number' ? result.scorePercent : correct ? 100 : 0,
    feedback,
    modelAnswer: correct ? '' : modelAnswer,
  };
}

function parseJsonFromModel(text) {
  const raw = String(text || '').trim();
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : raw;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error('Invalid JSON from model');
  }
}

export async function POST(req) {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return NextResponse.json(
      {
        error:
          'Missing OPENAI_API_KEY in .env.local. Dralo AI uses ChatGPT (OpenAI). Optional: OPENAI_MODEL=gpt-4o-mini',
      },
      { status: 503 },
    );
  }

  const ip = clientIp(req);
  if (!tryConsumeRate(ip)) {
    return NextResponse.json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
  }

  const openai = getOpenAI();
  if (!openai) {
    return NextResponse.json({ error: 'OpenAI is not configured.' }, { status: 503 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 });
  }

  const {
    action,
    mode,
    activity,
    level,
    exercise,
    userAnswer,
    questionId,
    varietySeed,
    recentFingerprints,
    topic,
  } = body || {};

  if (!mode || !action) {
    return NextResponse.json({ error: 'Missing mode or action.' }, { status: 400 });
  }

  const systemBase =
    'You are Dralo, a friendly Cambridge English coach powered by ChatGPT. Be concise, accurate, and exam-focused. All feedback and tips must be in English. Always follow the JSON-only output format requested.';

  try {
    if (action === 'generate') {
      const completion = await openai.chat.completions.create({
        model: OPENAI_CHAT_MODEL,
        temperature: ['use-of-english', 'reading', 'listening', 'writing'].includes(mode)
          ? 0.92
          : 0.75,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemBase },
          {
            role: 'user',
            content: buildGeneratePrompt(mode, activity, level, {
              varietySeed,
              recentFingerprints,
              topic,
            }),
          },
        ],
      });
      const text = completion.choices?.[0]?.message?.content || '{}';
      const data = parseJsonFromModel(text);
      return NextResponse.json({ ok: true, exercise: data });
    }

    if (action === 'check') {
      const completion = await openai.chat.completions.create({
        model: OPENAI_CHAT_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemBase },
          {
            role: 'user',
            content: buildCheckPrompt(mode, activity, level, exercise, userAnswer, questionId),
          },
        ],
      });
      const text = completion.choices?.[0]?.message?.content || '{}';
      const result = parseJsonFromModel(text);
      let normalized = result;
      if (mode === 'use-of-english') {
        normalized = normalizeUoeCheckResult(result, exercise);
      } else if (mode === 'reading' || mode === 'listening') {
        normalized = normalizeRlCheckResult(result, exercise, questionId);
      }
      return NextResponse.json({ ok: true, result: normalized });
    }

    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    console.error('[dralo-ai/chat]', err);
    return NextResponse.json(
      { error: err?.message || 'Could not connect to ChatGPT.' },
      { status: 500 },
    );
  }
}
