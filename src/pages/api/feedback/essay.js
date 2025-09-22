import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractScore(text, category) {
  const regex = new RegExp(`${category}:\\s*(\\d)/5`, 'i');
  const match = text.match(regex);
  return match ? parseInt(match[1]) : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { essay } = req.body;

  if (!essay || essay.trim().length < 1) {
    return res.status(400).json({ error: 'Essay too short or missing.' });
  }

  try {
    const prompt = `
You are a Cambridge English C2 examiner. Evaluate the following B2-level essay.

If the essay is extremely short, irrelevant, or does not demonstrate effort (e.g. 1 word or gibberish), still return the structure below with a very low score (0/5 in all categories). Do not ask for resubmission. Just say the essay was too short or incoherent to evaluate properly.

Respond with this markdown structure:

🧠 General Feedback
...

✅ Strengths
...

⚠️ Areas for Improvement
...

📝 Cambridge Evaluation (C2 Scale)
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
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful and concise Cambridge English examiner." },
        { role: "user", content: prompt }
      ]
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
