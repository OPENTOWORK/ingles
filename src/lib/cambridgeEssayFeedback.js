import { cambridgeChatCompletion, isDraloOpenAIConfigured } from '@/lib/draloAiEngine';
import { formatWritingFeedbackDisplay } from '@/lib/formatWritingFeedback';

function extractScore(text, category) {
  const regex = new RegExp(`${category}:\\s*(\\d)\\s*/\\s*5`, 'i');
  const match = String(text || '').match(regex);
  return match ? parseInt(match[1], 10) : null;
}

function extractCefrLevel(text) {
  const match = String(text || '').match(
    /Level:\s*(A2|B1\+?|low\s+B2|B2\+?|C1)\b/i,
  );
  return match ? match[1].replace(/\s+/g, ' ').trim() : null;
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

function buildB2FirstPrompt({ essay, taskPack, wordMin, wordMax }) {
  return `
You are an experienced, encouraging English teacher marking a B2-level exam-style writing task. Give clear teacher-style feedback. Mark using four subscales (0–5 each, total /20).

${taskPack ? `**EXACT TASK SET TO THE CANDIDATE** — you MUST evaluate task fulfilment against this:\n---\n${taskPack}\n---\n` : 'No separate task sheet was supplied; infer a typical B2 Part 1 (essay) or Part 2 task from the answer.\n'}

Target length when relevant: **${wordMin}–${wordMax} words**.

Assessment scale:
- **Content**: All content is relevant; target reader fully informed.
- **Communicative Achievement**: Register, format and conventions appropriate to the task.
- **Organisation**: Text well organised; coherent; uses a range of cohesive devices.
- **Language**: Good range of vocabulary and grammar; errors do not impede communication.

CRITICAL marking rules:
- Estimate the student's REAL level honestly. Do NOT inflate the level.
- Do NOT overcorrect: focus on the 3–8 most important problems.
- The improved version must stay at the student's CURRENT level (do not turn a B1 text into a C1 text).
- Be specific and constructive, like a teacher writing on a student's paper.

**Required response format (in English). Do NOT use markdown headers (#, ##, ###). Use these emoji section titles exactly, in this order:**

📝 Dralo writing feedback

🎓 Estimated CEFR level
Level: <one of: A2, B1, B1+, low B2, B2, B2+, C1>
One sentence explaining why.

📊 Scores
- Content: x/5
- Communicative Achievement: x/5
- Organisation: x/5
- Language: x/5
**Total Score: X/20**

💪 Main strengths
- 2–4 bullet points.

🎯 Main problems
- 2–4 bullet points (the issues that most limit the mark).

✏️ Corrections
For each of the 3–8 most important errors, output a block in exactly this format (each field on its own line):
Original: "exact phrase from the student's text"
Problem: short description of what is wrong
Correct: "corrected phrase"
Why: brief teacher-style explanation
Type: <one of: grammar, vocabulary, spelling, word order, articles, prepositions, verb tense, subject-verb agreement, cohesion, register, task response>

📈 Improved version (your level)
Rewrite the student's full text with the corrections applied, staying at the student's current level. Same ideas, same voice — just accurate.

🚀 Stronger B2 version
Only include a rewritten version here if the student is close to B2 and it is genuinely useful. Otherwise write exactly: "Not needed yet — focus on the corrections above first."

📚 Study plan
Before your next writing, practise:
Grammar:
- 3 specific grammar points
Vocabulary:
- 2 vocabulary areas
Strategy:
- 1 writing strategy

Pass threshold: 12/20. End with exactly one line: either "✅ Pass — B2 standard met." or "❌ Not yet at pass level — keep practising."

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

  const prompt = isB2First
    ? buildB2FirstPrompt({ essay: trimmed, taskPack, wordMin: wMin, wordMax: wMax })
    : buildGenericPrompt(trimmed);

  try {
    const { text: feedback } = await cambridgeChatCompletion({
      system:
        'Be precise, constructive, and exam-focused, like a supportive teacher. Use emoji section titles (📝 🎓 📊 💪 🎯 ✏️ 📈 🚀 📚) — never use # markdown headers.',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.35,
    });
    if (!feedback) {
      return { ok: false, status: 502, error: 'The examiner returned an empty response. Please try again.' };
    }

    const formattedFeedback = formatWritingFeedbackDisplay(feedback);

    const content = extractScore(feedback, 'Content') ?? 0;
    const communication = extractScore(feedback, 'Communicative Achievement') ?? 0;
    const organisation = extractScore(feedback, 'Organisation') ?? 0;
    const language = extractScore(feedback, 'Language') ?? 0;
    const total = content + communication + organisation + language;
    const required = 12;
    const passed = total >= required;
    const cefr = extractCefrLevel(feedback);

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
