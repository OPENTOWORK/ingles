'use client';

import NavLink from '@/components/layout/NavLink';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAdminRole, ROLE_ROUTE_MAP } from '@/utils/authRoles';
import AdminPanelsNav from '@/components/layout/AdminPanelsNav';
import {
  DRALO_MENU_ITEMS,
  NAV_LINK_CONTACT,
  NAV_LINKS_BEFORE_DRALO,
} from '@/config/appNavMenu';

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
  const [adminPanelsOpen, setAdminPanelsOpen] = useState(false);
  const [adminPanelsMobileOpen, setAdminPanelsMobileOpen] = useState(false);

  const staffLink = getRoleLink(userRole);
  const showAdminDropdown = Boolean(session && isAdminRole(userRole));
  const showStaffLink = Boolean(staffLink && !showAdminDropdown);

  useEffect(() => {
    document.body.classList.toggle('nav-open', mobileOpen);
    return () => document.body.classList.remove('nav-open');
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setDraloOpen(false);
    setDraloDesktopOpen(false);
    setAdminPanelsOpen(false);
    setAdminPanelsMobileOpen(false);
  }, [pathname]);

  const closeMobile = () => {
    setMobileOpen(false);
    setDraloOpen(false);
    setAdminPanelsMobileOpen(false);
  };

  const closeDesktopDropdowns = () => {
    setDraloDesktopOpen(false);
    setAdminPanelsOpen(false);
  };

  const toggleDraloDesktop = () => {
    setDraloDesktopOpen((open) => {
      if (!open) setAdminPanelsOpen(false);
      return !open;
    });
  };

  const toggleAdminDesktop = () => {
    setAdminPanelsOpen((open) => {
      if (!open) setDraloDesktopOpen(false);
      return !open;
    });
  };

  const toggleDraloMobile = () => {
    setDraloOpen((open) => {
      if (!open) setAdminPanelsMobileOpen(false);
      return !open;
    });
  };

  const toggleAdminMobile = () => {
    setAdminPanelsMobileOpen((open) => {
      if (!open) setDraloOpen(false);
      return !open;
    });
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
        {NAV_LINKS_BEFORE_DRALO.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            className="app-nav__link"
            onClick={closeDesktopDropdowns}
            {...(item.tourId ? { 'data-tour': item.tourId } : {})}
          >
            {item.label}
          </NavLink>
        ))}

        <div className="app-nav__dropdown-wrap">
          <button
            type="button"
            className={`app-nav__link app-nav__link--button${draloDesktopOpen ? ' is-active' : ''}`}
            aria-expanded={draloDesktopOpen}
            onClick={toggleDraloDesktop}
          >
            Dralo AI <span aria-hidden>▼</span>
          </button>
          {draloDesktopOpen ? (
            <div className="app-nav__dropdown" role="menu">
              {DRALO_MENU_ITEMS.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className="app-nav__dropdown-item"
                  onClick={closeDesktopDropdowns}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          ) : null}
        </div>

        <NavLink href={NAV_LINK_CONTACT.href} className="app-nav__link" onClick={closeDesktopDropdowns}>
          {NAV_LINK_CONTACT.label}
        </NavLink>

        {session ? (
          <>
            {showAdminDropdown ? (
              <AdminPanelsNav
                variant="desktop"
                open={adminPanelsOpen}
                onToggle={toggleAdminDesktop}
                onClose={closeDesktopDropdowns}
              />
            ) : null}
            {showStaffLink ? (
              <NavLink href={staffLink.href} className="app-nav__link" onClick={closeDesktopDropdowns}>
                {staffLink.label}
              </NavLink>
            ) : null}
            <NavLink href="/perfil" className="app-nav__link" onClick={closeDesktopDropdowns}>
              Profile
            </NavLink>
            <button
              type="button"
              className="app-nav__btn"
              onClick={() => {
                closeDesktopDropdowns();
                onLogout();
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <NavLink href="/login" className="app-nav__btn app-nav__btn--ghost" onClick={closeDesktopDropdowns}>
            Login
          </NavLink>
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
          {NAV_LINKS_BEFORE_DRALO.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className={mobileLinkClass}
              onClick={closeMobile}
              {...(item.tourId ? { 'data-tour': item.tourId } : {})}
            >
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            className={`${mobileLinkClass} app-nav__accordion${draloOpen ? ' is-open' : ''}`}
            onClick={toggleDraloMobile}
            aria-expanded={draloOpen}
          >
            Dralo AI
            <span aria-hidden>{draloOpen ? '▲' : '▼'}</span>
          </button>
          {draloOpen ? (
            <div className="app-nav__sub">
              {DRALO_MENU_ITEMS.map((item) => (
                <NavLink key={item.href} href={item.href} className={mobileLinkClass} onClick={closeMobile}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ) : null}

          <NavLink href={NAV_LINK_CONTACT.href} className={mobileLinkClass} onClick={closeMobile}>
            {NAV_LINK_CONTACT.label}
          </NavLink>

          {session ? (
            <>
              {showAdminDropdown ? (
                <AdminPanelsNav
                  variant="mobile"
                  open={adminPanelsMobileOpen}
                  onToggle={toggleAdminMobile}
                  onClose={closeMobile}
                  linkClassName={mobileLinkClass}
                />
              ) : null}
              {showStaffLink ? (
                <NavLink href={staffLink.href} className={mobileLinkClass} onClick={closeMobile}>
                  {staffLink.label}
                </NavLink>
              ) : null}
              <NavLink href="/perfil" className={mobileLinkClass} onClick={closeMobile}>
                Profile
              </NavLink>
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
            <NavLink href="/login" className="app-nav__btn app-nav__btn--mobile" onClick={closeMobile}>
              Login
            </NavLink>
          )}
        </nav>
      </aside>
    </>
  );
}
