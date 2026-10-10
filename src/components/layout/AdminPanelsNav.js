'use client';

import NavLink from '@/components/layout/NavLink';
import { STAFF_PANELS_HUB_PATH } from '@/config/staffPanelHub';

/** Enlace directo a /paneles. Sin desplegable ni acordeón. */
export default function AdminPanelsNav({
  onNavigate,
  menuLabel = 'Paneles',
  isActive = false,
  linkClassName = 'app-nav__link',
}) {
  return (
    <NavLink
      href={STAFF_PANELS_HUB_PATH}
      className={`${linkClassName}${isActive ? ' is-active' : ''}`}
      onClick={onNavigate}
    >
      {menuLabel}
    </NavLink>
  );
}
