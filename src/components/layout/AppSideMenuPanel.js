'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useUserRole } from '@/context/UserRoleContext';
import { buildAppNavModel } from '@/config/appNavMenu';
import { AppSharedDrawerNav } from '@/components/layout/AppSharedDrawerNav';
import { performLogout } from '@/utils/logout';

/**
 * Menú lateral derecho desplegable (home, móvil/tablet).
 * Usa el mismo modelo que el drawer móvil de AppNav (prioriza barra desktop).
 */
export default function AppSideMenuPanel({ defaultOpen = true }) {
  const pathname = usePathname();
  const { userRole, session } = useUserRole();
  const [open, setOpen] = useState(defaultOpen);
  const [draloOpen, setDraloOpen] = useState(false);
  const [adminPanelsOpen, setAdminPanelsOpen] = useState(false);
  const navModel = useMemo(() => buildAppNavModel(userRole, session), [userRole, session]);
  const linkClass = 'app-side-menu__link';

  useEffect(() => {
    setDraloOpen(false);
    setAdminPanelsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.add('has-home-side-menu');
    return () => document.body.classList.remove('has-home-side-menu');
  }, []);

  const closeMenu = () => setOpen(false);

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
            onClick={closeMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="app-side-menu__nav">
          <AppSharedDrawerNav
            navModel={navModel}
            linkClass={linkClass}
            onNavigate={closeMenu}
            draloOpen={draloOpen}
            onToggleDralo={() => setDraloOpen((v) => !v)}
            adminPanelsOpen={adminPanelsOpen}
            onToggleAdminPanels={() => setAdminPanelsOpen((v) => !v)}
            onLogout={handleLogout}
            showNightMode={false}
            draloVariant="side"
          />
        </nav>
      </div>
    </aside>
  );
}
