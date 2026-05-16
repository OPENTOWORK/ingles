'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ROLE_ROUTE_MAP } from '@/utils/authRoles';

const DRALO_MENU_ITEMS = [
  { label: 'Use of English', href: '/dralo-ai/use-of-english' },
  { label: 'Reading', href: '/dralo-ai/reading' },
  { label: 'Writing', href: '/dralo-ai/writing' },
  { label: 'Listening', href: '/dralo-ai/listening' },
  { label: 'Speaking', href: '/speaking' },
];

const MAIN_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/teoria', label: 'Theory' },
  { href: '/niveles', label: 'Levels' },
  { href: '/prueba-nivel', label: 'Placement Test' },
  { href: '/training', label: 'Training' },
  { href: '/contacto', label: 'Contact' },
];

const ROLE_LABELS = {
  admin: 'Admin',
  administrador: 'Admin',
  teacher: 'Teacher',
  profesor: 'Teacher',
  soporte: 'Support',
  informatico: 'IT',
  centro_empresa: 'Centre',
  'centro/empresa': 'Centre',
  clases_grupos: 'Classes',
  'clases/grupos': 'Classes',
};

const STAFF_ROLES = new Set([
  'admin',
  'administrador',
  'teacher',
  'profesor',
  'soporte',
  'informatico',
  'centro_empresa',
  'centro/empresa',
  'clases_grupos',
  'clases/grupos',
]);

function getRoleLink(userRole) {
  const entry = Object.entries(ROLE_ROUTE_MAP).find(
    ([role]) => STAFF_ROLES.has(role) && role === userRole
  );
  if (!entry) return null;
  const [role, href] = entry;
  return { href, label: ROLE_LABELS[role] || 'Panel' };
}

export default function AppNav({ session, userRole, onLogout }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [draloOpen, setDraloOpen] = useState(false);
  const [draloDesktopOpen, setDraloDesktopOpen] = useState(false);

  const staffLink = getRoleLink(userRole);

  useEffect(() => {
    document.body.classList.toggle('nav-open', mobileOpen);
    return () => document.body.classList.remove('nav-open');
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setDraloOpen(false);
    setDraloDesktopOpen(false);
  }, [pathname]);

  const closeMobile = () => {
    setMobileOpen(false);
    setDraloOpen(false);
  };

  const mobileLinkClass = 'app-nav__link app-nav__link--mobile';

  return (
    <>
      <button
        type="button"
        className="app-nav__toggle"
        aria-expanded={mobileOpen}
        aria-controls="app-mobile-nav"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMobileOpen((open) => !open)}
      >
        <span className="app-nav__toggle-bar" />
        <span className="app-nav__toggle-bar" />
        <span className="app-nav__toggle-bar" />
      </button>

      <nav className="app-nav app-nav--desktop" aria-label="Main navigation">
        {MAIN_LINKS.map((item) => (
          <Link key={item.href} href={item.href} className="app-nav__link">
            {item.label}
          </Link>
        ))}

        <div className="app-nav__dropdown-wrap">
          <button
            type="button"
            className={`app-nav__link app-nav__link--button${draloDesktopOpen ? ' is-active' : ''}`}
            aria-expanded={draloDesktopOpen}
            onClick={() => setDraloDesktopOpen((v) => !v)}
          >
            Dralo AI <span aria-hidden>▼</span>
          </button>
          {draloDesktopOpen ? (
            <div className="app-nav__dropdown" role="menu">
              {DRALO_MENU_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className="app-nav__dropdown-item"
                  onClick={() => setDraloDesktopOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {session ? (
          <>
            {staffLink ? (
              <Link href={staffLink.href} className="app-nav__link">
                {staffLink.label}
              </Link>
            ) : null}
            <Link href="/perfil" className="app-nav__link">
              Profile
            </Link>
            <button type="button" className="app-nav__btn" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="app-nav__btn app-nav__btn--ghost">
            Login
          </Link>
        )}
      </nav>

      <button
        type="button"
        className={`app-nav__backdrop${mobileOpen ? ' is-visible' : ''}`}
        aria-hidden={!mobileOpen}
        tabIndex={mobileOpen ? 0 : -1}
        onClick={closeMobile}
      />

      <aside
        id="app-mobile-nav"
        className={`app-nav__drawer${mobileOpen ? ' is-open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        <div className="app-nav__drawer-head">
          <span className="app-nav__drawer-title">Menu</span>
          <button type="button" className="app-nav__drawer-close" onClick={closeMobile} aria-label="Close">
            ✕
          </button>
        </div>

        <nav className="app-nav__drawer-nav" aria-label="Mobile navigation">
          {MAIN_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className={mobileLinkClass} onClick={closeMobile}>
              {item.label}
            </Link>
          ))}

          <button
            type="button"
            className={`${mobileLinkClass} app-nav__accordion${draloOpen ? ' is-open' : ''}`}
            onClick={() => setDraloOpen((v) => !v)}
            aria-expanded={draloOpen}
          >
            Dralo AI
            <span aria-hidden>{draloOpen ? '▲' : '▼'}</span>
          </button>
          {draloOpen ? (
            <div className="app-nav__sub">
              {DRALO_MENU_ITEMS.map((item) => (
                <Link key={item.href} href={item.href} className={mobileLinkClass} onClick={closeMobile}>
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}

          {session ? (
            <>
              {staffLink ? (
                <Link href={staffLink.href} className={mobileLinkClass} onClick={closeMobile}>
                  {staffLink.label}
                </Link>
              ) : null}
              <Link href="/perfil" className={mobileLinkClass} onClick={closeMobile}>
                Profile
              </Link>
              <button
                type="button"
                className="app-nav__btn app-nav__btn--mobile"
                onClick={() => {
                  closeMobile();
                  onLogout();
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="app-nav__btn app-nav__btn--mobile" onClick={closeMobile}>
              Login
            </Link>
          )}
        </nav>
      </aside>
    </>
  );
}
