'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUserRole } from '@/context/UserRoleContext';
import { isAdminRole, ROLE_ROUTE_MAP } from '@/utils/authRoles';
import {
  ADMIN_PANEL_MENU_ITEMS,
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
    ([role]) => STAFF_ROLES.has(role) && role === userRole,
  );
  if (!entry) return null;
  const [role, href] = entry;
  return { href, label: ROLE_LABELS[role] || 'Panel' };
}

/**
 * Menú lateral derecho desplegable (fondo blanco). No desplaza el contenido de la página.
 */
export default function AppSideMenuPanel({ defaultOpen = true }) {
  const pathname = usePathname();
  const { userRole, session } = useUserRole();
  const [open, setOpen] = useState(defaultOpen);
  const [draloOpen, setDraloOpen] = useState(false);
  const [adminPanelsOpen, setAdminPanelsOpen] = useState(false);
  const staffLink = getRoleLink(userRole);
  const showAdminDropdown = Boolean(session && isAdminRole(userRole));
  const showStaffLink = Boolean(staffLink && !showAdminDropdown);
  const linkClass = 'app-side-menu__link';

  useEffect(() => {
    setDraloOpen(false);
    setAdminPanelsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    const { supabase } = await import('@/utils/supabaseClient');
    await supabase.auth.signOut();
    window.location.href = '/login';
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
          {NAV_LINKS_BEFORE_DRALO.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
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
                <Link key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}

          <Link href={NAV_LINK_CONTACT.href} className={linkClass}>
            {NAV_LINK_CONTACT.label}
          </Link>

          {session ? (
            <>
              {showAdminDropdown ? (
                <>
                  <button
                    type="button"
                    className={`${linkClass} app-side-menu__accordion${adminPanelsOpen ? ' is-open' : ''}`}
                    onClick={() => setAdminPanelsOpen((v) => !v)}
                    aria-expanded={adminPanelsOpen}
                  >
                    Admin
                    <span aria-hidden>{adminPanelsOpen ? '▲' : '▼'}</span>
                  </button>
                  {adminPanelsOpen ? (
                    <div className="app-side-menu__sub">
                      {ADMIN_PANEL_MENU_ITEMS.map((item) => (
                        <Link key={item.href} href={item.href} className={linkClass}>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
              {showStaffLink ? (
                <Link href={staffLink.href} className={linkClass}>
                  {staffLink.label}
                </Link>
              ) : null}
              <Link href="/perfil" className={linkClass}>
                Profile
              </Link>
              <button type="button" className="app-side-menu__logout" onClick={() => void handleLogout()}>
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="app-side-menu__logout app-side-menu__logout--link">
              Login
            </Link>
          )}
        </nav>
      </div>
    </aside>
  );
}
