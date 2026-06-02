import { draloChatCompletion, getDefaultModel } from '@/lib/ai/draloAiEngine';
import { buildSpeakingCoachPrompt } from '@/lib/ai/prompts/speakingCoachPrompt';

export const SPEAKING_AI_LEVELS = ['A2', 'B1', 'B2', 'C1', 'C2'];

const AVATAR_STATES = ['idle', 'listening', 'thinking', 'speaking', 'happy'];

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function clampStars(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(3, Math.round(n)));
}

function normalizeScores(raw = {}) {
  const s = raw && typeof raw === 'object' ? raw : {};
  return {
    grammar: clampScore(s.grammar),
    vocabulary: clampScore(s.vocabulary),
    fluency: clampScore(s.fluency),
    confidence: clampScore(s.confidence),
  };
}

function normalizeCompletedObjectives(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const v of raw) {
    const n = Number(v);
    if (Number.isInteger(n) && n >= 0 && n < 50 && !out.includes(n)) {
      out.push(n);
    }
  }
  return out;
}

function normalizeAvatarState(value, fallback) {
  const v = String(value || '').trim().toLowerCase();
  return AVATAR_STATES.includes(v) ? v : fallback;
}

function normalizeCorrection(raw) {
  const c = raw && typeof raw === 'object' ? raw : {};
  return {
    original: String(c.original || '').trim(),
    better: String(c.better || '').trim(),
    why: String(c.why || '').trim(),
  };
}

function toStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((v) => String(v || '').trim()).filter(Boolean);
  }
  if (value == null || value === '') return [];
  return [String(value).trim()].filter(Boolean);
}

/** Extrae y parsea el primer objeto JSON aunque el modelo lo envuelva en markdown o texto. */
function extractJson(text) {
  if (!text) return null;
  let cleaned = String(text).trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // fall through to brace extraction
  }

  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const candidate = cleaned.slice(first, last + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }
  return null;
}

function buildTurnResult(parsed, fallbackText) {
  if (!parsed || typeof parsed !== 'object') {
    return {
      reply:
        String(fallbackText || '').trim() ||
        "Let's keep going. Tell me a little more.",
      quickTip: { original: '', better: '', why: '' },
      completedObjectives: [],
      xpEarned: 0,
      xpReason: '',
      scores: normalizeScores(),
      avatarState: 'speaking',
      parsed: false,
    };
  }
  return {
    reply: String(parsed.reply || '').trim(),
    quickTip: normalizeCorrection(parsed.quickTip),
    completedObjectives: normalizeCompletedObjectives(parsed.completedObjectives),
    xpEarned: clampScore(parsed.xpEarned),
    xpReason: String(parsed.xpReason || '').trim(),
    scores: normalizeScores(parsed.scores),
    avatarState: normalizeAvatarState(parsed.avatarState, 'speaking'),
    parsed: true,
  };
}

function buildFinalResult(parsed, fallbackText) {
  if (!parsed || typeof parsed !== 'object') {
    return {
      missionComplete: true,
      overallFeedback:
        String(fallbackText || '').trim() ||
        'Great effort! Keep practising to build fluency and confidence.',
      stars: 1,
      xpEarned: 0,
      completedObjectives: [],
      scores: normalizeScores(),
      usefulExpressions: [],
      mainCorrection: { original: '', better: '', why: '' },
      nextMissionRecommendation: '',
      parsed: false,
    };
  }
  return {
    missionComplete: true,
    overallFeedback: String(parsed.overallFeedback || '').trim(),
    stars: clampStars(parsed.stars),
    xpEarned: clampScore(parsed.xpEarned),
    completedObjectives: normalizeCompletedObjectives(parsed.completedObjectives),
    scores: normalizeScores(parsed.scores),
    usefulExpressions: toStringArray(parsed.usefulExpressions),
    mainCorrection: normalizeCorrection(parsed.mainCorrection),
    nextMissionRecommendation: String(parsed.nextMissionRecommendation || '').trim(),
    parsed: true,
  };
}

function normalizeConversation(conversation = []) {
  return (Array.isArray(conversation) ? conversation : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && m.content != null)
    .slice(-20)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 4000) }));
}

function supportsJsonResponseFormat() {
  const model = getDefaultModel().toLowerCase();
  return model.includes('gpt-4o') || model.includes('gpt-4.1') || model.includes('gpt-4-turbo');
}

export async function runSpeakingCoach({
  level = 'B2',
  missionTitle = 'General conversation',
  scenario = '',
  character = 'Dralo Coach',
  objectives = [],
  conversation = [],
  userMessage = '',
  finish = false,
}) {
  const systemPrompt = buildSpeakingCoachPrompt({
    level,
    missionTitle,
    scenario,
    character,
    objectives,
    finish,
  });
  const history = normalizeConversation(conversation);

  const trimmedUser = String(userMessage || '').trim();
  const finalUserMessage = finish
    ? `The student wants to finish the mission now (finish = true). Based on the whole conversation, produce the final mission report JSON.${
        trimmedUser ? `\n\nFinal student message:\n${trimmedUser}` : ''
      }`
    : trimmedUser ||
      'Please start the mission. Greet the student in character and ask your first short question.';

  const text = await draloChatCompletion({
    systemPrompt,
    userMessage: finalUserMessage,
    conversationHistory: history,
    temperature: finish ? 0.4 : 0.7,
    max_tokens: finish ? 900 : 500,
    ...(supportsJsonResponseFormat() ? { response_format: { type: 'json_object' } } : {}),
  });

  const parsed = extractJson(text);
  return finish ? buildFinalResult(parsed, text) : buildTurnResult(parsed, text);
}
