'use client';

import NavLink from '@/components/layout/NavLink';
import { usePathname } from 'next/navigation';
import { useMountedSearchParams } from '@/hooks/useMountedSearchParams';
import AdminPanelsNav from '@/components/layout/AdminPanelsNav';
import {
  NAV_LINK_CONTACT,
  NAV_LINK_DRALO_AI,
  NAV_LINK_PRICING,
  NAV_LINK_PROFILE,
  isStaffPanelsNavActive,
  shouldShowAdminShell,
} from '@/config/appNavMenu';

/**
 * Bloques compartidos del menú drawer (móvil) y menú lateral (home tablet/móvil).
 * Usa buildAppNavModel para que todos los roles vean lo mismo en cada viewport.
 * Sin desplegables: cada sección es un enlace directo a su hub.
 */
export function AppSharedDrawerNav({
  navModel,
  linkClass,
  onNavigate,
  adminPanelsOpen,
  onToggleAdminPanels,
  onLogout,
  draloVariant = 'mobile',
  /** Si viene informado, las opciones de la app (no el bloque legal) van aquí. Solo Home móvil sin sesión: login. */
  guestEntryHref = null,
}) {
  const pathname = usePathname();
  const searchParams = useMountedSearchParams();
  const showMobileLegal = draloVariant === 'mobile' || draloVariant === 'side';
  const {
    sectionLinks,
    showDralo,
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
      {sectionLinks.map((item) => (
        <NavLink
          key={item.href}
          href={guestEntryHref || item.href}
          className={`${linkClass}${
            item.menuItems && examStrategiesLocked ? ' app-nav__link--locked-preview' : ''
          }`}
          onClick={onNavigate}
          {...(item.tourId ? { 'data-tour': item.tourId } : {})}
        >
          {item.label}
        </NavLink>
      ))}

      {showDralo ? (
        <span className={`${linkClass} app-nav__dralo-soon`} aria-disabled="true">
          <span>{NAV_LINK_DRALO_AI.label}</span>
          <span className="app-nav__dralo-soon-pill">Coming soon</span>
        </span>
      ) : null}

      {showPricing ? (
        <NavLink
          href={NAV_LINK_PRICING.href}
          className={linkClass}
          onClick={onNavigate}
          {...(NAV_LINK_PRICING.tourId ? { 'data-tour': NAV_LINK_PRICING.tourId } : {})}
        >
          {NAV_LINK_PRICING.label}
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

      {showMobileLegal ? (
        <div className="app-nav__legal-foot">
          <NavLink href="/legal" className={`${linkClass} app-nav__legal-foot-link`} onClick={onNavigate}>
            Legal y privacidad
          </NavLink>
        </div>
      ) : null}
    </>
  );
}
