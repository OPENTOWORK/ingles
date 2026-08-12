/**
 * Canonical B2 First Writing task types (Doc 01, Phase 2).
 *
 * v1 scope is Cambridge B2 First only. `story`, A2/B1/C1/C2 genres and the
 * placement-writing types are deliberately absent: Doc 01 does not cover them.
 */
import { z } from 'zod';

export const B2_FIRST_TASK_TYPES = [
  'essay',
  'informal_email',
  'formal_email',
  'article',
  'report',
  'review',
] as const;

export type B2FirstTaskType = typeof B2_FIRST_TASK_TYPES[number];

export const b2FirstTaskTypeSchema = z.enum(B2_FIRST_TASK_TYPES);

export const EMAIL_TASK_TYPES = ['informal_email', 'formal_email'] as const;

/** Genres explicitly outside v1 scope — recognised so they fail loudly, not silently. */
export const OUT_OF_SCOPE_TASK_TYPES = [
  'story',
  'set_text',
  'note',
  'proposal',
  'summary',
] as const;

export function isB2FirstTaskType(value: string): value is B2FirstTaskType {
  return (B2_FIRST_TASK_TYPES as readonly string[]).includes(value);
}

/**
 * Aliases used by existing DRALO task metadata (`src/data/b2WritingTasks.js`
 * `writingType`) and by free-text prompts. `email` / `letter` stay ambiguous on
 * purpose: Doc 01 requires formal and informal to be distinguished, and the
 * legacy data does not record formality.
 */
const TASK_TYPE_ALIASES: Record<string, B2FirstTaskType | 'email_family'> = {
  essay: 'essay',
  article: 'article',
  report: 'report',
  review: 'review',
  informal_email: 'informal_email',
  formal_email: 'formal_email',
  informal_letter: 'informal_email',
  formal_letter: 'formal_email',
  email: 'email_family',
  letter: 'email_family',
  'email/letter': 'email_family',
  email_letter: 'email_family',
  correspondence: 'email_family',
};

export type TaskTypeNormalisation =
  | { status: 'resolved'; task_type: B2FirstTaskType }
  | { status: 'ambiguous'; family: 'email'; candidates: readonly B2FirstTaskType[] }
  | { status: 'out_of_scope'; value: string }
  | { status: 'unknown'; value: string };

export function normaliseTaskTypeValue(raw: unknown): TaskTypeNormalisation {
  const value = String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

  if (!value) return { status: 'unknown', value: '' };

  if ((OUT_OF_SCOPE_TASK_TYPES as readonly string[]).includes(value)) {
    return { status: 'out_of_scope', value };
  }

  const alias = TASK_TYPE_ALIASES[value] ?? TASK_TYPE_ALIASES[value.replace(/_/g, '/')];
  if (alias === 'email_family') {
    return { status: 'ambiguous', family: 'email', candidates: EMAIL_TASK_TYPES };
  }
  if (alias) return { status: 'resolved', task_type: alias };

  return { status: 'unknown', value };
}
