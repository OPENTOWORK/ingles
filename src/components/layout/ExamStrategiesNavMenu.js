'use client';

import NavLink from '@/components/layout/NavLink';
import { EXAM_STRATEGIES_MENU_ITEMS, getGuestLoginHref } from '@/config/appNavMenu';

/**
 * Sub-ítems de Exam Strategies (dropdown desktop, acordeón móvil / lateral).
 * @param {'desktop' | 'mobile' | 'side'} variant
 */
export function ExamStrategiesNavMenuItems({
  guestRequiresLogin = false,
  variant = 'desktop',
  onNavigate,
}) {
  const itemClass =
    variant === 'side'
      ? 'app-side-menu__link'
      : variant === 'mobile'
        ? 'app-nav__link app-nav__link--mobile'
        : 'app-nav__dropdown-item';

  return (
    <>
      {EXAM_STRATEGIES_MENU_ITEMS.map((item) => (
        <NavLink
          key={item.href}
          href={guestRequiresLogin ? getGuestLoginHref(item.href) : item.href}
          role="menuitem"
          className={itemClass}
          onClick={onNavigate}
        >
          {item.label}
        </NavLink>
      ))}
    </>
  );
}
