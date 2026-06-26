'use client';

import { Suspense } from 'react';
import { useUserRole } from '@/context/UserRoleContext';
import { TeoriaGlobalStyles } from '@/components/theory/TeoriaStyles';
import ExamTheorySection from '@/components/niveles/ExamTheorySection';
import NivelesPageStyles from '@/components/niveles/NivelesPageStyles';
import { usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';

function ExamStrategiesInner() {
  const { session, userRole } = useUserRole();
  const isStudent = Boolean(session) && usesStudentContentRestrictions(userRole);

  return (
    <main className="shell niveles-page niveles-page--theory">
      <div className="sections">
        <ExamTheorySection
          userId={session?.user?.id}
          accessToken={session?.access_token}
          isStudent={isStudent}
        />
      </div>

      <NivelesPageStyles />
      <TeoriaGlobalStyles />
    </main>
  );
}

export default function ExamStrategiesPage() {
  return (
    <Suspense
      fallback={
        <main className="shell niveles-page" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading Exam Strategies…</p>
        </main>
      }
    >
      <ExamStrategiesInner />
    </Suspense>
  );
}
