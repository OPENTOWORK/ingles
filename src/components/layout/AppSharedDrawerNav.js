'use client';

import NavLink from '@/components/layout/NavLink';
import { usePathname, useSearchParams } from 'next/navigation';
import AdminPanelsNav from '@/components/layout/AdminPanelsNav';
import { DraloAiComingSoonRibbon, DraloAiNavMenuItems } from '@/components/layout/DraloAiNavMenu';
import { ExamStrategiesNavMenuItems } from '@/components/layout/ExamStrategiesNavMenu';
import ReadingNightModeToggle from '@/components/exam/ReadingNightModeToggle';
import {
  NAV_LINK_CONTACT,
  NAV_LINK_PRICING,
  HOME_PRICING_LINK,
  isStaffPanelsNavActive,
} from '@/config/appNavMenu';
import { APP_ROUTES } from '@/config/appRoutes';

/**
 * Bloques compartidos del menú drawer (móvil) y menú lateral (home tablet/móvil).
 * Usa buildAppNavModel para que todos los roles vean lo mismo en cada viewport.
 */
export function AppSharedDrawerNav({
  navModel,
  linkClass,
  onNavigate,
  examStrategiesOpen,
  onToggleExamStrategies,
  draloOpen,
  onToggleDralo,
  adminPanelsOpen,
  onToggleAdminPanels,
  onLogout,
  showNightMode = true,
  draloVariant = 'mobile',
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    guest,
    sectionLinks,
    showDralo,
    draloLocked,
    showPricing,
    showContact,
    showLogin,
    showProfile,
    showLogout,
    staffItems,
    staffMenuLabel,
    showStaffDropdown,
    showStaffSingleLink,
  } = navModel;

  const staffPanelsNavActive = isStaffPanelsNavActive(pathname, searchParams, staffItems);

  return (
    <>
      {sectionLinks.map((item) =>
        item.menuItems ? (
          <div key={item.href}>
            <button
              type="button"
              className={`${linkClass} app-nav__accordion${examStrategiesOpen ? ' is-open' : ''}`}
              onClick={onToggleExamStrategies}
              aria-expanded={examStrategiesOpen}
              {...(item.tourId ? { 'data-tour': item.tourId } : {})}
            >
              {item.label}
              <span aria-hidden>{examStrategiesOpen ? '▲' : '▼'}</span>
            </button>
            {examStrategiesOpen ? (
              <div className="app-nav__sub">
                <NavLink
                  href={item.href}
                  className={linkClass}
                  onClick={onNavigate}
                >
                  All skills
                </NavLink>
                <ExamStrategiesNavMenuItems
                  guestRequiresLogin={guest}
                  variant={draloVariant}
                  onNavigate={onNavigate}
                />
              </div>
            ) : null}
          </div>
        ) : (
          <NavLink
            key={item.href}
            href={item.href}
            className={linkClass}
            onClick={onNavigate}
            {...(item.tourId ? { 'data-tour': item.tourId } : {})}
          >
            {item.label}
          </NavLink>
        ),
      )}

      {showDralo ? (
        <>
          <button
            type="button"
            className={`${linkClass} app-nav__accordion${draloOpen ? ' is-open' : ''}${
              draloLocked ? ' app-nav__link--locked-preview' : ''
            }`}
            onClick={onToggleDralo}
            aria-expanded={draloOpen}
            data-tour="nav-dralo-ai"
          >
            Dralo AI
            <span aria-hidden>{draloOpen ? '▲' : '▼'}</span>
          </button>
          {draloOpen ? (
            <div className={`app-nav__sub${draloLocked ? ' app-nav__sub--locked' : ''}`}>
              <DraloAiNavMenuItems
                locked={draloLocked}
                guestRequiresLogin={guest}
                variant={draloVariant}
                onNavigate={onNavigate}
              />
              {draloLocked ? <DraloAiComingSoonRibbon /> : null}
            </div>
          ) : null}
        </>
      ) : null}

      {showNightMode ? <ReadingNightModeToggle variant="mobile" /> : null}

      {showPricing ? (
        <NavLink
          href={NAV_LINK_PRICING.href}
          className={linkClass}
          onClick={onNavigate}
          {...(NAV_LINK_PRICING.tourId ? { 'data-tour': NAV_LINK_PRICING.tourId } : {})}
        >
          {HOME_PRICING_LINK.label}
        </NavLink>
      ) : null}

      {showContact ? (
        <NavLink href={NAV_LINK_CONTACT.href} className={linkClass} onClick={onNavigate}>
          {NAV_LINK_CONTACT.label}
        </NavLink>
      ) : null}

      {showStaffDropdown ? (
        <AdminPanelsNav
          variant={draloVariant === 'side' ? 'side' : 'mobile'}
          open={adminPanelsOpen}
          onToggle={onToggleAdminPanels}
          linkClassName={linkClass}
          items={staffItems}
          menuLabel={staffMenuLabel}
          isActive={staffPanelsNavActive}
          onNavigate={onNavigate}
        />
      ) : null}

      {showStaffSingleLink ? (
        <NavLink href={staffItems[0].href} className={linkClass} onClick={onNavigate}>
          {staffItems[0].label}
        </NavLink>
      ) : null}

      {showProfile ? (
        <NavLink href={APP_ROUTES.profile} className={linkClass} onClick={onNavigate}>
          Profile
        </NavLink>
      ) : null}

      {showLogout ? (
        <button
          type="button"
          className="app-nav__btn app-nav__btn--mobile"
          onClick={() => {
            onNavigate?.();
            onLogout?.();
          }}
        >
          Logout
        </button>
      ) : null}

      {showLogin ? (
        <NavLink href="/login" className={`${linkClass} app-nav__btn app-nav__btn--mobile`} onClick={onNavigate}>
          Login
        </NavLink>
      ) : null}
    </>
  );
}
