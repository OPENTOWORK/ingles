const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const OPENAI_CHAT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function extractScore(text, category) {
  const regex = new RegExp(`${category}:\\s*(\\d)/5`, 'i');
  const match = String(text || '').match(regex);
  return match ? parseInt(match[1], 10) : null;
}

module.exports = async function handler(req, res) {
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
  const clip = (s) => (String(s).length > MAX_CONTEXT ? `${String(s).slice(0, MAX_CONTEXT)}\n\n[…truncated]` : String(s));

  const taskPack = [
    partLabel && `**Part / section:** ${partLabel}`,
    partDescription && `**Part description (fixed rubric context):**\n${clip(partDescription)}`,
    taskInstructions && `**Task instructions:**\n${clip(taskInstructions)}`,
    taskInputText && `**Input / stimulus material:**\n${clip(taskInputText)}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  if (!essay || String(essay).trim().length < 1) {
    return res.status(400).json({ error: 'Essay too short or missing.' });
  }

  if (!process.env.OPENAI_API_KEY || !String(process.env.OPENAI_API_KEY).trim()) {
    return res.status(503).json({
      error: 'Missing OPENAI_API_KEY on server.',
    });
  }

  try {
    const prompt = isB2First
      ? `
You are an experienced B2 First (FCE)-level English examiner.
${taskPack ? `Use this exact task context while evaluating:\n---\n${taskPack}\n---` : ''}
Target length when relevant: about ${wMin}-${wMax} words.

Respond with:
🧠 General Feedback
✅ Strengths
⚠️ Areas for Improvement
📝 Writing evaluation (B2 First criteria)
- Content: x/5
- Communicative Achievement: x/5
- Organisation: x/5
- Language: x/5
Total Score: X/20
Then: "✅ You passed!" or "❌ You did not pass."

Candidate's answer:
${essay}
`
      : `
You are an experienced C2-level English examiner. Evaluate this essay.
Return:
🧠 General Feedback
✅ Strengths
⚠️ Areas for Improvement
📝 Writing evaluation (C2 scale)
- Content: x/5
- Communicative Achievement: x/5
- Organisation: x/5
- Language: x/5
Total Score: X/20
Then: "✅ You passed!" or "❌ You did not pass."

Essay:
${essay}
`;

    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful and concise English certification examiner.' },
        { role: 'user', content: prompt },
      ],
    });

    const feedback = completion.choices?.[0]?.message?.content || '';
    const content = extractScore(feedback, 'Content') || 0;
    const communication = extractScore(feedback, 'Communicative Achievement') || 0;
    const organisation = extractScore(feedback, 'Organisation') || 0;
    const language = extractScore(feedback, 'Language') || 0;
    const total = content + communication + organisation + language;
    const passed = total >= 12;

    return res.status(200).json({
      feedback,
      scores: { content, communication, organisation, language, total, passed, required: 12 },
    });
  } catch (err) {
    return res.status(500).json({ error: err?.message || 'Something went wrong while processing your request.' });
  }
};
