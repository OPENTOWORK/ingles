'use client';

import { useState } from 'react';
import NavLink from '@/components/layout/NavLink';
import { STAFF_PANELS_HUB_PATH } from '@/config/staffPanelHub';
import { StaffPanelsNavMenuItems } from '@/components/layout/StaffPanelsNavMenu';

/**
 * Admin / Paneles: mismo patrón hover que Exam Strategies y Dralo AI (desktop)
 * y acordeón en móvil / menú lateral.
 */
export default function AdminPanelsNav({
  variant = 'desktop',
  open = false,
  onToggle,
  onNavigate,
  items = [],
  menuLabel = 'Admin',
  isActive = false,
  linkClassName = 'app-nav__link',
}) {
  const [hoverOpen, setHoverOpen] = useState(false);

  if (variant === 'mobile' || variant === 'side') {
    return (
      <>
        <button
          type="button"
          className={`${linkClassName} app-nav__accordion${open ? ' is-open' : ''}`}
          onClick={onToggle}
          aria-expanded={open}
        >
          {menuLabel}
          <span aria-hidden>{open ? '▲' : '▼'}</span>
        </button>
        {open ? (
          <div className="app-nav__sub">
            <StaffPanelsNavMenuItems
              items={items}
              variant={variant}
              onNavigate={onNavigate}
            />
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div
      className={`app-nav__dropdown-wrap app-nav__dropdown-wrap--hover app-nav__dropdown-wrap--account${
        hoverOpen ? ' is-hover-open' : ''
      }`}
      onMouseEnter={() => setHoverOpen(true)}
      onMouseLeave={() => setHoverOpen(false)}
    >
      <NavLink
        href={STAFF_PANELS_HUB_PATH}
        className={`${linkClassName} app-nav__link--has-menu${isActive ? ' is-active' : ''}`}
        onClick={onNavigate}
      >
        {menuLabel}
        <span className="app-nav__chevron" aria-hidden>
          ▾
        </span>
      </NavLink>
      <div className="app-nav__dropdown app-nav__dropdown--hover app-nav__dropdown--account" role="menu">
        <StaffPanelsNavMenuItems
          items={items}
          variant="desktop"
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
