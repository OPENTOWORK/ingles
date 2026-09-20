'use client';

import NavLink from '@/components/layout/NavLink';
import { usePathname } from 'next/navigation';
import { useMountedSearchParams } from '@/hooks/useMountedSearchParams';
import AdminPanelsNav from '@/components/layout/AdminPanelsNav';
import { DraloAiComingSoonRibbon, DraloAiNavMenuItems } from '@/components/layout/DraloAiNavMenu';
import { ExamStrategiesNavMenuItems } from '@/components/layout/ExamStrategiesNavMenu';
import ReadingNightModeToggle from '@/components/exam/ReadingNightModeToggle';
import {
  NAV_LINK_CONTACT,
  NAV_LINK_PRICING,
  NAV_LINK_PROFILE,
  HOME_PRICING_LINK,
  isStaffPanelsNavActive,
  shouldShowAdminShell,
} from '@/config/appNavMenu';

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
  const searchParams = useMountedSearchParams();
  const {
    guest,
    sectionLinks,
    showDralo,
    draloLocked,
    examStrategiesLocked,
    showPricing,
    showContact,
    showLogin,
    showProfile,
    showLogout,
    staffItems,
    staffMenuLabel,
    showStaffDropdown,
    showStaffSingleLink,
    showStaffAdminLink,
    staffAdminHref,
    staffAdminLabel,
  } = navModel;

  const staffPanelsNavActive = showStaffAdminLink
    ? shouldShowAdminShell(pathname, navModel.userRole)
    : isStaffPanelsNavActive(pathname, searchParams, staffItems);

  return (
    <>
      {sectionLinks.map((item) =>
        item.menuItems ? (
          <div key={item.href} {...(item.tourId ? { 'data-tour': item.tourId } : {})}>
            <div
              className={`app-nav__accordion-row${examStrategiesOpen ? ' is-open' : ''}${
                examStrategiesLocked ? ' app-nav__link--locked-preview' : ''
              }`}
            >
              <NavLink href={item.href} className={`${linkClass} app-nav__accordion-link`} onClick={onNavigate}>
                {item.label}
              </NavLink>
              <button
                type="button"
                className="app-nav__accordion-toggle"
                onClick={onToggleExamStrategies}
                aria-expanded={examStrategiesOpen}
                aria-label={`Show ${item.label} skills`}
              >
                <span aria-hidden>{examStrategiesOpen ? '▲' : '▼'}</span>
              </button>
            </div>
            {examStrategiesOpen ? (
              <div className="app-nav__sub">
                <ExamStrategiesNavMenuItems
                  locked={examStrategiesLocked}
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
        <NavLink
          href={NAV_LINK_CONTACT.href}
          className={linkClass}
          onClick={onNavigate}
          {...(NAV_LINK_CONTACT.tourId ? { 'data-tour': NAV_LINK_CONTACT.tourId } : {})}
        >
          {NAV_LINK_CONTACT.label}
        </NavLink>
      ) : null}

      {showStaffAdminLink ? (
        <NavLink
          href={staffAdminHref}
          className={`${linkClass}${staffPanelsNavActive ? ' is-active' : ''}`}
          onClick={onNavigate}
        >
          {staffAdminLabel}
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
        <NavLink
          href={NAV_LINK_PROFILE.href}
          className={linkClass}
          onClick={onNavigate}
          {...(NAV_LINK_PROFILE.tourId ? { 'data-tour': NAV_LINK_PROFILE.tourId } : {})}
        >
          {NAV_LINK_PROFILE.label}
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
