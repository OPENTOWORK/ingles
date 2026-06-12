'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import PracticeReportError from '@/components/support/PracticeReportError';

export default function TheoryExerciseReportError({
  exerciseId = '',
  question = '',
  topicHref = '',
  cefrLevel = '',
}) {
  const pathname = usePathname();
  const canonicalTopic = topicHref || pathname || '';

  const subject = exerciseId
    ? `Theory exercise error (${String(exerciseId).slice(0, 8)}…)`
    : 'Theory exercise error';

  const contextLines = useMemo(
    () =>
      [
        `Topic: ${canonicalTopic}`,
        cefrLevel ? `Level: ${cefrLevel}` : null,
        exerciseId ? `Exercise ID: ${exerciseId}` : null,
        question ? `Question: ${question}` : null,
      ].filter(Boolean),
    [canonicalTopic, cefrLevel, exerciseId, question],
  );

  return (
    <PracticeReportError
      subject={subject}
      contextLines={contextLines}
      formId="theory-error-report"
      formLabel="What went wrong with this exercise?"
      placeholder="Describe the mistake (wrong answer, typo, unclear wording…)"
    />
  );
}
