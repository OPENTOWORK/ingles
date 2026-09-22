'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useUserRole } from '@/context/UserRoleContext';
import { buildAppNavModel } from '@/config/appNavMenu';
import { useExamStrategiesAccess } from '@/hooks/useExamStrategiesAccess';
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
  const [examStrategiesOpen, setExamStrategiesOpen] = useState(false);
  const [draloOpen, setDraloOpen] = useState(false);
  const [adminPanelsOpen, setAdminPanelsOpen] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const { locked: examStrategiesPlanLocked } = useExamStrategiesAccess({ userRole, session });
  const navModel = useMemo(() => {
    const base = buildAppNavModel(userRole, session);
    return {
      ...base,
      examStrategiesLocked: base.guest ? false : examStrategiesPlanLocked,
    };
  }, [userRole, session, examStrategiesPlanLocked]);
  const linkClass = 'app-side-menu__link';

  useEffect(() => {
    setExamStrategiesOpen(false);
    setDraloOpen(false);
    setAdminPanelsOpen(false);
  }, [pathname]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 639px)');
    const sync = () => setIsPhone(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    document.body.classList.add('has-home-side-menu');
    return () => {
      document.body.classList.remove('has-home-side-menu');
      document.body.classList.remove('home-side-menu-open');
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle('home-side-menu-open', open);
  }, [open]);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    void performLogout();
  };

  const menu = (
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
            examStrategiesOpen={examStrategiesOpen}
            onToggleExamStrategies={() => setExamStrategiesOpen((v) => !v)}
            draloOpen={draloOpen}
            onToggleDralo={() => setDraloOpen((v) => !v)}
            adminPanelsOpen={adminPanelsOpen}
            onToggleAdminPanels={() => setAdminPanelsOpen((v) => !v)}
            onLogout={handleLogout}
            showNightMode={false}
            draloVariant="side"
            guestEntryHref={!session && isPhone ? '/registro' : null}
          />
        </nav>
      </div>
    </aside>
  );

  if (!portalReady) return null;
  return createPortal(menu, document.body);
}
