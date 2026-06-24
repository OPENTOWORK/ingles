'use client';

import { useMemo } from 'react';
import { useUserRole } from '@/context/UserRoleContext';
import { useExamTheoryProgress } from '@/hooks/useExamTheoryProgress';
import {
  getExamTheoryUnlockInfo,
  isExamTheorySectionSlug,
  isExamTheorySlugLocked,
} from '@/lib/examTheoryUnlock';
import { EXAM_THEORY_CATALOG } from '@/data/teoriaSections';
import ExamTheoryLockedNotice from '@/components/niveles/ExamTheoryLockedNotice';
import ExamTheoryTopicList from '@/components/theory/ExamTheoryTopicList';
import TeoriaTopicList from '@/components/theory/TeoriaTopicList';

export default function ExamTheorySectionGate({ sectionSlug, sectionTitle, topics }) {
  const { userRole, session } = useUserRole();
  const isStudent = userRole === 'student' || userRole === 'alumno';
  const { units } = useExamTheoryProgress(
    session?.user?.id,
    session?.access_token,
  );

  const sectionMeta = useMemo(
    () => EXAM_THEORY_CATALOG.find((area) => area.slug === sectionSlug),
    [sectionSlug],
  );

  const isExamSection = isExamTheorySectionSlug(sectionSlug);
  const unitLocked =
    isStudent && isExamSection && isExamTheorySlugLocked(sectionSlug, units, true);

  if (unitLocked) {
    const info = getExamTheoryUnlockInfo(sectionSlug, units, true);
    return (
      <ExamTheoryLockedNotice
        requiredPartName={info?.requiredPrevious}
        partNumber={info?.partNumber}
      />
    );
  }

  if (isExamSection) {
    return (
      <ExamTheoryTopicList
        sectionSlug={sectionSlug}
        sectionTitle={sectionTitle}
        sectionDescription={sectionMeta?.description}
        sectionAccent={sectionMeta?.accent}
        sectionHeroAccent={sectionMeta?.heroAccent}
        topics={topics}
      />
    );
  }

  return <TeoriaTopicList sectionTitle={sectionTitle} topics={topics} />;
}
