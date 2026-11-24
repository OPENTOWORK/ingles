import { Suspense } from 'react';
import PracticeSsrHeading from '@/components/b2/PracticeSsrHeading';
import ExamReadingPracticeClient from '../exam-reading/ExamReadingPracticeClient';

export default function B2ReadingAndUseOfEnglishPage() {
  return (
    <>
      <PracticeSsrHeading
        title="B2 Reading and Use of English Practice"
        subtitle="Parts 1 to 7"
        note="Loading practice…"
      />
      <Suspense fallback={null}>
        <ExamReadingPracticeClient />
      </Suspense>
    </>
  );
}
