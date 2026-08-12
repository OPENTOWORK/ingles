/**
 * Resolve B2 writing task_type for the v3 engine without inventing formality.
 */
import type { B2FirstTaskType } from '../../domain/task-types';

const CANONICAL: Record<string, B2FirstTaskType> = {
  essay: 'essay',
  article: 'article',
  review: 'review',
  report: 'report',
  informal_email: 'informal_email',
  formal_email: 'formal_email',
  email: 'informal_email',
};

/**
 * Prefer an explicit writingType from task context. Email without formality
 * defaults to informal_email (Doc 07 D9 residual — product should store formality).
 */
export function resolveWritingV3TaskType(input: {
  writingType?: string | null;
  taskType?: string | null;
  taskPrompt?: string | null;
}): B2FirstTaskType {
  const explicit = String(input.taskType || input.writingType || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (explicit && CANONICAL[explicit]) return CANONICAL[explicit];

  const prompt = String(input.taskPrompt || '').toLowerCase();
  if (/\bessay\b/.test(prompt)) return 'essay';
  if (/\breview\b/.test(prompt)) return 'review';
  if (/\breport\b/.test(prompt)) return 'report';
  if (/\barticle\b/.test(prompt)) return 'article';
  if (/\bemail\b|\be-mail\b/.test(prompt)) {
    if (/\bformal\b/.test(prompt)) return 'formal_email';
    return 'informal_email';
  }
  return 'essay';
}

/**
 * Exam-configuration reader facts (not scoring labels). Used when the prompt
 * wording alone leaves Communicative Achievement unresolved.
 */
export function resolveTrustedTargetReader(input: {
  taskType: B2FirstTaskType;
  explicitReader?: string | null;
  taskPrompt?: string | null;
}): string | null {
  const explicit = String(input.explicitReader || '').trim();
  if (explicit) return explicit;

  const prompt = String(input.taskPrompt || '');
  const fromPrompt =
    prompt.match(/your English teacher/i)?.[0] ||
    prompt.match(/English-speaking friend/i)?.[0] ||
    prompt.match(/group leader[^.\n]*/i)?.[0] ||
    null;
  if (fromPrompt) return fromPrompt;

  switch (input.taskType) {
    case 'essay':
      return 'your English teacher';
    case 'informal_email':
      return 'an English-speaking friend';
    case 'formal_email':
      return 'the organiser';
    case 'article':
      return 'readers of an English-language website';
    case 'review':
      return 'readers of an English-language magazine';
    case 'report':
      return 'the group leader';
    default:
      return null;
  }
}

export function buildTaskPromptSnapshot(input: {
  structuredExamContext?: string | null;
  taskContext?: Record<string, unknown> | string | null;
}): string {
  const structured = String(input.structuredExamContext || '').trim();
  if (structured) return structured;

  const ctx = input.taskContext;
  if (!ctx) return 'B2 First Writing task';
  if (typeof ctx === 'string') return ctx.trim() || 'B2 First Writing task';

  const parts = [
    ctx.partLabel,
    ctx.partDescription,
    ctx.instructions,
    ctx.inputText,
    ctx.writingType ? `Writing type: ${ctx.writingType}` : null,
  ]
    .map((p) => String(p || '').trim())
    .filter(Boolean);
  return parts.join('\n\n') || 'B2 First Writing task';
}
