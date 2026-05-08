const OpenAI = require('openai');

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 40;
const ipBuckets = new Map();
const MAX_CONTEXT = 6000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const OPENAI_CHAT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (xf) return String(xf).split(',')[0].trim().slice(0, 64) || 'unknown';
  return String(req.headers['x-real-ip'] || '').trim().slice(0, 64) || 'unknown';
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

function clip(s) {
  const t = String(s || '').trim();
  if (!t) return '';
  return t.length > MAX_CONTEXT ? `${t.slice(0, MAX_CONTEXT)}\n\n[…]` : t;
}

function normalizeKeyCompare(s) {
  return String(s || '')
    .trim()
    .replace(/\.$/, '')
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  if (!process.env.OPENAI_API_KEY || !String(process.env.OPENAI_API_KEY).trim()) {
    return res.status(503).json({ error: 'Missing OPENAI_API_KEY on server.' });
  }

  const ip = clientIp(req);
  if (!tryConsumeRate(ip)) {
    return res.status(429).json({ error: 'Too many requests. Try again later.' });
  }

  const body = req.body || {};
  const partLabel = clip(body.partLabel);
  const questionLabel = clip(body.questionLabel);
  const contextSnippet = clip(body.contextSnippet);
  const userChoiceText = clip(body.userChoiceText);
  const correctChoiceText = clip(body.correctChoiceText);
  const answersFromDatabase = clip(body.answersFromDatabase);
  const isCorrect = Boolean(body.isCorrect);

  if (!contextSnippet || !String(userChoiceText || '').trim()) {
    return res.status(400).json({ error: 'Missing required context.' });
  }
  if (!isCorrect && !String(correctChoiceText || '').trim()) {
    return res.status(400).json({ error: 'Missing official key for incorrect answer case.' });
  }

  const system = isCorrect
    ? `You are an experienced English teacher. Student answer is correct.
Write in English only. Explain why it fits the provided context. Max two sentences, single line.`
    : `You are an experienced English teacher. Student answer is wrong.
Write in English only. Explain briefly why the student answer is wrong, then one short sentence why official answer fits. Single line.`;

  const user = `Part: ${partLabel || '—'}
Item: ${questionLabel || '—'}
Result: ${isCorrect ? 'CORRECT' : 'WRONG'}
Context:
${contextSnippet}

${answersFromDatabase ? `Database options:\n${answersFromDatabase}\n\n` : ''}Student choice: ${userChoiceText}
${isCorrect ? `Official keyed answer: ${correctChoiceText || ''}` : `Official key: ${correctChoiceText}`}`;

  try {
    const completion = await openai.chat.completions.create({
      model: OPENAI_CHAT_MODEL,
      temperature: 0.35,
      max_tokens: isCorrect ? 200 : 280,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    });
    const raw = completion.choices?.[0]?.message?.content?.trim() || '';
    let oneLine = raw.replace(/\s+/g, ' ').trim();
    if (!isCorrect && String(correctChoiceText || '').trim()) {
      oneLine = stripRedundantKeyedSuffix(oneLine, String(correctChoiceText).trim()).slice(0, 560);
    } else {
      oneLine = oneLine.slice(0, isCorrect ? 460 : 520);
    }
    return res.status(200).json({ justification: oneLine || 'Could not generate an explanation.' });
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Failed to generate justification.' });
  }
};
