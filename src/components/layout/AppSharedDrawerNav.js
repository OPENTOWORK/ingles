'use client';

import NavLink from '@/components/layout/NavLink';
import { usePathname } from 'next/navigation';
import { useMountedSearchParams } from '@/hooks/useMountedSearchParams';
import AdminPanelsNav from '@/components/layout/AdminPanelsNav';
import { DraloAiComingSoonRibbon, DraloAiNavMenuItems } from '@/components/layout/DraloAiNavMenu';
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
  onLogout,
  draloVariant = 'mobile',
  /** Si viene informado, las opciones de la app (no el bloque legal) van aquí. Solo Home móvil sin sesión: login. */
  guestEntryHref = null,
  /** Solo el menú lateral de la Home: en el móvil el botón Tutorial no cabe en la página. */
  onOpenTutorial = null,
}) {
  const pathname = usePathname();
  const searchParams = useMountedSearchParams();
  const showMobileLegal = draloVariant === 'mobile' || draloVariant === 'side';
  const {
    sectionLinks,
    showDralo,
    draloLocked,
    guest,
    examStrategiesLocked,
    showPricing,
    showContact,
    showLogin,
    showProfile,
    showLogout,
    staffItems,
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
      {sectionLinks.map((item) => {
        if (item.menuId === 'practice' && item.menuItems?.length) {
          const subClass = draloVariant === 'side' ? 'app-side-menu__sub' : 'app-nav__sub';
          return (
            <div key={item.label} {...(item.tourId ? { 'data-tour': item.tourId } : {})}>
              <span className="app-nav__group-label">{item.label}</span>
              <div className={subClass}>
                {item.menuItems.map((sub) => (
                  <NavLink
                    key={sub.href}
                    href={guestEntryHref || sub.href}
                    className={linkClass}
                    onClick={onNavigate}
                  >
                    {sub.label}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        }

        return (
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
        );
      })}

      {showDralo ? (
        draloLocked ? (
          <div data-tour="nav-dralo-ai">
            <span className={`${linkClass} app-nav__link--locked-preview`} aria-disabled="true">
              {NAV_LINK_DRALO_AI.label}
            </span>
            <div
              className={`${draloVariant === 'side' ? 'app-side-menu__sub' : 'app-nav__sub'} app-nav__sub--locked`}
            >
              <DraloAiNavMenuItems
                locked
                guestRequiresLogin={guest}
                guestEntryHref={guestEntryHref}
                variant={draloVariant}
              />
              <DraloAiComingSoonRibbon />
            </div>
          </div>
        ) : (
          <NavLink
            href={guestEntryHref || NAV_LINK_DRALO_AI.href}
            className={linkClass}
            onClick={onNavigate}
            data-tour="nav-dralo-ai"
          >
            {NAV_LINK_DRALO_AI.label}
          </NavLink>
        )
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
          linkClassName={linkClass}
          menuLabel="Paneles"
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

      {showProfile && onOpenTutorial ? (
        <button
          type="button"
          className={linkClass}
          onClick={() => {
            onNavigate?.();
            onOpenTutorial();
          }}
        >
          Tutorial
        </button>
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
