import { redirect } from 'next/navigation';

/** Temporary: skip level picker during alpha — B2 exam mode only. */
export default function ExamModeLevelPage() {
  redirect('/niveles/b2/exam-mode');
}
