import { draloChatCompletion, getFastModel } from '@/lib/ai/draloAiEngine';
import {
  ERROR_TRACKER_SYSTEM_PROMPT,
  buildErrorTrackerUserMessage,
  buildErrorExercisesPrompt,
  buildErrorExercisesUserMessage,
} from '@/lib/ai/prompts/errorTrackerPrompt';

const ERROR_TYPES = [
  'Grammar',
  'Vocabulary',
  'Spelling',
  'Word Order',
  'Prepositions',
  'Verb Tenses',
  'Pronunciation',
];

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

function supportsJsonResponseFormat(model) {
  const m = String(model || '').toLowerCase();
  return m.includes('gpt-4o') || m.includes('gpt-4.1') || m.includes('gpt-4-turbo');
}

function cleanString(value, max = 600) {
  const t = String(value == null ? '' : value).trim();
  return t.length > max ? t.slice(0, max) : t;
}

function normalizeErrorType(value) {
  const raw = cleanString(value, 40);
  if (!raw) return 'Grammar';
  const match = ERROR_TYPES.find((t) => t.toLowerCase() === raw.toLowerCase());
  return match || raw;
}

function normalizeErrors(parsed) {
  const list = Array.isArray(parsed?.errors) ? parsed.errors : [];
  return list
    .map((e) => (e && typeof e === 'object' ? e : null))
    .filter(Boolean)
    .map((e) => ({
      error_type: normalizeErrorType(e.error_type),
      original_text: cleanString(e.original_text),
      corrected_text: cleanString(e.corrected_text),
      explanation: cleanString(e.explanation, 800),
      suggestion: cleanString(e.suggestion, 400),
    }))
    .filter((e) => e.original_text && e.corrected_text)
    .slice(0, 5);
}

/**
 * action: "extract_errors"
 * @returns {Promise<{ errors: Array<object> }>}
 */
export async function runErrorExtractor({
  level = 'B2',
  source = 'Writing',
  userText = '',
  correctedText = '',
}) {
  const trimmedUser = String(userText || '').trim();
  const trimmedCorrected = String(correctedText || '').trim();
  if (!trimmedUser && !trimmedCorrected) {
    return { errors: [] };
  }

  const model = getFastModel();
  const userMessage = buildErrorTrackerUserMessage({
    level,
    source,
    userText: trimmedUser,
    correctedText: trimmedCorrected,
  });

  try {
    const text = await draloChatCompletion({
      systemPrompt: ERROR_TRACKER_SYSTEM_PROMPT,
      userMessage,
      model,
      temperature: 0.2,
      max_tokens: 900,
      ...(supportsJsonResponseFormat(model) ? { response_format: { type: 'json_object' } } : {}),
    });
    const parsed = extractJson(text);
    return { errors: normalizeErrors(parsed) };
  } catch {
    return { errors: [] };
  }
}

function normalizeMultipleChoice(list) {
  return (Array.isArray(list) ? list : [])
    .map((q) => (q && typeof q === 'object' ? q : null))
    .filter(Boolean)
    .map((q) => {
      const options = (Array.isArray(q.options) ? q.options : [])
        .map((o) => cleanString(o, 200))
        .filter(Boolean);
      return {
        question: cleanString(q.question, 400),
        options,
        answer: cleanString(q.answer, 200),
      };
    })
    .filter((q) => q.question && q.options.length >= 2 && q.answer)
    .slice(0, 5);
}

function normalizeFillInTheGap(list) {
  return (Array.isArray(list) ? list : [])
    .map((q) => (q && typeof q === 'object' ? q : null))
    .filter(Boolean)
    .map((q) => ({
      sentence: cleanString(q.sentence, 400),
      answer: cleanString(q.answer, 200),
    }))
    .filter((q) => q.sentence && q.answer)
    .slice(0, 5);
}

function buildExercisesFallback() {
  return {
    multipleChoice: [],
    fillInTheGap: [],
    finalExplanation:
      'We could not generate exercises right now. Please review the correction and try again in a moment.',
  };
}

/**
 * action: "generate_error_exercises"
 * @returns {Promise<{ multipleChoice: Array, fillInTheGap: Array, finalExplanation: string }>}
 */
export async function runErrorExercises({ level = 'B2', error = {} }) {
  const e = error && typeof error === 'object' ? error : {};
  if (!String(e.corrected_text || '').trim() && !String(e.original_text || '').trim()) {
    return buildExercisesFallback();
  }

  const model = getFastModel();
  const systemPrompt = buildErrorExercisesPrompt({ level, error: e });
  const userMessage = buildErrorExercisesUserMessage({ level, error: e });

  try {
    const text = await draloChatCompletion({
      systemPrompt,
      userMessage,
      model,
      temperature: 0.5,
      max_tokens: 1400,
      ...(supportsJsonResponseFormat(model) ? { response_format: { type: 'json_object' } } : {}),
    });
    const parsed = extractJson(text);
    if (!parsed || typeof parsed !== 'object') return buildExercisesFallback();
    return {
      multipleChoice: normalizeMultipleChoice(parsed.multipleChoice),
      fillInTheGap: normalizeFillInTheGap(parsed.fillInTheGap),
      finalExplanation:
        cleanString(parsed.finalExplanation, 1200) ||
        'Review the corrected version and keep practising this pattern.',
    };
  } catch {
    return buildExercisesFallback();
  }
}

export const ERROR_TRACKER_ERROR_TYPES = ERROR_TYPES;
