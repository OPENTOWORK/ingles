'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import PracticeReportError from '@/components/support/PracticeReportError';

function resolveModeLabel({ examModeActive, reviewMode, practiceMode }) {
  if (examModeActive && reviewMode) return 'Exam mode (review)';
  if (examModeActive) return 'Exam mode';
  if (practiceMode) return practiceMode;
  return 'Part practice';
}

function buildSubject({ questionId, partNumber, sectionTitle, hub }) {
  if (hub && sectionTitle) return `Exam mode error — ${sectionTitle}`;
  if (questionId) return `Exam practice error (${String(questionId).slice(0, 8)}…)`;
  if (partNumber) return `Exam practice error — Part ${partNumber}`;
  return 'Exam practice error';
}

/**
 * @param {object} props
 * @param {object} props.context
 */
export default function ExamPracticeReportError({ context = {} }) {
  const pathname = usePathname();

  const {
    levelSlug,
    skillRoute,
    partNumber,
    examSlot,
    practiceMode,
    examModeActive,
    reviewMode,
    questionId,
    questionText,
    sectionTitle,
    url,
    hub,
  } = context;

  const subject = buildSubject({ questionId, partNumber, sectionTitle, hub });

  const contextLines = useMemo(
    () =>
      [
        `Page: ${url || pathname || ''}`,
        levelSlug ? `Level: ${String(levelSlug).toUpperCase()}` : null,
        skillRoute ? `Skill: ${skillRoute}` : null,
        sectionTitle ? `Section: ${sectionTitle}` : null,
        partNumber ? `Part: ${partNumber}` : null,
        examSlot ? `Exam slot: ${examSlot}` : null,
        `Mode: ${resolveModeLabel({ examModeActive, reviewMode, practiceMode })}`,
        questionId ? `Question ID: ${questionId}` : null,
        questionText ? `Question: ${questionText}` : null,
      ].filter(Boolean),
    [
      url,
      pathname,
      levelSlug,
      skillRoute,
      sectionTitle,
      partNumber,
      examSlot,
      examModeActive,
      reviewMode,
      practiceMode,
      questionId,
      questionText,
    ],
  );

  const formId = `exam-practice-error-${partNumber || sectionTitle || 'hub'}-${examSlot || '0'}`;

  return (
    <PracticeReportError
      subject={subject}
      contextLines={contextLines}
      formId={formId}
      formLabel={
        hub
          ? 'What went wrong with this exam section?'
          : 'What went wrong with this exam practice?'
      }
      placeholder="Describe the mistake (wrong answer, typo, audio issue, unclear wording…)"
    />
  );
}
