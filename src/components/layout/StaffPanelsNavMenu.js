'use client';

import NavLink from '@/components/layout/NavLink';

/**
 * Sub-ítems del menú Admin / Paneles (dropdown desktop, acordeón móvil / lateral).
 * @param {'desktop' | 'mobile' | 'side'} variant
 */
export function StaffPanelsNavMenuItems({
  items = [],
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
      {items.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
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
