'use client';

import NavLink from '@/components/layout/NavLink';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import AdminPanelsNav from '@/components/layout/AdminPanelsNav';
import { DraloAiComingSoonRibbon, DraloAiNavMenuItems } from '@/components/layout/DraloAiNavMenu';
import ReadingNightModeToggle from '@/components/exam/ReadingNightModeToggle';
import { AppSharedDrawerNav } from '@/components/layout/AppSharedDrawerNav';
import {
  buildAppNavModel,
  isNavLinkActive,
  NAV_LINKS_BEFORE_DRALO,
  NAV_LINK_CONTACT,
  NAV_LINK_PRICING,
} from '@/config/appNavMenu';

function AppNavInner({ session, userRole, onLogout }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [draloOpen, setDraloOpen] = useState(false);
  const [draloDesktopOpen, setDraloDesktopOpen] = useState(false);
  const [adminPanelsOpen, setAdminPanelsOpen] = useState(false);
  const [adminPanelsMobileOpen, setAdminPanelsMobileOpen] = useState(false);

  const navModel = useMemo(() => buildAppNavModel(userRole, session), [userRole, session]);

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

  const desktopLinkClass = (href) =>
    `app-nav__link${isNavLinkActive(href, pathname, searchParams) ? ' is-active' : ''}`;

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
        <div className="app-nav__primary" role="group" aria-label="Sections">
          {navModel.showPrimaryNav
            ? NAV_LINKS_BEFORE_DRALO.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  className={desktopLinkClass(item.href)}
                  onClick={closeDesktopDropdowns}
                  {...(item.tourId ? { 'data-tour': item.tourId } : {})}
                >
                  {item.label}
                </NavLink>
              ))
            : null}

          {navModel.showDralo ? (
            <div
              className={`app-nav__dropdown-wrap${navModel.draloLocked ? ' app-nav__dropdown-wrap--locked' : ''}`}
              data-tour="nav-dralo-ai"
            >
              <button
                type="button"
                className={`app-nav__link app-nav__link--button${
                  draloDesktopOpen || pathname?.startsWith('/dralo-ai') ? ' is-active' : ''
                }${navModel.draloLocked ? ' app-nav__link--locked-preview' : ''}`}
                aria-expanded={draloDesktopOpen}
                onClick={toggleDraloDesktop}
              >
                Dralo AI
                <span className="app-nav__chevron" aria-hidden>
                  ▾
                </span>
              </button>
              {draloDesktopOpen ? (
                <div
                  className={`app-nav__dropdown${navModel.draloLocked ? ' app-nav__dropdown--locked' : ''}`}
                  role="menu"
                >
                  <DraloAiNavMenuItems
                    locked={navModel.draloLocked}
                    variant="desktop"
                    onNavigate={closeDesktopDropdowns}
                  />
                  {navModel.draloLocked ? <DraloAiComingSoonRibbon /> : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <ReadingNightModeToggle variant="desktop" />

        <div className="app-nav__account" role="group" aria-label="Account">
          {navModel.guest ? (
            <>
              <NavLink
                href={NAV_LINK_CONTACT.href}
                className={desktopLinkClass(NAV_LINK_CONTACT.href)}
                onClick={closeDesktopDropdowns}
              >
                {NAV_LINK_CONTACT.label}
              </NavLink>
              <NavLink href="/login" className="app-nav__btn" onClick={closeDesktopDropdowns}>
                Login
              </NavLink>
            </>
          ) : (
            <>
              {navModel.showStaffDropdown ? (
                <AdminPanelsNav
                  variant="desktop"
                  open={adminPanelsOpen}
                  onToggle={toggleAdminDesktop}
                  onClose={closeDesktopDropdowns}
                  items={navModel.staffItems}
                  menuLabel={navModel.staffMenuLabel}
                />
              ) : null}
              {navModel.showStaffSingleLink ? (
                <NavLink
                  href={navModel.staffItems[0].href}
                  className={desktopLinkClass(navModel.staffItems[0].href)}
                  onClick={closeDesktopDropdowns}
                >
                  {navModel.staffItems[0].label}
                </NavLink>
              ) : null}
              {navModel.showPricing ? (
                <NavLink
                  href={NAV_LINK_PRICING.href}
                  className={desktopLinkClass(NAV_LINK_PRICING.href)}
                  onClick={closeDesktopDropdowns}
                  {...(NAV_LINK_PRICING.tourId ? { 'data-tour': NAV_LINK_PRICING.tourId } : {})}
                >
                  {NAV_LINK_PRICING.label}
                </NavLink>
              ) : null}
              <NavLink
                href={NAV_LINK_CONTACT.href}
                className={desktopLinkClass(NAV_LINK_CONTACT.href)}
                onClick={closeDesktopDropdowns}
              >
                {NAV_LINK_CONTACT.label}
              </NavLink>
              <NavLink
                href="/perfil"
                className={desktopLinkClass('/perfil')}
                onClick={closeDesktopDropdowns}
              >
                Profile
              </NavLink>
              <button
                type="button"
                className="app-nav__btn app-nav__btn--logout"
                onClick={() => {
                  closeDesktopDropdowns();
                  onLogout();
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
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
          <AppSharedDrawerNav
            navModel={navModel}
            linkClass={mobileLinkClass}
            onNavigate={closeMobile}
            draloOpen={draloOpen}
            onToggleDralo={toggleDraloMobile}
            adminPanelsOpen={adminPanelsMobileOpen}
            onToggleAdminPanels={toggleAdminMobile}
            onLogout={onLogout}
          />
        </nav>
      </aside>
    </>
  );
}

export default function AppNav(props) {
  return (
    <Suspense fallback={null}>
      <AppNavInner {...props} />
    </Suspense>
  );
}
