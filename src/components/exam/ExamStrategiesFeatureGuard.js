'use client';

import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import { isExamStrategiesLockedForUser } from '@/constants/studentFeatureAccess';

export function ExamStrategiesBlockedScreen() {
  return (
    <main className="shell niveles-page" style={{ padding: '2rem 1.5rem', maxWidth: 520 }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.75rem' }}>
        Coming soon
      </h1>
      <p style={{ color: '#4b5563', lineHeight: 1.6, marginBottom: '1rem' }}>
        Exam Strategies is not available for students yet. Keep practising in{' '}
        <strong>Exam practice</strong> while we finish preparing tips and strategies for you.
      </p>
      <Link href="/exam-practice/b2" className="home-cta__btn home-cta__btn--inline">
        Go to Exam practice
      </Link>
    </main>
  );
}

/**
 * Blocks Exam Strategies routes for students (staff roles keep access).
 */
export default function ExamStrategiesFeatureGuard({ children }) {
  const { userRole, session } = useUserRole();
  const locked = Boolean(session) && isExamStrategiesLockedForUser(userRole);

  if (locked) {
    return <ExamStrategiesBlockedScreen />;
  }

  return children;
}
