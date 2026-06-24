'use client';

import { useMemo } from 'react';
import { useUserRole } from '@/context/UserRoleContext';
import { useExamTheoryProgress } from '@/hooks/useExamTheoryProgress';
import { useTeoriaProgress } from '@/hooks/useTeoriaProgress';
import {
  getExamTheoryUnlockInfo,
  isExamTheorySectionSlug,
  isExamTheorySlugLocked,
} from '@/lib/examTheoryUnlock';
import {
  getTeoriaApartadoUnlockInfo,
  isTeoriaApartadoLocked,
  isTheorySectionSlug,
} from '@/lib/teoriaUnlock';
import { EXAM_THEORY_CATALOG, THEORY_SECTION_CATALOG } from '@/data/teoriaSections';
import ExamTheoryLockedNotice from '@/components/niveles/ExamTheoryLockedNotice';
import ExamTheoryTopicList from '@/components/theory/ExamTheoryTopicList';
import TheoryTopicList from '@/components/theory/TheoryTopicList';
import TeoriaTopicList from '@/components/theory/TeoriaTopicList';

export default function TeoriaSectionGate({ sectionSlug, sectionTitle, topics }) {
  const { userRole, session } = useUserRole();
  const isStudent = userRole === 'student' || userRole === 'alumno';
  const isExam = isExamTheorySectionSlug(sectionSlug);
  const isTheory = isTheorySectionSlug(sectionSlug);
  const examProgress = useExamTheoryProgress(
    isExam ? session?.user?.id : null,
    isExam ? session?.access_token : null,
  );
  const teoriaProgress = useTeoriaProgress(
    isTheory ? session?.user?.id : null,
    isTheory ? session?.access_token : null,
  );

  const examMeta = useMemo(
    () => EXAM_THEORY_CATALOG.find((area) => area.slug === sectionSlug),
    [sectionSlug],
  );
  const theoryMeta = useMemo(
    () => THEORY_SECTION_CATALOG.find((area) => area.slug === sectionSlug),
    [sectionSlug],
  );

  if (isExam) {
    const unitLocked =
      isStudent && isExamTheorySlugLocked(sectionSlug, examProgress.units, true);
    if (unitLocked) {
      const info = getExamTheoryUnlockInfo(sectionSlug, examProgress.units, true);
      return (
        <ExamTheoryLockedNotice
          requiredPartName={info?.requiredPrevious}
          partNumber={info?.partNumber}
        />
      );
    }
    return (
      <ExamTheoryTopicList
        sectionSlug={sectionSlug}
        sectionTitle={sectionTitle}
        sectionDescription={examMeta?.description}
        sectionAccent={examMeta?.accent}
        sectionHeroAccent={examMeta?.heroAccent}
        topics={topics}
      />
    );
  }

  if (isTheory) {
    const apartadoLocked =
      isStudent && isTeoriaApartadoLocked(sectionSlug, teoriaProgress.units, true);
    if (apartadoLocked) {
      const info = getTeoriaApartadoUnlockInfo(sectionSlug, teoriaProgress.units, true);
      return (
        <ExamTheoryLockedNotice
          requiredPartName={info?.requiredPrevious}
          partNumber={info?.partNumber}
          backHref="/teoria"
          backLabel="Back to Theory"
        />
      );
    }
    return (
      <TheoryTopicList
        sectionSlug={sectionSlug}
        sectionTitle={sectionTitle}
        sectionDescription={theoryMeta?.description}
        sectionAccent={theoryMeta?.accent}
        topics={topics}
      />
    );
  }

  return <TeoriaTopicList sectionTitle={sectionTitle} topics={topics} />;
}
