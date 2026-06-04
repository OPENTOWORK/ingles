'use client';

import NavLink from '@/components/layout/NavLink';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUserRole } from '@/context/UserRoleContext';
import { isAdminRole } from '@/utils/authRoles';
import {
  DRALO_MENU_ITEMS,
  getStaffPanelMenuItemsForRole,
  getStaffPanelMenuLabel,
  NAV_LINK_CONTACT,
  HOME_MAIN_LINKS,
  NAV_LINKS_BEFORE_DRALO,
} from '@/config/appNavMenu';
import { performLogout } from '@/utils/logout';

/**
 * Menú lateral derecho desplegable (fondo blanco). No desplaza el contenido de la página.
 */
export default function AppSideMenuPanel({ defaultOpen = true }) {
  const pathname = usePathname();
  const { userRole, session } = useUserRole();
  const [open, setOpen] = useState(defaultOpen);
  const [draloOpen, setDraloOpen] = useState(false);
  const [adminPanelsOpen, setAdminPanelsOpen] = useState(false);
  const staffMenuItems = session ? getStaffPanelMenuItemsForRole(userRole) : [];
  const staffMenuLabel = getStaffPanelMenuLabel(userRole);
  const showStaffDropdown = staffMenuItems.length > 1;
  const showStaffSingleLink = staffMenuItems.length === 1;
  const showAdminHomeLinks = isAdminRole(userRole);
  const linkClass = 'app-side-menu__link';

  useEffect(() => {
    setDraloOpen(false);
    setAdminPanelsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.add('has-home-side-menu');
    return () => document.body.classList.remove('has-home-side-menu');
  }, []);

  const handleLogout = () => {
    void performLogout();
  };

  return (
    <aside
      className={`app-side-menu${open ? ' app-side-menu--open' : ' app-side-menu--collapsed'}`}
      aria-label="Site menu"
    >
      <button
        type="button"
        className="app-side-menu__tab"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="app-side-menu-panel"
      >
        <span className="app-side-menu__tab-label">{open ? '›' : '☰ Menu'}</span>
      </button>

      <div
        id="app-side-menu-panel"
        className="app-side-menu__panel"
        aria-hidden={!open}
      >
        <div className="app-side-menu__head">
          <span className="app-side-menu__title">Menu</span>
          <button
            type="button"
            className="app-side-menu__close"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="app-side-menu__nav">
          {showAdminHomeLinks
            ? HOME_MAIN_LINKS.map((item) => (
                <NavLink key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </NavLink>
              ))
            : null}
          {NAV_LINKS_BEFORE_DRALO.map((item) => (
            <NavLink key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            className={`${linkClass} app-side-menu__accordion${draloOpen ? ' is-open' : ''}`}
            onClick={() => setDraloOpen((v) => !v)}
            aria-expanded={draloOpen}
          >
            Dralo AI
            <span aria-hidden>{draloOpen ? '▲' : '▼'}</span>
          </button>
          {draloOpen ? (
            <div className="app-side-menu__sub">
              {DRALO_MENU_ITEMS.map((item) => (
                <NavLink key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ) : null}

          <NavLink href={NAV_LINK_CONTACT.href} className={linkClass}>
            {NAV_LINK_CONTACT.label}
          </NavLink>

          {session ? (
            <>
              {showStaffDropdown ? (
                <>
                  <button
                    type="button"
                    className={`${linkClass} app-side-menu__accordion${adminPanelsOpen ? ' is-open' : ''}`}
                    onClick={() => setAdminPanelsOpen((v) => !v)}
                    aria-expanded={adminPanelsOpen}
                  >
                    {staffMenuLabel}
                    <span aria-hidden>{adminPanelsOpen ? '▲' : '▼'}</span>
                  </button>
                  {adminPanelsOpen ? (
                    <div className="app-side-menu__sub">
                      {staffMenuItems.map((item) => (
                        <NavLink key={item.href} href={item.href} className={linkClass}>
                          {item.label}
                        </NavLink>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
              {showStaffSingleLink ? (
                <NavLink href={staffMenuItems[0].href} className={linkClass}>
                  {staffMenuItems[0].label}
                </NavLink>
              ) : null}
              <NavLink href="/perfil" className={linkClass}>
                Profile
              </NavLink>
              <button type="button" className="app-side-menu__logout" onClick={() => void handleLogout()}>
                Logout
              </button>
            </>
          ) : (
            <NavLink href="/login" className="app-side-menu__logout app-side-menu__logout--link">
              Login
            </NavLink>
          )}
        </nav>
      </div>
    </aside>
  );
}
