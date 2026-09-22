'use client';

import Link from 'next/link';
import ExamSkillIcon from '@/components/exam/ExamSkillIcon';
import { useConfirmedUserRole } from '@/context/UserRoleContext';
import { usesStudentContentRestrictions } from '@/constants/studentFeatureAccess';
import { getLevelExamSkillRoute, getLevelSkillNavLinks } from '@/data/nivelesLevelHub';
import { nivelesPathToExamPractice } from '@/config/appRoutes';

const LEVEL_SLUG = 'b2';
const GUEST_LOGIN_HREF = '/login';

/**
 * Accesos a las skills de B2.
 * Solo visible por debajo de 640px (`.home-student-board` está oculto por defecto).
 * Sin sesión, cualquier skill lleva al login y la tarjeta se ve igual.
 */
export default function HomeStudentMobileBoard({ guest = false }) {
  const { roleConfirmed, userRole } = useConfirmedUserRole();
  const isStudent = usesStudentContentRestrictions(userRole);
  const skills = getLevelSkillNavLinks(LEVEL_SLUG);

  if ((!guest && !roleConfirmed) || !skills.length) return null;

  return (
    <section className="home-student-board">
      <nav className="home-student-board__skills" aria-label="Skills">
        <ul className="home-student-board__list">
          {skills.map((item) => {
            const label =
              getLevelExamSkillRoute(LEVEL_SLUG, item.skillRoute)?.section || item.label;
            const comingSoon = !item.enabledForStudents;
            const locked = !guest && isStudent && comingSoon;

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
                    href={guest ? GUEST_LOGIN_HREF : nivelesPathToExamPractice(item.href)}
                    className={`home-student-board__skill${comingSoon ? ' home-student-board__skill--locked' : ''}`}
                    data-skill={item.theme}
                    aria-label={comingSoon ? `${label}, coming soon` : undefined}
                  >
                    <ExamSkillIcon theme={item.theme} />
                    <span className="home-student-board__skill-label">{label}</span>
                    {comingSoon ? <span className="home-student-board__skill-note">Coming soon</span> : null}
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
