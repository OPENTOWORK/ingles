import { Suspense } from 'react';
import PracticeSsrHeading from '@/components/b2/PracticeSsrHeading';
import B2WritingExamPracticePage from '@/components/b2/B2WritingExamPracticePage';

export default function B2WritingExamsPage() {
  return (
    <>
      <PracticeSsrHeading
        title="B2 Writing Practice"
        subtitle="B2 Writing — Parts 1 & 2"
        note="Loading B2 Writing…"
      />
      <Suspense fallback={null}>
        <B2WritingExamPracticePage />
      </Suspense>
    </>
  );
}
