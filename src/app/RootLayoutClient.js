'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { normalizeRoleName, getRoleNameByUserId, peekCachedRoleName } from '@/utils/authRoles';
import { performLogout } from '@/utils/logout';
import { isPublicPath } from '@/utils/publicRoutes';
import { isWritingV3PreviewPath } from '@/utils/writingV3Preview';
import Link from 'next/link';
import DraloTagline from '@/components/DraloTagline';
import { useActivityHeartbeat } from '@/hooks/useActivityHeartbeat';
import { usePageViewTracker } from '@/hooks/usePageViewTracker';
import { useClarityPageTags } from '@/hooks/useClarityPageTags';
import MicrosoftClarity from '@/components/analytics/MicrosoftClarity';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import MetaPixel from '@/components/analytics/MetaPixel';
import { isClarityExcludedPath } from '@/lib/clarity';
import DeferredSiteAssistant from '@/components/chat/DeferredSiteAssistant';
import { clearAssistantDismissed } from '@/components/chat/SiteAssistantWidget';
import RouteLoadingMascot from '@/components/RouteLoadingMascot';
const Toaster = dynamic(
  () => import('react-hot-toast').then((mod) => ({ default: mod.Toaster })),
  { ssr: false },
);
import AuthenticatedAppShell from '@/components/layout/AuthenticatedAppShell';
import SiteNightModeInit from '@/components/layout/SiteNightModeInit';
import { useLevelsStarsBackfill } from '@/hooks/useLevelsStarsBackfill';

function SiteHeaderBrand({ nav = null }) {
  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link href="/" className="site-header__logo">
          <img src="/uk-flag.png" alt="UK Flag" className="site-header__flag bandera" />
          <span>Dralo Academy</span>
        </Link>
        {nav ? <div className="site-header__nav">{nav}</div> : null}
      </div>
    </header>
  );
}

export default function RootLayoutClient({ children }) {
  /** Solo bloquea hasta conocer la sesión; el rol se resuelve en segundo plano. */
  const [authPending, setAuthPending] = useState(() => {
    if (typeof window === 'undefined') return true;
    const path = window.location.pathname;
    return !isPublicPath(path) && !isWritingV3PreviewPath(path);
  });
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState('student');
  const [cookieConsent, setCookieConsent] = useState(null);
  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    analytics: false,
    personalization: false,
  });
  const router = useRouter();
  const pathname = usePathname();
  const roleFetchedForUserIdRef = useRef(null);
  const lastAccessTokenRef = useRef(null);

  const isPublic = isPublicPath(pathname);
  /** Superficie interna de Writing v3: solo existe fuera de producción (Fase 8). */
  const allowWithoutAuth = isPublic || isWritingV3PreviewPath(pathname);
  const heartbeatEnabled = Boolean(session) && !allowWithoutAuth;
  const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || '';
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-ELSL12SBGQ';
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
  const analyticsCookiesEnabled = Boolean(cookieConsent) && Boolean(cookiePreferences.analytics);
  const personalizationCookiesEnabled =
    Boolean(cookieConsent) && Boolean(cookiePreferences.personalization);
  const clarityAnalyticsEnabled =
    analyticsCookiesEnabled &&
    Boolean(clarityProjectId) &&
    !isClarityExcludedPath(pathname);
  const googleAnalyticsEnabled =
    analyticsCookiesEnabled &&
    Boolean(gaMeasurementId) &&
    !isClarityExcludedPath(pathname);
  const metaPixelEnabled =
    personalizationCookiesEnabled &&
    Boolean(metaPixelId) &&
    !isClarityExcludedPath(pathname);

  useActivityHeartbeat(session, heartbeatEnabled);
  usePageViewTracker(session, heartbeatEnabled);
  useClarityPageTags(clarityAnalyticsEnabled);
  useLevelsStarsBackfill(session);

  useEffect(() => {
    if (allowWithoutAuth || authPending || session) return undefined;
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const next = encodeURIComponent(`${pathname}${search}`);
    router.replace(`/login?next=${next}`);
    return undefined;
  }, [allowWithoutAuth, authPending, session, pathname, router]);

  useEffect(() => {
    if (allowWithoutAuth) setAuthPending(false);
  }, [allowWithoutAuth]);

  useEffect(() => {
    let cancelled = false;

    const hydrateAuth = async (newSession) => {
      if (cancelled) return;

      const accessToken = newSession?.access_token ?? null;
      const uid = newSession?.user?.id ?? null;
      const sameSession =
        accessToken &&
        accessToken === lastAccessTokenRef.current &&
        uid &&
        roleFetchedForUserIdRef.current === uid;

      lastAccessTokenRef.current = accessToken;
      setSession(newSession);

      if (!uid) {
        roleFetchedForUserIdRef.current = null;
        setUserRole('student');
        if (!allowWithoutAuth) setAuthPending(false);
        return;
      }

      if (!allowWithoutAuth) setAuthPending(false);

      const cachedRole = peekCachedRoleName(uid);
      if (cachedRole) {
        setUserRole(normalizeRoleName(cachedRole));
      }

      if (sameSession) return;

      void getRoleNameByUserId(uid, newSession.user.email).then((roleName) => {
        if (cancelled) return;
        roleFetchedForUserIdRef.current = uid;
        setUserRole(normalizeRoleName(roleName));
      });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) void hydrateAuth(session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_IN' && newSession) {
        if (cancelled) return;
        clearAssistantDismissed();
        lastAccessTokenRef.current = newSession.access_token ?? null;
        roleFetchedForUserIdRef.current = null;
        setSession(newSession);
        setAuthPending(false);
        const uid = newSession.user?.id;
        if (uid) {
          const cachedRole = peekCachedRoleName(uid);
          if (cachedRole) setUserRole(normalizeRoleName(cachedRole));
          void getRoleNameByUserId(uid, newSession.user.email).then((roleName) => {
            if (cancelled) return;
            roleFetchedForUserIdRef.current = uid;
            setUserRole(normalizeRoleName(roleName));
          });
        }
        return;
      }
      if (event === 'SIGNED_OUT') {
        if (cancelled) return;
        lastAccessTokenRef.current = null;
        roleFetchedForUserIdRef.current = null;
        setSession(null);
        setUserRole('student');
        if (!allowWithoutAuth) setAuthPending(false);
        return;
      }
      if (event === 'TOKEN_REFRESHED') {
        if (cancelled) return;
        lastAccessTokenRef.current = newSession?.access_token ?? null;
        setSession(newSession);
        return;
      }
      void hydrateAuth(newSession);
    });
    return () => {
      cancelled = true;
      sub?.subscription?.unsubscribe?.();
    };
  }, [allowWithoutAuth]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dralo_cookie_consent');
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed?.preferences) {
        setCookiePreferences({
          necessary: true,
          analytics: Boolean(parsed.preferences.analytics),
          personalization: Boolean(parsed.preferences.personalization),
        });
      }
      setCookieConsent(parsed);
    } catch (_error) {
      setCookieConsent(null);
    }
  }, []);

  useEffect(() => {
    const openCookieSettingsFromEvent = () => setShowCookieSettings(true);
    window.addEventListener('dralo:open-cookie-settings', openCookieSettingsFromEvent);
    return () => window.removeEventListener('dralo:open-cookie-settings', openCookieSettingsFromEvent);
  }, []);

  /**
   * Un SW registrado en localhost sirve bundles cacheados y rompe el HMR, lo que
   * acaba en errores de DOM de React. Se limpia en cualquier página, no solo en el buzón.
   */
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

    void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
      if (!registrations.length) return;
      await Promise.all(registrations.map((registration) => registration.unregister()));
      if ('caches' in window) {
        const names = await window.caches.keys();
        await Promise.all(names.map((name) => window.caches.delete(name)));
      }
      window.location.reload();
    });
  }, []);

  if (!allowWithoutAuth && authPending) {
    return (
      <>
        <SiteNightModeInit />
        <Toaster position="top-center" reverseOrder={false} />
        <SiteHeaderBrand />
        <main className="page-content">
          <RouteLoadingMascot label="Cargando" variant={3} />
        </main>
      </>
    );
  }

  if (!allowWithoutAuth && !session) {
    return (
      <>
        <SiteNightModeInit />
        <Toaster position="top-center" reverseOrder={false} />
        <SiteHeaderBrand />
        <main className="page-content">
          <RouteLoadingMascot label="Redirigiendo al login" variant={3} />
        </main>
      </>
    );
  }

  const handleLogout = () => {
    lastAccessTokenRef.current = null;
    roleFetchedForUserIdRef.current = null;
    setSession(null);
    setUserRole('student');
    void performLogout();
  };

  const saveCookieConsent = (preferences, mode) => {
    const payload = {
      mode,
      updatedAt: new Date().toISOString(),
      preferences: {
        necessary: true,
        analytics: Boolean(preferences.analytics),
        personalization: Boolean(preferences.personalization),
      },
    };

    localStorage.setItem('dralo_cookie_consent', JSON.stringify(payload));
    setCookiePreferences(payload.preferences);
    setCookieConsent(payload);
    setShowCookieSettings(false);
  };

  const acceptAllCookies = () => {
    saveCookieConsent(
      {
        analytics: true,
        personalization: true,
      },
      'all'
    );
  };

  const acceptNecessaryCookies = () => {
    saveCookieConsent(
      {
        analytics: false,
        personalization: false,
      },
      'necessary_only'
    );
  };

  return (
    <>
      <SiteNightModeInit />
      <Toaster position="top-center" reverseOrder={false} />
      <MicrosoftClarity enabled={clarityAnalyticsEnabled} projectId={clarityProjectId} />
      <GoogleAnalytics enabled={googleAnalyticsEnabled} measurementId={gaMeasurementId} />
      <MetaPixel enabled={metaPixelEnabled} pixelId={metaPixelId} />

      <AuthenticatedAppShell session={session} userRole={userRole} onLogout={handleLogout}>
        {children}
      </AuthenticatedAppShell>

      <DeferredSiteAssistant enabled={Boolean(session)} />

      {!cookieConsent && (
        <div className="cookie-banner" role="dialog" aria-label="Configuracion de cookies">
          <div className="cookie-banner-content">
            <p>
              Este sitio web utiliza cookies y herramientas relacionadas.
              Diferenciamos entre cookies necesarias y otras opcionales para
              mejorar la experiencia. Puedes encontrar mas informacion en nuestra{' '}
              <Link href="/politica-cookies">Politica de cookies</Link> y{' '}
              <Link href="/politica-privacidad">Politica de privacidad</Link>.
            </p>
            <div className="cookie-banner-actions">
              <button onClick={acceptAllCookies} className="cookie-btn cookie-btn-primary" type="button">
                Aceptar todas las cookies
              </button>
              <button onClick={acceptNecessaryCookies} className="cookie-btn cookie-btn-secondary" type="button">
                Solo cookies necesarias
              </button>
              <button onClick={() => setShowCookieSettings((prev) => !prev)} className="cookie-btn cookie-btn-link" type="button">
                Ajustar la configuracion de cookies
              </button>
            </div>
          </div>
        </div>
      )}

      {showCookieSettings && (
        <div className="cookie-settings-panel" role="dialog" aria-label="Ajustes de cookies">
          <h4>Configuracion de cookies</h4>
          <label>
            <input type="checkbox" checked disabled />
            Cookies necesarias (siempre activas)
          </label>
          <label>
            <input
              type="checkbox"
              checked={cookiePreferences.analytics}
              onChange={(e) =>
                setCookiePreferences((prev) => ({
                  ...prev,
                  analytics: e.target.checked,
                }))
              }
            />
            Cookies analiticas
          </label>
          <label>
            <input
              type="checkbox"
              checked={cookiePreferences.personalization}
              onChange={(e) =>
                setCookiePreferences((prev) => ({
                  ...prev,
                  personalization: e.target.checked,
                }))
              }
            />
            Cookies de personalizacion
          </label>
          <div className="cookie-settings-actions">
            <button
              type="button"
              className="cookie-btn cookie-btn-primary"
              onClick={() =>
                saveCookieConsent(
                  {
                    analytics: cookiePreferences.analytics,
                    personalization: cookiePreferences.personalization,
                  },
                  'custom'
                )
              }
            >
              Guardar configuracion
            </button>
            <button
              type="button"
              className="cookie-btn cookie-btn-secondary"
              onClick={() => setShowCookieSettings(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      <footer className="footer legal-footer">
        <div className="legal-footer-content">
          <div className="legal-footer-column">
            <h3>Legal</h3>
            <ul className="legal-footer-list">
              <li>
                <Link href="/terminos-condiciones">Términos y condiciones</Link>
              </li>
              <li>
                <Link href="/aviso-legal">Aviso legal</Link>
              </li>
              <li>
                <Link href="/politica-reembolsos">Política de reembolsos</Link>
              </li>
              <li>
                <Link href="/normas-comunidad">Normas de comunidad</Link>
              </li>
              <li>
                <Link href="/contact">Contacta con nosotros</Link>
              </li>
            </ul>
          </div>
          <div className="legal-footer-column">
            <h3>Privacidad</h3>
            <ul className="legal-footer-list">
              <li>
                <Link href="/politica-privacidad">Política de privacidad</Link>
              </li>
              <li>
                <Link href="/politica-cookies">Política de cookies</Link>
              </li>
              <li>
                <Link href="/proteccion-datos">Protección de datos</Link>
              </li>
              <li>
                <Link href="/blog">Blog</Link>
              </li>
              <li>
                <button
                  type="button"
                  className="legal-footer-link-btn"
                  onClick={() => setShowCookieSettings(true)}
                >
                  Ajustes de cookies
                </button>
              </li>
            </ul>
          </div>
          <div className="legal-footer-column legal-footer-column--tagline">
            <DraloTagline className="dralo-tagline--footer" />
            <p className="legal-footer-copy legal-footer-copy--tagline legal-footer-copy--tagline-desc">
              Ejercicios diseñados para practicar tus habilidades en inglés.
            </p>
            <p className="legal-footer-copy legal-footer-copy--tagline legal-footer-meta">
              <span>© {new Date().getFullYear()} Dralo</span>
              <span className="legal-footer-meta__sep" aria-hidden="true">
                ·
              </span>
              <span className="legal-footer-version">Versión Alpha 1.0.0</span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
