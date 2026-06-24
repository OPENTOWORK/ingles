'use client';

import NavLink from '@/components/layout/NavLink';
import { DRALO_MENU_ITEMS, getGuestLoginHref } from '@/config/appNavMenu';

/**
 * Ítems del menú Dralo AI (desktop dropdown, móvil o menú lateral).
 * @param {'desktop' | 'mobile' | 'side'} variant
 */
export function DraloAiNavMenuItems({
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
      {DRALO_MENU_ITEMS.map((item) => {
        if (guestRequiresLogin) {
          return (
            <NavLink
              key={item.href}
              href={getGuestLoginHref(item.href)}
              role="menuitem"
              className={itemClass}
              onClick={onNavigate}
            >
              {item.label}
            </NavLink>
          );
        }

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
            href={item.href}
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

export function DraloAiComingSoonRibbon() {
  return (
    <span className="app-nav__coming-soon-ribbon" role="status" aria-live="polite">
      Coming soon
    </span>
  );
}
