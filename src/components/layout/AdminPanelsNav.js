'use client';

import Link from 'next/link';
import { ADMIN_PANEL_MENU_ITEMS } from '@/config/appNavMenu';

/**
 * Desplegable de paneles staff (solo se muestra cuando el padre comprueba rol admin).
 */
export default function AdminPanelsNav({
  variant = 'desktop',
  open,
  onToggle,
  onClose,
  linkClassName = 'app-nav__link',
  dropdownItemClassName = 'app-nav__dropdown-item',
}) {
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
          Admin
          <span aria-hidden>{open ? '▲' : '▼'}</span>
        </button>
        {open ? (
          <div className="app-nav__sub" role="menu">
            {ADMIN_PANEL_MENU_ITEMS.map((item) => (
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
        Admin <span aria-hidden>▼</span>
      </button>
      {open ? (
        <div className="app-nav__dropdown" role="menu">
          {ADMIN_PANEL_MENU_ITEMS.map((item) => (
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
