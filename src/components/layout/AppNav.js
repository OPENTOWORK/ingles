'use client';

import NavLink from '@/components/layout/NavLink';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAdminRole } from '@/utils/authRoles';
import { canViewPricing } from '@/utils/pricingAccess';
import AdminPanelsNav from '@/components/layout/AdminPanelsNav';
import {
  DRALO_MENU_ITEMS,
  getStaffPanelMenuItemsForRole,
  getStaffPanelMenuLabel,
  NAV_LINK_CONTACT,
  NAV_LINK_PRICING,
  NAV_LINKS_BEFORE_DRALO,
} from '@/config/appNavMenu';

export default function AppNav({ session, userRole, onLogout }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [draloOpen, setDraloOpen] = useState(false);
  const [draloDesktopOpen, setDraloDesktopOpen] = useState(false);
  const [adminPanelsOpen, setAdminPanelsOpen] = useState(false);
  const [adminPanelsMobileOpen, setAdminPanelsMobileOpen] = useState(false);

  const staffMenuItems = session ? getStaffPanelMenuItemsForRole(userRole) : [];
  const staffMenuLabel = getStaffPanelMenuLabel(userRole);
  const showStaffDropdown = staffMenuItems.length > 1;
  const showStaffSingleLink = staffMenuItems.length === 1;
  const showPricing = canViewPricing(userRole);

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

  const isNavActive = (href) => {
    if (!pathname || !href) return false;
    const path = pathname.replace(/\/$/, '') || '/';
    const target = href.replace(/\/$/, '') || '/';
    if (target === '/') return path === '/';
    return path === target || path.startsWith(`${target}/`);
  };

  const desktopLinkClass = (href) =>
    `app-nav__link${isNavActive(href) ? ' is-active' : ''}`;

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
          {NAV_LINKS_BEFORE_DRALO.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className={desktopLinkClass(item.href)}
              onClick={closeDesktopDropdowns}
              {...(item.tourId ? { 'data-tour': item.tourId } : {})}
            >
              {item.label}
            </NavLink>
          ))}

          <div className="app-nav__dropdown-wrap" data-tour="nav-dralo-ai">
            <button
              type="button"
              className={`app-nav__link app-nav__link--button${
                draloDesktopOpen || pathname?.startsWith('/dralo-ai') ? ' is-active' : ''
              }`}
              aria-expanded={draloDesktopOpen}
              onClick={toggleDraloDesktop}
            >
              Dralo AI
              <span className="app-nav__chevron" aria-hidden>
                ▾
              </span>
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
        </div>

        <div className="app-nav__account" role="group" aria-label="Account">
          {session ? (
            <>
              {showStaffDropdown ? (
                <AdminPanelsNav
                  variant="desktop"
                  open={adminPanelsOpen}
                  onToggle={toggleAdminDesktop}
                  onClose={closeDesktopDropdowns}
                  items={staffMenuItems}
                  menuLabel={staffMenuLabel}
                />
              ) : null}
              {showStaffSingleLink ? (
                <NavLink
                  href={staffMenuItems[0].href}
                  className={desktopLinkClass(staffMenuItems[0].href)}
                  onClick={closeDesktopDropdowns}
                >
                  {staffMenuItems[0].label}
                </NavLink>
              ) : null}
              {showPricing ? (
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
          ) : (
            <>
              {showPricing ? (
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
              <NavLink href="/login" className="app-nav__btn" onClick={closeDesktopDropdowns}>
                Login
              </NavLink>
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
            data-tour="nav-dralo-ai"
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

          {showPricing ? (
            <NavLink
              href={NAV_LINK_PRICING.href}
              className={mobileLinkClass}
              onClick={closeMobile}
              {...(NAV_LINK_PRICING.tourId ? { 'data-tour': NAV_LINK_PRICING.tourId } : {})}
            >
              {NAV_LINK_PRICING.label}
            </NavLink>
          ) : null}

          <NavLink href={NAV_LINK_CONTACT.href} className={mobileLinkClass} onClick={closeMobile}>
            {NAV_LINK_CONTACT.label}
          </NavLink>

          {session ? (
            <>
              {showStaffDropdown ? (
                <AdminPanelsNav
                  variant="mobile"
                  open={adminPanelsMobileOpen}
                  onToggle={toggleAdminMobile}
                  onClose={closeMobile}
                  linkClassName={mobileLinkClass}
                  items={staffMenuItems}
                  menuLabel={staffMenuLabel}
                />
              ) : null}
              {showStaffSingleLink ? (
                <NavLink
                  href={staffMenuItems[0].href}
                  className={mobileLinkClass}
                  onClick={closeMobile}
                >
                  {staffMenuItems[0].label}
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
