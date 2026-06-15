'use client';

import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import { isStudentRole } from '@/constants/studentFeatureAccess';
import { isStaffRole } from '@/lib/placementLevelAccess';
import { getLevelSkillNavLinks, skillRoutesMatch } from '@/data/nivelesLevelHub';

const SKILL_ICONS = {
  reading: '📘',
  writing: '✍️',
  listening: '🎧',
  speaking: '🗣️',
};

function SkillLockIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 10V8a5 5 0 0 1 10 0v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/**
 * @param {{ levelSlug: string, activeSkillRoute: string }} props
 */
export default function ExamPracticeSkillPicker({ levelSlug, activeSkillRoute }) {
  const { userRole } = useUserRole();
  const isStudent = isStudentRole(userRole) && !isStaffRole(userRole);
  const links = getLevelSkillNavLinks(levelSlug);

  if (!links.length) return null;

  return (
    <div className="exam-practice-skill-strip" role="navigation" aria-label="Exam skills">
      <span className="exam-practice-skill-strip__label">Skill</span>
      <ul className="exam-practice-skill-strip__list">
        {links.map((item) => {
          const isActive = skillRoutesMatch(activeSkillRoute, item.skillRoute);
          const locked = isStudent && !item.enabledForStudents;

          return (
            <li key={item.href}>
              {locked ? (
                <span
                  className={`exam-practice-skill-strip__pill exam-practice-skill-strip__pill--locked exam-practice-skill-strip__pill--${item.theme}`}
                  title="Coming soon"
                  aria-disabled="true"
                  aria-label={`${item.label} locked`}
                >
                  <SkillLockIcon />
                  <span className="exam-practice-skill-strip__icon" aria-hidden>
                    {SKILL_ICONS[item.theme] || '📋'}
                  </span>
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={`exam-practice-skill-strip__pill exam-practice-skill-strip__pill--${item.theme}${
                    isActive ? ' exam-practice-skill-strip__pill--active' : ''
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="exam-practice-skill-strip__icon" aria-hidden>
                    {SKILL_ICONS[item.theme] || '📋'}
                  </span>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
