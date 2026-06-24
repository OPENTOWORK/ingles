import { buildTeoriaExamPartTipsHref } from '@/lib/examPartTipsHref';
import { examStrategiesChapterPath } from '@/config/appRoutes';

/** Nivel por defecto para el índice de estudiantes (único abierto). */
export const EXAM_STRATEGIES_STUDENT_LEVEL = 'b2';

/**
 * @typedef {{ label: string, href?: string, children?: IndexChapter[] }} IndexChapter
 */

/** @type {Record<string, IndexChapter[]>} */
export const EXAM_STRATEGIES_STUDENT_INDEX_BY_SLUG = {
  'reading-and-use-of-english': [
    {
      label: 'Overall Strategy',
      href: examStrategiesChapterPath('reading-and-use-of-english', 'overall-strategy'),
    },
    ...[1, 2, 3, 4, 5, 6, 7].map((part) => ({
      label: `Part ${part} Tips`,
      href: buildTeoriaExamPartTipsHref(
        EXAM_STRATEGIES_STUDENT_LEVEL,
        'reading-and-use-of-english',
        part,
      ),
    })),
  ],
  listening: [
    {
      label: 'Overall Strategy',
      href: examStrategiesChapterPath('listening', 'overall-strategy'),
    },
    ...[1, 2, 3, 4].map((part) => ({
      label: `Part ${part} Tips`,
      href: buildTeoriaExamPartTipsHref(EXAM_STRATEGIES_STUDENT_LEVEL, 'listening', part),
    })),
  ],
  writing: [
    {
      label: 'Overall Strategy',
      href: examStrategiesChapterPath('writing', 'overall-strategy'),
    },
    {
      label: 'Part 1 - Essay',
      href: buildTeoriaExamPartTipsHref(EXAM_STRATEGIES_STUDENT_LEVEL, 'writing', 1),
    },
    {
      label: 'Part 2 - Choice',
      children: [
        {
          label: 'Review',
          href: examStrategiesChapterPath('writing', 'part-2-review'),
        },
        {
          label: 'Report',
          href: examStrategiesChapterPath('writing', 'part-2-report'),
        },
        {
          label: 'Article',
          href: examStrategiesChapterPath('writing', 'part-2-article'),
        },
        {
          label: 'Email',
          href: examStrategiesChapterPath('writing', 'part-2-email'),
        },
      ],
    },
  ],
  speaking: [
    {
      label: 'Overall Strategy',
      href: examStrategiesChapterPath('speaking', 'overall-strategy'),
    },
    ...[1, 2, 3, 4].map((part) => ({
      label: `Part ${part} Tips`,
      href: buildTeoriaExamPartTipsHref(EXAM_STRATEGIES_STUDENT_LEVEL, 'speaking', part),
    })),
  ],
};

/** @type {Record<string, { title: string, intro: string }>} */
export const EXAM_STRATEGIES_CHAPTER_COPY = {
  'reading-and-use-of-english/overall-strategy': {
    title: 'Overall Strategy',
    intro:
      'General approach, timing, and cross-part tactics for Reading and Use of English at B2.',
  },
  'listening/overall-strategy': {
    title: 'Overall Strategy',
    intro: 'General approach, timing, and cross-part tactics for Listening at B2.',
  },
  'writing/overall-strategy': {
    title: 'Overall Strategy',
    intro: 'General approach, timing, and cross-part tactics for Writing at B2.',
  },
  'writing/part-2-review': {
    title: 'Part 2 — Review',
    intro: 'Structure, register, and language for review tasks in Writing Part 2.',
  },
  'writing/part-2-report': {
    title: 'Part 2 — Report',
    intro: 'Structure, register, and language for report tasks in Writing Part 2.',
  },
  'writing/part-2-article': {
    title: 'Part 2 — Article',
    intro: 'Structure, register, and language for article tasks in Writing Part 2.',
  },
  'writing/part-2-email': {
    title: 'Part 2 — Email',
    intro: 'Structure, register, and language for email tasks in Writing Part 2.',
  },
  'speaking/overall-strategy': {
    title: 'Overall Strategy',
    intro: 'General approach, timing, and cross-part tactics for Speaking at B2.',
  },
};

/**
 * @param {string} sectionSlug
 * @returns {IndexChapter[] | null}
 */
export function getExamStrategiesStudentIndex(sectionSlug) {
  return EXAM_STRATEGIES_STUDENT_INDEX_BY_SLUG[sectionSlug] ?? null;
}

/**
 * @param {string} skill
 * @param {string} chapter
 */
export function getExamStrategiesChapterCopy(skill, chapter) {
  return EXAM_STRATEGIES_CHAPTER_COPY[`${skill}/${chapter}`] ?? null;
}
