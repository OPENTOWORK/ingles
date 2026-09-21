'use client';

import { useState } from 'react';
import NavLink from '@/components/layout/NavLink';
import DraloTagline from '@/components/DraloTagline';
import { SITE_FOOTER_TAGLINE } from '@/lib/siteSeo';
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
  const [legalOpen, setLegalOpen] = useState(false);
  const showMobileLegal = draloVariant === 'mobile' || draloVariant === 'side';
  const legalSubClass = draloVariant === 'side' ? 'app-side-menu__sub' : 'app-nav__sub';
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

      {showMobileLegal ? (
        <>
          <button
            type="button"
            className={`${linkClass} app-nav__accordion${legalOpen ? ' is-open' : ''}`}
            onClick={() => setLegalOpen((open) => !open)}
            aria-expanded={legalOpen}
          >
            Legal y privacidad
            <span aria-hidden>{legalOpen ? '▲' : '▼'}</span>
          </button>
          {legalOpen ? (
            <div className={legalSubClass}>
              <NavLink href="/terminos-condiciones" className={linkClass} onClick={onNavigate}>
                Términos y condiciones
              </NavLink>
              <NavLink href="/aviso-legal" className={linkClass} onClick={onNavigate}>
                Aviso legal
              </NavLink>
              <NavLink href="/politica-reembolsos" className={linkClass} onClick={onNavigate}>
                Política de reembolsos
              </NavLink>
              <NavLink href="/normas-comunidad" className={linkClass} onClick={onNavigate}>
                Normas de comunidad
              </NavLink>
              <NavLink href="/contact" className={linkClass} onClick={onNavigate}>
                Contacta con nosotros
              </NavLink>
              <NavLink href="/politica-privacidad" className={linkClass} onClick={onNavigate}>
                Política de privacidad
              </NavLink>
              <NavLink href="/politica-cookies" className={linkClass} onClick={onNavigate}>
                Política de cookies
              </NavLink>
              <NavLink href="/proteccion-datos" className={linkClass} onClick={onNavigate}>
                Protección de datos
              </NavLink>
              <NavLink href="/blog" className={linkClass} onClick={onNavigate}>
                Blog
              </NavLink>
              <button
                type="button"
                className={linkClass}
                onClick={() => {
                  onNavigate?.();
                  window.dispatchEvent(new Event('dralo:open-cookie-settings'));
                }}
              >
                Ajustes de cookies
              </button>
              <p className="app-nav__legal-note">
                En iPhone o iPad: pulsa Compartir y “Añadir a pantalla de inicio”. En Android: abre el
                menú ⋮ y pulsa “Instalar aplicación”.
              </p>
              <div className="app-nav__legal-tagline">
                <DraloTagline className="dralo-tagline--footer" />
                <p>{SITE_FOOTER_TAGLINE}</p>
                <p>
                  © {new Date().getFullYear()} Dralo · Versión Alpha 1.0.0
                </p>
              </div>
            </div>
          ) : null}
        </>
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
