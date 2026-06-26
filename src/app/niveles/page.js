'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUserRole } from '@/context/UserRoleContext';
import { TeoriaGlobalStyles } from '@/components/theory/TeoriaStyles';
import ExamTheorySection from '@/components/niveles/ExamTheorySection';
import NivelesPageStyles from '@/components/niveles/NivelesPageStyles';
import { APP_ROUTES } from '@/config/appRoutes';
import { usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';

function NivelesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, userRole } = useUserRole();
  const isStudent = Boolean(session) && usesStudentContentRestrictions(userRole);
  const isTheoryView = searchParams.get('tab') === 'theory';

  useEffect(() => {
    if (isTheoryView) return;
    if (typeof window !== 'undefined' && window.location.hash === '#exam-theory') {
      router.replace(APP_ROUTES.examStrategies, { scroll: false });
      return;
    }
    router.replace(APP_ROUTES.examPracticeDefaultLevel);
  }, [isTheoryView, router]);

  if (!isTheoryView) {
    return (
      <main className="shell niveles-page center">
        <div className="loader" aria-hidden />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Opening exam practice…</p>
        <NivelesPageStyles />
      </main>
    );
  }

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

export default function Niveles() {
  return (
    <Suspense
      fallback={
        <main className="shell niveles-page" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Loading levels…</p>
        </main>
      }
    >
      <NivelesInner />
    </Suspense>
  );
}
