'use client';

import { useState } from 'react';
import NavLink from '@/components/layout/NavLink';
import { usePathname } from 'next/navigation';
import { useMountedSearchParams } from '@/hooks/useMountedSearchParams';
import AdminPanelsNav from '@/components/layout/AdminPanelsNav';
import { DraloAiComingSoonRibbon, DraloAiNavMenuItems } from '@/components/layout/DraloAiNavMenu';
import SiteThemePicker from '@/components/layout/SiteThemePicker';
import {
  NAV_LINK_CONTACT,
  NAV_LINK_DRALO_AI,
  NAV_LINK_PRICING,
  NAV_LINK_PROFILE,
  isStaffPanelsNavActive,
  shouldShowAdminShell,
} from '@/config/appNavMenu';

function DrawerMenuGroup({ label, tourId, linkClass, children, panelClass }) {
  const [open, setOpen] = useState(false);

  return (
    <div {...(tourId ? { 'data-tour': tourId } : {})}>
      <button
        type="button"
        className={linkClass || 'app-nav__group-toggle'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{label}</span>
        <span className="app-nav__chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open ? <div className={panelClass}>{children}</div> : null}
    </div>
  );
}

/**
 * Bloques compartidos del menú drawer (móvil) y menú lateral (home tablet/móvil).
 * Practice y Dralo AI empiezan plegados.
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
    admin,
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
            <DrawerMenuGroup
              key={item.label}
              label={item.label}
              tourId={item.tourId}
              linkClass={`${linkClass} app-nav__group-toggle--link`}
              panelClass={subClass}
            >
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
            </DrawerMenuGroup>
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
          <DrawerMenuGroup
            label={NAV_LINK_DRALO_AI.label}
            tourId="nav-dralo-ai"
            linkClass={`${linkClass} app-nav__group-toggle--link`}
            panelClass={`${draloVariant === 'side' ? 'app-side-menu__sub' : 'app-nav__sub'} app-nav__sub--locked`}
          >
            <DraloAiNavMenuItems
              locked
              guestRequiresLogin={guest}
              guestEntryHref={guestEntryHref}
              variant={draloVariant}
            />
            <DraloAiComingSoonRibbon />
          </DrawerMenuGroup>
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

      {admin && !guest ? <SiteThemePicker variant="drawer" /> : null}

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
