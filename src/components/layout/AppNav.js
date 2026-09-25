'use client';

import NavLink from '@/components/layout/NavLink';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useMountedSearchParams } from '@/hooks/useMountedSearchParams';
import AdminPanelsNav from '@/components/layout/AdminPanelsNav';
import { DraloAiComingSoonRibbon, DraloAiNavMenuItems } from '@/components/layout/DraloAiNavMenu';
import { ExamStrategiesNavMenuItems } from '@/components/layout/ExamStrategiesNavMenu';
import { useExamStrategiesAccess } from '@/hooks/useExamStrategiesAccess';
import ReadingNightModeToggle from '@/components/exam/ReadingNightModeToggle';
import { AppSharedDrawerNav } from '@/components/layout/AppSharedDrawerNav';
import {
  buildAppNavModel,
  isNavLinkActive,
  isStaffPanelsNavActive,
  shouldShowAdminShell,
  NAV_LINKS_BEFORE_DRALO,
  NAV_LINK_CONTACT,
  NAV_LINK_PRICING,
  NAV_LINK_PROFILE,
  resolveNavItemHref,
} from '@/config/appNavMenu';
import { APP_ROUTES } from '@/config/appRoutes';

function AppNavInner({ session, userRole, onLogout, hideMobileToggle = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useMountedSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminPanelsMobileOpen, setAdminPanelsMobileOpen] = useState(false);
  const [desktopHoverMenu, setDesktopHoverMenu] = useState(null);

  const { locked: examStrategiesPlanLocked } = useExamStrategiesAccess({ userRole, session });
  const navModel = useMemo(() => {
    const base = buildAppNavModel(userRole, session);
    return {
      ...base,
      examStrategiesLocked: base.guest ? false : examStrategiesPlanLocked,
    };
  }, [userRole, session, examStrategiesPlanLocked]);

  const bindDesktopHoverMenu = (menuId) => ({
    onMouseEnter: () => setDesktopHoverMenu(menuId),
    onMouseLeave: () => setDesktopHoverMenu(null),
  });

  const desktopHoverMenuClass = (menuId, pinnedOpen = false) =>
    desktopHoverMenu === menuId || pinnedOpen ? ' is-hover-open' : '';

  useEffect(() => {
    document.body.classList.toggle('nav-open', mobileOpen);
    return () => document.body.classList.remove('nav-open');
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setAdminPanelsMobileOpen(false);
    setDesktopHoverMenu(null);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [pathname, searchParams.toString()]);

  const closeMobile = () => {
    setMobileOpen(false);
    setAdminPanelsMobileOpen(false);
  };

  const closeDesktopDropdowns = () => {
    setDesktopHoverMenu(null);
  };

  const examStrategiesHubHref = resolveNavItemHref(`${APP_ROUTES.examStrategies}/`, session);

  const goToExamStrategiesHub = (event) => {
    closeDesktopDropdowns();
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.defaultPrevented
    ) {
      return;
    }
    event.preventDefault();
    router.push(examStrategiesHubHref);
  };

  const toggleAdminMobile = () => {
    setAdminPanelsMobileOpen((open) => !open);
  };

  const mobileLinkClass = 'app-nav__link app-nav__link--mobile';

  const desktopLinkClass = (href) =>
    `app-nav__link${isNavLinkActive(href, pathname, searchParams) ? ' is-active' : ''}`;

  const staffPanelsNavActive = navModel.showStaffAdminLink
    ? shouldShowAdminShell(pathname, userRole)
    : isStaffPanelsNavActive(pathname, searchParams, navModel.staffItems);

  return (
    <>
      {hideMobileToggle ? null : (
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
      )}

      <nav className="app-nav app-nav--desktop" aria-label="Main navigation">
        <div className="app-nav__primary" role="group" aria-label="Sections">
          {navModel.showPrimaryNav
            ? NAV_LINKS_BEFORE_DRALO.map((item) =>
                item.menuItems ? (
                  <div
                    key={item.href}
                    className={`app-nav__dropdown-wrap app-nav__dropdown-wrap--hover${desktopHoverMenuClass(
                      item.menuId,
                    )}`}
                    {...bindDesktopHoverMenu(item.menuId)}
                    {...(item.tourId ? { 'data-tour': item.tourId } : {})}
                  >
                    <NavLink
                      href={
                        item.menuId === 'exam-strategies'
                          ? examStrategiesHubHref
                          : resolveNavItemHref(item.href, session)
                      }
                      className={`${desktopLinkClass(item.href)} app-nav__link--has-menu app-nav__link--dropdown-trigger${
                        item.menuId === 'exam-strategies' && navModel.examStrategiesLocked
                          ? ' app-nav__link--locked-preview'
                          : ''
                      }`}
                      onClick={
                        item.menuId === 'exam-strategies' ? goToExamStrategiesHub : closeDesktopDropdowns
                      }
                    >
                      {item.label}
                      <span className="app-nav__chevron" aria-hidden>
                        ▾
                      </span>
                    </NavLink>
                    <div className="app-nav__dropdown app-nav__dropdown--hover" role="menu">
                      {item.menuId === 'exam-strategies' ? (
                        <ExamStrategiesNavMenuItems
                          locked={navModel.examStrategiesLocked}
                          guestRequiresLogin={navModel.guest}
                          variant="desktop"
                          onNavigate={closeDesktopDropdowns}
                        />
                      ) : (
                        item.menuItems.map((sub) => (
                          <NavLink
                            key={sub.href}
                            href={resolveNavItemHref(sub.href, session)}
                            role="menuitem"
                            className="app-nav__dropdown-item"
                            onClick={closeDesktopDropdowns}
                          >
                            {sub.label}
                          </NavLink>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={item.href}
                    href={resolveNavItemHref(item.href, session)}
                    className={desktopLinkClass(item.href)}
                    onClick={closeDesktopDropdowns}
                    {...(item.tourId ? { 'data-tour': item.tourId } : {})}
                  >
                    {item.label}
                  </NavLink>
                ),
              )
            : null}

          {navModel.showDralo ? (
            <div
              className={`app-nav__dropdown-wrap app-nav__dropdown-wrap--hover${desktopHoverMenuClass('dralo-ai')}`}
              data-tour="nav-dralo-ai"
              {...bindDesktopHoverMenu('dralo-ai')}
            >
              {navModel.draloLocked ? (
                <span
                  className={`app-nav__link app-nav__link--has-menu app-nav__link--locked-preview${
                    pathname?.startsWith('/dralo-ai') ? ' is-active' : ''
                  }`}
                  aria-disabled="true"
                >
                  Dralo AI
                  <span className="app-nav__chevron" aria-hidden>
                    ▾
                  </span>
                </span>
              ) : (
                <NavLink
                  href={resolveNavItemHref('/dralo-ai', session)}
                  className={`app-nav__link app-nav__link--has-menu${
                    pathname?.startsWith('/dralo-ai') ? ' is-active' : ''
                  }`}
                  onClick={closeDesktopDropdowns}
                >
                  Dralo AI
                  <span className="app-nav__chevron" aria-hidden>
                    ▾
                  </span>
                </NavLink>
              )}
              <div
                className={`app-nav__dropdown app-nav__dropdown--hover${
                  navModel.draloLocked ? ' app-nav__dropdown--locked' : ''
                }`}
                role="menu"
              >
                <DraloAiNavMenuItems
                  locked={navModel.draloLocked}
                  guestRequiresLogin={navModel.guest}
                  variant="desktop"
                  onNavigate={closeDesktopDropdowns}
                />
                {navModel.draloLocked ? <DraloAiComingSoonRibbon /> : null}
              </div>
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
                {...(NAV_LINK_CONTACT.tourId ? { 'data-tour': NAV_LINK_CONTACT.tourId } : {})}
              >
                {NAV_LINK_CONTACT.label}
              </NavLink>
              <NavLink href="/login" className="app-nav__btn" onClick={closeDesktopDropdowns}>
                Login
              </NavLink>
            </>
          ) : (
            <>
              {navModel.showStaffAdminLink ? (
                <NavLink
                  href={navModel.staffAdminHref}
                  className={`app-nav__link${staffPanelsNavActive ? ' is-active' : ''}`}
                  onClick={closeDesktopDropdowns}
                >
                  {navModel.staffAdminLabel}
                </NavLink>
              ) : null}
              {navModel.showStaffDropdown ? (
                <AdminPanelsNav
                  variant="desktop"
                  items={navModel.staffItems}
                  menuLabel={navModel.staffMenuLabel}
                  isActive={staffPanelsNavActive}
                  onNavigate={closeDesktopDropdowns}
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
                {...(NAV_LINK_CONTACT.tourId ? { 'data-tour': NAV_LINK_CONTACT.tourId } : {})}
              >
                {NAV_LINK_CONTACT.label}
              </NavLink>
              <NavLink
                href={NAV_LINK_PROFILE.href}
                className={desktopLinkClass(NAV_LINK_PROFILE.href)}
                onClick={closeDesktopDropdowns}
                {...(NAV_LINK_PROFILE.tourId ? { 'data-tour': NAV_LINK_PROFILE.tourId } : {})}
              >
                {NAV_LINK_PROFILE.label}
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

      {hideMobileToggle ? null : (
      <button
        type="button"
        className={`app-nav__backdrop${mobileOpen ? ' is-visible' : ''}`}
        aria-hidden={!mobileOpen}
        tabIndex={mobileOpen ? 0 : -1}
        onClick={closeMobile}
      />
      )}

      {hideMobileToggle ? null : (
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
            adminPanelsOpen={adminPanelsMobileOpen}
            onToggleAdminPanels={toggleAdminMobile}
            onLogout={onLogout}
          />
        </nav>
      </aside>
      )}
    </>
  );
}

export default function AppNav(props) {
  return <AppNavInner {...props} />;
}
