'use client';

import Link from 'next/link';
import { useUserRole } from '@/context/UserRoleContext';
import { isAdminRole } from '@/utils/authRoles';
import { HOME_QUICK_LINKS, HOME_THEORY_LINK } from '@/config/appNavMenu';

export default function HomeQuickNav() {
  const { userRole } = useUserRole();
  const isStudent = userRole === 'student' || userRole === 'alumno';
  const showTheory = isAdminRole(userRole);
  const showQuickLinks = !isStudent;
  const links = [
    ...(showTheory ? [HOME_THEORY_LINK] : []),
    ...(showQuickLinks ? HOME_QUICK_LINKS : []),
  ];

  if (links.length === 0) return null;

  return (
    <nav className="home-quick-nav" aria-label="Theory, placement test, training and plans">
      <ul className="home-quick-nav__list">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="home-quick-nav__link"
              {...(item.tourId ? { 'data-tour': item.tourId } : {})}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
