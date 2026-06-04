'use client';

import Link from 'next/link';
import { getAdminPanelMenuItems } from '@/config/appNavMenu';

/**
 * Desplegable de paneles staff (items filtrados por rol en el padre).
 */
export default function AdminPanelsNav({
  variant = 'desktop',
  open,
  onToggle,
  onClose,
  linkClassName = 'app-nav__link',
  dropdownItemClassName = 'app-nav__dropdown-item',
  items,
  menuLabel = 'Admin',
}) {
  const menuItems = items?.length ? items : getAdminPanelMenuItems();
  const isMobile = variant === 'mobile';
  const buttonClass = isMobile
    ? `${linkClassName} app-nav__accordion${open ? ' is-open' : ''}`
    : `${linkClassName} app-nav__link--button${open ? ' is-active' : ''}`;

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          className={buttonClass}
          onClick={onToggle}
          aria-expanded={open}
        >
          {menuLabel}
          <span aria-hidden>{open ? '▲' : '▼'}</span>
        </button>
        {open ? (
          <div className="app-nav__sub" role="menu">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                role="menuitem"
                className={linkClassName}
                onClick={onClose}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="app-nav__dropdown-wrap">
      <button
        type="button"
        className={buttonClass}
        aria-expanded={open}
        onClick={onToggle}
      >
        {menuLabel} <span aria-hidden>▼</span>
      </button>
      {open ? (
        <div className="app-nav__dropdown" role="menu">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              className={dropdownItemClassName}
              onClick={onClose}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
