'use client';

import { usePathname } from 'next/navigation';
import ExamStrategiesArticle from '@/components/theory/ExamStrategiesArticle';
import GuestRegisterTeaser from '@/components/auth/GuestRegisterTeaser';
import { examStrategiesSkillPath } from '@/config/appRoutes';
import { useUserRole } from '@/context/UserRoleContext';
import { isGuestExamStrategiesChapterAllowed } from '@/lib/guestPreviewAccess';

export default function ExamStrategiesChapterView({ skill, title, intro, content }) {
  const pathname = usePathname();
  const { session } = useUserRole();
  const sectionBackHref = examStrategiesSkillPath(skill);

  if (!session && !isGuestExamStrategiesChapterAllowed(pathname)) {
    return (
      <main className="shell content-hub-shell teoria-page exam-strategies-chapter-page">
        <GuestRegisterTeaser
          nextHref={pathname}
          message="Create a free account to read the rest of Exam Strategies."
        />
      </main>
    );
  }

  return (
    <ExamStrategiesArticle
      skillSlug={skill}
      title={title}
      intro={intro}
      content={content}
      backHref={sectionBackHref}
      backLabel="Back"
    />
  );
}
