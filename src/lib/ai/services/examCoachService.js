import { draloChatCompletion } from '@/lib/ai/draloAiEngine';
import { examCoachPrompt } from '@/lib/ai/prompts/examCoachPrompt';

export const EXAM_COACH_TASK_TYPES = [
  'writing_correction',
  'exam_generation',
  'speaking_practice',
  'grammar_explanation',
  'vocabulary_practice',
  'reading_practice',
  'use_of_english',
  'listening_script',
];

const GENERATION_TASKS = new Set(['exam_generation', 'listening_script']);

/** Rough stats to flag very short writing samples. */
export function getWritingSampleStats(text) {
  const trimmed = String(text || '').trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const sentences = trimmed
    ? trimmed.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean)
    : [];
  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    isVeryShort: words.length > 0 && (words.length < 25 || sentences.length <= 1),
  };
}

export function isValidExamCoachTaskType(taskType) {
  return EXAM_COACH_TASK_TYPES.includes(String(taskType || ''));
}

export async function runExamCoach({
  taskType,
  level = 'B2',
  userInput,
  conversationHistory = [],
  max_tokens,
  response_format,
}) {
  if (!isValidExamCoachTaskType(taskType)) {
    throw new Error(`Invalid exam taskType: ${taskType}`);
  }

  const studentText = String(userInput || '').trim();
  const sampleStats = taskType === 'writing_correction' ? getWritingSampleStats(studentText) : null;

  const writingHint =
    taskType === 'writing_correction'
      ? `
IMPORTANT — WRITING CORRECTION:
* Follow WRITING CORRECTION — ACCURACY and REQUIRED OUTPUT FORMAT in your system instructions.
* Use ## Corrections with Original / Problem / Correct / Why blocks for each error.
* Do NOT invent grammar rules (e.g. never say to add "the" before "lives" in "in their lives").
* Target practice level: ${level}. Vocabulary must stay appropriate to Estimated Level, not only target level.
${
  sampleStats?.isVeryShort
    ? `
* This sample has ~${sampleStats.wordCount} word(s) and ~${sampleStats.sentenceCount} sentence(s) — VERY SHORT.
* You MUST say: "This is a very short sample, so the level estimate is limited."
* Prefer Estimated Level: A2+/B1 (range), not a firm B1. Organisation: 1/5 or "Limited sample".
* Do not overestimate. No formal vocab (assist, essential, crucial, support) for A2/B1.
`
    : ''
}
`
      : '';

  const userMessage = `
Assistant mode: DRALO EXAM COACH
Section: LEVELS
Task type: ${taskType}
Target level: ${level}
${writingHint}

Student text / user request:
${studentText}
`;

  return draloChatCompletion({
    systemPrompt: examCoachPrompt,
    userMessage,
    conversationHistory,
    temperature: GENERATION_TASKS.has(taskType) ? 0.5 : 0.3,
    max_tokens,
    response_format,
  });
}
