'use client';

import Link from 'next/link';
import ExamSkillIcon from '@/components/exam/ExamSkillIcon';
import { useConfirmedUserRole } from '@/context/UserRoleContext';
import { usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';
import { getLevelExamSkillRoute, getLevelSkillNavLinks } from '@/data/nivelesLevelHub';
import { APP_ROUTES, nivelesPathToExamPractice } from '@/config/appRoutes';
import { studyTrackRecordProfileHref } from '@/lib/studyTrackRecord';

const LEVEL_SLUG = 'b2';

/**
 * Acción principal, skills de B2 y progreso para el alumno.
 * Solo visible por debajo de 640px (`.home-student-board` está oculto por defecto).
 */
export default function HomeStudentMobileBoard() {
  const { roleConfirmed, userRole } = useConfirmedUserRole();
  const isStudent = usesStudentContentRestrictions(userRole);
  const skills = getLevelSkillNavLinks(LEVEL_SLUG);

  if (!roleConfirmed || !skills.length) return null;

  return (
    <section className="home-student-board">
      <Link
        href={APP_ROUTES.examPracticeDefaultLevel}
        className="home-cta__btn home-student-board__cta"
      >
        Start practising
      </Link>

      <nav className="home-student-board__skills" aria-labelledby="home-student-board-title">
        <h2 id="home-student-board-title" className="home-student-board__title">
          B2 practice
        </h2>
        <ul className="home-student-board__list">
          {skills.map((item) => {
            const label =
              getLevelExamSkillRoute(LEVEL_SLUG, item.skillRoute)?.section || item.label;
            const locked = isStudent && !item.enabledForStudents;

            return (
              <li key={item.href}>
                {locked ? (
                  <span
                    className="home-student-board__skill home-student-board__skill--locked"
                    aria-disabled="true"
                    aria-label={`${label} locked`}
                  >
                    <ExamSkillIcon theme={item.theme} />
                    <span className="home-student-board__skill-label">{label}</span>
                    <span className="home-student-board__skill-note">Coming soon</span>
                  </span>
                ) : (
                  <Link
                    href={nivelesPathToExamPractice(item.href)}
                    className="home-student-board__skill"
                  >
                    <ExamSkillIcon theme={item.theme} />
                    <span className="home-student-board__skill-label">{label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <Link href={studyTrackRecordProfileHref()} className="home-student-board__progress">
        Progress
      </Link>
    </section>
  );
}
