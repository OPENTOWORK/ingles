import { B2_SPEAKING_EXAMINER_PART_1_PROMPT } from '@/lib/ai/prompts/b2SpeakingExaminerPart1Prompt';
import { B2_SPEAKING_PART_MIN } from './b2-speaking-exam-parts';

/** Global B2 paper part numbers (14–17) with dedicated live examiner prompts. */
const DEDICATED_EXAMINER_PROMPTS: Partial<Record<number, string>> = {
  [B2_SPEAKING_PART_MIN]: B2_SPEAKING_EXAMINER_PART_1_PROMPT,
};

const B2_PART_1_FALLBACK_QUESTIONS = [
  'Do you work or are you a student?',
  'What do you enjoy doing in your free time?',
  'Tell me about a place you have enjoyed visiting.',
  'What would you like to do in the next few years?',
];

export function hasDedicatedB2ExaminerPrompt(b2PartNumber: number): boolean {
  return Boolean(DEDICATED_EXAMINER_PROMPTS[b2PartNumber]);
}

/**
 * Self-contained examiner system prompt for a B2 speaking part (no Real-Life / legacy Cambridge wrapper).
 * Returns null when the part still uses the generic examiner stack.
 */
export function buildB2ExaminerSystemPrompt(
  b2PartNumber: number,
  dbTaskContext = '',
): string | null {
  const base = DEDICATED_EXAMINER_PROMPTS[b2PartNumber];
  if (!base) return null;

  const ctx = String(dbTaskContext || '').trim();
  if (!ctx) return base;

  const paperQuestions = extractB2Part1PaperQuestions(ctx);
  const numbered =
    paperQuestions.length > 0
      ? `\nOfficial interview questions in order:\n${paperQuestions
          .map((q, i) => `${i + 1}. ${q}`)
          .join('\n')}\n`
      : '';

  return `${base}

---

EXAM PAPER FOR THIS SESSION (mandatory when interview questions are listed):
${ctx}
${numbered}
Rules for this paper context:
- Ask the official interview questions in order, one per turn.
- Keep each question's topic; do not replace them with similar repeated questions.
- After a valid English answer, advance to the next unused question.
- If the candidate answers in a language other than English, re-ask the SAME question in English.`;
}

/** Pull Part 1 interview questions from the exam-paper enunciado text. */
export function extractB2Part1PaperQuestions(taskContext = ''): string[] {
  const lines = String(taskContext || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const questions: string[] = [];
  for (const line of lines) {
    const cleaned = line.replace(/^[-•*\d.)\s]+/, '').trim();
    if (!cleaned) continue;
    if (
      /^(the examiner|about \d|answer the|tip:|materials:|task prompts|decision question|partner follow-up|directions?)/i.test(
        cleaned,
      )
    ) {
      continue;
    }
    if (
      /why\?|why not\?|tell me more/i.test(cleaned) &&
      cleaned.length < 90 &&
      !/^(what|where|when|who|how|do |does |did |can |would |is |are |tell me)/i.test(cleaned)
    ) {
      continue;
    }
    const looksLikeQuestion =
      /\?$/.test(cleaned) ||
      /^(what|where|when|who|why|how|do |does |did |can you|could you|would you|is |are |tell me)/i.test(
        cleaned,
      );
    if (!looksLikeQuestion) continue;
    if (questions.some((q) => q.toLowerCase() === cleaned.toLowerCase())) continue;
    questions.push(cleaned);
  }
  return questions;
}

type CandidateAnswerLanguage = 'english' | 'non-english' | 'uncertain';

/**
 * Conservative language check for short speaking answers.
 * We reject only clearly non-English answers; short valid answers such as
 * "I work" or "My name is Eric" must never be rejected.
 */
export function assessB2Part1AnswerLanguage(answer = ''): CandidateAnswerLanguage {
  const normalized = String(answer || '')
    .toLowerCase()
    .replace(/[¿¡]/g, ' ')
    .replace(/[^\p{L}'\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return 'uncertain';

  const clearlySpanish =
    /[áéíóúüñ]/u.test(normalized) ||
    /\b(soy|estoy|tengo|trabajo|estudio|vivo|gusta|gustan|encanta|disfruto|juego|hago|voy|porque|pero|también|español|motos?|deportes?|fútbol)\b/u.test(
      normalized,
    ) ||
    /\b(me llamo|mi nombre es|soy de|vivo en|me gusta|no me|yo trabajo|yo estudio)\b/u.test(
      normalized,
    );
  if (clearlySpanish) return 'non-english';

  if (
    /\b(i|i'm|i've|i'd|my|mine|me|we|our|the|a|an|am|is|are|was|were|work|study|live|like|love|enjoy|play|go|do|have|from|because|usually|sometimes|football|sport|sports)\b/i.test(
      normalized,
    )
  ) {
    return 'english';
  }

  return 'uncertain';
}

function normalizeQuestionKey(text = ''): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function paperQuestionAlreadyAsked(
  paperQuestion: string,
  assistantTurns: string[],
): boolean {
  const target = normalizeQuestionKey(paperQuestion);
  if (!target) return false;
  const targetTokens = new Set(target.split(' ').filter((t) => t.length > 3));
  return assistantTurns.some((turn) => {
    const key = normalizeQuestionKey(turn);
    if (!key) return false;
    if (key.includes(target) || target.includes(key)) return true;
    if (targetTokens.size === 0) return false;
    const overlap = [...targetTokens].filter((t) => key.includes(t)).length;
    return overlap >= Math.min(3, targetTokens.size);
  });
}

/**
 * Deterministic live reply for Part 1. Language acceptance and question
 * progression must not depend on the LLM following instructions.
 */
export function resolveB2Part1ExaminerReply(params: {
  isOpening?: boolean;
  transcript?: string;
  taskContext?: string;
  history?: { role: string; content: string }[];
}): string {
  if (params.isOpening) {
    return 'Good morning. My name is Emma. And what is your name?';
  }

  const paperQuestions = extractB2Part1PaperQuestions(params.taskContext || '');
  const questions =
    paperQuestions.length > 0 ? paperQuestions : B2_PART_1_FALLBACK_QUESTIONS;
  const assistantTurns = (params.history || [])
    .filter((line) => line.role === 'assistant')
    .map((line) => String(line.content || '').trim())
    .filter(Boolean);

  let nextIndex = 0;
  while (
    nextIndex < questions.length &&
    paperQuestionAlreadyAsked(questions[nextIndex], assistantTurns)
  ) {
    nextIndex += 1;
  }

  const answerLanguage = assessB2Part1AnswerLanguage(params.transcript || '');
  if (answerLanguage === 'non-english') {
    const previousQuestion =
      nextIndex > 0
        ? questions[nextIndex - 1]
        : 'What is your name?';
    return `Please answer in English. ${previousQuestion}`;
  }

  if (nextIndex >= questions.length) {
    return 'Thank you. That is the end of Part 1.';
  }

  return `Thank you. ${questions[nextIndex]}`;
}

/**
 * Build a deterministic Part 1 turn instruction so the model cannot invent/repeat questions.
 */
export function buildB2Part1TurnUserMessage(params: {
  isOpening?: boolean;
  transcript?: string;
  taskContext?: string;
  history?: { role: string; content: string }[];
}): string | null {
  const questions = extractB2Part1PaperQuestions(params.taskContext || '');
  if (!questions.length) return null;

  const assistantTurns = (params.history || [])
    .filter((line) => line.role === 'assistant')
    .map((line) => String(line.content || '').trim())
    .filter(Boolean);

  let nextIndex = 0;
  while (
    nextIndex < questions.length &&
    paperQuestionAlreadyAsked(questions[nextIndex], assistantTurns)
  ) {
    nextIndex += 1;
  }

  if (params.isOpening) {
    return (
      `This is the opening turn of B2 Speaking Part 1 (Interview). ` +
      `Greet the candidate briefly and ask them to introduce themselves (name and where they are from). ` +
      `Use this style: "Good morning. My name is Emma. And what is your name?" ` +
      `Do NOT ask any paper interview question yet. ` +
      `Return only what the examiner says aloud.`
    );
  }

  const transcript = String(params.transcript || '').trim();
  const answerLanguage = assessB2Part1AnswerLanguage(transcript);
  const introDone = assistantTurns.length >= 1;
  // Paper questions start only after the warm-up introduction turn.
  const paperIndex = introDone ? nextIndex : 0;
  const asked = questions.slice(0, paperIndex);
  const askedBlock = asked.length
    ? `Already asked paper questions (do NOT repeat any of these):\n${asked
        .map((q, i) => `${i + 1}. ${q}`)
        .join('\n')}\n`
    : '';

  if (introDone && paperIndex >= questions.length) {
    return (
      `Candidate's latest answer:\n"${transcript}"\n\n` +
      `${askedBlock}` +
      `All paper questions have been asked. Close Part 1 now with exactly: "Thank you. That is the end of Part 1."`
    );
  }

  // First candidate answer after opening → first paper question.
  const nextQuestion = questions[paperIndex];
  const isFirstPaperQuestion = paperIndex === 0;
  const languageInstruction =
    answerLanguage === 'non-english'
      ? `LANGUAGE CHECK RESULT: clearly non-English. Re-ask the SAME previous question in English and do not advance.\n`
      : answerLanguage === 'english'
        ? `LANGUAGE CHECK RESULT: English. You MUST accept it as an English answer and advance. Never ask the candidate to answer in English.\n`
        : `LANGUAGE CHECK RESULT: not clearly non-English. Accept the answer and advance; do not ask the candidate to change language.\n`;
  return (
    `Candidate's latest answer:\n"${transcript}"\n\n` +
    `${askedBlock}` +
    languageInstruction +
    (isFirstPaperQuestion
      ? `The warm-up introduction is done. Thank them briefly by name if they gave one, then ask EXACTLY this first paper question:\n`
      : `Otherwise, thank them briefly and ask EXACTLY this next paper question (same meaning; do not invent another):\n`) +
    `"${nextQuestion}"\n` +
    `Return only what the examiner says aloud.`
  );
}

export const B2_PART_1_OPENING_USER_MESSAGE =
  'This is the opening turn of B2 Speaking Part 1 (Interview). Greet the candidate and ask them to introduce themselves (name). Do not ask a paper topic question yet. Return only what the examiner says aloud.';
