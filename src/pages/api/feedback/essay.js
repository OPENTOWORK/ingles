import OpenAI from "openai";

/** Misma API que usa ChatGPT en integraciones: https://platform.openai.com/api-keys */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** Modelo chat (p. ej. gpt-4o-mini, gpt-4o). No pegues la clave en el código: usa .env.local */
const OPENAI_CHAT_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

function extractScore(text, category) {
  const regex = new RegExp(`${category}:\\s*(\\d)/5`, 'i');
  const match = text.match(regex);
  return match ? parseInt(match[1]) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { essay, level, taskContext, wordMin: bodyWordMin, wordMax: bodyWordMax } = req.body || {};
  const examLevel = String(level || '').toLowerCase();
  const isB2First = examLevel === 'b2' || examLevel === 'fce' || examLevel === 'b2first';

  const tc = taskContext && typeof taskContext === 'object' ? taskContext : {};
  const partLabel = String(tc.partLabel || '').trim();
  const partDescription = String(tc.partDescription || '').trim();
  const taskInstructions = String(tc.instructions || '').trim();
  const taskInputText = String(tc.inputText || '').trim();

  const wMin = Number.isFinite(Number(bodyWordMin)) ? Number(bodyWordMin) : 140;
  const wMax = Number.isFinite(Number(bodyWordMax)) ? Number(bodyWordMax) : 190;

  const MAX_CONTEXT = 28000;
  const clip = (s) => (s.length > MAX_CONTEXT ? `${s.slice(0, MAX_CONTEXT)}\n\n[…truncated]` : s);

  const taskPack = [
    partLabel && `**Part / section:** ${partLabel}`,
    partDescription && `**Part description (fixed rubric context):**\n${clip(partDescription)}`,
    taskInstructions && `**Task instructions (what the candidate must do — use as primary marking criteria for task achievement):**\n${clip(taskInstructions)}`,
    taskInputText && `**Input / stimulus material (readings, notes, bullet points — candidate should use when the task requires):**\n${clip(taskInputText)}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  if (!essay || essay.trim().length < 1) {
    return res.status(400).json({ error: 'Essay too short or missing.' });
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return res.status(503).json({
      error:
        'Falta OPENAI_API_KEY en el servidor. Añádela en .env.local (no la compartas en chats). Opcional: OPENAI_MODEL=gpt-4o-mini',
    });
  }

  try {
    const prompt = isB2First
      ? `
You are an experienced B2 First (FCE)-level English examiner.

${taskPack ? `Below is the **exact task** the candidate was set (instructions + any input texts). You MUST:\n- Judge whether their answer **fulfils this specific task** (genre, audience, content points, required reactions to input).\n- In "General Feedback" and "Areas for Improvement", **refer to the task** (e.g. missing bullet points, wrong register, ignored question).\n- If they wrote the wrong text type or largely ignored the task, reflect that in **Content** and **Communicative Achievement**.\n\n---\n${taskPack}\n---\n` : `No separate task sheet was supplied; infer a typical B2 First writing task from the candidate text and still score fairly.\n`}

Target length for this paper when relevant: about **${wMin}–${wMax} words**. If the answer is far outside that range, say so briefly under "Areas for Improvement" but still score all categories.

If the text is extremely short, irrelevant, or gibberish, still return the structure below with very low scores (0/5). Do not ask for resubmission.

Respond with this markdown structure (English is fine for feedback):

🧠 General Feedback
...

✅ Strengths
...

⚠️ Areas for Improvement
...

📝 Writing evaluation (B2 First criteria)
- Content: x/5
- Communicative Achievement: x/5
- Organisation: x/5
- Language: x/5

Total Score: X/20
Then say if they passed: "✅ You passed!" or "❌ You did not pass." (typical pass threshold around 12/20 on this scale).

**Candidate's answer to evaluate:**

${essay}`
      : `
You are an experienced C2-level English examiner. Evaluate the following B2-level essay.

If the essay is extremely short, irrelevant, or does not demonstrate effort (e.g. 1 word or gibberish), still return the structure below with a very low score (0/5 in all categories). Do not ask for resubmission. Just say the essay was too short or incoherent to evaluate properly.

Respond with this markdown structure:

🧠 General Feedback
...

✅ Strengths
...

⚠️ Areas for Improvement
...

📝 Writing evaluation (C2 scale)
- Content: x/5
- Communicative Achievement: x/5
- Organisation: x/5
- Language: x/5

Total Score: X/20
Then say if they passed: "✅ You passed!" or "❌ You did not pass."

Essay:
"${essay}"
`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      messages: [
        { role: "system", content: "You are a helpful and concise English certification examiner." },
        { role: "user", content: prompt },
      ],
    });

    const feedback = completion.choices[0].message.content;

    const content = extractScore(feedback, "Content") || 0;
    const communication = extractScore(feedback, "Communicative Achievement") || 0;
    const organisation = extractScore(feedback, "Organisation") || 0;
    const language = extractScore(feedback, "Language") || 0;

    const total = content + communication + organisation + language;
    const passed = total >= 12;

    res.status(200).json({
      feedback,
      scores: {
        content,
        communication,
        organisation,
        language,
        total,
        passed,
        required: 12
      }
    });

  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Something went wrong while processing your request." });
  }
}
