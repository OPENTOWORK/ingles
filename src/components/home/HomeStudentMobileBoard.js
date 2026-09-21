'use client';

import Link from 'next/link';
import ExamSkillIcon from '@/components/exam/ExamSkillIcon';
import { useConfirmedUserRole } from '@/context/UserRoleContext';
import { usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';
import { getLevelExamSkillRoute, getLevelSkillNavLinks } from '@/data/nivelesLevelHub';
import { nivelesPathToExamPractice } from '@/config/appRoutes';

const LEVEL_SLUG = 'b2';

/**
 * Accesos a las skills de B2 para el alumno.
 * Solo visible por debajo de 640px (`.home-student-board` está oculto por defecto).
 */
export default function HomeStudentMobileBoard() {
  const { roleConfirmed, userRole } = useConfirmedUserRole();
  const isStudent = usesStudentContentRestrictions(userRole);
  const skills = getLevelSkillNavLinks(LEVEL_SLUG);

  if (!roleConfirmed || !skills.length) return null;

  return (
    <section className="home-student-board">
      <nav className="home-student-board__skills" aria-label="Skills">
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
                    data-skill={item.theme}
                    aria-disabled="true"
                    aria-label={`${label}, coming soon`}
                  >
                    <ExamSkillIcon theme={item.theme} />
                    <span className="home-student-board__skill-label">{label}</span>
                    <span className="home-student-board__skill-note">Coming soon</span>
                  </span>
                ) : (
                  <Link
                    href={nivelesPathToExamPractice(item.href)}
                    className="home-student-board__skill"
                    data-skill={item.theme}
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
    </section>
  );
}
