'use client';

import NavLink from '@/components/layout/NavLink';
import { EXAM_STRATEGIES_MENU_ITEMS, getGuestLoginHref } from '@/config/appNavMenu';
import { DraloAiComingSoonRibbon } from '@/components/layout/DraloAiNavMenu';

/**
 * Sub-ítems de Exam Strategies (dropdown desktop, acordeón móvil / lateral).
 * @param {'desktop' | 'mobile' | 'side'} variant
 */
export function ExamStrategiesNavMenuItems({
  locked = false,
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
      {EXAM_STRATEGIES_MENU_ITEMS.map((item) => {
        if (locked) {
          return (
            <span
              key={item.href}
              className={`${itemClass} app-nav__dropdown-item--locked`}
              role="menuitem"
              aria-disabled="true"
            >
              {item.label}
            </span>
          );
        }

        return (
          <NavLink
            key={item.href}
            href={guestRequiresLogin ? getGuestLoginHref(item.href) : item.href}
            role="menuitem"
            className={itemClass}
            onClick={onNavigate}
          >
            {item.label}
          </NavLink>
        );
      })}
    </>
  );
}

export function ExamStrategiesComingSoonRibbon() {
  return <DraloAiComingSoonRibbon />;
}
