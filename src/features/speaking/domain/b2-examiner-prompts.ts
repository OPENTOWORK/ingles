import { B2_SPEAKING_EXAMINER_PART_1_PROMPT } from '@/lib/ai/prompts/b2SpeakingExaminerPart1Prompt';
import { B2_SPEAKING_PART_MIN } from './b2-speaking-exam-parts';

/** Global B2 paper part numbers (14–17) with dedicated live examiner prompts. */
const DEDICATED_EXAMINER_PROMPTS: Partial<Record<number, string>> = {
  [B2_SPEAKING_PART_MIN]: B2_SPEAKING_EXAMINER_PART_1_PROMPT,
};

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

  return `${base}

---

OPTIONAL TASK CONTEXT FROM EXAM PAPER (use as guidance only; do not read mechanically):
${ctx}`;
}

export const B2_PART_1_OPENING_USER_MESSAGE =
  'This is the opening turn of B2 Speaking Part 1 (Interview). Follow your OPENING TURN instructions. Return only what the examiner says aloud — one brief greeting and the first question only.';
